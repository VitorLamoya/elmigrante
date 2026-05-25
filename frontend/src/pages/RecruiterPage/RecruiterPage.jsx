import { useEffect, useState } from "react";
import { emptyJobForm } from "../../data/jobs";
import {
  areaOptions,
  contractOptions,
  countryOptions,
  experienceOptions,
  getCityLabel,
  getCityCoordinates,
  getCityOptions,
  getCountryLabel,
  getOptionLabel,
  languageLevelOptions,
  languageOptions,
} from "../../data/jobOptions";
import { createTranslator } from "../../i18n/translations";
import { getRecruiterJobs } from "../../services/api";
import "./RecruiterPage.css";

const requiredFields = ["title", "company", "city", "country", "area", "contract", "contact", "description"];
const defaultRecruiterSummary = {
  plan: "free",
  jobLimit: 5,
  totals: { views: 0, contactClicks: 0, recentViews: 0, recentContactClicks: 0 },
  jobs: [],
};

function hasText(value) {
  return value.trim().length > 0;
}

function getFilledLength(value) {
  return value.trim().length;
}

function formatMoney(value) {
  const digits = value.replace(/\D/g, "");
  const amount = Number(digits);

  return digits && amount > 0 ? `€ ${amount.toLocaleString("pt-BR")}` : "";
}

