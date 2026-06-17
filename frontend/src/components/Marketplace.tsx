// src/components/Marketplace.tsx
import React, { useState } from "react";
import MarketplaceCard from "./MarketplaceCard";
import Filters from "./Filters";
import { Rumi } from "../types/rumi";
import { RumiFacade } from "../data/RumiFacade";
import styles from "./Marketplace.module.css";

interface MarketplaceProps {
  setOpen: (item: Rumi) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ setOpen }) => {
  // Load all items synchronously from bundled JSON
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

  return (
    <section className={styles.marketplace}>
      <Filters filters={filters} setFilters={setFilters} />
      <div className={styles.cards}>
        {filtered.map((it) => (
          <MarketplaceCard
            key={it.properties.stone_id}
            item={it}
            onClick={setOpen}
          />
        ))}
      </div>
    </section>
  );
};

export default Marketplace;
