import React from "react";

const Header = () => {

  return (
    <header className="site-header">
      <div className="brand">
        <div className="brand-row">
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Rumi Logo"
            className="logo"
          />
          <div className="brand-text">
            <h1>Rumi</h1>
            <p className="tagline">
              Automating compliance, illuminating provenance.
            </p>
          </div>
        </div>
      </div>
      <nav className="quick-actions">
        <a href="/collection" className="browse-btn">
          Browse Collection
        </a>
        <a href="/about" className="browse-btn">
          About
        </a>
      </nav>
    </header>
  );
};

export default Header;
