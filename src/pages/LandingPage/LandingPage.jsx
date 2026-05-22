import { createTranslator } from "../../i18n/translations";
import { getSalaryLabel } from "../../data/jobOptions";
import { getPlanWhatsAppUrl, planOptions } from "../../data/plans";
import "./LandingPage.css";

const heroBackground = `url("${process.env.PUBLIC_URL}/images/img-office.jpg")`;

function LandingPage({ jobs, language = "pt" }) {
  const t = createTranslator(language);
  const featuredJobs = jobs.slice(0, 3);
  const categories = t("landing.categories", []);
  const steps = t("landing.steps", []);
  const employerItems = t("landing.employerItems", []);

  return (
    <main className="landing-page" style={{ "--hero-image": heroBackground }}>
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">{t("landing.eyebrow")}</p>
          <h1>{t("landing.title")}</h1>
          <p className="hero__text">{t("landing.text")}</p>

          <form className="hero__search" onSubmit={(event) => {
            event.preventDefault();
            const value = event.currentTarget.elements.search.value.trim();
            window.location.hash = value ? `#/vagas?busca=${encodeURIComponent(value)}` : "#/vagas";
          }}>
            <label htmlFor="hero-search">{t("landing.searchLabel")}</label>
            <div className="hero__search-row">
              <input id="hero-search" name="search" type="search" placeholder={t("landing.searchPlaceholder")} />
              <button type="submit">{t("landing.searchButton")}</button>
            </div>
          </form>

          <div className="hero__actions" aria-label={t("landing.primaryActions")}>
            <a className="button button--primary" href="#/vagas">{t("landing.viewJobs")}</a>
            <a className="button button--secondary" href="#/publicar">{t("landing.postJob")}</a>
          </div>
        </div>
      </section>

      <section className="overview" aria-label={t("landing.summaryLabel")}>
        <div className="overview__item"><strong>{jobs.length}</strong><span>{t("landing.statsJobs")}</span></div>
        <div className="overview__item"><strong>24h</strong><span>{t("landing.statsPublish")}</span></div>
        <div className="overview__item"><strong>0</strong><span>{t("landing.statsOpen")}</span></div>
      </section>

      <section className="services" id="categorias">
        <div className="section__header"><p>{t("landing.categoriesLabel")}</p><h2>{t("landing.categoriesTitle")}</h2></div>
        <div className="services__grid">
          {categories.map(([label, title, text, detail]) => (
            <article className="service-card" key={label}>
              <span>{label}</span><h3>{title}</h3><p>{text}</p><strong>{detail}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="regularization" id="processo">
        <div className="regularization__content">
          <div className="section__header"><p>{t("landing.processLabel")}</p><h2>{t("landing.processTitle")}</h2></div>
          <p>{t("landing.processText")}</p>
          <a className="button button--light" href="#/vagas">{t("landing.opportunities")}</a>
        </div>
        <ol className="regularization__steps">{steps.map((step) => <li key={step}>{step}</li>)}</ol>
      </section>

      <section className="market" id="vagas">
        <div className="section__header"><p>{t("landing.featuredLabel")}</p><h2>{t("landing.featuredTitle")}</h2></div>
        <div className="market__grid">
          {featuredJobs.map((job) => (
            <article className="listing-card" key={job.id}>
              <span>{job.contract}</span><h3>{job.title}</h3>
              <p>{job.company} · {job.city}, {job.country}</p>
              <strong>{getSalaryLabel(job.salary, t("jobs.salaryNotInformed"))}</strong><small>{job.languages}</small>
              <a href={`#/vaga/${job.id}`}>{t("landing.details")}</a>
            </article>
          ))}
        </div>
      </section>

      <section className="plans" id="planos">
        <div className="section__header">
          <p>{t("plans.eyebrow")}</p>
          <h2>{t("plans.title")}</h2>
        </div>
        <div className="plans__grid">
          {planOptions.map((plan) => (
            <article className={`plan-card plan-card--${plan.value}${plan.value === "business" ? " plan-card--featured" : ""}`} key={plan.value}>
              <span>{plan.labels[language]}</span>
              <h3>{plan.price}</h3>
              <p>{plan.descriptions[language]}</p>
              <strong>{plan.limit === null ? t("plans.unlimitedJobs") : `${t("plans.upTo")} ${plan.limit} ${t("plans.activeJobs")}`}</strong>
              <ul>
                {plan.features[language].map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <div className="plan-card__action">
                {plan.value === "free" ? (
                  <a href="#/cadastro">{t("plans.startFree")}</a>
                ) : (
                  <a href={getPlanWhatsAppUrl(plan, language)} target="_blank" rel="noreferrer">{t("plans.subscribe")}</a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="institutional" id="contato">
        <div className="institutional__content">
          <div className="section__header"><p>{t("landing.companiesLabel")}</p><h2>{t("landing.companiesTitle")}</h2></div>
          <p>{t("landing.companiesText")}</p>
          <a className="button button--primary" href="#/publicar">{t("landing.postJob")}</a>
        </div>
        <ul className="institutional__list" aria-label={t("landing.publicationCriteria")}>{employerItems.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

    </main>
  );
}

export default LandingPage;