function RecruiterPage({ authSession, mode = "dashboard", onCreateJob, onDeleteJob, language = "pt" }) {
  const t = createTranslator(language);
  const [form, setForm] = useState(emptyJobForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [languageDraft, setLanguageDraft] = useState({ language: "", level: "" });
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [recruiterSummary, setRecruiterSummary] = useState(defaultRecruiterSummary);
  const [selectedDashboardJobId, setSelectedDashboardJobId] = useState("");
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [deletingJobId, setDeletingJobId] = useState("");
  const [jobPendingDelete, setJobPendingDelete] = useState(null);
  const cityOptions = getCityOptions(form.countryCode);
  const recommended = t("recruiter.recommended", []);
  const token = authSession?.session?.access_token;
  const recruiterMeta = authSession?.user?.user_metadata || {};
  const recruiterName = recruiterMeta.name || authSession?.user?.email || t("recruiter.accountFallback");
  const recruiterCompany = recruiterMeta.companyName || "";
  const activeJobs = recruiterSummary.jobs.length;
  const jobLimit = recruiterSummary.jobLimit ?? Math.max(activeJobs, 1);
  const planUsage = recruiterSummary.jobLimit === null ? 100 : Math.min((activeJobs / jobLimit) * 100, 100);
  const planLabel = t(`recruiter.planLabels.${recruiterSummary.plan}`, recruiterSummary.plan);
  const planBadgeClassName = `plan-badge plan-badge--${recruiterSummary.plan || "free"}`;
  const remainingJobs = recruiterSummary.jobLimit === null ? t("recruiter.unlimitedJobs") : Math.max(jobLimit - activeJobs, 0);
  const hasReachedLimit = recruiterSummary.jobLimit !== null && activeJobs >= jobLimit;
  const totalViews = recruiterSummary.totals?.views || 0;
  const totalContactClicks = recruiterSummary.totals?.contactClicks || 0;
  const recentViews = recruiterSummary.totals?.recentViews || 0;
  const recentContactClicks = recruiterSummary.totals?.recentContactClicks || 0;
  const conversionRate = totalViews > 0 ? `${Math.round((totalContactClicks / totalViews) * 100)}%` : "0%";
  const sortedDashboardJobs = [...recruiterSummary.jobs].sort((firstJob, secondJob) => (secondJob.views || 0) - (firstJob.views || 0));
  const selectedDashboardJob = recruiterSummary.jobs.find((job) => job.id === selectedDashboardJobId) || sortedDashboardJobs[0] || null;
  const selectedJobConversionRate = selectedDashboardJob?.views > 0
    ? `${Math.round(((selectedDashboardJob.contactClicks || 0) / selectedDashboardJob.views) * 100)}%`
    : "0%";

  const recommendedItems = [
    { label: recommended[0], complete: hasText(form.salary) },
    { label: recommended[1], complete: hasText(form.city) && hasText(form.country) && hasText(form.area) },
    { label: recommended[2], complete: hasText(form.contract) },
    { label: recommended[3], complete: selectedLanguages.length > 0 && hasText(form.experience) },
    { label: recommended[4], complete: hasText(form.contact) },
  ];
  const completedItems = recommendedItems.filter((item) => item.complete).length;
  const hasError = submitted && requiredFields.some((field) => !hasText(form[field]));

  useEffect(() => {
    let isActive = true;

    async function loadRecruiterJobs() {
      if (!token) return;

      try {
        setIsLoadingJobs(true);
        const summary = await getRecruiterJobs(token);
        if (isActive) setRecruiterSummary(summary);
      } catch (error) {
        if (isActive) setSubmitError(error.message);
      } finally {
        if (isActive) setIsLoadingJobs(false);
      }
    }

    loadRecruiterJobs();

    return () => {
      isActive = false;
    };
  }, [token]);

  useEffect(() => {
    if (!recruiterCompany) return;

    setForm((currentForm) => ({
      ...currentForm,
      company: currentForm.company || recruiterCompany,
    }));
  }, [recruiterCompany]);

  function updateField(event) {
    const { name, value } = event.target;
    const nextValue = name === "isUrgent" || name === "hasAccommodation" ? value === "yes" : name === "salary" ? formatMoney(value) : value;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: nextValue,
      ...(name === "countryCode" ? { country: getCountryLabel(value, language), cityCode: "", city: "" } : {}),
      ...(name === "cityCode" ? { city: getCityLabel(currentForm.countryCode, value, language), ...getCityCoordinates(currentForm.countryCode, value) } : {}),
      ...(name === "areaCode" ? { area: getOptionLabel(areaOptions, value, language) } : {}),
      ...(name === "contractCode" ? { contract: getOptionLabel(contractOptions, value, language) } : {}),
      ...(name === "experienceCode" ? { experience: getOptionLabel(experienceOptions, value, language) } : {}),
      ...(name === "contactMethod" ? { contact: "" } : {}),
    }));
  }

  function updateLanguageDraft(event) {
    const { name, value } = event.target;
    setLanguageDraft((currentDraft) => ({ ...currentDraft, [name]: value }));
  }

  function syncLanguages(languages) {
    setSelectedLanguages(languages);
    setForm((currentForm) => ({
      ...currentForm,
      languageItems: languages,
      languages: languages.map((item) => `${getOptionLabel(languageOptions, item.language, language)} ${getOptionLabel(languageLevelOptions, item.level, language).toLowerCase()}`).join(", "),
    }));
  }

  function addLanguage() {
    if (!languageDraft.language || !languageDraft.level) return;
    const exists = selectedLanguages.some((item) => item.language === languageDraft.language && item.level === languageDraft.level);
    if (!exists) syncLanguages([...selectedLanguages, languageDraft]);
    setLanguageDraft({ language: "", level: "" });
  }

  function removeLanguage(languageToRemove) {
    syncLanguages(selectedLanguages.filter((item) => item.language !== languageToRemove.language || item.level !== languageToRemove.level));
  }

  function openDeleteModal(jobId) {
    const jobToDelete = recruiterSummary.jobs.find((job) => job.id === jobId);
    if (!jobToDelete) return;
    setJobPendingDelete(jobToDelete);
  }

  function closeDeleteModal() {
    if (deletingJobId) return;
    setJobPendingDelete(null);
  }

  async function handleDeletePublishedJob() {
    if (!jobPendingDelete) return;

    try {
      setSubmitError("");
      setDeletingJobId(jobPendingDelete.id);
      await onDeleteJob?.(jobPendingDelete.id);
      setRecruiterSummary((currentSummary) => ({
        ...currentSummary,
        jobs: currentSummary.jobs.filter((job) => job.id !== jobPendingDelete.id),
      }));
      if (selectedDashboardJobId === jobPendingDelete.id) {
        setSelectedDashboardJobId("");
      }
      setJobPendingDelete(null);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setDeletingJobId("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setSubmitError("");
    if (requiredFields.some((field) => !hasText(form[field]))) return;
    if (hasReachedLimit) {
      setSubmitError(t("recruiter.limitReached"));
      return;
    }

    try {
      setIsSubmitting(true);
      const publishedJob = await onCreateJob({
        ...form,
        title: form.title.trim(),
        company: form.company.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        area: form.area.trim(),
        contract: form.contract.trim(),
        salary: form.salary.trim(),
        contact: form.contact.trim(),
        description: form.description.trim(),
        requirements: form.requirements.trim(),
        benefits: form.benefits.trim(),
      });
      if (publishedJob) {
        setRecruiterSummary((currentSummary) => ({
          ...currentSummary,
          jobs: [publishedJob, ...currentSummary.jobs.filter((job) => job.id !== publishedJob.id)],
        }));
        setForm({ ...emptyJobForm, company: recruiterCompany });
        setSelectedLanguages([]);
        setSubmitted(false);
        window.location.hash = "#/recrutador";
      }
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (mode === "dashboard") {
    return (
      <main className="recruiter-page recruiter-page--admin">
        <section className="admin-topbar">
          <div>
            <p>{t("recruiter.eyebrow")}</p>
            <h1>{t("recruiter.dashboardTitle")}</h1>
            <span>{t("recruiter.dashboardText")}</span>
          </div>
          <div className="admin-topbar__actions">
            <a className="admin-topbar__secondary" href="#/vagas">{t("header.jobs")}</a>
            <a className="admin-topbar__primary" href="#/publicar">{t("recruiter.publishNewJob")}</a>
          </div>
        </section>
        <section className="account-strip" aria-label={t("recruiter.dashboardLabel")}>
          <article>
            <span>{t("recruiter.account")}</span>
            <strong>{recruiterName}</strong>
          </article>
          <article>
            <span>{t("recruiter.currentPlan")}</span>
            <strong className={planBadgeClassName}>{planLabel}</strong>
          </article>
          <article>
            <span>{t("recruiter.activeAds")}</span>
            <strong>{activeJobs}/{recruiterSummary.jobLimit ?? "∞"}</strong>
          </article>
          <article className={hasReachedLimit ? "is-warning" : ""}>
            <span>{t("recruiter.remainingAds")}</span>
            <strong>{remainingJobs}</strong>
          </article>
        </section>
        <section className="admin-layout">
          <div className="admin-main">
            <section className="metrics-grid" aria-label={t("recruiter.lastSevenDays")}>
              <article>
                <div className="metric-card__label">
                  <span>{t("recruiter.views")}</span>
                  <small>{t("recruiter.lastSevenDays")}</small>
                </div>
                <strong>{totalViews}</strong>
                <p>{recentViews} {t("recruiter.lastSevenDays")}</p>
              </article>
              <article>
                <div className="metric-card__label">
                  <span>{t("recruiter.applications")}</span>
                  <small>{t("recruiter.lastSevenDays")}</small>
                </div>
                <strong>{totalContactClicks}</strong>
                <p>{recentContactClicks} {t("recruiter.lastSevenDays")}</p>
              </article>
              <article>
                <div className="metric-card__label">
                  <span>{t("recruiter.conversion")}</span>
                  <small>CTR</small>
                </div>
                <strong>{conversionRate}</strong>
                <p>{t("recruiter.contactRateHint")}</p>
              </article>
            </section>
            <section className="admin-jobs">
              <div className="admin-section-header">
                <div>
                  <p>{t("recruiter.myJobsTitle")}</p>
                  <h2>{isLoadingJobs ? t("recruiter.loadingJobs") : `${activeJobs} ${t("recruiter.myJobsCount")}`}</h2>
                </div>
                <a className="admin-section-header__button" href="#/publicar">{t("recruiter.publishNewJob")}</a>
              </div>
              {submitError && <div className="admin-jobs__alert" role="alert">{submitError}</div>}
              <div className="admin-jobs__table">
                {recruiterSummary.jobs.length > 0 && (
                  <div className="admin-job-row admin-job-row--head" aria-hidden="true">
                    <span>{t("recruiter.jobColumn")}</span>
                    <span>{t("recruiter.views")}</span>
                    <span>{t("recruiter.applications")}</span>
                    <span>{t("recruiter.conversion")}</span>
                    <span>{t("recruiter.status")}</span>
                  </div>
                )}
                {!isLoadingJobs && recruiterSummary.jobs.length === 0 && <p>{t("recruiter.noJobs")}</p>}
                {sortedDashboardJobs.map((job) => (
                  <button
                    type="button"
                    className={selectedDashboardJob?.id === job.id ? "admin-job-row is-selected" : "admin-job-row"}
                    key={job.id}
                    onClick={() => setSelectedDashboardJobId(job.id)}
                  >
                    <span>
                      <strong>{job.title}</strong>
                      <small>{job.city}, {job.country}</small>
                    </span>
                    <span>{job.views || 0}</span>
                    <span>{job.contactClicks || 0}</span>
                    <span>{job.views > 0 ? `${Math.round(((job.contactClicks || 0) / job.views) * 100)}%` : "0%"}</span>
                    <span><small className="status-pill">{t("recruiter.published")}</small></span>
                  </button>
                ))}
              </div>
            </section>
          </div>
          <aside className="recruiter-panel recruiter-panel--admin">
            <section className="job-insight-panel">
              <div className="recruiter-panel__header">
                <h2>{t("recruiter.jobInsightsTitle")}</h2>
                <p>{selectedDashboardJob ? selectedDashboardJob.title : t("recruiter.noJobs")}</p>
              </div>
              {selectedDashboardJob && (
                <>
                  <div className="job-insight-panel__stats">
                    <div>
                      <span>{t("recruiter.views")}</span>
                      <strong>{selectedDashboardJob.views || 0}</strong>
                    </div>
                    <div>
                      <span>{t("recruiter.applications")}</span>
                      <strong>{selectedDashboardJob.contactClicks || 0}</strong>
                    </div>
                    <div>
                      <span>{t("recruiter.conversion")}</span>
                      <strong>{selectedJobConversionRate}</strong>
                    </div>
                  </div>
                  <dl className="job-insight-panel__meta">
                    <div>
                      <dt>{t("recruiter.location")}</dt>
                      <dd>{selectedDashboardJob.city}, {selectedDashboardJob.country}</dd>
                    </div>
                    <div>
                      <dt>{t("recruiter.lastAccess")}</dt>
                      <dd>{selectedDashboardJob.lastAccessedAt ? new Date(selectedDashboardJob.lastAccessedAt).toLocaleDateString() : t("recruiter.noAccessYet")}</dd>
                    </div>
                  </dl>
                  <a className="job-insight-panel__link" href={`#/vaga/${selectedDashboardJob.id}`}>{t("recruiter.viewPublicJob")}</a>
                  <button
                    type="button"
                    className="job-insight-panel__delete"
                    onClick={() => openDeleteModal(selectedDashboardJob.id)}
                    disabled={deletingJobId === selectedDashboardJob.id}
                  >
                    {deletingJobId === selectedDashboardJob.id ? t("recruiter.deletingJob") : t("recruiter.deleteJob")}
                  </button>
                </>
              )}
            </section>
            <section className="plan-panel">
              <div className="recruiter-panel__header">
                <h2>{t("recruiter.planTitle")}</h2>
                <p>{t("recruiter.planText")}</p>
              </div>
              <div className="plan-panel__usage">
                <span style={{ width: `${planUsage}%` }}></span>
              </div>
              {hasReachedLimit && (
                <div className="job-form__tip" role="alert">
                  <strong>{t("recruiter.limitReached")}</strong>
                  <span>{t("recruiter.upgradeTip")}</span>
                  <a href="#/planos">{t("recruiter.viewPlans")}</a>
                </div>
              )}
            </section>
          </aside>
        </section>
        {jobPendingDelete && (
          <div className="recruiter-modal-overlay">
            <div className="recruiter-modal" role="dialog" aria-modal="true" aria-labelledby="delete-job-modal-title">
              <button
                type="button"
                className="recruiter-modal__close"
                onClick={closeDeleteModal}
                aria-label={t("jobs.closeModal")}
                disabled={Boolean(deletingJobId)}
              >
                ×
              </button>
              <div className="recruiter-modal__header">
                <span>{t("recruiter.deleteJob")}</span>
                <h2 id="delete-job-modal-title">{jobPendingDelete.title}</h2>
                <p>{jobPendingDelete.company}</p>
              </div>
              <p className="recruiter-modal__text">{t("recruiter.deleteConfirm").replace("{title}", jobPendingDelete.title)}</p>
              <div className="recruiter-modal__meta">
                <div>
                  <strong>{t("recruiter.location")}</strong>
                  <span>{jobPendingDelete.city}, {jobPendingDelete.country}</span>
                </div>
                <div>
                  <strong>{t("recruiter.status")}</strong>
                  <span>{t("recruiter.published")}</span>
                </div>
              </div>
              <div className="recruiter-modal__actions">
                <button type="button" className="recruiter-modal__button recruiter-modal__button--secondary" onClick={closeDeleteModal} disabled={Boolean(deletingJobId)}>
                  {t("recruiter.cancelDelete")}
                </button>
                <button type="button" className="recruiter-modal__button recruiter-modal__button--danger" onClick={handleDeletePublishedJob} disabled={Boolean(deletingJobId)}>
                  {deletingJobId ? t("recruiter.deletingJob") : t("recruiter.confirmDelete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="recruiter-page">
      <section className="recruiter-hero"><p>{t("recruiter.eyebrow")}</p><h1>{t("recruiter.publishTitle")}</h1><span>{t("recruiter.publishText")}</span></section>
      {/*
      <section className="recruiter-dashboard" aria-label={t("recruiter.dashboardLabel")}>
        <article>
          <span>{t("recruiter.account")}</span>
          <strong>{recruiterName}</strong>
        </article>
        <article>
          <span>{t("recruiter.currentPlan")}</span>
          <strong className={planBadgeClassName}>{planLabel}</strong>
        </article>
        <article>
          <span>{t("recruiter.activeAds")}</span>
          <strong>{activeJobs}/{recruiterSummary.jobLimit ?? "∞"}</strong>
        </article>
        <article className={hasReachedLimit ? "is-warning" : ""}>
          <span>{t("recruiter.remainingAds")}</span>
          <strong>{remainingJobs}</strong>
        </article>
      </section>
      */}
      <section className="recruiter-layout">
        <form className="job-form" onSubmit={handleSubmit}>
          <div className="job-form__header">
            <p>{t("recruiter.formEyebrow")}</p>
            <h2>{t("recruiter.formTitle")}</h2>
          </div>
          {hasError && <div className="job-form__alert" role="alert">{t("recruiter.error")}</div>}
          {submitError && <div className="job-form__alert" role="alert">{submitError}</div>}
          <div className="job-form__section">
            <span>{t("recruiter.sectionDetails")}</span>
          </div>
          <div className="job-form__grid">
            <label>{t("recruiter.titleField")}<input name="title" value={form.title} onChange={updateField} placeholder={t("recruiter.titlePlaceholder")} /></label>
            <label>{t("recruiter.company")}<input name="company" value={form.company} onChange={updateField} readOnly={Boolean(recruiterCompany)} placeholder={t("recruiter.companyPlaceholder")} /></label>
            <label>{t("recruiter.country")}<select name="countryCode" value={form.countryCode} onChange={updateField} required><option value="" disabled>{t("recruiter.countryPlaceholder")}</option>{countryOptions.map((item) => <option value={item.value} key={item.value}>{item.labels[language]}</option>)}</select></label>
            <label>{t("recruiter.city")}<select name="cityCode" value={form.cityCode} onChange={updateField} required disabled={!form.countryCode}><option value="" disabled>{t("recruiter.cityPlaceholder")}</option>{cityOptions.map((item) => <option value={item.value} key={item.value}>{item.labels[language]}</option>)}</select></label>
            <label>{t("recruiter.area")}<select name="areaCode" value={form.areaCode} onChange={updateField} required><option value="" disabled>{t("recruiter.areaPlaceholder")}</option>{areaOptions.map((item) => <option value={item.value} key={item.value}>{item.labels[language]}</option>)}</select></label>
            <label>{t("recruiter.contract")}<select name="contractCode" value={form.contractCode} onChange={updateField} required><option value="" disabled>{t("recruiter.contractPlaceholder")}</option>{contractOptions.map((item) => <option value={item.value} key={item.value}>{item.labels[language]}</option>)}</select></label>
            <label>{t("recruiter.salary")}<input name="salary" inputMode="numeric" value={form.salary} onChange={updateField} placeholder={t("recruiter.salaryPlaceholder")} /></label>
            <label>
              {t("recruiter.urgentHiring")}
              <select name="isUrgent" value={form.isUrgent ? "yes" : "no"} onChange={updateField}>
                <option value="no">{t("recruiter.urgentHiringNo")}</option>
                <option value="yes">{t("recruiter.urgentHiringYes")}</option>
              </select>
            </label>
            <label>
              {t("recruiter.accommodation")}
              <select name="hasAccommodation" value={form.hasAccommodation ? "yes" : "no"} onChange={updateField}>
                <option value="no">{t("recruiter.accommodationNo")}</option>
                <option value="yes">{t("recruiter.accommodationYes")}</option>
              </select>
            </label>
            <label>
              {t("recruiter.contactMethod")}
              <select name="contactMethod" value={form.contactMethod} onChange={updateField}>
                <option value="email">{t("recruiter.contactMethodEmail")}</option>
                <option value="phone">{t("recruiter.contactMethodPhone")}</option>
              </select>
            </label>
            <label>
              {t("recruiter.contact")}
              <input
                name="contact"
                type={form.contactMethod === "email" ? "email" : "tel"}
                value={form.contact}
                onChange={updateField}
                placeholder={form.contactMethod === "email" ? t("recruiter.contactEmailPlaceholder") : t("recruiter.contactPhonePlaceholder")}
              />
            </label>
            <label>{t("recruiter.experience")}<select name="experienceCode" value={form.experienceCode} onChange={updateField}><option value="" disabled>{t("recruiter.experiencePlaceholder")}</option>{experienceOptions.map((item) => <option value={item.value} key={item.value}>{item.labels[language]}</option>)}</select></label>
            <div className="language-field">
              <span>{t("recruiter.languages")}</span>
              <div className="language-field__controls">
                <select name="language" value={languageDraft.language} onChange={updateLanguageDraft}><option value="" disabled>{t("recruiter.language")}</option>{languageOptions.map((item) => <option value={item.value} key={item.value}>{item.labels[language]}</option>)}</select>
                <select name="level" value={languageDraft.level} onChange={updateLanguageDraft}><option value="" disabled>{t("recruiter.level")}</option>{languageLevelOptions.map((item) => <option value={item.value} key={item.value}>{item.labels[language]}</option>)}</select>
                <button type="button" onClick={addLanguage}>{t("recruiter.add")}</button>
              </div>
              <div className="language-field__chips" aria-label={t("recruiter.languages")}>
                {selectedLanguages.length === 0 && <small>{t("recruiter.noLanguage")}</small>}
                {selectedLanguages.map((item) => <button type="button" key={`${item.language}-${item.level}`} onClick={() => removeLanguage(item)}>{getOptionLabel(languageOptions, item.language, language)} · {getOptionLabel(languageLevelOptions, item.level, language)}<span aria-hidden="true">×</span></button>)}
              </div>
            </div>
          </div>
          <div className="job-form__section">
            <span>{t("recruiter.sectionDescription")}</span>
          </div>
          <div className="job-form__text-grid">
            <label className="job-form__textarea-card job-form__textarea-card--primary">
              <span className="job-form__textarea-head">
                <strong>{t("recruiter.description")}</strong>
                <small>{t("recruiter.descriptionHelp")}</small>
              </span>
              <textarea name="description" value={form.description} onChange={updateField} rows="6" placeholder={t("recruiter.descriptionPlaceholder")} />
              <em>{getFilledLength(form.description)} {t("recruiter.charactersCount")}</em>
            </label>
            <div className="job-form__text-columns">
              <label className="job-form__textarea-card">
                <span className="job-form__textarea-head">
                  <strong>{t("recruiter.requirements")}</strong>
                  <small className="job-form__optional-tag">{t("recruiter.optionalTag")}</small>
                </span>
                <span className="job-form__textarea-note">{t("recruiter.requirementsHelp")}</span>
                <textarea name="requirements" value={form.requirements} onChange={updateField} rows="5" placeholder={t("recruiter.requirementsPlaceholder")} />
                <em>{getFilledLength(form.requirements)} {t("recruiter.charactersCount")}</em>
              </label>
              <label className="job-form__textarea-card">
                <span className="job-form__textarea-head">
                  <strong>{t("recruiter.benefits")}</strong>
                  <small className="job-form__optional-tag">{t("recruiter.optionalTag")}</small>
                </span>
                <span className="job-form__textarea-note">{t("recruiter.benefitsHelp")}</span>
                <textarea name="benefits" value={form.benefits} onChange={updateField} rows="5" placeholder={t("recruiter.benefitsPlaceholder")} />
                <em>{getFilledLength(form.benefits)} {t("recruiter.charactersCount")}</em>
              </label>
            </div>
          </div>
          <div className="job-form__footer">
            <p>{t("recruiter.submitHint")}</p>
            <button type="submit" disabled={isSubmitting || hasReachedLimit}>{isSubmitting ? t("recruiter.submitting") : t("recruiter.submit")}</button>
          </div>
        </form>
        <aside className="recruiter-panel">
          <section className="plan-panel">
            <div className="recruiter-panel__header">
              <h2>{t("recruiter.planTitle")}</h2>
              <p>{t("recruiter.planText")}</p>
            </div>
            <div className="plan-panel__usage">
              <span style={{ width: `${planUsage}%` }}></span>
            </div>
            {hasReachedLimit && (
              <div className="job-form__tip" role="alert">
                <strong>{t("recruiter.limitReached")}</strong>
                <span>{t("recruiter.upgradeTip")}</span>
                <a href="#/planos">{t("recruiter.viewPlans")}</a>
              </div>
            )}
          </section>
          <div className="recruiter-panel__header">
            <h2>{t("recruiter.panelTitle")}</h2>
            <p>{completedItems}/{recommendedItems.length} {t("recruiter.panelProgress")}</p>
          </div>
          <div className="recruiter-panel__progress" aria-hidden="true">
            <span style={{ width: `${(completedItems / recommendedItems.length) * 100}%` }}></span>
          </div>
          <ul>
            {recommendedItems.map((item) => (
              <li className={item.complete ? "is-complete" : "is-pending"} key={item.label}>
                <span className="recruiter-panel__icon" aria-hidden="true">{item.complete ? "✓" : ""}</span>
                <strong>{item.label}</strong>
                <small>{item.complete ? t("recruiter.completeStatus") : t("recruiter.pendingStatus")}</small>
              </li>
            ))}
          </ul>
          <section className="my-jobs">
            <div className="recruiter-panel__header">
              <h2>{t("recruiter.myJobsTitle")}</h2>
              <p>{isLoadingJobs ? t("recruiter.loadingJobs") : `${activeJobs} ${t("recruiter.myJobsCount")}`}</p>
            </div>
            <div className="my-jobs__list">
              {!isLoadingJobs && recruiterSummary.jobs.length === 0 && <p>{t("recruiter.noJobs")}</p>}
              {recruiterSummary.jobs.map((job) => (
                <a href={`#/vaga/${job.id}`} className="my-jobs__item" key={job.id}>
                  <strong>{job.title}</strong>
                  <span>{job.city}, {job.country}</span>
                  <small>{job.publishedAt ? `${t("recruiter.publishedAt")} ${job.publishedAt}` : t("recruiter.published")}</small>
                </a>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

export default RecruiterPage;
