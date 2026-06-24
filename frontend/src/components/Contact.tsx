// Contact.tsx
import React, { useState } from "react";
import styles from "./Contact.module.css";
import { useTranslation } from "react-i18next";

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with backend or email service (e.g., Formspree, Netlify Forms, custom API)
    alert(t("contact.alert"));
    console.log("Form submitted:", formData);
  };

  return (
    <div className={styles.contact}>
      <h1 className={styles.title}>{t("contact.title")}</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          {t("contact.name")}
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.label}>
          {t("contact.email")}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.label}>
          {t("contact.message")}
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className={styles.textarea}
            required
          />
        </label>
        <button type="submit" className={styles.button}>{t("contact.send")}</button>
      </form>
    </div>
  );
};

export default Contact;
