import { useMemo, useState } from "react";
import "./JobsPage.css";

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function JobsPage({ jobs, selectedJob, initialSearch = "" }) {
  const [filters, setFilters] = useState({
    search: initialSearch,
    city: "",
    area: "",
    contract: "",
  });

  const areas = useMemo(() => [...new Set(jobs.map((job) => job.area))].sort(), [jobs]);
  const contracts = useMemo(
    () => [...new Set(jobs.map((job) => job.contract))].sort(),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchableText = normalize(
        `${job.title} ${job.company} ${job.city} ${job.country} ${job.area} ${job.contract} ${job.languages}`
      );
      const matchesSearch = searchableText.includes(normalize(filters.search));
      const matchesCity = normalize(`${job.city} ${job.country}`).includes(normalize(filters.city));
      const matchesArea = !filters.area || job.area === filters.area;
      const matchesContract = !filters.contract || job.contract === filters.contract;

      return matchesSearch && matchesCity && matchesArea && matchesContract;
    });
  }, [filters, jobs]);

  const jobToShow = selectedJob || filteredJobs[0];

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
  }

  return (
    <main className="jobs-page">
      <section className="jobs-hero">
        <div>
          <p>Vagas abertas na Europa</p>
          <h1>Pesquise oportunidades publicadas por recrutadores em diferentes países.</h1>
        </div>
        <span>{filteredJobs.length} vagas encontradas</span>
      </section>

      <section className="jobs-layout">
        <aside className="jobs-filters" aria-label="Filtros de vagas">
          <label>
            Cargo, empresa ou idioma
            <input
              name="search"
              type="search"
              value={filters.search}
              onChange={updateFilter}
              placeholder="Ex.: cozinha, inglês"
            />
          </label>

          <label>
            Cidade ou país
            <input
              name="city"
              type="search"
              value={filters.city}
              onChange={updateFilter}
              placeholder="Ex.: Lisboa"
            />
          </label>

          <label>
            Área
            <select name="area" value={filters.area} onChange={updateFilter}>
              <option value="">Todas as áreas</option>
              {areas.map((area) => (
                <option value={area} key={area}>
                  {area}
                </option>
              ))}
            </select>
          </label>

          <label>
            Contrato
            <select name="contract" value={filters.contract} onChange={updateFilter}>
              <option value="">Todos os contratos</option>
              {contracts.map((contract) => (
                <option value={contract} key={contract}>
                  {contract}
                </option>
              ))}
            </select>
          </label>
        </aside>

        <section className="jobs-results" aria-label="Lista de vagas">
          {filteredJobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div>
                <span>{job.contract}</span>
                <h2>{job.title}</h2>
                <p>{job.company}</p>
              </div>
              <dl>
                <div>
                  <dt>Local</dt>
                  <dd>
                    {job.city}, {job.country}
                  </dd>
                </div>
                <div>
                  <dt>Salário</dt>
                  <dd>{job.salary}</dd>
                </div>
              </dl>
              <a href={`#/vaga/${job.id}`}>Ver detalhes</a>
            </article>
          ))}

          {filteredJobs.length === 0 && (
            <div className="jobs-empty">
              <h2>Nenhuma vaga encontrada</h2>
              <p>Revise os filtros ou pesquise por outro cargo, cidade, país ou idioma.</p>
            </div>
          )}
        </section>

        <aside className="job-detail" aria-label="Detalhe da vaga">
          {jobToShow ? (
            <>
              <span>{jobToShow.area}</span>
              <h2>{jobToShow.title}</h2>
              <p className="job-detail__company">{jobToShow.company}</p>

              <div className="job-detail__facts">
                <strong>{jobToShow.salary}</strong>
                <span>
                  {jobToShow.city}, {jobToShow.country}
                </span>
                <span>{jobToShow.contract}</span>
                <span>Publicada em {formatDate(jobToShow.publishedAt)}</span>
              </div>

              <h3>Descrição</h3>
              <p>{jobToShow.description}</p>

              <h3>Requisitos</h3>
              <p>{jobToShow.requirements}</p>

              <h3>Idiomas</h3>
              <p>{jobToShow.languages}</p>

              <h3>Benefícios</h3>
              <p>{jobToShow.benefits}</p>

              <a className="job-detail__contact" href={`mailto:${jobToShow.contact}`}>
                Candidatar-se por e-mail
              </a>
            </>
          ) : (
            <p>Selecione uma vaga para verificar os detalhes.</p>
          )}
        </aside>
      </section>
    </main>
  );
}

export default JobsPage;
