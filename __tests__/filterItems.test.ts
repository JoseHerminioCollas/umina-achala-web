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

describe("filterItems (combined and edge cases)", () => {
  const stone = (
    type: string,
    cut?: string,
    mountedBy?: string,
  ) => {
    const attrs: { trait_type: string; value?: string }[] = [
      { trait_type: "Stone Type", value: type },
    ];
    if (cut !== undefined) attrs.push({ trait_type: "Stone Cut", value: cut });
    if (mountedBy !== undefined)
      attrs.push({ trait_type: "Mounted By", value: mountedBy });
    return { attributes: attrs };
  };

  const data = [
    stone("Jade", "Cabochon", "Ana"),
    stone("Jade", "Faceted"),
    stone("Amethyst", "Cabochon", "Luis"),
    stone("Amethyst"),
  ];
  const none: Filters = { type: "", cut: "", mounted: "" };

  it("combines type and cut", () => {
    const result = filterItems(data, { ...none, type: "Jade", cut: "Cabochon" });
    expect(result).toEqual([data[0]]);
  });

  it("combines cut and mounted", () => {
    const result = filterItems(data, { ...none, cut: "Cabochon", mounted: "true" });
    expect(result).toEqual([data[0], data[2]]);
  });

  it("combines type, cut and mounted=false", () => {
    const result = filterItems(data, {
      ...none,
      type: "Jade",
      cut: "Faceted",
      mounted: "false",
    });
    expect(result).toEqual([data[1]]);
  });

  it("returns nothing when no stone matches", () => {
    expect(filterItems(data, { ...none, type: "Quartz" })).toEqual([]);
    expect(
      filterItems(data, { ...none, type: "Amethyst", cut: "Faceted" }),
    ).toEqual([]);
  });

  it("treats a missing Stone Cut attribute as 'No Cut'", () => {
    const result = filterItems(data, { ...none, cut: "No Cut" });
    expect(result).toEqual([data[3]]);
  });

  it("treats a whitespace-only Mounted By as unmounted", () => {
    const items = [stone("Jade", "Cabochon", "   ")];
    expect(filterItems(items, { ...none, mounted: "true" })).toEqual([]);
    expect(filterItems(items, { ...none, mounted: "false" })).toEqual(items);
  });

  it("does not mutate the input array", () => {
    const copy = [...data];
    filterItems(data, { ...none, type: "Jade" });
    expect(data).toEqual(copy);
  });

  it("handles an empty list", () => {
    expect(filterItems([], { ...none, type: "Jade" })).toEqual([]);
  });
});
