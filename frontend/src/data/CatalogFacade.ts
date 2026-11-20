// src/data/CatalogFacade.ts
// The site's items, read from catalog.json (#89, #124). The catalog is loaded
// at run time, so a rebuilt and published catalog shows with no site build.
import { CATALOG_URL, NETWORK } from "../config";
import { Catalog, CatalogItem } from "../types/catalog";

export class CatalogFacade {
  private constructor(private readonly items: CatalogItem[]) {}

  static fromCatalog(catalog: Catalog): CatalogFacade {
    return new CatalogFacade(catalog.items);
  }

  /** Everything UA has for sale: Umiña, then Achala, each by serial. */
  getAll(): CatalogItem[] {
    return this.items;
  }

  getFeatured(count: number = 3): CatalogItem[] {
    return this.items.slice(0, count);
  }

  /**
   * The item with this stone_id. A stone mounted in an Achala is not listed
   * alone, so its id finds the Achala it is mounted in.
   */
  findById(stoneId: string): CatalogItem | undefined {
    return this.items.find(
      (item) =>
        item.stone_id === stoneId ||
        (item.kind === "achala" && item.stones.some((s) => s.stone_id === stoneId)),
    );
  }
}

/**
 * Fetches and checks catalog.json. Rejects when the file is missing or broken,
 * or was built for another network than the site's.
 */
export async function loadCatalog(
  url: string = CATALOG_URL,
  fetchFn: typeof fetch = fetch,
): Promise<Catalog> {
  // no-cache: revalidate, so a republished catalog shows on the next visit
  const res = await fetchFn(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Catalog: ${url} returned ${res.status}`);
  const catalog = (await res.json()) as Catalog;
  if (catalog?.schema_version !== 1 || !Array.isArray(catalog.items)) {
    throw new Error("Catalog: not a schema_version 1 catalog");
  }
  if (catalog.network !== NETWORK) {
    throw new Error(`Catalog: built for ${catalog.network}, the site is on ${NETWORK}`);
  }
  return catalog;
}
