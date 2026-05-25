import { FiBriefcase, FiMail, FiMapPin } from "react-icons/fi";
import { createTranslator } from "../../i18n/translations";
import "./Footer.css";

function Footer({ language = "pt" }) {
  const t = createTranslator(language);
  const year = new Date().getFullYear();

  const footerLinks = [
    { href: "#/vagas", label: t("footer.jobs") },
    { href: "#/publicar", label: t("footer.recruiters") },
    { href: "#/", label: t("footer.about") },
  ];

  return (
    <footer className="site-footer">
      <div className="site-footer__container">
        <div className="site-footer__brand">
          <a className="site-footer__logo" href="#/" aria-label={t("header.initialPageLabel")}>
            <span className="site-footer__mark" aria-hidden="true">
              <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="" />
            </span>
            <span>
              <strong>ElMigrante</strong>
              <small>{t("footer.company")}</small>
            </span>
          </a>
          <p>{t("landing.footer")}</p>
        </div>

        <nav className="site-footer__nav" aria-label={t("footer.navigation")}>
          <h2>{t("footer.navigation")}</h2>
          {footerLinks.map((link) => (
            <a href={link.href} key={link.href}>{link.label}</a>
          ))}
        </nav>

        <div className="site-footer__info">
          <h2>{t("footer.platform")}</h2>
          <p><FiMapPin aria-hidden="true" /> {t("footer.region")}</p>
          <p><FiBriefcase aria-hidden="true" /> {t("footer.focus")}</p>
          <p><FiMail aria-hidden="true" /> {t("footer.contact")}</p>
        </div>
      </div>

      <div className="site-footer__bottom">
        <span>© {year} ElMigrante. {t("footer.rights")}</span>
        <span>{t("footer.disclaimer")}</span>
      </div>
    </footer>
  );
}

export default Footer;
