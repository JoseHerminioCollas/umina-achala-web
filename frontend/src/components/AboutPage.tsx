import React from "react";
import styles from "./AboutPage.module.css";
import { useTranslation } from "react-i18next";

const AboutPage = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.aboutPage}>
      <h1 className={styles.title}>{t("about.title")}</h1>
      <p className={styles.tagline}>{t("about.tagline")}</p>

      <section className={styles.section}>
        <h2>{t("about.what")}</h2>
        <p dangerouslySetInnerHTML={{ __html: t("about.whatDesc1") }} />
        <p dangerouslySetInnerHTML={{ __html: t("about.whatDesc2") }} />
      </section>

      <section className={styles.section}>
        <h2>{t("about.umina")}</h2>
        <p dangerouslySetInnerHTML={{ __html: t("about.uminaDesc") }} />
      </section>

      <section className={styles.section}>
        <h2>{t("about.achala")}</h2>
        <p dangerouslySetInnerHTML={{ __html: t("about.achalaDesc") }} />
      </section>

      <section className={styles.section}>
        <h2>{t("about.compliance")}</h2>
        <p dangerouslySetInnerHTML={{ __html: t("about.complianceDesc") }} />
        <ul>
          {(t("about.complianceItems", { returnObjects: true }) as string[]  ).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>{t("about.platform")}</h2>
        <h3>{t("about.platformUrl")}</h3>
        <p dangerouslySetInnerHTML={{ __html: t("about.platformDesc") }} />

        <div className={styles.subSection}>
          <h3>{t("about.wallet")}</h3>
          <ul>
            {(t("about.walletItems", { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </div>

        <div className={styles.subSection}>
          <h3>{t("about.provenance")}</h3>
          <ul>
            {(t("about.provenanceItems", { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </div>

        <div className={styles.subSection}>
          <h3>{t("about.marketplace")}</h3>
          <ul>
            {(t("about.marketplaceItems", { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </div>

        <div className={styles.subSection}>
          <h3>{t("about.complianceDashboard")}</h3>
          <ul>
            {(t("about.complianceDashboardItems", { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </div>

        <div className={styles.subSection}>
          <h3>{t("about.community")}</h3>
          <ul>
            {(t("about.communityItems", { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t("about.artistry")}</h2>
        <p>{t("about.artistryDesc")}</p>
        <ul>
          {(t("about.artistryItems", { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>{t("about.lifecycle")}</h2>
        <ol>
          {(t("about.lifecycleItems", { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default AboutPage;
