import React from "react";
import styles from "./FAQ.module.css";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "../hooks/usePageMeta";

const FAQ = () => {
  const { t } = useTranslation();
  usePageMeta("faqs");
  return (
    <div className={styles.faqPage}>
      <h1 className={styles.title}>{t("faq.title")}</h1>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>{t("faq.q1")}</h2>
        <p className={styles.answer} dangerouslySetInnerHTML={{ __html: t("faq.a1") }} />
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>{t("faq.q2")}</h2>
        <p className={styles.answer} dangerouslySetInnerHTML={{ __html: t("faq.a2") }} />
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>{t("faq.q3")}</h2>
        <p className={styles.answer} dangerouslySetInnerHTML={{ __html: t("faq.a3") }} />
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>{t("faq.q4")}</h2>
        <p className={styles.answer} dangerouslySetInnerHTML={{ __html: t("faq.a4") }} />
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>{t("faq.q5")}</h2>
        <p className={styles.answer} dangerouslySetInnerHTML={{ __html: t("faq.a5") }} />
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>{t("faq.q6")}</h2>
        <p className={styles.answer} dangerouslySetInnerHTML={{ __html: t("faq.a6") }} />
      </div>

      <div className={styles.faqItem}>
        <h2 className={styles.question}>{t("faq.q7")}</h2>
        <p className={styles.answer} dangerouslySetInnerHTML={{ __html: t("faq.a7") }} />
      </div>
    </div>
  );
};

export default FAQ;
