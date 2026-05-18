import { useMemo, useEffect, useState } from "react";
import { createTranslator, getLanguageConfig } from "../../i18n/translations";
import { FiShare2 } from "react-icons/fi";
import { HiOutlineBriefcase } from "react-icons/hi2";
import "./JobsPage.css";

const JOBS_PER_PAGE = 10;
const mapCoordinates = {
  "lisboa portugal": { x: 20, y: 64 },
  "porto portugal": { x: 18, y: 61 },
  "portugal": { x: 20, y: 70 },
  "madrid espanha": { x: 29, y: 70 },
  "barcelona espanha": { x: 36, y: 66 },
  "espanha": { x: 30, y: 70 },
  "paris franca": { x: 43, y: 53 },
  "franca": { x: 42, y: 57 },
  "berlim alemanha": { x: 54, y: 43 },
  "munique alemanha": { x: 52, y: 55 },
  "alemanha": { x: 53, y: 47 },
  "roma italia": { x: 55, y: 71 },
  "milan italia": { x: 51, y: 61 },
  "italia": { x: 55, y: 68 },
  "amsterda holanda": { x: 47, y: 43 },
  "amsterdam holanda": { x: 47, y: 43 },
  "holanda": { x: 47, y: 43 },
  "bruxelas belgica": { x: 45, y: 47 },
  "belgica": { x: 45, y: 47 },
  "londres reino unido": { x: 38, y: 44 },
  "reino unido": { x: 38, y: 44 },
  "dublin irlanda": { x: 31, y: 42 },
  "irlanda": { x: 31, y: 42 },
  "viena austria": { x: 58, y: 56 },
  "austria": { x: 58, y: 56 },
  "zurique suica": { x: 48, y: 58 },
  "suica": { x: 48, y: 58 },
  "varsovia polonia": { x: 64, y: 43 },
  "polonia": { x: 64, y: 43 },
  "praga republica tcheca": { x: 57, y: 50 },
  "republica tcheca": { x: 57, y: 50 },
  "copenhague dinamarca": { x: 52, y: 34 },
  "dinamarca": { x: 52, y: 34 },
  "estocolmo suecia": { x: 60, y: 24 },
  "suecia": { x: 60, y: 24 },
  "oslo noruega": { x: 52, y: 20 },
  "noruega": { x: 52, y: 20 },
};

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

function scrollToPageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function getMapCoordinate(job) {
  const cityCountryKey = normalize(`${job.city} ${job.country}`);
  const countryKey = normalize(job.country);
  return mapCoordinates[cityCountryKey] || mapCoordinates[countryKey] || { x: 50, y: 50 };
}

