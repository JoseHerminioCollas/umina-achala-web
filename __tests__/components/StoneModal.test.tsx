/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "../../frontend/src/i18n";
import StoneModal from "../../frontend/src/components/StoneModal";
import { UminaItem } from "../../frontend/src/types/catalog";
import { achala, umina } from "../fixtures/catalog";

const withMetadata = (over: Partial<UminaItem["metadata"]>): UminaItem => ({
  ...umina,
  metadata: { ...umina.metadata, ...over },
});

describe("StoneModal", () => {
  it("renders nothing when no stone is open", () => {
    const { container } = render(<StoneModal open={null} setOpen={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the stone type as the heading, the image and the price", () => {
    render(<StoneModal open={umina} setOpen={jest.fn()} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Agate");
    expect(screen.getByRole("img", { name: umina.metadata.name })).toBeInTheDocument();
    expect(screen.getByText("Price: 45 HBAR")).toBeInTheDocument();
  });

  it("shows the catalog's display copy of the photo when it has one", () => {
    const media = { [umina.metadata.image]: { thumb: "media/QmA/thumb.webp", display: "media/QmA/display.webp" } };
    render(<StoneModal open={umina} setOpen={jest.fn()} media={media} />);
    expect(screen.getByRole("img", { name: umina.metadata.name })).toHaveAttribute(
      "src",
      "./data/media/QmA/display.webp",
    );
  });

  describe("gallery (#130)", () => {
    const thumbs = () => screen.getAllByRole("button").filter((b) => b.querySelector("img"));
    const LEFT = "Front view, turned left 25° (estimated from photo 1)";

    it("shows the main photo large, with a thumbnail for each of the 6 photos", () => {
      render(<StoneModal open={umina} setOpen={jest.fn()} />);
      expect(screen.getByRole("img", { name: umina.metadata.name })).toBeInTheDocument();
      expect(thumbs()).toHaveLength(6);
      expect(thumbs()[0]).toHaveAttribute("aria-current", "true");
      expect(screen.getByText("photo 1 of 6")).toBeInTheDocument();
      expect(thumbs()[1].querySelector("img")).toHaveAttribute("loading", "lazy");
    });

    it("a thumbnail shows its photo large, with its description as the caption", async () => {
      render(<StoneModal open={umina} setOpen={jest.fn()} />);
      await userEvent.click(screen.getByRole("button", { name: LEFT }));
      expect(screen.getByRole("img", { name: LEFT })).toBeInTheDocument();
      expect(screen.getByText("photo 2 of 6")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: LEFT })).toHaveAttribute("aria-current", "true");
      expect(thumbs()[0]).not.toHaveAttribute("aria-current");
    });

    it("right and left arrow keys step through the photos, round the ends", () => {
      render(<StoneModal open={umina} setOpen={jest.fn()} />);
      fireEvent.keyDown(document, { key: "ArrowRight" });
      expect(screen.getByRole("img", { name: LEFT })).toBeInTheDocument();
      fireEvent.keyDown(document, { key: "ArrowLeft" });
      fireEvent.keyDown(document, { key: "ArrowLeft" });
      expect(screen.getByText("photo 6 of 6")).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Back view (estimated from photo 1)" })).toBeInTheDocument();
    });

    it("loads the display copy large and the thumbnails from the catalog's copies", () => {
      const media = {
        [umina.metadata.image]: { thumb: "media/QmA/thumb.webp", display: "media/QmA/display.webp" },
      };
      render(<StoneModal open={umina} setOpen={jest.fn()} media={media} />);
      expect(screen.getByRole("img", { name: umina.metadata.name })).toHaveAttribute(
        "src",
        "./data/media/QmA/display.webp",
      );
      expect(thumbs()[0].querySelector("img")).toHaveAttribute("src", "./data/media/QmA/thumb.webp");
    });

    it("an item with one photo has no thumbnails", () => {
      render(<StoneModal open={withMetadata({ files: [] })} setOpen={jest.fn()} />);
      expect(screen.getByRole("img", { name: umina.metadata.name })).toBeInTheDocument();
      expect(thumbs()).toHaveLength(0);
      expect(screen.queryByText(/photo 1 of/)).not.toBeInTheDocument();
      fireEvent.keyDown(document, { key: "ArrowRight" });
      expect(screen.getByRole("img", { name: umina.metadata.name })).toBeInTheDocument();
    });

    it("opens each item on its first photo", async () => {
      const { rerender } = render(<StoneModal open={umina} setOpen={jest.fn()} />);
      await userEvent.click(screen.getByRole("button", { name: LEFT }));
      rerender(<StoneModal open={achala} setOpen={jest.fn()} />);
      expect(screen.getByRole("img", { name: achala.metadata.name })).toBeInTheDocument();
      expect(thumbs()).toHaveLength(0); // one photo: the main one only
    });
  });

  it("lists attributes but hides HS Code, Stone Type and empty values", () => {
    const open = withMetadata({
      attributes: [
        { trait_type: "Stone Type", value: "jade" },
        { trait_type: "HS Code", value: "7103" },
        { trait_type: "Stone Cut", value: "Step Cut" },
        { trait_type: "Mounted By", value: "" },
      ],
    });
    render(<StoneModal open={open} setOpen={jest.fn()} />);
    expect(screen.getByText("Stone Cut")).toBeInTheDocument();
    expect(screen.getByText("Step Cut")).toBeInTheDocument();
    expect(screen.queryByText("HS Code")).not.toBeInTheDocument();
    expect(screen.queryByText("Mounted By")).not.toBeInTheDocument();
    expect(screen.queryByText("Stone Type")).not.toBeInTheDocument();
  });

  it("closes from the × button", async () => {
    const setOpen = jest.fn();
    render(<StoneModal open={umina} setOpen={setOpen} />);
    await userEvent.click(screen.getByRole("button", { name: "×" }));
    expect(setOpen).toHaveBeenCalledWith(null);
  });

  it("closes when the backdrop is clicked but not when the content is", async () => {
    const setOpen = jest.fn();
    const { container } = render(<StoneModal open={umina} setOpen={setOpen} />);
    await userEvent.click(screen.getByRole("heading", { level: 2 }));
    expect(setOpen).not.toHaveBeenCalled();
    await userEvent.click(container.firstElementChild as Element);
    expect(setOpen).toHaveBeenCalledWith(null);
  });

  it("closes on Escape while open", () => {
    const setOpen = jest.fn();
    render(<StoneModal open={umina} setOpen={setOpen} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(setOpen).toHaveBeenCalledWith(null);
  });

  it("ignores Escape when closed and other keys when open", () => {
    const setOpen = jest.fn();
    const { rerender } = render(<StoneModal open={null} setOpen={setOpen} />);
    fireEvent.keyDown(document, { key: "Escape" });
    rerender(<StoneModal open={umina} setOpen={setOpen} />);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(setOpen).not.toHaveBeenCalled();
  });

  it("stops listening for Escape after unmounting", () => {
    const setOpen = jest.fn();
    const { unmount } = render(<StoneModal open={umina} setOpen={setOpen} />);
    unmount();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(setOpen).not.toHaveBeenCalled();
  });

  it("links to the NFT on HashScan testnet, in a new tab", () => {
    render(<StoneModal open={umina} setOpen={jest.fn()} />);
    const link = screen.getByRole("link", { name: "View Minted Token on HashScan" });
    expect(link).toHaveAttribute(
      "href",
      `https://hashscan.io/testnet/token/${umina.token_id}/${umina.serial}`,
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  const COMPLIANCE = "View Compliance Record on HashScan";

  it("links to the item's own COMPLIANCE message on HashScan, and opens it", () => {
    render(<StoneModal open={umina} setOpen={jest.fn()} />);
    const link = screen.getByRole("link", { name: COMPLIANCE });
    // seq 63, the agate's COMPLIANCE on the provenance topic
    expect(link).toHaveAttribute(
      "href",
      "https://hashscan.io/testnet/transaction/1795104674.631909729/message",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(fireEvent.click(link)).toBe(true); // not cancelled: no demo message (#83)
  });

  it("links to the compliance topic when the item has no COMPLIANCE event", () => {
    render(<StoneModal open={{ ...umina, events: [] }} setOpen={jest.fn()} />);
    expect(screen.getByRole("link", { name: COMPLIANCE })).toHaveAttribute(
      "href",
      `https://hashscan.io/testnet/topic/${umina.metadata.properties.hcs_compliance_topic}`,
    );
  });

  it("omits the compliance link with neither an event nor a topic", () => {
    const open = withMetadata({
      properties: { ...umina.metadata.properties, hcs_compliance_topic: undefined },
    });
    render(<StoneModal open={{ ...open, events: [] }} setOpen={jest.fn()} />);
    expect(screen.queryByRole("link", { name: COMPLIANCE })).not.toBeInTheDocument();
  });

  it("names the compliance link in Spanish", async () => {
    await i18n.changeLanguage("es");
    render(<StoneModal open={umina} setOpen={jest.fn()} />);
    expect(
      screen.getByRole("link", { name: "Ver Registro de Cumplimiento en HashScan" }),
    ).toBeInTheDocument();
    await i18n.changeLanguage("en");
  });

  it("has no list of stones for an Umiña", () => {
    render(<StoneModal open={umina} setOpen={jest.fn()} />);
    expect(screen.queryByText("Stones in this piece")).not.toBeInTheDocument();
  });

  it("shows an Achala's piece type and lists its stones, each linked to its NFT", () => {
    render(<StoneModal open={achala} setOpen={jest.fn()} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Pendant");
    const list = screen.getByRole("heading", { name: "Stones in this piece" }).parentElement!;
    const stone = achala.stones[0];
    const item = within(list).getByRole("listitem");
    expect(item).toHaveTextContent("Gold · 18.4 g");
    expect(within(item).getByRole("link", { name: stone.stone_id })).toHaveAttribute(
      "href",
      `https://hashscan.io/testnet/token/${stone.token_id}/${stone.serial}`,
    );
  });
});
