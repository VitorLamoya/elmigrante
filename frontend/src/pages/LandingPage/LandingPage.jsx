import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiHeart, FiSearch } from "react-icons/fi";
import { getLocalizedJob, getSalaryLabel } from "../../data/jobOptions";
import { getPlanWhatsAppUrl, planOptions } from "../../data/plans";
import { createTranslator, getLanguageConfig } from "../../i18n/translations";
import { removeSavedJobForCandidate, saveJobForCandidate } from "../../services/api";
import "./LandingPage.css";

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function LandingPage({ jobs, language = "pt", authSession, candidateDashboard, onCandidateDashboardUpdate }) {
  const t = createTranslator(language);
  const locale = getLanguageConfig(language).locale;
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [savingState, setSavingState] = useState({});
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }), [locale]);
  const latestJobs = useMemo(
    () => [...jobs].sort((firstJob, secondJob) => new Date(`${secondJob.publishedAt}T12:00:00`) - new Date(`${firstJob.publishedAt}T12:00:00`)).slice(0, 12),
    [jobs]
  );
  const maxCarouselIndex = Math.max(latestJobs.length - 3, 0);
  const visibleJobs = latestJobs.slice(carouselIndex, carouselIndex + 3);
  const authRole = authSession?.user?.user_metadata?.role || authSession?.user?.app_metadata?.role || "";
  const candidateToken = authRole === "candidate" ? authSession?.session?.access_token : "";
  const favoriteIds = new Set((candidateDashboard?.favorites || []).map((job) => job.id));

  function submitSearch(event) {
    event.preventDefault();
    const value = event.currentTarget.elements.search.value.trim();
    window.location.hash = value ? `#/vagas?busca=${encodeURIComponent(value)}` : "#/vagas";
  }

  function previousJobs() {
    setCarouselIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  }

  function nextJobs() {
    setCarouselIndex((currentIndex) => Math.min(currentIndex + 1, maxCarouselIndex));
  }

  async function toggleFavorite(job) {
    if (!candidateToken) {
      window.location.hash = "#/login?audience=candidate";
      return;
    }

    if (!isUuid(job.id)) {
      window.alert(t("jobs.saveUnavailable", "Esta vaga ainda não está sincronizada com o banco de dados. Publique ou recarregue as vagas antes de salvar."));
      return;
    }

    const alreadySaved = favoriteIds.has(job.id);

    try {
      setSavingState((currentState) => ({ ...currentState, [job.id]: true }));

      if (alreadySaved) {
        await removeSavedJobForCandidate(job.id, "favorite", candidateToken);
      } else {
        await saveJobForCandidate(job.id, "favorite", candidateToken);
      }

      const currentDashboard = candidateDashboard || { favorites: [], applyLater: [], user: null };
      const nextFavorites = alreadySaved
        ? currentDashboard.favorites.filter((item) => item.id !== job.id)
        : [{ ...job, savedAt: new Date().toISOString() }, ...currentDashboard.favorites.filter((item) => item.id !== job.id)];

      onCandidateDashboardUpdate?.({
        ...currentDashboard,
        favorites: nextFavorites,
        applyLater: currentDashboard.applyLater || [],
      });
    } finally {
      setSavingState((currentState) => ({ ...currentState, [job.id]: false }));
    }
  }

  return (
    <main className="landing-page">
      <section className="landing-search" aria-label={t("landing.searchLabel")}>
        <div className="landing-search__content">
          <p>{t("landing.eyebrow")}</p>
          <h1>{t("landing.title")}</h1>
          <form className="landing-search__form" onSubmit={submitSearch}>
            <label htmlFor="landing-search">{t("landing.searchLabel")}</label>
            <div>
              <FiSearch aria-hidden="true" />
              <input id="landing-search" name="search" type="search" placeholder={t("landing.searchPlaceholder")} />
              <button type="submit">{t("landing.searchButton")}</button>
            </div>
          </form>
          <a className="landing-search__all" href="#/vagas">{t("landing.viewJobs")}</a>
        </div>
      </section>

      <section className="landing-jobs" aria-label={t("landing.featuredLabel")}>
        <div className="landing-jobs__header">
          <div>
            <p>{t("landing.featuredLabel")}</p>
            <h2>{t("landing.featuredTitle")}</h2>
          </div>
          <div className="landing-jobs__controls">
            <button type="button" onClick={previousJobs} disabled={carouselIndex === 0} aria-label={t("jobs.previousPage")}>
              <FiChevronLeft aria-hidden="true" />
            </button>
            <button type="button" onClick={nextJobs} disabled={carouselIndex >= maxCarouselIndex} aria-label={t("jobs.nextPage")}>
              <FiChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="landing-jobs__grid">
          {visibleJobs.map((job) => {
            const localizedJob = getLocalizedJob(job, language);
            const isFavorite = favoriteIds.has(job.id);

            return (
              <article className="landing-job-card" key={job.id}>
                <div className="landing-job-card__top">
                  <span>{localizedJob.contract}</span>
                  <button
                    type="button"
                    className={isFavorite ? "landing-job-card__favorite is-active" : "landing-job-card__favorite"}
                    onClick={() => toggleFavorite(job)}
                    disabled={savingState[job.id]}
                    aria-label={isFavorite ? t("jobs.removeFavorite", "Remover favorito") : t("jobs.addFavorite", "Favoritar")}
                  >
                    <FiHeart aria-hidden="true" />
                  </button>
                </div>
                <h3>{job.title}</h3>
                <p>{job.company}</p>
                <dl>
                  <div>
                    <dt>{t("jobs.location")}</dt>
                    <dd>{localizedJob.city}, {localizedJob.country}</dd>
                  </div>
                  <div>
                    <dt>{t("jobs.salary")}</dt>
                    <dd>{getSalaryLabel(job.salary, t("jobs.salaryNotInformed"))}</dd>
                  </div>
                </dl>
                <small>{t("landing.postedOn")} {dateFormatter.format(new Date(`${job.publishedAt}T12:00:00`))}</small>
                <a href={`#/vaga/${job.id}`}>{t("landing.details")}</a>
              </article>
            );
          })}
          {visibleJobs.length === 0 && (
            <div className="landing-jobs__empty">
              <h3>{t("jobs.emptyTitle")}</h3>
              <p>{t("jobs.emptyText")}</p>
            </div>
          )}
        </div>
      </section>

      <section className="landing-plans" id="planos" aria-label={t("plans.eyebrow")}>
        <div className="landing-plans__header">
          <p>{t("plans.eyebrow")}</p>
          <h2>{t("plans.title")}</h2>
        </div>

        <div className="landing-plans__grid">
          {planOptions.map((plan) => (
            <article
              className={`landing-plan-card landing-plan-card--${plan.value}${plan.value === "business" ? " landing-plan-card--featured" : ""}`}
              key={plan.value}
            >
              <span>{plan.labels[language] || plan.labels.pt}</span>
              <h3>{plan.price}</h3>
              <p>{plan.descriptions[language] || plan.descriptions.pt}</p>
              <strong>
                {plan.limit === null
                  ? t("plans.unlimitedJobs")
                  : `${t("plans.upTo")} ${plan.limit} ${t("plans.activeJobs")}`}
              </strong>
              <ul>
                {(plan.features[language] || plan.features.pt).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="landing-plan-card__action">
                {plan.value === "free" ? (
                  <a href="#/cadastro">{t("plans.startFree")}</a>
                ) : (
                  <a href={getPlanWhatsAppUrl(plan, language)} target="_blank" rel="noreferrer">
                    {t("plans.subscribe")}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
