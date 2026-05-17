import { useState } from "react";
import { emptyJobForm } from "../../data/jobs";
import "./RecruiterPage.css";

const requiredFields = [
  "title",
  "company",
  "city",
  "country",
  "area",
  "contract",
  "salary",
  "contact",
  "description",
];

function hasText(value) {
  return value.trim().length > 0;
}

function RecruiterPage({ onCreateJob }) {
  const [form, setForm] = useState(emptyJobForm);
  const [submitted, setSubmitted] = useState(false);

  const hasError = submitted && requiredFields.some((field) => !hasText(form[field]));
  const recommendedItems = [
    { label: "Salário ou faixa salarial", complete: hasText(form.salary) },
    {
      label: "Cidade, país e área da vaga",
      complete: hasText(form.city) && hasText(form.country) && hasText(form.area),
    },
    { label: "Tipo de contrato e jornada", complete: hasText(form.contract) },
    {
      label: "Requisitos de idioma e experiência",
      complete: hasText(form.languages) && hasText(form.experience),
    },
    { label: "Contato direto para candidatura", complete: hasText(form.contact) },
  ];

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);

    if (requiredFields.some((field) => !hasText(form[field]))) {
      return;
    }

    onCreateJob(form);
  }

  return (
    <main className="recruiter-page">
      <section className="recruiter-hero">
        <p>Área do recrutador</p>
        <h1>Publique vagas para candidatos imigrantes em diferentes países da Europa.</h1>
        <span>
          Informe cidade, país, contrato, salário e requisitos para que candidatos possam comparar oportunidades com clareza.
        </span>
      </section>

      <section className="recruiter-layout">
        <form className="job-form" onSubmit={handleSubmit}>
          {hasError && (
            <div className="job-form__alert" role="alert">
              Preencha os campos obrigatórios antes de publicar a vaga.
            </div>
          )}

          <div className="job-form__grid">
            <label>
              Cargo *
              <input name="title" value={form.title} onChange={updateField} placeholder="Ex.: Auxiliar de cozinha" />
            </label>

            <label>
              Empresa *
              <input name="company" value={form.company} onChange={updateField} placeholder="Nome da empresa" />
            </label>

            <label>
              Cidade *
              <input name="city" value={form.city} onChange={updateField} placeholder="Ex.: Lisboa" />
            </label>

            <label>
              País *
              <input name="country" value={form.country} onChange={updateField} placeholder="Ex.: Portugal" />
            </label>

            <label>
              Área *
              <select name="area" value={form.area} onChange={updateField} required>
                <option value="" disabled>
                  Selecione uma área
                </option>
                <option value="Operacional">Operacional</option>
                <option value="Atendimento">Atendimento</option>
                <option value="Logística">Logística</option>
                <option value="Serviços">Serviços</option>
                <option value="Hotelaria">Hotelaria</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Bilíngue">Bilíngue</option>
              </select>
            </label>

            <label>
              Tipo de contrato *
              <select name="contract" value={form.contract} onChange={updateField} required>
                <option value="" disabled>
                  Selecione um contrato
                </option>
                <option value="Tempo integral">Tempo integral</option>
                <option value="Meio período">Meio período</option>
                <option value="Contrato local">Contrato local</option>
                <option value="Temporário">Temporário</option>
                <option value="Freelancer">Freelancer</option>
              </select>
            </label>

            <label>
              Salário *
              <input name="salary" value={form.salary} onChange={updateField} placeholder="Ex.: € 1.250" />
            </label>

            <label>
              Contato *
              <input name="contact" value={form.contact} onChange={updateField} placeholder="email@empresa.com" />
            </label>

            <label>
              Idiomas
              <input name="languages" value={form.languages} onChange={updateField} placeholder="Ex.: Português básico, inglês" />
            </label>

            <label>
              Experiência
              <input name="experience" value={form.experience} onChange={updateField} placeholder="Ex.: Não exige experiência" />
            </label>
          </div>

          <label>
            Descrição da vaga *
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              rows="5"
              placeholder="Descreva as principais atividades da função."
            />
          </label>

          <label>
            Requisitos
            <textarea
              name="requirements"
              value={form.requirements}
              onChange={updateField}
              rows="4"
              placeholder="Informe requisitos mínimos, horários, permissões ou documentos necessários."
            />
          </label>

          <label>
            Benefícios
            <textarea
              name="benefits"
              value={form.benefits}
              onChange={updateField}
              rows="4"
              placeholder="Informe alimentação, transporte, alojamento, formação ou outros benefícios."
            />
          </label>

          <button type="submit">Publicar vaga</button>
        </form>

        <aside className="recruiter-panel">
          <h2>Dados recomendados</h2>
          <ul>
            {recommendedItems.map((item) => (
              <li className={item.complete ? "is-complete" : "is-pending"} key={item.label}>
                <span aria-hidden="true">{item.complete ? "✓" : "!"}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}

export default RecruiterPage;
