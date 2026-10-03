/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../frontend/src/i18n";
import Card from "../../frontend/src/components/Card";
import { UminaFacade } from "../../frontend/src/data/UminaFacade";
import { Umina } from "../../frontend/src/types/umina";

const base = UminaFacade.fromJSON().getAll()[0];

const withAttrs = (attrs: Umina["attributes"], stoneId = base.properties.stone_id): Umina => ({
  ...base,
  properties: { ...base.properties, stone_id: stoneId },
  attributes: attrs,
});

describe("Card", () => {
  afterEach(() => jest.restoreAllMocks());

  it("shows the stone type, cut and mounted-by", () => {
    const item = withAttrs([
      { trait_type: "Stone Type", value: "jade" },
      { trait_type: "Stone Cut", value: "Step Cut" },
      { trait_type: "Mounted By", value: "Ana" },
    ]);
    render(<Card item={item} onClick={jest.fn()} />);
    expect(screen.getByRole("heading", { name: "jade" })).toBeInTheDocument();
    expect(screen.getByText("Step Cut")).toBeInTheDocument();
    expect(screen.getByText("Mounted by:")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
  });

  it("omits the cut badge and mounted-by when they are absent", () => {
    const item = withAttrs([{ trait_type: "Stone Type", value: "jade" }]);
    render(<Card item={item} onClick={jest.fn()} />);
    expect(screen.queryByText("Mounted by:")).not.toBeInTheDocument();
    expect(screen.queryByText("Step Cut")).not.toBeInTheDocument();
  });

  it("renders the stone image with its name as alt text", () => {
    render(<Card item={base} onClick={jest.fn()} />);
    expect(screen.getByRole("img", { name: base.name })).toHaveAttribute("src", base.image);
  });

  it("calls onClick with the item from the view button and the thumbnail", async () => {
    const onClick = jest.fn();
    render(<Card item={base} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "View Umiña" }));
    expect(onClick).toHaveBeenLastCalledWith(base);
    await userEvent.click(screen.getByRole("img", { name: base.name }));
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("labels the button 'View Achala' when there is no stone_id", () => {
    render(<Card item={withAttrs([], "")} onClick={jest.fn()} />);
    expect(screen.getByRole("button", { name: "View Achala" })).toBeInTheDocument();
  });

  it("tells the user that buying is coming soon from the cart button", async () => {
    const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
    render(<Card item={base} onClick={jest.fn()} />);
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[buttons.length - 1]);
    expect(alert).toHaveBeenCalledWith("Buy with UMA coming soon!");
  });
});
