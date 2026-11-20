// src/components/Filters.tsx
import React from "react";
import styles from "./Filters.module.css";
import { useTranslation } from "react-i18next";
import { Filters as FilterValues } from "../utils/filterItems";

interface FiltersProps {
  filters: FilterValues;
  options: { types: string[]; cuts: string[] };
  setFilters: (filters: FilterValues) => void;
  setPage: (page: number) => void;
}

const Filters: React.FC<FiltersProps> = ({ filters, options, setFilters, setPage }) => {
  const { t } = useTranslation();
  const updateFilter = (key: keyof FilterValues, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  return (
    <section className={styles.filters}>
      <label className={styles.label}>
        {t("filters.kind")}
        <select
          className={styles.select}
          value={filters.kind}
          onChange={(e) => updateFilter("kind", e.target.value)}
        >
          <option value="">{t("filters.all")}</option>
          <option value="umina">{t("filters.kind_umina")}</option>
          <option value="achala">{t("filters.kind_achala")}</option>
        </select>
      </label>

      <label className={styles.label}>
        {t("filters.type")}
        <select
          className={styles.select}
          value={filters.type}
          onChange={(e) => updateFilter("type", e.target.value)}
        >
          <option value="">{t("filters.all")}</option>
          {options.types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.label}>
        {t("filters.cut")}
        <select
          className={styles.select}
          value={filters.cut}
          onChange={(e) => updateFilter("cut", e.target.value)}
        >
          <option value="">{t("filters.all")}</option>
          {options.cuts.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
};
export default Filters;
