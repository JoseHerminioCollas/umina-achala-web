/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../frontend/src/i18n";
import Card from "../../frontend/src/components/Card";
import { imageUrl } from "../../frontend/src/utils/item";
import { achala, makeUmina, umina } from "../fixtures/catalog";

describe("Card", () => {
  afterEach(() => jest.restoreAllMocks());

  it("shows an Umiña's stone type, cut and price", () => {
    render(<Card item={umina} onClick={jest.fn()} />);
    expect(screen.getByRole("heading", { name: "Agate" })).toBeInTheDocument();
    expect(screen.getByText("Tumbled")).toBeInTheDocument();
    expect(screen.getByText("45 HBAR")).toBeInTheDocument();
  });

  it("omits the cut badge when the stone has no cut", () => {
    render(<Card item={makeUmina(1, "Gold")} onClick={jest.fn()} />);
    expect(screen.queryByText("Tumbled")).not.toBeInTheDocument();
  });

  it("shows a 3D badge when the item has a 3D model (#119)", () => {
    render(<Card item={umina} onClick={jest.fn()} />);
    expect(screen.getByTitle("3D model")).toHaveTextContent("3D");
  });

  it("has no 3D badge without a model, even when an Achala's stone has one", () => {
    render(<Card item={achala} onClick={jest.fn()} />);
    expect(screen.queryByTitle("3D model")).not.toBeInTheDocument();
  });

  it("shows an Achala's piece type, metal, stones and price", () => {
    render(<Card item={achala} onClick={jest.fn()} />);
    expect(screen.getByRole("heading", { name: "Pendant" })).toBeInTheDocument();
    expect(screen.getByText(/Gold 22k/)).toBeInTheDocument();
    expect(screen.getByText("Stones:")).toBeInTheDocument();
    expect(screen.getByText("120 HBAR")).toBeInTheDocument();
  });

  it("renders the main photo through the IPFS gateway, with its name as alt text", () => {
    render(<Card item={umina} onClick={jest.fn()} />);
    const img = screen.getByRole("img", { name: umina.metadata.name });
    expect(img).toHaveAttribute("src", imageUrl(umina));
    expect(img.getAttribute("src")).toMatch(/^https:\/\/gateway\.pinata\.cloud\/ipfs\//);
  });

  it("uses the catalog's thumbnail when it has one", () => {
    const media = { [umina.metadata.image]: { thumb: "media/QmA/thumb.webp", display: "media/QmA/display.webp" } };
    render(<Card item={umina} onClick={jest.fn()} media={media} />);
    expect(screen.getByRole("img", { name: umina.metadata.name })).toHaveAttribute(
      "src",
      "./data/media/QmA/thumb.webp",
    );
  });

  it("calls onClick with the item from the view button and the thumbnail", async () => {
    const onClick = jest.fn();
    render(<Card item={umina} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "View Umiña" }));
    expect(onClick).toHaveBeenLastCalledWith(umina);
    await userEvent.click(screen.getByRole("img", { name: umina.metadata.name }));
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("labels the button 'View Achala' for jewelry", () => {
    render(<Card item={achala} onClick={jest.fn()} />);
    expect(screen.getByRole("button", { name: "View Achala" })).toBeInTheDocument();
  });

  it("starts buying the item from the cart button, named with its price (#58)", async () => {
    const onBuy = jest.fn();
    render(<Card item={umina} onClick={jest.fn()} onBuy={onBuy} />);
    await userEvent.click(screen.getByRole("button", { name: "Buy Agate for 45 HBAR" }));
    expect(onBuy).toHaveBeenCalledWith(umina);
  });
});