function JobsPage({ jobs, selectedJob, initialSearch = "", language = "pt" }) {
  const t = createTranslator(language);
  const locale = getLanguageConfig(language).locale;
  const [filters, setFilters] = useState({ search: initialSearch, city: "", area: "", contract: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);
  const [shareStatus, setShareStatus] = useState("");
  const [phoneMailModal, setphoneMailModal] = useState(false);
  const areas = useMemo(() => [...new Set(jobs.map((job) => job.area))].sort(), [jobs]);
  const contracts = useMemo(() => [...new Set(jobs.map((job) => job.contract))].sort(), [jobs]);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }), [locale]);
  const todayIso = getTodayIso();
  const faqItems = t("jobs.faqItems", []);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const searchableText = normalize(`${job.title} ${job.company} ${job.city} ${job.country} ${job.area} ${job.contract} ${job.languages}`);
        return (
          searchableText.includes(normalize(filters.search)) &&
          normalize(`${job.city} ${job.country}`).includes(normalize(filters.city)) &&
          (!filters.area || job.area === filters.area) &&
          (!filters.contract || job.contract === filters.contract)
        );
      })
      .sort((firstJob, secondJob) => new Date(`${secondJob.publishedAt}T12:00:00`) - new Date(`${firstJob.publishedAt}T12:00:00`));
  }, [filters, jobs]);

  const mapLocations = useMemo(() => {
    const groupedLocations = filteredJobs.reduce((locations, job) => {
      const key = `${job.city}, ${job.country}`;
      const coordinate = getMapCoordinate(job);

      if (!locations[key]) {
        locations[key] = {
          ...coordinate,
          label: key,
          count: 0,
        };
      }

      locations[key].count += 1;
      return locations;
    }, {});

    return Object.values(groupedLocations).sort((firstLocation, secondLocation) => secondLocation.count - firstLocation.count);
  }, [filteredJobs]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const visibleJobs = filteredJobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const otherOpenJobs = useMemo(() => {
    if (!selectedJob) return [];

    return jobs
      .filter((job) => job.id !== selectedJob.id)
      .sort((firstJob, secondJob) => new Date(`${secondJob.publishedAt}T12:00:00`) - new Date(`${firstJob.publishedAt}T12:00:00`))
      .slice(0, 3);
  }, [jobs, selectedJob]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
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

  if (selectedJob) {
    return (
      <main className="jobs-page">
        <section className="job-detail-page">
          <article className="job-detail job-detail--full" aria-label={t("jobs.detailLabel")}>
            <div className="job-detail__topbar">
              <a className="job-detail__back" href="#/vagas">{t("jobs.backToJobs")}</a>
              <span className="job-detail__badge">{selectedJob.area}</span>
            </div>

            <header className="job-detail__header">
              <div>
                <h1>{selectedJob.title}</h1>
                <p className="job-detail__company"><HiOutlineBriefcase color="blue" size={14}/> {selectedJob.company}</p>
              </div>
              <button type="button" className="job-detail__share" onClick={shareJob}>
                <FiShare2 aria-hidden="true" />
                <span>{shareStatus || t("jobs.shareJob")}</span>
              </button>
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
            </div>

            <div className="job-detail__sections">
              <section className="job-detail__section">
                <h3>{t("jobs.description")}</h3>
                <p>{selectedJob.description}</p>
              </section>
              <section className="job-detail__section">
                <h3>{t("jobs.requirements")}</h3>
                <p>{selectedJob.requirements}</p>
              </section>
              <section className="job-detail__section">
                <h3>{t("jobs.languages")}</h3>
                <p>{selectedJob.languages}</p>
              </section>
              <section className="job-detail__section">
                <h3>{t("jobs.benefits")}</h3>
                <p>{selectedJob.benefits}</p>
              </section>
            </div>

            {selectedJob.hasAccommodation && (
              <section className="job-detail__housing" aria-label={t("jobs.housingTitle")}>
                <strong>{t("jobs.housingTitle")}</strong>
                <p>{t("jobs.housingText")}</p>
              </section>
            )}

            <aside className="job-detail__apply-panel" aria-label={t("jobs.applyPanelTitle")}>
                <span>{t("jobs.applyPanelTitle")}</span>
                <strong>{selectedJob.company}</strong>
                <p>{t("jobs.applyPanelText")}</p>
                <button
                  type="button"
                  className="job-detail__contact"
                  onClick={() => {
                    setphoneMailModal(true);
                    return;
                  }}
                >
                  {selectedJob.contactMethod === "phone"
                    ? t("jobs.applyByPhone")
                    : t("jobs.applyByEmail")}
                </button>
              </aside>

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
                        <span>{job.city}, {job.country} · {job.salary}</span>
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
        <div className="jobs-map__visual" aria-hidden="true">
          <svg className="jobs-map__canvas" viewBox="0 0 760 360" role="img">
            <path className="jobs-map__land" d="M112 142L156 104L224 82L314 94L394 66L520 90L612 136L654 218L600 284L460 306L348 278L244 300L154 250Z" />
            <path className="jobs-map__region" d="M286 112L322 70L392 78L434 124L404 180L330 174Z" />
            <path className="jobs-map__region" d="M440 114L518 92L590 126L616 190L554 232L482 196Z" />
            <path className="jobs-map__region" d="M210 188L274 166L330 206L306 274L226 294L172 244Z" />
            <path className="jobs-map__region" d="M392 214L458 198L510 242L496 314L430 322L382 270Z" />
            <path className="jobs-map__road jobs-map__road--main" d="M150 238C230 210 280 198 350 210C432 224 486 198 596 154" />
            <path className="jobs-map__road jobs-map__road--main" d="M222 292C270 242 306 212 358 174C410 136 464 116 588 128" />
            <path className="jobs-map__road" d="M198 132C272 146 342 150 414 124C474 102 538 104 626 166" />
            <path className="jobs-map__road" d="M342 278C386 236 412 198 438 152C462 110 494 90 542 92" />
            <text x="132" y="232">Lisboa</text>
            <text x="252" y="246">Madrid</text>
            <text x="392" y="174">Paris</text>
            <text x="488" y="142">Berlim</text>
          </svg>
          <div className="jobs-map__pins">
            {mapLocations.map((location) => (
              <span
                className="jobs-map__point"
                key={location.label}
                style={{
                  left: `${location.x}%`,
                  top: `${location.y}%`,
                  "--point-size": `${Math.min(32, 14 + location.count * 4)}px`,
                }}
                title={`${location.label}: ${location.count}`}
              >
                <span></span>
                <small>{location.count}</small>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="jobs-layout">
        <aside className="jobs-filters" aria-label={t("jobs.filtersLabel")}>
          <label>{t("jobs.search")}<input name="search" type="search" value={filters.search} onChange={updateFilter} placeholder={t("jobs.searchPlaceholder")} /></label>
          <label>{t("jobs.city")}<input name="city" type="search" value={filters.city} onChange={updateFilter} placeholder={t("jobs.cityPlaceholder")} /></label>
          <label>{t("jobs.area")}<select name="area" value={filters.area} onChange={updateFilter}><option value="">{t("jobs.allAreas")}</option>{areas.map((area) => <option value={area} key={area}>{area}</option>)}</select></label>
          <label>{t("jobs.contract")}<select name="contract" value={filters.contract} onChange={updateFilter}><option value="">{t("jobs.allContracts")}</option>{contracts.map((contract) => <option value={contract} key={contract}>{contract}</option>)}</select></label>
        </aside>

        <section className="jobs-results" aria-label={t("jobs.listLabel")}>
          {visibleJobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-card__meta">
                <span className="job-card__contract">{job.contract}</span>
                <div className="job-card__flags" aria-label="Job highlights">
                  {job.isUrgent && <span className="job-card__flag job-card__flag--urgent">{t("jobs.urgentFlag")}</span>}
                  {job.publishedAt === todayIso && <span className="job-card__flag job-card__flag--today">{t("jobs.todayFlag")}</span>}
                </div>
              </div>
              <div>
                <h2>{job.title}</h2>
                <p>{job.company}</p>
              </div>
              <div className="job-card__description">
                <strong>{t("jobs.description")}</strong>
                <p>{job.description}</p>
              </div>
              <dl>
                <div><dt>{t("jobs.location")}</dt><dd>{job.city}, {job.country}</dd></div>
                <div><dt>{t("jobs.salary")}</dt><dd>{job.salary}</dd></div>
                <div><dt>{t("jobs.postedOn")}</dt><dd>{dateFormatter.format(new Date(`${job.publishedAt}T12:00:00`))}</dd></div>
              </dl>
              <a href={`#/vaga/${job.id}`}>{t("jobs.details")}</a>
            </article>
          ))}
          {filteredJobs.length === 0 && <div className="jobs-empty"><h2>{t("jobs.emptyTitle")}</h2><p>{t("jobs.emptyText")}</p></div>}
          <nav className="jobs-pagination" aria-label={t("jobs.paginationLabel")}>
            <button type="button" onClick={goToPreviousPage} disabled={!canGoPrevious}>
              {t("jobs.previousPage")}
            </button>
            <span>
              {t("jobs.page")} {currentPage} {t("jobs.pageOf")} {totalPages}
            </span>
            <button type="button" onClick={goToNextPage} disabled={!canGoNext}>
              {t("jobs.nextPage")}
            </button>
          </nav>
        </section>
      </section>
    </main>
  );
}

export default JobsPage;
