import { useState } from "react";
import { emptyJobForm } from "../../data/jobs";
import { createTranslator } from "../../i18n/translations";
import "./RecruiterPage.css";

const requiredFields = ["title", "company", "city", "country", "area", "contract", "salary", "contact", "description"];

function hasText(value) {
  return value.trim().length > 0;
}

function formatMoney(value) {
  const digits = value.replace(/\D/g, "");
  return digits ? `€ ${Number(digits).toLocaleString("pt-BR")}` : "";
}

function RecruiterPage({ onCreateJob, language = "pt" }) {
  const t = createTranslator(language);
  const [form, setForm] = useState(emptyJobForm);
  const [submitted, setSubmitted] = useState(false);
  const [languageDraft, setLanguageDraft] = useState({ language: "", level: "" });
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const languageOptions = t("recruiter.languageOptions", []);
  const languageLevels = t("recruiter.languageLevels", []);
  const experienceOptions = t("recruiter.experienceOptions", []);
  const areaOptions = t("recruiter.areaOptions", []);
  const contractOptions = t("recruiter.contractOptions", []);
  const recommended = t("recruiter.recommended", []);

  const recommendedItems = [
    { label: recommended[0], complete: hasText(form.salary) },
    { label: recommended[1], complete: hasText(form.city) && hasText(form.country) && hasText(form.area) },
    { label: recommended[2], complete: hasText(form.contract) },
    { label: recommended[3], complete: selectedLanguages.length > 0 && hasText(form.experience) },
    { label: recommended[4], complete: hasText(form.contact) },
  ];
  const completedItems = recommendedItems.filter((item) => item.complete).length;
  const hasError = submitted && requiredFields.some((field) => !hasText(form[field]));

  function updateField(event) {
    const { name, value } = event.target;
    const nextValue = name === "isUrgent" || name === "hasAccommodation" ? value === "yes" : name === "salary" ? formatMoney(value) : value;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: nextValue,
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
      languages: languages.map((item) => `${item.language} ${item.level.toLowerCase()}`).join(", "),
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

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    if (requiredFields.some((field) => !hasText(form[field]))) return;
    onCreateJob(form);
  }

  return (
    <main className="recruiter-page">
      <section className="recruiter-hero"><p>{t("recruiter.eyebrow")}</p><h1>{t("recruiter.title")}</h1><span>{t("recruiter.text")}</span></section>
      <section className="recruiter-layout">
        <form className="job-form" onSubmit={handleSubmit}>
          <div className="job-form__header">
            <p>{t("recruiter.formEyebrow")}</p>
            <h2>{t("recruiter.formTitle")}</h2>
          </div>
          {hasError && <div className="job-form__alert" role="alert">{t("recruiter.error")}</div>}
          <div className="job-form__section">
            <span>{t("recruiter.sectionDetails")}</span>
          </div>
          <div className="job-form__grid">
            <label>{t("recruiter.titleField")}<input name="title" value={form.title} onChange={updateField} placeholder={t("recruiter.titlePlaceholder")} /></label>
            <label>{t("recruiter.company")}<input name="company" value={form.company} onChange={updateField} placeholder={t("recruiter.companyPlaceholder")} /></label>
            <label>{t("recruiter.city")}<input name="city" value={form.city} onChange={updateField} placeholder={t("recruiter.cityPlaceholder")} /></label>
            <label>{t("recruiter.country")}<input name="country" value={form.country} onChange={updateField} placeholder={t("recruiter.countryPlaceholder")} /></label>
            <label>{t("recruiter.area")}<select name="area" value={form.area} onChange={updateField} required><option value="" disabled>{t("recruiter.areaPlaceholder")}</option>{areaOptions.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
            <label>{t("recruiter.contract")}<select name="contract" value={form.contract} onChange={updateField} required><option value="" disabled>{t("recruiter.contractPlaceholder")}</option>{contractOptions.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
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
            <label>{t("recruiter.experience")}<select name="experience" value={form.experience} onChange={updateField}><option value="" disabled>{t("recruiter.experiencePlaceholder")}</option>{experienceOptions.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
            <div className="language-field">
              <span>{t("recruiter.languages")}</span>
              <div className="language-field__controls">
                <select name="language" value={languageDraft.language} onChange={updateLanguageDraft}><option value="" disabled>{t("recruiter.language")}</option>{languageOptions.map((item) => <option value={item} key={item}>{item}</option>)}</select>
                <select name="level" value={languageDraft.level} onChange={updateLanguageDraft}><option value="" disabled>{t("recruiter.level")}</option>{languageLevels.map((item) => <option value={item} key={item}>{item}</option>)}</select>
                <button type="button" onClick={addLanguage}>{t("recruiter.add")}</button>
              </div>
              <div className="language-field__chips" aria-label={t("recruiter.languages")}>
                {selectedLanguages.length === 0 && <small>{t("recruiter.noLanguage")}</small>}
                {selectedLanguages.map((item) => <button type="button" key={`${item.language}-${item.level}`} onClick={() => removeLanguage(item)}>{item.language} · {item.level}<span aria-hidden="true">×</span></button>)}
              </div>
            </div>
          </div>
          <div className="job-form__section">
            <span>{t("recruiter.sectionDescription")}</span>
          </div>
          <label>{t("recruiter.description")}<textarea name="description" value={form.description} onChange={updateField} rows="5" placeholder={t("recruiter.descriptionPlaceholder")} /></label>
          <label>{t("recruiter.requirements")}<textarea name="requirements" value={form.requirements} onChange={updateField} rows="4" placeholder={t("recruiter.requirementsPlaceholder")} /></label>
          <label>{t("recruiter.benefits")}<textarea name="benefits" value={form.benefits} onChange={updateField} rows="4" placeholder={t("recruiter.benefitsPlaceholder")} /></label>
          <div className="job-form__footer">
            <p>{t("recruiter.submitHint")}</p>
            <button type="submit">{t("recruiter.submit")}</button>
          </div>
        </form>
        <aside className="recruiter-panel">
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
        </aside>
      </section>
    </main>
  );
}

export default RecruiterPage;
