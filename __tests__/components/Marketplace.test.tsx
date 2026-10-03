/** @jest-environment jsdom */
import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../frontend/src/i18n";
import Marketplace from "../../frontend/src/components/Marketplace";
import { UminaFacade } from "../../frontend/src/data/UminaFacade";
import { filterItems } from "../../frontend/src/utils/filterItems";

const all = UminaFacade.fromJSON().getAll();
const PER_PAGE = 6;
const attr = (u: (typeof all)[number], trait: string) =>
  u.attributes.find((a) => a.trait_type === trait)?.value || "";

// image alt text is the stone name, which is unique per stone
const shownNames = () =>
  screen.getAllByRole("img").map((img) => img.getAttribute("alt"));
const viewButtons = () => screen.getAllByRole("button", { name: "View Umiña" });

// find a type + cut combination that no stone has
const types = Array.from(new Set(all.map((u) => attr(u, "Stone Type"))));
const cuts = Array.from(new Set(all.map((u) => attr(u, "Stone Cut") || "No Cut")));
const emptyCombo = types
  .flatMap((type) => cuts.map((cut) => ({ type, cut })))
  .find((f) => filterItems(all, { ...f, mounted: "" }).length === 0);

describe("Marketplace", () => {
  it("shows the first page of stones", () => {
    render(<Marketplace />);
    expect(viewButtons()).toHaveLength(Math.min(PER_PAGE, all.length));
    expect(shownNames()).toEqual(all.slice(0, PER_PAGE).map((u) => u.name));
  });

  it("pages through the stones", async () => {
    render(<Marketplace />);
    await userEvent.click(screen.getByRole("button", { name: "2" }));
    expect(shownNames()).toEqual(all.slice(PER_PAGE, PER_PAGE * 2).map((u) => u.name));
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(shownNames()).toEqual(all.slice(PER_PAGE * 2, PER_PAGE * 3).map((u) => u.name));
  });

  it("filters by stone type and hides the pager when one page is enough", async () => {
    render(<Marketplace />);
    const type = types[0];
    const expected = filterItems(all, { type, cut: "", mounted: "" });
    expect(expected.length).toBeLessThanOrEqual(PER_PAGE);
    await userEvent.selectOptions(screen.getAllByRole("combobox")[0], type);
    expect(shownNames()).toEqual(expected.map((u) => u.name));
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
  });

  it("filters by mounted", async () => {
    render(<Marketplace />);
    await userEvent.selectOptions(screen.getAllByRole("combobox")[2], "true");
    const expected = filterItems(all, { type: "", cut: "", mounted: "true" });
    expect(screen.getAllByText("Mounted by:")).toHaveLength(
      Math.min(PER_PAGE, expected.length),
    );
  });

  it("returns to page 1 when a filter changes (#57)", async () => {
    const { container } = render(<Marketplace />);
    const lastPage = Math.ceil(all.length / PER_PAGE);
    await userEvent.click(screen.getByRole("button", { name: String(lastPage) }));
    expect(container.querySelector(".activePage")).toHaveTextContent(String(lastPage));

    const unmounted = filterItems(all, { type: "", cut: "", mounted: "false" });
    expect(unmounted.length).toBeGreaterThan(PER_PAGE); // pager stays visible
    await userEvent.selectOptions(screen.getAllByRole("combobox")[2], "false");
    expect(container.querySelector(".activePage")).toHaveTextContent("1");
    expect(shownNames()).toEqual(unmounted.slice(0, PER_PAGE).map((u) => u.name));
  });

  it("shows a message when no stone matches the filters", async () => {
    expect(emptyCombo).toBeDefined();
    render(<Marketplace />);
    const [typeSelect, cutSelect] = screen.getAllByRole("combobox");
    await userEvent.selectOptions(typeSelect, emptyCombo!.type);
    await userEvent.selectOptions(cutSelect, emptyCombo!.cut);
    expect(
      screen.getByText("No stones match your filters. Try adjusting your search."),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: "View Umiña" })).toHaveLength(0);
  });

  it("opens the stone modal from a card and closes it on Escape", async () => {
    render(<Marketplace />);
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    await userEvent.click(viewButtons()[0]);
    const modal = screen.getByRole("heading", { level: 2 });
    expect(modal).toHaveTextContent(attr(all[0], "Stone Type"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
  });
});
