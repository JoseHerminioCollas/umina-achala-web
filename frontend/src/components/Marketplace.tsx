// src/components/Marketplace.tsx
import React, { useState } from "react";
import MarketplaceCard from "./MarketplaceCard";
import Filters from "./Filters";
import StoneModal from "./StoneModal";
import { Rumi } from "../types/rumi";
import { RumiFacade } from "../data/RumiFacade";
import styles from "./Marketplace.module.css";

const Marketplace: React.FC = () => {
  const [open, setOpen] = useState<Rumi | null>(null);

  // Load all items synchronously
  const data = RumiFacade.fromJSON().getAll();

  // Filters state
  const [filters, setFilters] = useState({
    type: "",
    types: Array.from(
      new Set(
        data.map(
          (i) =>
            i.attributes.find((a) => a.trait_type === "Stone Type")?.value || ""
        )
      )
    ),
    region: "",
    regions: Array.from(new Set(data.map((i) => i.properties.mining_concession || ""))),
    cut: "",
    cuts: Array.from(
      new Set(
        data.map(
          (i) =>
            i.attributes.find((a) => a.trait_type === "Stone Cut")?.value || ""
        )
      )
    ),
    mounted: "",
    q: "",
  });

  // Paging state
  const [page, setPage] = useState(1);
  const perPage = 6;

  // Filtering logic
  const filtered = data.filter((i) => {
    if (
      filters.type &&
      !i.attributes.some(
        (a) => a.trait_type === "Stone Type" && a.value === filters.type
      )
    )
      return false;
    if (filters.region && i.properties.mining_concession !== filters.region)
      return false;
    if (
      filters.cut &&
      !i.attributes.some(
        (a) => a.trait_type === "Stone Cut" && a.value === filters.cut
      )
    )
      return false;
    if (
      filters.mounted === "true" &&
      !i.attributes.some((a) => a.trait_type === "Artisan")
    )
      return false;
    if (
      filters.mounted === "false" &&
      i.attributes.some((a) => a.trait_type === "Artisan")
    )
      return false;
    if (filters.q) {
      const hay = (
        i.properties.stone_id +
        " " +
        (i.attributes.find((a) => a.trait_type === "Artisan")?.value || "") +
        " " +
        (i.properties.vendor_ruc || "")
      ).toLowerCase();
      if (!hay.includes(filters.q.toLowerCase())) return false;
    }
    return true;
  });

  // Paging slice
  const totalPages = Math.ceil(filtered.length / perPage);
  const pagedItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <section className={styles.marketplace}>
      <Filters filters={filters} setFilters={setFilters} />

      {filtered.length === 0 ? (
        <div className={styles.noResults}>
          No stones match your filters. Try adjusting your search.
        </div>
      ) : (
        <>
          <div className={styles.cards}>
            {pagedItems.map((it) => (
              <MarketplaceCard
                key={it.properties.stone_id}
                item={it}
                onClick={setOpen}
              />
            ))}
          </div>

          {/* Paging controls only if results exist */}
          {totalPages > 1 && (
            <div className={styles.paging}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
                  <button
                    key={num}
                    className={num === page ? styles.activePage : ""}
                    onClick={() => setPage(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Shared StoneModal */}
      <StoneModal open={open} setOpen={setOpen} />
    </section>
  );
};

export default Marketplace;
