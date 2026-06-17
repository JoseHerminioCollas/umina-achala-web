// src/utils/filterItems.ts
import { Rumi } from "../types/rumi";

export type FiltersState = {
  types: string[];
  regions: string[];
  cuts: string[];
  type: string;
  region: string;
  cut: string;
  mounted: string;
  q: string;
};


export function filterItems(items: Rumi[], filters: FiltersState): Rumi[] {
  return items.filter((i) => {
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
}
