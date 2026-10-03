/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../frontend/src/i18n";
import Filters from "../../frontend/src/components/Filters";

const filters = {
  type: "",
  types: ["amethyst", "jade"],
  cut: "",
  cuts: ["Step Cut", "No Cut"],
  mounted: "",
};

const setup = () => {
  const setFilters = jest.fn();
  const setPage = jest.fn();
  render(<Filters filters={filters} setFilters={setFilters} setPage={setPage} />);
  const [type, cut, mounted] = screen.getAllByRole("combobox");
  return { setFilters, setPage, type, cut, mounted };
};

describe("Filters", () => {
  it("lists the available types, cuts and mounted options", () => {
    const { type, cut, mounted } = setup();
    expect(type).toHaveDisplayValue("All");
    expect(Array.from((type as HTMLSelectElement).options).map((o) => o.text)).toEqual([
      "All",
      "amethyst",
      "jade",
    ]);
    expect(Array.from((cut as HTMLSelectElement).options).map((o) => o.text)).toEqual([
      "All",
      "Step Cut",
      "No Cut",
    ]);
    expect(Array.from((mounted as HTMLSelectElement).options).map((o) => o.text)).toEqual([
      "All",
      "Mounted",
      "Unmounted",
    ]);
  });

  it("updates the type filter and returns to page 1", async () => {
    const { setFilters, setPage, type } = setup();
    await userEvent.selectOptions(type, "jade");
    expect(setFilters).toHaveBeenCalledWith({ ...filters, type: "jade" });
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it("updates the cut filter and returns to page 1", async () => {
    const { setFilters, setPage, cut } = setup();
    await userEvent.selectOptions(cut, "No Cut");
    expect(setFilters).toHaveBeenCalledWith({ ...filters, cut: "No Cut" });
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it("updates the mounted filter and returns to page 1", async () => {
    const { setFilters, setPage, mounted } = setup();
    await userEvent.selectOptions(mounted, "false");
    expect(setFilters).toHaveBeenCalledWith({ ...filters, mounted: "false" });
    expect(setPage).toHaveBeenCalledWith(1);
  });
});
