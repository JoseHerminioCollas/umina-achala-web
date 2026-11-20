// src/components/Marketplace.tsx
import React, { useMemo, useState } from "react";
import Card from "./Card";
import Filters from "./Filters";
import StoneModal from "./StoneModal";
import { CatalogItem } from "../types/catalog";
import styles from "./Marketplace.module.css";
import Pager from "./Pager";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "../hooks/usePageMeta";
import { useCatalog } from "../hooks/useCatalog";
import { Filters as FilterValues, filterItems, filterOptions } from "../utils/filterItems";

const PER_PAGE = 6;

const Marketplace: React.FC = () => {
  const { t } = useTranslation();
  usePageMeta("marketplace");
  const state = useCatalog();
  const [open, setOpen] = useState<CatalogItem | null>(null);
  const [filters, setFilters] = useState<FilterValues>({ kind: "", type: "", cut: "" });
  const [page, setPage] = useState(1);

  const items = state.status === "ready" ? state.catalog.getAll() : [];
  const media = state.status === "ready" ? state.catalog.media : undefined;
  const options = useMemo(() => filterOptions(items), [items]);

  if (state.status === "loading") {
    return (
      <section className={styles.marketplace}>
        <div className={styles.noResults}>{t("marketplace.loading")}</div>
      </section>
    );
  }
  if (state.status === "error") {
    return (
      <section className={styles.marketplace}>
        <div className={styles.noResults} role="alert">{t("marketplace.error")}</div>
      </section>
    );
  }
  if (items.length === 0) {
    return (
      <section className={styles.marketplace}>
        <div className={styles.noResults}>{t("marketplace.empty")}</div>
      </section>
    );
  }

  const filtered = filterItems(items, filters);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pagedItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <section className={styles.marketplace}>
      <div className={styles.controls}>
        <Filters filters={filters} options={options} setFilters={setFilters} setPage={setPage} />
        <Pager page={page} totalPages={totalPages} setPage={setPage} />
      </div>
      {filtered.length === 0 ? (
        <div className={styles.noResults}>{t("marketplace.noResults")}</div>
      ) : (
        <div className={styles.cards}>
          {pagedItems.map((it) => (
            <Card key={it.stone_id} item={it} onClick={setOpen} media={media} />
          ))}
        </div>
      )}
      <StoneModal open={open} setOpen={setOpen} media={media} />
    </section>
  );
};

export default Marketplace;
