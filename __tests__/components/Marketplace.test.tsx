/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import "../../frontend/src/i18n";
import Marketplace from "../../frontend/src/components/Marketplace";
import { resetCatalog } from "../../frontend/src/hooks/useCatalog";
import { Catalog } from "../../frontend/src/types/catalog";
import { achala, catalog, makeUmina, mockFetch, withItems } from "../fixtures/catalog";

const PER_PAGE = 6;

// 12 stones of 4 types (gold has no cut), then the gold pendant: 3 pages
const TYPES = [
  ["Agate", "Tumbled"],
  ["Quartz", "Step Cut"],
  ["Opal", "Cabochon"],
  ["Gold", undefined],
] as const;
const stones = Array.from({ length: 12 }, (_, i) => makeUmina(i + 1, ...TYPES[i % 4]));
const all = [...stones, achala];
const big = withItems(all);

const names = (items: typeof all) => items.map((i) => i.metadata.name);
// image alt text is the item's name, which is unique per item
const shownNames = () => screen.getAllByRole("img").map((img) => img.getAttribute("alt"));
const combo = (label: string) => screen.getByRole("combobox", { name: label });

const renderWith = async (body: Catalog | number = big) => {
  mockFetch(body);
  const result = render(<MemoryRouter><Marketplace /></MemoryRouter>);
  return result;
};

describe("Marketplace", () => {
  beforeEach(() => resetCatalog());
  afterEach(() => jest.restoreAllMocks());

  it("shows a loading message, then the first page of items", async () => {
    await renderWith();
    expect(screen.getByText("Loading the stones…")).toBeInTheDocument();
    await screen.findAllByRole("img");
    expect(shownNames()).toEqual(names(all.slice(0, PER_PAGE)));
  });

  it("shows an error, not a blank page, when the catalog cannot be loaded", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    await renderWith(404);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The stones could not be loaded. Please try again later.",
    );
  });

  it("says no stones are listed when the catalog is empty", async () => {
    await renderWith(withItems([]));
    expect(await screen.findByText("No stones listed yet.")).toBeInTheDocument();
  });

  it("shows the testnet catalog: the agate and the gold pendant", async () => {
    await renderWith(catalog);
    await screen.findAllByRole("img");
    expect(shownNames()).toEqual(names(catalog.items as typeof all));
    expect(screen.getByRole("button", { name: "View Umiña" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Achala" })).toBeInTheDocument();
  });

  it("pages through the items", async () => {
    await renderWith();
    await screen.findAllByRole("img");
    await userEvent.click(screen.getByRole("button", { name: "2" }));
    expect(shownNames()).toEqual(names(all.slice(PER_PAGE, PER_PAGE * 2)));
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(shownNames()).toEqual(names(all.slice(PER_PAGE * 2)));
  });

  it("filters by kind", async () => {
    await renderWith();
    await screen.findAllByRole("img");
    await userEvent.selectOptions(combo("Show:"), "achala");
    expect(shownNames()).toEqual(names([achala]));
  });

  it("filters by stone type, matching an Achala by its stones", async () => {
    await renderWith();
    await screen.findAllByRole("img");
    await userEvent.selectOptions(combo("Type:"), "Gold");
    const gold = all.filter((i) => i.kind === "achala" || i.metadata.name.startsWith("Gold"));
    expect(shownNames()).toEqual(names(gold));
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
  });

  it("returns to page 1 when a filter changes (#57)", async () => {
    const { container } = await renderWith();
    await screen.findAllByRole("img");
    await userEvent.click(screen.getByRole("button", { name: "3" }));
    expect(container.querySelector(".activePage")).toHaveTextContent("3");
    await userEvent.selectOptions(combo("Show:"), "umina");
    expect(container.querySelector(".activePage")).toHaveTextContent("1");
    expect(shownNames()).toEqual(names(stones.slice(0, PER_PAGE)));
  });

  it("shows a message when nothing matches the filters", async () => {
    await renderWith();
    await screen.findAllByRole("img");
    await userEvent.selectOptions(combo("Type:"), "Gold");
    await userEvent.selectOptions(combo("Cut:"), "Tumbled");
    expect(
      screen.getByText("No stones match your filters. Try adjusting your search."),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });

  it("opens the detail from a card and closes it on Escape", async () => {
    await renderWith();
    await screen.findAllByRole("img");
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "View Umiña" })[0]);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Agate");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
  });
});
