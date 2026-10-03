import { UminaFacade } from "../frontend/src/data/UminaFacade";
import uminas from "../frontend/src/data/uminas.json";

describe("UminaFacade", () => {
  const facade = UminaFacade.fromJSON();

  it("getAll returns every bundled stone", () => {
    expect(facade.getAll()).toHaveLength(uminas.length);
  });

  it("getFeatured returns the first 3 stones by default", () => {
    const featured = facade.getFeatured();
    expect(featured).toHaveLength(3);
    expect(featured.map((u) => u.properties.stone_id)).toEqual(
      uminas.slice(0, 3).map((u) => u.properties.stone_id),
    );
  });

  it("getFeatured honors the count", () => {
    expect(facade.getFeatured(5)).toHaveLength(5);
    expect(facade.getFeatured(0)).toEqual([]);
  });

  it("getFeatured returns everything when count exceeds the data", () => {
    expect(facade.getFeatured(uminas.length + 10)).toHaveLength(uminas.length);
  });

  it("findById finds a stone by stone_id", () => {
    const id = uminas[4].properties.stone_id;
    expect(facade.findById(id)?.properties.stone_id).toBe(id);
  });

  it("findById returns undefined for an unknown id", () => {
    expect(facade.findById("UMINA-0000-XX-00")).toBeUndefined();
  });
});
