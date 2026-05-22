import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiGlobe } from "react-icons/fi";
import { createTranslator, languages } from "../../i18n/translations";
import "./Header.css";

function Header({ language = "pt", onLanguageChange, authSession, onLogout }) {
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
    const [currentHash, setCurrentHash] = useState(window.location.hash || "#/");
    const languageRef = useRef(null);
    const t = createTranslator(language);
    const activeLanguage = languages.find((option) => option.code === language) || languages[0];
    const isAuthenticated = Boolean(authSession?.session?.access_token);
    const navigationItems = [
        { href: "#/", label: t("header.home") },
        { href: "#/vagas", label: t("header.jobs") },
        { href: "#/recrutador", label: t("header.recruiters") },
    ];

    useEffect(() => {
        function handleOutsideClick(event) {
            if (!languageRef.current?.contains(event.target)) {
                setIsLanguageOpen(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        function syncHash() {
            setCurrentHash(window.location.hash || "#/");
        }

        window.addEventListener("hashchange", syncHash);
        return () => window.removeEventListener("hashchange", syncHash);
    }, []);

    function selectLanguage(nextLanguage) {
        onLanguageChange?.(nextLanguage);
        setIsLanguageOpen(false);
    }

    function isActiveNavigationItem(href) {
        if (href === "#/") {
            return currentHash === "" || currentHash === "#/" || currentHash === "#/planos";
        }

        return currentHash.startsWith(href);
    }

    return (
        <header className="header">
            <div className="header__container">
                <a className="header__brand" href="#/" aria-label={t("header.initialPageLabel")}>
                    <span className="header__logo" aria-hidden="true">
                        <span className="header__logo-arc"></span>
                        <span className="header__logo-star"></span>
                    </span>
                    <span className="header__brand-text">
                        <strong>ElMigrante</strong>
                        <small>{t("header.tagline")}</small>
                    </span>
                </a>

                <nav className="header__nav" aria-label={t("header.navLabel")}>
                    {navigationItems.map((item) => (
                        <a href={item.href} aria-current={isActiveNavigationItem(item.href) ? "page" : undefined} key={item.href}>
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="header__actions">
                    {isAuthenticated ? (
                        <>
                            <a className="header__link header__link--panel" href="#/recrutador">
                                {t("header.dashboard")}
                            </a>
                            <a className="header__button" href="#/publicar">
                                {t("header.publishJob")}
                            </a>
                            <button className="header__logout" type="button" onClick={onLogout}>
                                {t("header.logout")}
                            </button>
                        </>
                    ) : (
                        <>
                            <a className="header__link" href="#/vagas">
                                {t("header.findJob")}
                            </a>
                            <a className="header__button" href="#/login">
                                {t("header.login")}
                            </a>
                        </>
                    )}

                    <div className="header__language" ref={languageRef}>
                        <button
                            className="header__language-trigger"
                            type="button"
                            aria-label={t("header.languageLabel")}
                            aria-expanded={isLanguageOpen}
                            onClick={() => setIsLanguageOpen((currentState) => !currentState)}
                        >
                            <FiGlobe size={16} aria-hidden="true" />
                            <span>{activeLanguage.shortLabel}</span>
                            <FiChevronDown size={14} aria-hidden="true" />
                        </button>

                        {isLanguageOpen && (
                            <div className="header__language-dropdown" role="menu">
                                {languages.map((option) => (
                                    <button
                                        className="header__language-option"
                                        type="button"
                                        role="menuitemradio"
                                        aria-checked={language === option.code}
                                        key={option.code}
                                        onClick={() => selectLanguage(option.code)}
                                    >
                                        <span>{option.label}</span>
                                        <strong>{option.shortLabel}</strong>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
