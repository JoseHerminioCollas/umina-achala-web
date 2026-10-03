// src/components/Header.tsx
import React from "react";
import NavBar from "./NavBar";
import styles from "./Header.module.css";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

const Header = () => {
  const { t } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language?.startsWith("es") ? "en" : "es";
    i18n.changeLanguage(next);
  };

  return (
    <header className={styles.siteHeader}>
      <div className={styles.brand}>
        <div className={styles.brandRow}>
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Umiña Achala Logo"
            className={styles.logo}
          />
          <div className={styles.brandText}>
            <h1>{t("site.title")}</h1>
            <p className={styles.tagline}>
              <b>{t("site.tagline")}</b>
            </p>
            <p className={styles.demoNotice}>{t("demo.notice")}</p>
          </div>
        </div>
      </div>
      <div className={styles.navContainer}>
        <div className={styles.langButton}>
          <span
            role="img"
            aria-label="Español"
            title="Español"
            className={
              i18n.language?.startsWith("es")
                ? styles.activeFlag
                : styles.inactiveFlag
            }
            onClick={
              i18n.language?.startsWith("es") ? undefined : toggleLanguage
            }
          >
            🇪🇸
          </span>
          <span
            role="img"
            aria-label="English"
            title="English"
            className={
              i18n.language?.startsWith("es")
                ? styles.inactiveFlag
                : styles.activeFlag
            }
            onClick={
              i18n.language?.startsWith("es") ? toggleLanguage : undefined
            }
          >
            🇬🇧
          </span>
        </div>
        <NavBar />
      </div>
    </header>
  );
};

export default Header;
