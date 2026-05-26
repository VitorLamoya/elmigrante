import { useEffect, useState } from "react";
import { createTranslator } from "../../i18n/translations";
import { loginRecruiter, registerCandidate, registerRecruiter } from "../../services/api";
import "./AuthPage.css";

const companySizeOptions = ["1-10", "11-50", "51-200", "201-500", "500+"];

function AuthPage({ language = "pt", mode = "login", audience = "recruiter", onAuth }) {
  const t = createTranslator(language);
  const isRegister = mode === "register";
  const [selectedAudience, setSelectedAudience] = useState(audience);
  const isCandidate = selectedAudience === "candidate";
  const highlights = t(isCandidate ? "auth.candidateHighlights" : "auth.highlights", []);
  const [form, setForm] = useState({ name: "", companyName: "", companySize: "", email: "", password: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedAudience(audience);
  }, [audience]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function getAudienceHref(nextAudience) {
    const baseRoute = isRegister ? "#/cadastro" : "#/login";
    return `${baseRoute}?audience=${nextAudience}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsSubmitting(true);

    try {
      const data = isRegister
        ? (isCandidate ? await registerCandidate(form) : await registerRecruiter(form))
        : await loginRecruiter({ ...form, audience: selectedAudience });

      if (data.session) {
        onAuth(data);
        window.location.hash = isCandidate ? "#/candidato" : "#/publicar";
        return;
      }

      setStatus(t("auth.checkEmail"));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={isCandidate ? "auth-page auth-page--candidate" : "auth-page auth-page--recruiter"}>
      <section className={isRegister ? `auth-shell auth-shell--register auth-shell--${selectedAudience}` : `auth-shell auth-shell--${selectedAudience}`}>
        <aside className={isCandidate ? "auth-aside auth-aside--candidate" : "auth-aside auth-aside--recruiter"} aria-label={t("auth.eyebrow")}>
          {/* <div className="auth-aside__brand">
            <span className="header__logo" aria-hidden="true">
              <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="" />
            </span>
            <div>
              <strong>ElMigrante</strong>
              <small>{t("header.tagline")}</small>
            </div>
          </div> */}

          <div className="auth-aside__content">
            <p>{t(`auth.${isCandidate ? "candidateEyebrow" : "eyebrow"}`, isCandidate ? "Area do candidato" : "Area do recrutador")}</p>
            <h2>{isCandidate ? t("auth.candidateAsideTitle", "Organize vagas favoritas e acompanhe oportunidades para aplicar depois.") : t("auth.asideTitle")}</h2>
            <span>{isCandidate ? t("auth.candidateAsideText", "A area do candidato reune vagas salvas, favoritos e acesso rapido aos detalhes de cada oportunidade.") : t("auth.asideText")}</span>
          </div>

          <ul className="auth-aside__list">
            {highlights.map((item) => <li key={item}>{item}</li>)}
          </ul>

          <div className="auth-aside__signature">
            <strong>{isCandidate ? t("auth.candidateTab", "Candidato") : t("auth.recruiterTab", "Recrutador")}</strong>
            <span>{isRegister ? t("auth.registerButton") : t("auth.loginButton")}</span>
          </div>
        </aside>

        <section className={isRegister ? "auth-card auth-card--register" : "auth-card"}>
          <div className="auth-card__header">
            <div className="auth-card__header-top">
              <p>{t(`auth.${isCandidate ? "candidateEyebrow" : "eyebrow"}`, isCandidate ? "Area do candidato" : "Area do recrutador")}</p>
              <span className="auth-card__mode-pill">{isRegister ? t("auth.registerButton") : t("auth.loginButton")}</span>
            </div>

            <div className="auth-card__audience" role="tablist" aria-label={t("auth.accountTypeLabel", "Tipo de acesso")}>
              <a
                className={!isCandidate ? "is-active" : ""}
                href={getAudienceHref("recruiter")}
                role="tab"
                aria-selected={!isCandidate}
                onClick={() => setSelectedAudience("recruiter")}
              >
                {t("auth.recruiterTab", "Recrutador")}
              </a>
              <a
                className={isCandidate ? "is-active" : ""}
                href={getAudienceHref("candidate")}
                role="tab"
                aria-selected={isCandidate}
                onClick={() => setSelectedAudience("candidate")}
              >
                {t("auth.candidateTab", "Candidato")}
              </a>
            </div>

            <h1>{isRegister ? t(`auth.${isCandidate ? "registerCandidateTitle" : "registerTitle"}`, isCandidate ? "Criar conta de candidato" : "Criar conta de recrutador") : t(`auth.${isCandidate ? "loginCandidateTitle" : "loginTitle"}`, isCandidate ? "Entrar como candidato" : "Entrar na conta")}</h1>
            <span>{isRegister ? t(`auth.${isCandidate ? "registerCandidateText" : "registerText"}`, isCandidate ? "Registe-se para guardar vagas favoritas e organizar candidaturas futuras." : "Registe-se para publicar oportunidades para candidatos em toda a Europa.") : t(`auth.${isCandidate ? "loginCandidateText" : "loginText"}`, isCandidate ? "Aceda a sua conta para guardar vagas favoritas e vagas para aplicar depois." : "Aceda a sua conta para publicar e gerir vagas.")}</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__fields">
              {isRegister && (
                <>
                  <label>
                    {t("auth.name")}
                    <input name="name" value={form.name} onChange={updateField} placeholder={t("auth.namePlaceholder")} required />
                  </label>

                  {!isCandidate && (
                    <>
                      <label>
                        {t("auth.companyName")}
                        <input name="companyName" value={form.companyName} onChange={updateField} placeholder={t("auth.companyNamePlaceholder")} required />
                      </label>
                      <label>
                        {t("auth.companySize")}
                        <select name="companySize" value={form.companySize} onChange={updateField} required>
                          <option value="" disabled>{t("auth.companySizePlaceholder")}</option>
                          {companySizeOptions.map((size) => <option value={size} key={size}>{t(`auth.companySizes.${size}`, size)}</option>)}
                        </select>
                      </label>
                    </>
                  )}
                </>
              )}

              <label>
                {t("auth.email")}
                <input name="email" type="email" value={form.email} onChange={updateField} placeholder={t("auth.emailPlaceholder")} required />
              </label>

              <label>
                {t("auth.password")}
                <input name="password" type="password" value={form.password} onChange={updateField} placeholder={t("auth.passwordPlaceholder")} required minLength={6} />
              </label>
            </div>

            {!isRegister && !isCandidate && (
              <div className="auth-card__note">
                <strong>{t("auth.loginNoteTitle")}</strong>
                <span>{t("auth.loginNoteText")}</span>
              </div>
            )}

            {error && <div className="auth-form__alert" role="alert">{error}</div>}
            {status && <div className="auth-form__status" role="status">{status}</div>}

            <div className="auth-form__actions">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("auth.submitting") : isRegister ? t("auth.registerButton") : t("auth.loginButton")}
              </button>
            </div>
          </form>

          <p className="auth-card__switch">
            {isRegister ? t("auth.hasAccount") : t("auth.noAccount")}
            <a href={isRegister ? `#/login?audience=${selectedAudience}` : `#/cadastro?audience=${selectedAudience}`}>
              {isRegister ? t("auth.goToLogin") : t("auth.goToRegister")}
            </a>
          </p>
        </section>
      </section>
    </main>
  );
}

export default AuthPage;
