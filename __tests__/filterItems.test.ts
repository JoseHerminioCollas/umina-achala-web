import { filterItems, Filters } from "../frontend/src/utils/filterItems";

const makeItem = (attrs: { trait_type: string; value?: string }[]) => ({
  attributes: attrs,
});

describe("filterItems", () => {
  const data = [
    makeItem([{ trait_type: "Stone Type", value: "Granite" }]),
    makeItem([{ trait_type: "Stone Cut", value: "Round" }]),
    makeItem([{ trait_type: "Stone Cut", value: "" }]), // No Cut
    makeItem([{ trait_type: "Mounted By", value: "Alice" }]),
  ];

  it("filters by type", () => {
    const filters: Filters = { type: "Granite", cut: "", mounted: "" };
    const result = filterItems(data, filters);
    expect(result).toHaveLength(1);
    expect(result[0].attributes[0].value).toBe("Granite");
  });

  it("filters by cut", () => {
    const filters: Filters = { type: "", cut: "Round", mounted: "" };
    const result = filterItems(data, filters);
    expect(result).toHaveLength(1);
    expect(result[0].attributes[0].value).toBe("Round");
  });

  it("filters by 'No Cut'", () => {
    const filters: Filters = { type: "", cut: "No Cut", mounted: "" };
    const result = filterItems(data, filters);
    expect(result).toHaveLength(3);
    expect(result[0].attributes[0].value).toBe("Granite");
  });

  it("filters by mounted=true", () => {
    const filters: Filters = { type: "", cut: "", mounted: "true" };
    const result = filterItems(data, filters);
    expect(result).toHaveLength(1);
    expect(result[0].attributes[0].value).toBe("Alice");
  });

  it("filters by mounted=false", () => {
    const filters: Filters = { type: "", cut: "", mounted: "false" };
    const result = filterItems(data, filters);
    // Should exclude the mounted item
    expect(result.every((i) =>
      !i.attributes.some((a) => a.trait_type === "Mounted By" && a.value)
    )).toBe(true);
  });

  it("returns all items when filters are empty", () => {
    const filters: Filters = { type: "", cut: "", mounted: "" };
    const result = filterItems(data, filters);
    expect(result).toHaveLength(data.length);
  });
});
