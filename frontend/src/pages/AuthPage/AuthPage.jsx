import { useState } from "react";
import { createTranslator } from "../../i18n/translations";
import { loginRecruiter, registerRecruiter } from "../../services/api";
import "./AuthPage.css";

const companySizeOptions = ["1-10", "11-50", "51-200", "201-500", "500+"];

function AuthPage({ language = "pt", mode = "login", onAuth }) {
  const t = createTranslator(language);
  const isRegister = mode === "register";
  const highlights = t("auth.highlights", []);
  const [form, setForm] = useState({ name: "", companyName: "", companySize: "", email: "", password: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsSubmitting(true);

    try {
      const data = isRegister ? await registerRecruiter(form) : await loginRecruiter(form);

      if (data.session) {
        onAuth(data);
        window.location.hash = "#/publicar";
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
    <main className="auth-page">
      <section className={isRegister ? "auth-shell auth-shell--register" : "auth-shell"}>
        <aside className="auth-aside" aria-label={t("auth.eyebrow")}>
          <div className="auth-aside__brand">
            <span aria-hidden="true">EM</span>
            <div>
              <strong>ElMigrante</strong>
              <small>{t("header.tagline")}</small>
            </div>
          </div>
          <div className="auth-aside__content">
            <p>{t("auth.eyebrow")}</p>
            <h2>{t("auth.asideTitle")}</h2>
            <span>{t("auth.asideText")}</span>
          </div>
          <ul className="auth-aside__list">
            {highlights.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </aside>

        <section className={isRegister ? "auth-card auth-card--register" : "auth-card"}>
          <div className="auth-card__header">
            <p>{t("auth.eyebrow")}</p>
            <h1>{isRegister ? t("auth.registerTitle") : t("auth.loginTitle")}</h1>
            <span>{isRegister ? t("auth.registerText") : t("auth.loginText")}</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__fields">
              {isRegister && (
                <>
                  <label>
                    {t("auth.name")}
                    <input name="name" value={form.name} onChange={updateField} placeholder={t("auth.namePlaceholder")} required />
                  </label>
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

              <label>
                {t("auth.email")}
                <input name="email" type="email" value={form.email} onChange={updateField} placeholder={t("auth.emailPlaceholder")} required />
              </label>

              <label>
                {t("auth.password")}
                <input name="password" type="password" value={form.password} onChange={updateField} placeholder={t("auth.passwordPlaceholder")} required minLength={6} />
              </label>
            </div>

            {!isRegister && (
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
            <a href={isRegister ? "#/login" : "#/cadastro"}>
              {isRegister ? t("auth.goToLogin") : t("auth.goToRegister")}
            </a>
          </p>
        </section>
      </section>
    </main>
  );
}

export default AuthPage;
