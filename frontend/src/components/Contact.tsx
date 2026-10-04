// Contact.tsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "./Contact.module.css";
import { useTranslation } from "react-i18next";
import { CONTACT_FORM_URL } from "../config";

const Contact: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.contact}>
      <h1 className={styles.title}>{t("contact.title")}</h1>
      <p className={styles.intro}>{t("contact.intro")}</p>
      <iframe
        src={`${CONTACT_FORM_URL}?embedded=true`}
        title={t("contact.frameTitle")}
        className={styles.frame}
        scrolling="no"
        loading="lazy"
      >
        {t("contact.loading")}
      </iframe>
      <a
        href={CONTACT_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.phoneButton}
      >
        {t("contact.openForm")}
      </a>
      <p className={`${styles.note} ${styles.newTabNote}`}>
        <a href={CONTACT_FORM_URL} target="_blank" rel="noopener noreferrer">
          {t("contact.openInNewTab")}
        </a>
      </p>
      <p className={styles.note}>
        {t("contact.privacyNote")} <Link to="/privacy">{t("nav.privacy")}</Link>
      </p>
    </div>
  );
};

export default Contact;
