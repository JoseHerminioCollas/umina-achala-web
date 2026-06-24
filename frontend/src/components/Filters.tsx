// src/components/Filters.tsx
import React from "react";
import styles from "./Filters.module.css";
import { useTranslation } from "react-i18next";

interface FiltersProps {
  filters: {
    type: string;
    types: string[];
    cut: string;
    cuts: string[];
    mounted: string;
  };
  setFilters: (filters: any) => void;
}

const Filters: React.FC<FiltersProps> = ({ filters, setFilters }) => {
  const { t } = useTranslation();
  return (
    <section className={styles.filters}>
      <label className={styles.label}>
        {t("filters.type")}
        <select
          className={styles.select}
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">{t("filters.all")}</option>
        {filters.types.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>

    <label className={styles.label}>
      {t("filters.cut")}
      <select
        className={styles.select}
        value={filters.cut}
        onChange={(e) => setFilters({ ...filters, cut: e.target.value })}
      >
        <option value="">{t("filters.all")}</option>
        {filters.cuts.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>

    <label className={styles.label}>
      {t("filters.mounted")}
      <select
        className={styles.select}
        value={filters.mounted}
        onChange={(e) => setFilters({ ...filters, mounted: e.target.value })}
      >
        <option value="">{t("filters.all")}</option>
        <option value="true">{t("filters.mounted_yes")}</option>
        <option value="false">{t("filters.mounted_no")}</option>
      </select>
    </label>
  </section>
  );
};
export default Filters;
