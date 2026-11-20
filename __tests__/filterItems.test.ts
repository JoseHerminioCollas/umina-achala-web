import { filterItems, filterOptions, NO_CUT } from "../frontend/src/utils/filterItems";
import { achala, makeUmina } from "./fixtures/catalog";

const agate = makeUmina(1, "Agate", "Tumbled");
const gold = makeUmina(2, "Gold"); // no cut
const quartz = makeUmina(3, "Quartz", "Step Cut");
const items = [agate, gold, quartz, achala]; // achala: a gold pendant

const ids = (filtered: typeof items) => filtered.map((i) => i.stone_id);
const none = { kind: "", type: "", cut: "" } as const;

describe("filterItems", () => {
  it("returns everything with no filter", () => {
    expect(filterItems(items, none)).toEqual(items);
  });

  it("filters by kind: stones or jewelry", () => {
    expect(ids(filterItems(items, { ...none, kind: "umina" }))).toEqual(ids([agate, gold, quartz]));
    expect(filterItems(items, { ...none, kind: "achala" })).toEqual([achala]);
  });

  it("matches a stone type on an Umiña or on any of an Achala's stones", () => {
    expect(filterItems(items, { ...none, type: "Gold" })).toEqual([gold, achala]);
    expect(filterItems(items, { ...none, type: "Agate" })).toEqual([agate]);
  });

  it("filters by cut, Umiña only", () => {
    expect(filterItems(items, { ...none, cut: "Step Cut" })).toEqual([quartz]);
  });

  it("matches stones with no cut with NO_CUT, never an Achala", () => {
    expect(filterItems(items, { ...none, cut: NO_CUT })).toEqual([gold]);
  });

  it("combines filters", () => {
    expect(filterItems(items, { kind: "umina", type: "Gold", cut: "" })).toEqual([gold]);
    expect(filterItems(items, { kind: "achala", type: "Agate", cut: "" })).toEqual([]);
  });
});

describe("filterOptions", () => {
  it("lists each stone type once, sorted, including an Achala's stones", () => {
    expect(filterOptions([quartz, achala, agate]).types).toEqual(["Agate", "Gold", "Quartz"]);
  });

  it("lists the Umiña cuts, with NO_CUT for a stone without one", () => {
    expect(filterOptions(items).cuts).toEqual([NO_CUT, "Step Cut", "Tumbled"]);
    expect(filterOptions([achala]).cuts).toEqual([]);
  });
});
