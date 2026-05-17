import "./Header.css";

const navigationItems = [
    { href: "#/", label: "Início" },
    { href: "#/vagas", label: "Vagas" },
    { href: "#/publicar", label: "Recrutadores" },
];

function Header() {
    return (
        <header className="header">
            <div className="header__container">
                <a className="header__brand" href="#/">
                    <span className="header__brand-mark" aria-hidden="true">
                        EM
                    </span>
                    <span>ElMigrante</span>
                </a>

                <nav className="header__nav" aria-label="Navegação principal">
                    {navigationItems.map((item) => (
                        <a href={item.href} key={item.href}>
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="header__actions">
                    <a className="header__link" href="#/vagas">
                        Pesquisar vagas
                    </a>
                    <a className="header__button" href="#/publicar">
                        Publicar vaga
                    </a>
                </div>
            </div>
        </header>
    );
}

export default Header;
