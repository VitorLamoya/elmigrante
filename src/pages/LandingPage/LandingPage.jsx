import "./LandingPage.css";

const jobCategories = [
  {
    id: "operacional",
    label: "Operacional",
    title: "Vagas de entrada e início imediato",
    text: "Oportunidades para cozinha, limpeza, estoque, produção, atendimento e apoio logístico.",
    detail: "Busca por área",
  },
  {
    id: "servicos",
    label: "Serviços",
    title: "Atendimento e funções com contato direto",
    text: "Cargos para recepção, vendas, suporte, hotelaria, restaurantes e comércio local.",
    detail: "Filtro por contrato",
  },
  {
    id: "bilingue",
    label: "Bilíngue",
    title: "Empregos que valorizam idiomas",
    text: "Vagas que exigem ou valorizam português, espanhol, inglês, francês, alemão ou outros idiomas.",
    detail: "Pesquisa por idioma",
  },
];

const hiringSteps = [
  "O recrutador informa salário, cidade, país, jornada, contrato e requisitos mínimos.",
  "A vaga é publicada com campos padronizados para facilitar comparação entre países.",
  "O candidato acessa os detalhes e entra em contato pelo canal indicado.",
];

const employerItems = [
  "Publicação com salário, cidade, país e jornada obrigatórios",
  "Descrição clara de requisitos, benefícios e forma de contato",
  "Vaga disponível para usuários logados ou visitantes",
];

const heroBackground = `url("${process.env.PUBLIC_URL}/images/img-office.jpg")`;

function LandingPage({ jobs }) {
  const featuredJobs = jobs.slice(0, 3);

  return (
    <main className="landing-page" style={{ "--hero-image": heroBackground }}>
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Portal de vagas ElMigrante</p>
          <h1>Vagas de trabalho na Europa para imigrantes com informação clara e confiável.</h1>
          <p className="hero__text">
            Recrutadores publicam oportunidades com dados essenciais. Candidatos,
            logados ou não, pesquisam por cidade, país, idioma e contrato antes de se candidatar.
          </p>

          <form className="hero__search" onSubmit={(event) => {
            event.preventDefault();
            const value = event.currentTarget.elements.search.value.trim();
            window.location.hash = value ? `#/vagas?busca=${encodeURIComponent(value)}` : "#/vagas";
          }}>
            <label htmlFor="hero-search">Pesquisar vagas por cargo, cidade, país ou idioma</label>
            <div className="hero__search-row">
              <input
                id="hero-search"
                name="search"
                type="search"
                placeholder="Ex.: Lisboa, cozinha, inglês, hotelaria"
              />
              <button type="submit">Pesquisar</button>
            </div>
          </form>

          <div className="hero__actions" aria-label="Ações principais">
            <a className="button button--primary" href="#/vagas">
              Ver vagas abertas
            </a>
            <a className="button button--secondary" href="#/publicar">
              Publicar uma vaga
            </a>
          </div>
        </div>
      </section>

      <section className="overview" aria-label="Resumo da plataforma">
        <div className="overview__item">
          <strong>{jobs.length}</strong>
          <span>vagas publicadas para diferentes países europeus</span>
        </div>
        <div className="overview__item">
          <strong>24h</strong>
          <span>para recrutadores publicarem novas oportunidades</span>
        </div>
        <div className="overview__item">
          <strong>0</strong>
          <span>barreiras para pesquisar vagas sem login</span>
        </div>
      </section>

      <section className="services" id="categorias">
        <div className="section__header">
          <p>Categorias</p>
          <h2>Oportunidades organizadas para facilitar a busca</h2>
        </div>

        <div className="services__grid">
          {jobCategories.map((category) => (
            <article className="service-card" id={category.id} key={category.id}>
              <span>{category.label}</span>
              <h3>{category.title}</h3>
              <p>{category.text}</p>
              <strong>{category.detail}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="regularization" id="processo">
        <div className="regularization__content">
          <div className="section__header">
            <p>Processo</p>
            <h2>Uma publicação simples para recrutadores e uma busca aberta para candidatos</h2>
          </div>
          <p>
            A plataforma separa a jornada de quem publica vagas da jornada de quem
            pesquisa oportunidades, mantendo a consulta pública e direta em toda a Europa.
          </p>
          <a className="button button--light" href="#/vagas">
            Ver oportunidades
          </a>
        </div>

        <ol className="regularization__steps">
          {hiringSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="market" id="vagas">
        <div className="section__header">
          <p>Vagas em destaque</p>
          <h2>Empregos com salário, localidade e requisitos visíveis</h2>
        </div>

        <div className="market__grid">
          {featuredJobs.map((job) => (
            <article className="listing-card" key={job.id}>
              <span>{job.contract}</span>
              <h3>{job.title}</h3>
              <p>
                {job.company} · {job.city}, {job.country}
              </p>
              <strong>{job.salary}</strong>
              <small>{job.languages}</small>
              <a href={`#/vaga/${job.id}`}>Ver detalhes</a>
            </article>
          ))}
        </div>
      </section>

      <section className="institutional" id="contato">
        <div className="institutional__content">
          <div className="section__header">
            <p>Para empresas</p>
            <h2>Publique vagas com um padrão profissional de informação</h2>
          </div>
          <p>
            Empresas e recrutadores podem divulgar oportunidades para candidatos
            imigrantes em diferentes países europeus, com critérios claros e contato direto.
          </p>
          <a className="button button--primary" href="#/publicar">
            Publicar vaga
          </a>
        </div>

        <ul className="institutional__list" aria-label="Critérios de publicação">
          {employerItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <span>ElMigrante</span>
        <p>Vagas de trabalho na Europa com informação clara para candidatos imigrantes.</p>
      </footer>
    </main>
  );
}

export default LandingPage;
