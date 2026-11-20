// Test data: catalog.json as built from testnet on 2026-11-19
// (umina-achala-chain#44): Umiña 15 (agate) and Achala 5 with Umiña 8 (gold).
import fixture from "./catalog.json";
import { AchalaItem, Catalog, CatalogItem, UminaItem } from "../../frontend/src/types/catalog";

export const catalog = fixture as unknown as Catalog;
export const umina = catalog.items.find((i) => i.kind === "umina") as UminaItem;
export const achala = catalog.items.find((i) => i.kind === "achala") as AchalaItem;

/** A copy of the fixture's Umiña with its own serial, stone type and cut. */
export function makeUmina(serial: number, type: string, cut?: string): UminaItem {
  const attributes = umina.metadata.attributes
    .filter((a) => a.trait_type !== "Stone Type" && a.trait_type !== "Stone Cut")
    .concat(
      [{ trait_type: "Stone Type", value: type }],
      cut ? [{ trait_type: "Stone Cut", value: cut }] : [],
    );
  const stoneId = `UMINA-2026-XX-${String(serial).padStart(2, "0")}`;
  return {
    ...umina,
    stone_id: stoneId,
    serial,
    metadata: {
      ...umina.metadata,
      name: `${type} · ${stoneId}`,
      properties: { ...umina.metadata.properties, stone_id: stoneId },
      attributes,
    },
  };
}

export const withItems = (items: CatalogItem[]): Catalog => ({ ...catalog, items });

/** Serves a catalog (or an HTTP error status) to the site's fetch. */
export function mockFetch(body: Catalog | number) {
  const fn = jest.fn(async () =>
    typeof body === "number"
      ? ({ ok: false, status: body, json: async () => ({}) } as Response)
      : ({ ok: true, status: 200, json: async () => body } as Response),
  );
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}
