// Privacy.jsx
import React from "react";
import styles from "./Privacy.module.css";
import { useTranslation } from "react-i18next";

const Privacy = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.privacy}>
      <h1 className={styles.title}>{t("privacy.title")}</h1>

      <section className={styles.section}>
        <h2>{t("privacy.policy")}</h2>
        <p>{t("privacy.policyDesc")}</p>
        <ul>
          {(t("privacy.policyItems", { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>{t("privacy.cookies")}</h2>
        <p>{t("privacy.cookiesDesc")}</p>
        <ul>
          <li dangerouslySetInnerHTML={{ __html: t("privacy.essential") }} />
          <li dangerouslySetInnerHTML={{ __html: t("privacy.preference") }} />
          <li dangerouslySetInnerHTML={{ __html: t("privacy.analytics") }} />
        </ul>
      </section>

      <section className={styles.section}>
        <h2>{t("privacy.rights")}</h2>
        <p>{t("privacy.rightsDesc")}</p>
      </section>
    </div>
  );
};

export default Privacy;
