// AdminNFT.tsx
import React, { useState } from "react";
import styles from "./AdminNFT.module.css";
import { useTranslation } from "react-i18next";

const AdminNFT: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with backend auth (AWS Cognito, API Gateway + Lambda, etc.)
    alert(t("admin.alert"));
    console.log("Admin login submitted:", formData);
  };

  return (
    <div className={styles.admin}>
      <h1 className={styles.title}>{t("admin.title")}</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          {t("admin.username")}
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.label}>
          {t("admin.password")}
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </label>
        <button type="submit" className={styles.button}>
          {t("admin.logIn")}
        </button>
      </form>
    </div>
  );
};

export default AdminNFT;
