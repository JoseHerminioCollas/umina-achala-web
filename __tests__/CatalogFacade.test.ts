import { CatalogFacade, loadCatalog } from "../frontend/src/data/CatalogFacade";
import { achala, catalog, makeUmina, umina, withItems } from "./fixtures/catalog";

const response = (body: unknown, status = 200) =>
  jest.fn(async () => ({ ok: status < 400, status, json: async () => body }) as Response);

describe("CatalogFacade", () => {
  const facade = CatalogFacade.fromCatalog(catalog);

  it("getAll returns every item in the catalog's order", () => {
    expect(facade.getAll().map((i) => i.stone_id)).toEqual(catalog.items.map((i) => i.stone_id));
  });

  it("getFeatured returns the first 3 items by default, and honors the count", () => {
    const many = CatalogFacade.fromCatalog(
      withItems([1, 2, 3, 4, 5].map((n) => makeUmina(n, "Agate"))),
    );
    expect(many.getFeatured().map((i) => i.serial)).toEqual([1, 2, 3]);
    expect(many.getFeatured(5)).toHaveLength(5);
    expect(many.getFeatured(0)).toEqual([]);
    expect(many.getFeatured(10)).toHaveLength(5);
  });

  it("findById finds an Umiña and an Achala by stone_id", () => {
    expect(facade.findById(umina.stone_id)).toBe(umina);
    expect(facade.findById(achala.stone_id)).toBe(achala);
  });

  it("findById finds the Achala a stone is mounted in", () => {
    const mounted = achala.stones[0].stone_id;
    expect(catalog.items.some((i) => i.stone_id === mounted)).toBe(false);
    expect(facade.findById(mounted)).toBe(achala);
  });

  it("findById returns undefined for an unknown id", () => {
    expect(facade.findById("UMINA-0000-XX-00")).toBeUndefined();
  });
});

describe("loadCatalog", () => {
  it("fetches catalog.json without the browser's cached copy", async () => {
    const fetchFn = response(catalog);
    await expect(loadCatalog("./data/catalog.json", fetchFn)).resolves.toBe(catalog);
    expect(fetchFn).toHaveBeenCalledWith("./data/catalog.json", { cache: "no-cache" });
  });

  it("rejects a missing catalog", async () => {
    await expect(loadCatalog("x", response({}, 404))).rejects.toThrow("404");
  });

  it("rejects a file that is not a catalog", async () => {
    await expect(loadCatalog("x", response({ items: [] }))).rejects.toThrow("schema_version");
    await expect(loadCatalog("x", response("<html>"))).rejects.toThrow("schema_version");
  });

  it("rejects a catalog built for another network than the site's", async () => {
    await expect(
      loadCatalog("x", response({ ...catalog, network: "mainnet" })),
    ).rejects.toThrow("built for mainnet, the site is on testnet");
  });
});
