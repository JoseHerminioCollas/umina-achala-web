/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../frontend/src/i18n";
import Filters from "../../frontend/src/components/Filters";
import { Filters as FilterValues } from "../../frontend/src/utils/filterItems";

const filters: FilterValues = { kind: "", type: "", cut: "" };
const options = { types: ["Agate", "Gold"], cuts: ["No Cut", "Step Cut"] };

const setup = () => {
  const setFilters = jest.fn();
  const setPage = jest.fn();
  render(
    <Filters filters={filters} options={options} setFilters={setFilters} setPage={setPage} />,
  );
  const [kind, type, cut] = screen.getAllByRole("combobox");
  return { setFilters, setPage, kind, type, cut };
};

const optionTexts = (select: HTMLElement) =>
  Array.from((select as HTMLSelectElement).options).map((o) => o.text);

describe("Filters", () => {
  it("lists the kinds, the stone types and the cuts", () => {
    const { kind, type, cut } = setup();
    expect(type).toHaveDisplayValue("All");
    expect(optionTexts(kind)).toEqual(["All", "Stones", "Jewelry"]);
    expect(optionTexts(type)).toEqual(["All", "Agate", "Gold"]);
    expect(optionTexts(cut)).toEqual(["All", "No Cut", "Step Cut"]);
  });

  it("updates the kind filter and returns to page 1", async () => {
    const { setFilters, setPage, kind } = setup();
    await userEvent.selectOptions(kind, "achala");
    expect(setFilters).toHaveBeenCalledWith({ ...filters, kind: "achala" });
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it("updates the type filter and returns to page 1", async () => {
    const { setFilters, setPage, type } = setup();
    await userEvent.selectOptions(type, "Gold");
    expect(setFilters).toHaveBeenCalledWith({ ...filters, type: "Gold" });
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it("updates the cut filter and returns to page 1", async () => {
    const { setFilters, setPage, cut } = setup();
    await userEvent.selectOptions(cut, "No Cut");
    expect(setFilters).toHaveBeenCalledWith({ ...filters, cut: "No Cut" });
    expect(setPage).toHaveBeenCalledWith(1);
  });
});
