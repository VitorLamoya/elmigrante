import { useMemo, useEffect, useState } from "react";
import JobsMap from "../../components/JobsMap/JobsMap";
import {
  areaOptions,
  contractOptions,
  experienceOptions,
  getLocalizedJob,
  getOptionLabel,
  getSalaryLabel,
  languageLevelOptions,
  languageOptions,
} from "../../data/jobOptions";
import { createTranslator, getLanguageConfig } from "../../i18n/translations";
import { FiChevronLeft, FiChevronRight, FiClock, FiHeart, FiSearch, FiShare2, FiX } from "react-icons/fi";
import { HiOutlineBriefcase } from "react-icons/hi2";
import { removeSavedJobForCandidate, saveJobForCandidate, trackJobEvent } from "../../services/api";
import "./JobsPage.css";

const JOBS_PER_PAGE = 10;
function normalize(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getContactHref(job) {
  if (job.contactMethod === "phone") {
    return `tel:${job.contact.replace(/[^\d+]/g, "")}`;
  }

  return `mailto:${job.contact}`;
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function getLanguageRows(job, language) {
  if (Array.isArray(job.languageItems) && job.languageItems.length > 0) {
    return job.languageItems.map((item) => ({
      language: getOptionLabel(languageOptions, item.language, language),
      level: getOptionLabel(languageLevelOptions, item.level, language),
    }));
  }

  return (job.languages || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [languageLabel, levelLabel = ""] = item.split("·").map((value) => value.trim());
      return { language: languageLabel, level: levelLabel };
    });
}

function scrollToPageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function hasSalary(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length > 0 && Number(digits) > 0;
}

function getTextOrFallback(value, fallback) {
  return String(value || "").trim() || fallback;
}

function getPromotionPriority(job) {
  return job.isPromoted ? 1 : 0;
}

function getPromotedPlanClass(plan) {
  if (plan === "enterprise") return "enterprise";
  if (plan === "business") return "business";
  return "pro";
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function getFavoriteButtonClassName(isActive) {
  return isActive ? "job-save-button job-save-button--favorite is-active" : "job-save-button job-save-button--favorite";
}

function getApplyLaterButtonClassName(isActive) {
  return isActive ? "job-save-button job-save-button--apply-later is-active" : "job-save-button job-save-button--apply-later";
}

function JobsPage({ jobs, isJobsLoading = false, selectedJob, initialSearch = "", language = "pt", authSession, candidateDashboard, onCandidateDashboardUpdate }) {
  const t = createTranslator(language);
  const locale = getLanguageConfig(language).locale;
  const [filters, setFilters] = useState({ search: initialSearch, city: "", area: "", contract: "", language: "", experience: "", highlight: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);
  const [shareStatus, setShareStatus] = useState("");
  const [phoneMailModal, setphoneMailModal] = useState(false);
  const [savingState, setSavingState] = useState({});
  const areas = useMemo(() => areaOptions.map((item) => ({ value: item.value, label: item.labels[language] })), [language]);
  const contracts = useMemo(() => contractOptions.map((item) => ({ value: item.value, label: item.labels[language] })), [language]);
  const languageFilters = useMemo(() => languageOptions.map((item) => ({ value: item.value, label: item.labels[language] })), [language]);
  const experiences = useMemo(() => experienceOptions.map((item) => ({ value: item.value, label: item.labels[language] })), [language]);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }), [locale]);
  const todayIso = getTodayIso();
  const faqItems = t("jobs.faqItems", []);
  const hasActiveFilters = Object.values(filters).some(Boolean);
  const authRole = authSession?.user?.user_metadata?.role || authSession?.user?.app_metadata?.role || "";
  const candidateToken = authRole === "candidate" ? authSession?.session?.access_token : "";
  const favoriteIds = new Set((candidateDashboard?.favorites || []).map((job) => job.id));
  const applyLaterIds = new Set((candidateDashboard?.applyLater || []).map((job) => job.id));

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const localizedJob = getLocalizedJob(job, language);
        const searchableText = normalize(`${job.title} ${job.company} ${localizedJob.city} ${localizedJob.country} ${localizedJob.area} ${localizedJob.contract} ${localizedJob.languages} ${localizedJob.experience} ${job.description} ${job.requirements} ${job.benefits}`);
        const languageLabel = filters.language ? getOptionLabel(languageOptions, filters.language, language) : "";
        const matchesLanguage = !filters.language || (
          Array.isArray(job.languageItems) && job.languageItems.length > 0
            ? job.languageItems.some((item) => item.language === filters.language)
            : normalize(localizedJob.languages).includes(normalize(languageLabel))
        );
        const matchesExperience = !filters.experience || job.experienceCode === filters.experience || localizedJob.experience === filters.experience;
        const matchesHighlight =
          !filters.highlight ||
          (filters.highlight === "urgent" && job.isUrgent) ||
          (filters.highlight === "today" && job.publishedAt === todayIso) ||
          (filters.highlight === "housing" && job.hasAccommodation) ||
          (filters.highlight === "salary" && hasSalary(job.salary));

        return (
          searchableText.includes(normalize(filters.search)) &&
          normalize(`${localizedJob.city} ${localizedJob.country}`).includes(normalize(filters.city)) &&
          (!filters.area || job.areaCode === filters.area || localizedJob.area === filters.area) &&
          (!filters.contract || job.contractCode === filters.contract || localizedJob.contract === filters.contract) &&
          matchesLanguage &&
          matchesExperience &&
          matchesHighlight
        );
      })
      .sort((firstJob, secondJob) => {
        const promotionDifference = getPromotionPriority(secondJob) - getPromotionPriority(firstJob);
        if (promotionDifference !== 0) return promotionDifference;

        return new Date(`${secondJob.publishedAt}T12:00:00`) - new Date(`${firstJob.publishedAt}T12:00:00`);
      });
  }, [filters, jobs, language, todayIso]);

  const mapLocations = useMemo(() => {
    const groupedLocations = filteredJobs.reduce((locations, job) => {
      const localizedJob = getLocalizedJob(job, language);
      const key = `${localizedJob.city}, ${localizedJob.country}`;

      if (!locations[key]) {
        locations[key] = {
          latitude: job.latitude,
          longitude: job.longitude,
          label: key,
          count: 0,
        };
      }

      locations[key].count += 1;
      return locations;
    }, {});

    return Object.values(groupedLocations).sort((firstLocation, secondLocation) => secondLocation.count - firstLocation.count);
  }, [filteredJobs, language]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const visibleJobs = filteredJobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);
  const paginationPages = useMemo(() => {
    const pageSet = new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages]);

    return Array.from(pageSet)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((firstPage, secondPage) => firstPage - secondPage);
  }, [currentPage, totalPages]);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const otherOpenJobs = useMemo(() => {
    if (!selectedJob) return [];

    return jobs
      .filter((job) => job.id !== selectedJob.id)
      .sort((firstJob, secondJob) => {
        const promotionDifference = getPromotionPriority(secondJob) - getPromotionPriority(firstJob);
        if (promotionDifference !== 0) return promotionDifference;

        return new Date(`${secondJob.publishedAt}T12:00:00`) - new Date(`${firstJob.publishedAt}T12:00:00`);
      })
      .slice(0, 3);
  }, [jobs, selectedJob]);
  const selectedJobDisplay = selectedJob ? getLocalizedJob(selectedJob, language) : null;
  const selectedJobSalary = selectedJob ? getSalaryLabel(selectedJob.salary, t("jobs.salaryNotInformed")) : "";
  const selectedJobLanguages = selectedJob ? getLanguageRows(selectedJob, language) : [];
  const selectedJobRequirements = selectedJob ? getTextOrFallback(selectedJob.requirements, t("jobs.textNotInformed")) : "";
  const selectedJobBenefits = selectedJob ? getTextOrFallback(selectedJob.benefits, t("jobs.textNotInformed")) : "";
  const selectedJobPromotionClass = selectedJob ? getPromotedPlanClass(selectedJob.recruiterPlan) : "pro";
  const selectedJobMapLocations = useMemo(() => {
    if (!selectedJob || !Number.isFinite(selectedJob.latitude) || !Number.isFinite(selectedJob.longitude)) {
      return [];
    }

    return [
      {
        latitude: selectedJob.latitude,
        longitude: selectedJob.longitude,
        label: `${selectedJobDisplay?.city || selectedJob.city}, ${selectedJobDisplay?.country || selectedJob.country}`,
        count: 1,
      },
    ];
  }, [selectedJob, selectedJobDisplay]);

  useEffect(() => {
    if (!selectedJob?.id) return;
    trackJobEvent(selectedJob.id, "view").catch(() => {});
  }, [selectedJob?.id]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setFilters((currentFilters) => ({ ...currentFilters, search: initialSearch }));
    setCurrentPage(1);
  }, [initialSearch]);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: "", city: "", area: "", contract: "", language: "", experience: "", highlight: "" });
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
    scrollToPageTop();
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
    scrollToPageTop();
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    scrollToPageTop();
  };

  const shareJob = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/vaga/${selectedJob.id}`;
    const shareData = {
      title: selectedJob.title,
      text: `${selectedJob.title} - ${selectedJob.company}`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }

      setShareStatus(t("jobs.shareCopied"));
      window.setTimeout(() => setShareStatus(""), 2400);
    } catch (error) {
      setShareStatus("");
    }
  };

  async function toggleSavedJob(job, listType) {
    if (!candidateToken) {
      window.location.hash = "#/login?audience=candidate";
      return;
    }

    if (!isUuid(job.id)) {
      window.alert(t("jobs.saveUnavailable", "Esta vaga ainda não está sincronizada com o banco de dados. Publique ou recarregue as vagas antes de salvar."));
      return;
    }

    const isFavorite = listType === "favorite";
    const activeSet = isFavorite ? favoriteIds : applyLaterIds;
    const alreadySaved = activeSet.has(job.id);

    try {
      setSavingState((currentState) => ({ ...currentState, [`${job.id}:${listType}`]: true }));

      if (alreadySaved) {
        await removeSavedJobForCandidate(job.id, listType, candidateToken);
      } else {
        await saveJobForCandidate(job.id, listType, candidateToken);
      }

      const currentDashboard = candidateDashboard || { favorites: [], applyLater: [], user: null };
      const nextFavorites = isFavorite
        ? (alreadySaved ? currentDashboard.favorites.filter((item) => item.id !== job.id) : [{ ...job, savedAt: new Date().toISOString() }, ...currentDashboard.favorites.filter((item) => item.id !== job.id)])
        : currentDashboard.favorites;
      const nextApplyLater = !isFavorite
        ? (alreadySaved ? currentDashboard.applyLater.filter((item) => item.id !== job.id) : [{ ...job, savedAt: new Date().toISOString() }, ...currentDashboard.applyLater.filter((item) => item.id !== job.id)])
        : currentDashboard.applyLater;

      onCandidateDashboardUpdate?.({
        ...currentDashboard,
        favorites: nextFavorites,
        applyLater: nextApplyLater,
      });
    } finally {
      setSavingState((currentState) => ({ ...currentState, [`${job.id}:${listType}`]: false }));
    }
  }

  if (selectedJob) {
    return (
      <main className="jobs-page">
        <section className="job-detail-page">
          <article className="job-detail job-detail--full" aria-label={t("jobs.detailLabel")}>
            <div className="job-detail__topbar">
              <a className="job-detail__back" href="#/vagas">{t("jobs.backToJobs")}</a>
              <div className="job-detail__topbar-tags">
                <span className="job-detail__badge">{selectedJobDisplay.area}</span>
                {selectedJob.isPromoted && <span className={`job-detail__badge job-detail__badge--promoted job-detail__badge--promoted-${selectedJobPromotionClass}`}>{t("jobs.promotedFlag")}</span>}
              </div>
            </div>

            <header className="job-detail__header">
              <div>
                <h1>{selectedJob.title}</h1>
                <p className="job-detail__company"><HiOutlineBriefcase color="blue" size={14}/> {selectedJob.company}</p>
                <div className="job-detail__meta-line">
                  <span>{selectedJobDisplay.city}, {selectedJobDisplay.country}</span>
                  <span>{selectedJobDisplay.contract}</span>
                  <span>{t("jobs.published")} {dateFormatter.format(new Date(`${selectedJob.publishedAt}T12:00:00`))}</span>
                </div>
              </div>
              <button type="button" className="job-detail__share" onClick={shareJob}>
                <FiShare2 aria-hidden="true" />
                <span>{shareStatus || t("jobs.shareJob")}</span>
              </button>
            </header>

            <div className="job-detail__overview">
              <div className="job-detail__content">
                <div className="job-detail__facts job-detail__facts--grid">
                  <div>
                    <small>{t("jobs.salary")}</small>
                    <strong>{selectedJobSalary}</strong>
                  </div>
                  <div>
                    <small>{t("jobs.location")}</small>
                    <span>{selectedJobDisplay.city}, {selectedJobDisplay.country}</span>
                  </div>
                  <div>
                    <small>{t("jobs.contract")}</small>
                    <span>{selectedJobDisplay.contract}</span>
                  </div>
                  <div>
                    <small>{t("jobs.published")}</small>
                    <span>{dateFormatter.format(new Date(`${selectedJob.publishedAt}T12:00:00`))}</span>
                  </div>
                </div>

                <div className="job-detail__sections">
                  <section className="job-detail__section job-detail__section--primary">
                    <h3>{t("jobs.description")}</h3>
                    <p>{selectedJob.description}</p>
                  </section>
                  <section className="job-detail__section">
                    <h3>{t("jobs.requirements")}</h3>
                    <p className={selectedJob.requirements?.trim() ? "" : "job-detail__text--fallback"}>{selectedJobRequirements}</p>
                  </section>
                  <section className="job-detail__section">
                    <h3>{t("jobs.languages")}</h3>
                    <ul className="job-detail__language-list">
                      {selectedJobLanguages.map((item) => (
                        <li key={`${item.language}-${item.level}`}>
                          <span aria-hidden="true"></span>
                          <strong>{item.language}</strong>
                          {item.level && <small>{item.level}</small>}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section className="job-detail__section">
                    <h3>{t("jobs.benefits")}</h3>
                    <p className={selectedJob.benefits?.trim() ? "" : "job-detail__text--fallback"}>{selectedJobBenefits}</p>
                  </section>
                </div>

                {selectedJob.hasAccommodation && (
                  <section className="job-detail__housing" aria-label={t("jobs.housingTitle")}>
                    <strong>{t("jobs.housingTitle")}</strong>
                    <p>{t("jobs.housingText")}</p>
                  </section>
                )}
              </div>

              <aside className="job-detail__sidebar">
                <aside className="job-detail__apply-panel" aria-label={t("jobs.applyPanelTitle")}>
                  <span>{t("jobs.applyPanelTitle")}</span>
                  <strong>{selectedJob.company}</strong>
                  <p>{t("jobs.applyPanelText")}</p>
                  {selectedJobMapLocations.length > 0 && (
                    <div className="job-detail__map job-detail__map--sidebar" aria-label={t("jobs.mapLabel")}>
                      <JobsMap locations={selectedJobMapLocations} jobLabel={t("jobs.mapJob")} jobsLabel={t("jobs.mapJobs")} />
                    </div>
                  )}
                  <div className="job-detail__apply-summary">
                    <div>
                      <small>{t("jobs.location")}</small>
                      <span>{selectedJobDisplay.city}, {selectedJobDisplay.country}</span>
                    </div>
                    <div>
                      <small>{t("jobs.salary")}</small>
                      <span>{selectedJobSalary}</span>
                    </div>
                  </div>
                  <div className="job-detail__save-actions">
                    <button
                      type="button"
                      className={getFavoriteButtonClassName(favoriteIds.has(selectedJob.id))}
                      onClick={() => toggleSavedJob(selectedJob, "favorite")}
                      disabled={savingState[`${selectedJob.id}:favorite`]}
                    >
                      <FiHeart aria-hidden="true" />
                      {favoriteIds.has(selectedJob.id) ? t("jobs.removeFavorite", "Remover favorito") : t("jobs.addFavorite", "Favoritar")}
                    </button>
                    <button
                      type="button"
                      className={getApplyLaterButtonClassName(applyLaterIds.has(selectedJob.id))}
                      onClick={() => toggleSavedJob(selectedJob, "apply_later")}
                      disabled={savingState[`${selectedJob.id}:apply_later`]}
                    >
                      <FiClock aria-hidden="true" />
                      {applyLaterIds.has(selectedJob.id) ? t("jobs.removeApplyLater", "Remover de aplicar depois") : t("jobs.addApplyLater", "Aplicar depois")}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="job-detail__contact"
                    onClick={() => {
                      trackJobEvent(selectedJob.id, "contact_click").catch(() => {});
                      setphoneMailModal(true);
                      return;
                    }}
                  >
                    {selectedJob.contactMethod === "phone"
                      ? t("jobs.applyByPhone")
                      : t("jobs.applyByEmail")}
                  </button>
                </aside>
              </aside>
            </div>

            <section className="job-detail__faq" aria-label={t("jobs.faqTitle")}>
              <h2>{t("jobs.faqTitle")}</h2>
              <div className="job-detail__faq-list">
                {faqItems.map((item, index) => {
                  const isOpen = openFaq === index;

                  return (
                    <div className={isOpen ? "job-detail__faq-item is-open" : "job-detail__faq-item"} key={item.question}>
                      <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)} aria-expanded={isOpen}>
                        <span>{item.question}</span>
                        <small aria-hidden="true">{isOpen ? "−" : "+"}</small>
                      </button>
                      {isOpen && <p>{item.answer}</p>}
                    </div>
                  );
                })}
              </div>
            </section>

            {otherOpenJobs.length > 0 && (
              <section className="job-detail__other" aria-label={t("jobs.otherOpenPositions")}>
                <h2>{t("jobs.otherOpenPositions")}</h2>
                <div className="job-detail__other-list">
                  {otherOpenJobs.map((job) => (
                    <a className="job-detail__other-card" href={`#/vaga/${job.id}`} key={job.id}>
                      <div>
                        <strong>{job.title}</strong>
                        <span>{getLocalizedJob(job, language).city}, {getLocalizedJob(job, language).country} · {getSalaryLabel(job.salary, t("jobs.salaryNotInformed"))}</span>
                      </div>
                      <small>{t("jobs.details")} →</small>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </article>
        </section>
        {phoneMailModal && (
          <div className="phone-modal-overlay">
            <div className="phone-modal" role="dialog" aria-modal="true" aria-labelledby="phone-modal-title">
              <button
                className="phone-modal__close"
                onClick={() => setphoneMailModal(false)}
                aria-label={t("jobs.closeModal")}
              >
                ×
              </button>

              <div className="phone-modal__header">
                <span aria-hidden="true">{selectedJob.contactMethod === "phone" ? "☎" : "✉"}</span>
                <div>
                  <p>{selectedJob.contactMethod === "phone" ? t("recruiter.contactMethodPhone") : t("recruiter.contactMethodEmail")}</p>
                  <h2 id="phone-modal-title">{selectedJob.company}</h2>
                </div>
              </div>

              <p className="phone-modal__intro">{t("jobs.contactRecruiter")}</p>

              <div className="phone-modal__info">
                <strong>
                  {selectedJob.contactMethod === "phone"
                    ? t("recruiter.contactMethodPhone")
                    : t("recruiter.contactMethodEmail")}
                </strong>

                <span>{selectedJob.contact}</span>
              </div>

              <div className="phone-modal__info">
                <strong>{t("recruiter.vacance")}</strong>
                <span>{selectedJob.title}</span>
              </div>

              <a
                className="phone-modal__action"
                href={getContactHref(selectedJob)}
              >
                {selectedJob.contactMethod === "phone"
                  ? t("recruiter.contactNow")
                  : t("recruiter.sendEmail")}
              </a>
            </div>
          </div>
        )}
      </main>
    );
  }

  if (isJobsLoading) {
    return (
      <main className="jobs-page">
        <section className="jobs-hero jobs-hero--loading" aria-hidden="true">
          <div className="jobs-loading-block jobs-loading-block--hero" />
          <div className="jobs-loading-block jobs-loading-block--counter" />
        </section>

        <section className="jobs-map jobs-map--loading" aria-hidden="true">
          <div className="jobs-loading-block jobs-loading-block--map-copy" />
          <div className="jobs-loading-block jobs-loading-block--map" />
        </section>

        <section className="jobs-layout">
          <aside className="jobs-filters jobs-filters--loading" aria-hidden="true">
            <div className="jobs-loading-block jobs-loading-block--filters" />
          </aside>
          <section className="jobs-results" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <article className="job-card job-card--loading" key={`jobs-loading-${index}`}>
                <div className="jobs-loading-block jobs-loading-block--title" />
                <div className="jobs-loading-block jobs-loading-block--line" />
                <div className="jobs-loading-block jobs-loading-block--tags" />
                <div className="jobs-loading-block jobs-loading-block--description" />
                <div className="jobs-loading-block jobs-loading-block--footer" />
              </article>
            ))}
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="jobs-page">
      <section className="jobs-hero">
        <div><p>{t("jobs.eyebrow")}</p><h1>{t("jobs.title")}</h1></div>
        <span>{filteredJobs.length} {t("jobs.found")}</span>
      </section>

      <section className="jobs-map" aria-label={t("jobs.mapLabel")}>
        <div className="jobs-map__content">
          <div>
            <p>{t("jobs.mapEyebrow")}</p>
            <h2>{t("jobs.mapTitle")}</h2>
            <span>{t("jobs.mapText")}</span>
          </div>
          <ul>
            {mapLocations.slice(0, 4).map((location) => (
              <li key={location.label}>
                <strong>{location.label}</strong>
                <span>{location.count} {location.count === 1 ? t("jobs.mapJob") : t("jobs.mapJobs")}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="jobs-map__visual">
          <JobsMap locations={mapLocations} jobLabel={t("jobs.mapJob")} jobsLabel={t("jobs.mapJobs")} />
        </div>
      </section>

      <section className="jobs-layout">
        <aside className="jobs-filters" aria-label={t("jobs.filtersLabel")}>
          <div className="jobs-filters__header">
            <p>{t("jobs.filtersLabel")}</p>
            <h2>{t("jobs.filtersTitle")}</h2>
            <span>{filteredJobs.length} {t("jobs.found")}</span>
          </div>
          <div className="jobs-filters__body">
            <label className="jobs-filter__field jobs-filter__field--search">
              <span>{t("jobs.search")}</span>
              <div>
                <FiSearch aria-hidden="true" />
                <input name="search" type="search" value={filters.search} onChange={updateFilter} placeholder={t("jobs.searchPlaceholder")} />
              </div>
            </label>
            <label className="jobs-filter__field">
              <span>{t("jobs.city")}</span>
              <input name="city" type="search" value={filters.city} onChange={updateFilter} placeholder={t("jobs.cityPlaceholder")} />
            </label>
            <label className="jobs-filter__field">
              <span>{t("jobs.area")}</span>
              <select name="area" value={filters.area} onChange={updateFilter}><option value="">{t("jobs.allAreas")}</option>{areas.map((area) => <option value={area.value} key={area.value}>{area.label}</option>)}</select>
            </label>
            <label className="jobs-filter__field">
              <span>{t("jobs.contract")}</span>
              <select name="contract" value={filters.contract} onChange={updateFilter}><option value="">{t("jobs.allContracts")}</option>{contracts.map((contract) => <option value={contract.value} key={contract.value}>{contract.label}</option>)}</select>
            </label>
            <label className="jobs-filter__field">
              <span>{t("jobs.languageFilter")}</span>
              <select name="language" value={filters.language} onChange={updateFilter}><option value="">{t("jobs.allLanguages")}</option>{languageFilters.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select>
            </label>
            <label className="jobs-filter__field">
              <span>{t("jobs.experienceFilter")}</span>
              <select name="experience" value={filters.experience} onChange={updateFilter}><option value="">{t("jobs.allExperiences")}</option>{experiences.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select>
            </label>
            <label className="jobs-filter__field">
              <span>{t("jobs.highlightsFilter")}</span>
              <select name="highlight" value={filters.highlight} onChange={updateFilter}>
                <option value="">{t("jobs.allHighlights")}</option>
                <option value="urgent">{t("jobs.highlightUrgent")}</option>
                <option value="today">{t("jobs.highlightToday")}</option>
                <option value="housing">{t("jobs.highlightHousing")}</option>
                <option value="salary">{t("jobs.highlightSalary")}</option>
              </select>
            </label>
            <button className="jobs-filters__clear" type="button" onClick={clearFilters} disabled={!hasActiveFilters}>
              <FiX aria-hidden="true" />
              {t("jobs.clearFilters")}
            </button>
          </div>
        </aside>

        <section className="jobs-results" aria-label={t("jobs.listLabel")}>
          {visibleJobs.map((job) => {
            const localizedJob = getLocalizedJob(job, language);
            const promotionClass = getPromotedPlanClass(job.recruiterPlan);

            return (
              <article className={job.isPromoted ? `job-card job-card--promoted job-card--promoted-${promotionClass}` : "job-card"} key={job.id}>
                <header className="job-card__header">
                  <div>
                    <h2>{job.title}</h2>
                    <p>{job.company}</p>
                    <div className="job-card__summary">
                      <span>{localizedJob.city}, {localizedJob.country}</span>
                      <span>{getSalaryLabel(job.salary, t("jobs.salaryNotInformed"))}</span>
                      <span>{t("jobs.postedOn")} {dateFormatter.format(new Date(`${job.publishedAt}T12:00:00`))}</span>
                    </div>
                  </div>
                  {job.isPromoted && (
                    <span className={`job-card__promotion job-card__promotion--${promotionClass}`}>
                      {t("jobs.promotedFlag")}
                    </span>
                  )}
                </header>
                <div className="job-card__tags" aria-label="Job highlights">
                  <span className="job-card__contract">{localizedJob.contract}</span>
                  {job.isUrgent && <span className="job-card__flag job-card__flag--urgent">{t("jobs.urgentFlag")}</span>}
                  {job.publishedAt === todayIso && <span className="job-card__flag job-card__flag--today">{t("jobs.todayFlag")}</span>}
                  {job.hasAccommodation && <span className="job-card__flag job-card__flag--housing">{t("jobs.housingTag")}</span>}
                </div>
                <div className="job-card__description">
                  <strong>{t("jobs.description")}</strong>
                  <p>{job.description}</p>
                </div>
                <footer className="job-card__footer">
                  <div className="job-card__meta">
                    <span>{localizedJob.area}</span>
                    <span>{job.views || 0} {t("jobs.viewsCount")}</span>
                  </div>
                  <div className="job-card__actions">
                    <button
                      type="button"
                      className={getFavoriteButtonClassName(favoriteIds.has(job.id))}
                      onClick={() => toggleSavedJob(job, "favorite")}
                      disabled={savingState[`${job.id}:favorite`]}
                    >
                      <FiHeart aria-hidden="true" />
                      {favoriteIds.has(job.id) ? t("jobs.removeFavorite", "Remover favorito") : t("jobs.addFavorite", "Favoritar")}
                    </button>
                    <a href={`#/vaga/${job.id}`}>{t("jobs.details")}</a>
                  </div>
                </footer>
              </article>
            );
          })}
          {filteredJobs.length === 0 && <div className="jobs-empty"><h2>{t("jobs.emptyTitle")}</h2><p>{t("jobs.emptyText")}</p></div>}
          <nav className="jobs-pagination" aria-label={t("jobs.paginationLabel")}>
            <div className="jobs-pagination__summary">
              <strong>{t("jobs.page")} {currentPage}</strong>
              <span>{t("jobs.pageOf")} {totalPages}</span>
            </div>
            <div className="jobs-pagination__controls">
              <button className="jobs-pagination__arrow" type="button" onClick={goToPreviousPage} disabled={!canGoPrevious} aria-label={t("jobs.previousPage")}>
                <FiChevronLeft aria-hidden="true" />
                <span>{t("jobs.previousPage")}</span>
              </button>
              <div className="jobs-pagination__pages">
                {paginationPages.map((page) => (
                  <button
                    className={page === currentPage ? "is-current" : ""}
                    type="button"
                    onClick={() => goToPage(page)}
                    aria-current={page === currentPage ? "page" : undefined}
                    key={page}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button className="jobs-pagination__arrow" type="button" onClick={goToNextPage} disabled={!canGoNext} aria-label={t("jobs.nextPage")}>
                <span>{t("jobs.nextPage")}</span>
                <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          </nav>
        </section>
      </section>
    </main>
  );
}

export default JobsPage;
