// src/utils/filterItems.ts
import { CatalogItem } from "../types/catalog";
import { attribute, stoneTypes } from "./item";

export const NO_CUT = "No Cut";

export interface Filters {
  /** "" for all, "umina" for stones, "achala" for jewelry. */
  kind: "" | CatalogItem["kind"];
  /** A stone type: an Umiña's, or any of an Achala's stones. */
  type: string;
  /** An Umiña's cut, or NO_CUT; an Achala has no cut, so it never matches. */
  cut: string;
}

export function filterItems(items: CatalogItem[], filters: Filters): CatalogItem[] {
  return items.filter((item) => {
    if (filters.kind && item.kind !== filters.kind) return false;
    if (filters.type && !stoneTypes(item).includes(filters.type)) return false;
    if (filters.cut) {
      if (item.kind !== "umina") return false;
      if ((attribute(item, "Stone Cut") ?? NO_CUT) !== filters.cut) return false;
    }
    return true;
  });
}

/** The choices for the type and cut filters, from the items themselves. */
export function filterOptions(items: CatalogItem[]) {
  const unique = (values: string[]) => Array.from(new Set(values)).sort();
  return {
    types: unique(items.flatMap(stoneTypes)),
    cuts: unique(
      items
        .filter((item) => item.kind === "umina")
        .map((item) => attribute(item, "Stone Cut") ?? NO_CUT),
    ),
  };
}
