import { useMemo, useState } from "react";
import { createTranslator, getLanguageConfig } from "../../i18n/translations";
import "./JobsPage.css";

function normalize(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getContactHref(job) {
  if (job.contactMethod === "phone") {
    return `tel:${job.contact.replace(/[^\d+]/g, "")}`;
  }

  return `mailto:${job.contact}`;
}

function JobsPage({ jobs, selectedJob, initialSearch = "", language = "pt" }) {
  const t = createTranslator(language);
  const locale = getLanguageConfig(language).locale;
  const [filters, setFilters] = useState({ search: initialSearch, city: "", area: "", contract: "" });
  const areas = useMemo(() => [...new Set(jobs.map((job) => job.area))].sort(), [jobs]);
  const contracts = useMemo(() => [...new Set(jobs.map((job) => job.contract))].sort(), [jobs]);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }), [locale]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchableText = normalize(`${job.title} ${job.company} ${job.city} ${job.country} ${job.area} ${job.contract} ${job.languages}`);
      return (
        searchableText.includes(normalize(filters.search)) &&
        normalize(`${job.city} ${job.country}`).includes(normalize(filters.city)) &&
        (!filters.area || job.area === filters.area) &&
        (!filters.contract || job.contract === filters.contract)
      );
    });
  }, [filters, jobs]);

  const jobToShow = filteredJobs[0];
  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
  };

  if (selectedJob) {
    const contactButtonLabel = selectedJob.contactMethod === "phone" ? t("jobs.applyByPhone") : t("jobs.applyByEmail");

    return (
      <main className="jobs-page">
        <section className="job-detail-page">
          <article className="job-detail job-detail--full" aria-label={t("jobs.detailLabel")}>
            <div className="job-detail__topbar">
              <a className="job-detail__back" href="#/vagas">{t("jobs.backToJobs")}</a>
              <span className="job-detail__badge">{selectedJob.area}</span>
            </div>

            <header className="job-detail__header">
              <h1>{selectedJob.title}</h1>
              <p className="job-detail__company">{selectedJob.company}</p>
            </header>

            <div className="job-detail__facts job-detail__facts--grid">
              <div>
                <small>{t("jobs.salary")}</small>
                <strong>{selectedJob.salary}</strong>
              </div>
              <div>
                <small>{t("jobs.location")}</small>
                <span>{selectedJob.city}, {selectedJob.country}</span>
              </div>
              <div>
                <small>{t("jobs.contract")}</small>
                <span>{selectedJob.contract}</span>
              </div>
              <div>
                <small>{t("jobs.published")}</small>
                <span>{dateFormatter.format(new Date(`${selectedJob.publishedAt}T12:00:00`))}</span>
              </div>
              <div>
                <small>{t("jobs.contactMethod")}</small>
                <span>{selectedJob.contactMethod === "phone" ? t("recruiter.contactMethodPhone") : t("recruiter.contactMethodEmail")}</span>
              </div>
            </div>

            <h3>{t("jobs.description")}</h3><p>{selectedJob.description}</p>
            <h3>{t("jobs.requirements")}</h3><p>{selectedJob.requirements}</p>
            <h3>{t("jobs.languages")}</h3><p>{selectedJob.languages}</p>
            <h3>{t("jobs.benefits")}</h3><p>{selectedJob.benefits}</p>

            <a className="job-detail__contact" href={getContactHref(selectedJob)}>{contactButtonLabel}</a>
          </article>
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

      <section className="jobs-layout">
        <aside className="jobs-filters" aria-label={t("jobs.filtersLabel")}>
          <label>{t("jobs.search")}<input name="search" type="search" value={filters.search} onChange={updateFilter} placeholder={t("jobs.searchPlaceholder")} /></label>
          <label>{t("jobs.city")}<input name="city" type="search" value={filters.city} onChange={updateFilter} placeholder={t("jobs.cityPlaceholder")} /></label>
          <label>{t("jobs.area")}<select name="area" value={filters.area} onChange={updateFilter}><option value="">{t("jobs.allAreas")}</option>{areas.map((area) => <option value={area} key={area}>{area}</option>)}</select></label>
          <label>{t("jobs.contract")}<select name="contract" value={filters.contract} onChange={updateFilter}><option value="">{t("jobs.allContracts")}</option>{contracts.map((contract) => <option value={contract} key={contract}>{contract}</option>)}</select></label>
        </aside>

        <section className="jobs-results" aria-label={t("jobs.listLabel")}>
          {filteredJobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div><span>{job.contract}</span><h2>{job.title}</h2><p>{job.company}</p></div>
              <dl>
                <div><dt>{t("jobs.location")}</dt><dd>{job.city}, {job.country}</dd></div>
                <div><dt>{t("jobs.salary")}</dt><dd>{job.salary}</dd></div>
              </dl>
              <a href={`#/vaga/${job.id}`}>{t("jobs.details")}</a>
            </article>
          ))}
          {filteredJobs.length === 0 && <div className="jobs-empty"><h2>{t("jobs.emptyTitle")}</h2><p>{t("jobs.emptyText")}</p></div>}
        </section>

        <aside className="job-detail" aria-label={t("jobs.detailLabel")}>
          {jobToShow ? (
            <>
              <span>{jobToShow.area}</span><h2>{jobToShow.title}</h2><p className="job-detail__company">{jobToShow.company}</p>
              <div className="job-detail__facts">
                <strong>{jobToShow.salary}</strong><span>{jobToShow.city}, {jobToShow.country}</span><span>{jobToShow.contract}</span>
                <span>{t("jobs.published")} {dateFormatter.format(new Date(`${jobToShow.publishedAt}T12:00:00`))}</span>
              </div>
              <h3>{t("jobs.description")}</h3><p>{jobToShow.description}</p>
              <h3>{t("jobs.requirements")}</h3><p>{jobToShow.requirements}</p>
              <h3>{t("jobs.languages")}</h3><p>{jobToShow.languages}</p>
              <h3>{t("jobs.benefits")}</h3><p>{jobToShow.benefits}</p>
              <a className="job-detail__contact" href={getContactHref(jobToShow)}>{jobToShow.contactMethod === "phone" ? t("jobs.applyByPhone") : t("jobs.applyByEmail")}</a>
            </>
          ) : <p>{t("jobs.select")}</p>}
        </aside>
      </section>
    </main>
  );
}

export default JobsPage;
