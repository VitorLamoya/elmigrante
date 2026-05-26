import { createTranslator } from "../../i18n/translations";
import "./CandidatePage.css";

function CandidatePage({ dashboard, language = "pt" }) {
  const t = createTranslator(language);
  const favorites = dashboard?.favorites || [];
  const applyLater = dashboard?.applyLater || [];
  const userName = dashboard?.user?.name || dashboard?.user?.email || t("candidate.accountFallback", "Conta de candidato");

  function renderJobList(jobs, emptyText) {
    if (jobs.length === 0) {
      return <p className="candidate-panel__empty">{emptyText}</p>;
    }

    return (
      <div className="candidate-panel__list">
        {jobs.map((job) => (
          <a className="candidate-panel__item" href={`#/vaga/${job.id}`} key={`${job.id}-${job.savedAt || ""}`}>
            <strong>{job.title}</strong>
            <span>{job.company}</span>
            <small>{job.city}, {job.country}</small>
          </a>
        ))}
      </div>
    );
  }

  return (
    <main className="candidate-page">
      <section className="candidate-hero">
        <p>{t("candidate.eyebrow", "Área do candidato")}</p>
        <h1>{t("candidate.title", "Painel do candidato")}</h1>
        <span>{t("candidate.text", "Veja as vagas que guardou como favoritas e as vagas reservadas para aplicar depois.")}</span>
      </section>

      <section className="candidate-summary">
        <article>
          <span>{t("candidate.account", "Conta")}</span>
          <strong>{userName}</strong>
        </article>
        <article>
          <span>{t("candidate.favoritesTitle", "Vagas favoritas")}</span>
          <strong>{favorites.length}</strong>
        </article>
        <article>
          <span>{t("candidate.applyLaterTitle", "Aplicar depois")}</span>
          <strong>{applyLater.length}</strong>
        </article>
      </section>

      <section className="candidate-layout">
        <article className="candidate-panel">
          <div className="candidate-panel__header">
            <h2>{t("candidate.favoritesTitle", "Vagas favoritas")}</h2>
            <p>{t("candidate.favoritesText", "Acompanhe as vagas que mais despertaram interesse.")}</p>
          </div>
          {renderJobList(favorites, t("candidate.emptyFavorites", "Nenhuma vaga favorita guardada ainda."))}
        </article>

        <article className="candidate-panel">
          <div className="candidate-panel__header">
            <h2>{t("candidate.applyLaterTitle", "Aplicar depois")}</h2>
            <p>{t("candidate.applyLaterText", "Guarde oportunidades para voltar nelas no momento certo.")}</p>
          </div>
          {renderJobList(applyLater, t("candidate.emptyApplyLater", "Nenhuma vaga guardada para aplicar depois ainda."))}
        </article>
      </section>
    </main>
  );
}

export default CandidatePage;
