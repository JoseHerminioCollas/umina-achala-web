// src/components/Marketplace.tsx
import React, { useState } from "react";
import Card from "./Card";
import Filters from "./Filters";
import StoneModal from "./StoneModal";
import { Rumi } from "../types/rumi";
import { RumiFacade } from "../data/RumiFacade";
import styles from "./Marketplace.module.css";
import Pager from "./Pager";
import { useTranslation } from "react-i18next";
import { filterItems } from "../utils/filterItems";

const Marketplace: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<Rumi | null>(null);
  const data = RumiFacade.fromJSON().getAll();
  const [filters, setFilters] = useState({
    type: "",
    types: Array.from(
      new Set(
        data.map(
          (i) =>
            i.attributes.find((a) => a.trait_type === "Stone Type")?.value ||
            "",
        ),
      ),
    ),
    cut: "",
    cuts: Array.from(
      new Set(
        data.map(
          (i) =>
            i.attributes.find((a) => a.trait_type === "Stone Cut")?.value ||
            "No Cut",
        ),
      ),
    ),
    mounted: "",
  });
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = filterItems(data, filters);
  const totalPages = Math.ceil(filtered.length / perPage);
  const pagedItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <section className={styles.marketplace}>
      <div className={styles.controls}>
        <Filters filters={filters} setFilters={setFilters} />
        <Pager page={page} totalPages={totalPages} setPage={setPage} />
      </div>
      {/* <Filters filters={filters} setFilters={setFilters} />
      <Pager page={page} totalPages={totalPages} setPage={setPage} /> */}
      {filtered.length === 0 ? (
        <div className={styles.noResults}>
          {t("marketplace.noResults")}
        </div>
      ) : (
        <>
          <div className={styles.cards}>
            {pagedItems.map((it) => (
              <Card
                key={it.properties.stone_id}
                item={it}
                onClick={setOpen}
              />
            ))}
          </div>
        </>
      )}
      <StoneModal open={open} setOpen={setOpen} />
    </section>
  );
};

export default Marketplace;
