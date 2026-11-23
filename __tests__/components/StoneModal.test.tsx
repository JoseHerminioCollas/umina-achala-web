/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
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
    // the photo tiles; the 3D tile (#119) is tested below
    const thumbs = () =>
      screen.getAllByRole("button").filter((b) => b.querySelector("img") && b.getAttribute("aria-label") !== "3D model");
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
      render(<StoneModal open={withMetadata({ files: umina.metadata.files.filter((f) => f.type !== "model/gltf-binary") })} setOpen={jest.fn()} />);
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

  describe("3D model (#119)", () => {
    const MODEL = "3D model, estimated from one photo (sample)";
    const modelFile = umina.metadata.files.find((f) => f.type === "model/gltf-binary")!;
    const tile = () => screen.getByRole("button", { name: "3D model" });
    const viewer = () => document.querySelector("model-viewer");
    let getContext: jest.SpiedFunction<typeof HTMLCanvasElement.prototype.getContext>;
    const reducedMotion = (on: boolean) => {
      window.matchMedia = jest.fn().mockReturnValue({ matches: on }) as unknown as typeof window.matchMedia;
    };

    beforeEach(() => {
      // jsdom has no WebGL; a context object stands for one
      getContext = jest
        .spyOn(HTMLCanvasElement.prototype, "getContext")
        .mockReturnValue({} as unknown as ReturnType<HTMLCanvasElement["getContext"]>);
      reducedMotion(false);
    });
    afterEach(() => {
      getContext.mockRestore();
    });

    it("is the last tile, after the photos, with a 3D badge; nothing 3D loads until it is selected", () => {
      render(<StoneModal open={umina} setOpen={jest.fn()} />);
      const tiles = screen.getAllByRole("button").filter((b) => b.querySelector("img"));
      expect(tiles).toHaveLength(7);
      expect(tiles[6]).toBe(tile());
      expect(tile()).toHaveTextContent("3D");
      expect(tile()).not.toHaveAttribute("aria-current");
      expect(viewer()).toBeNull();
    });

    it("selecting it shows the model in place of the large photo, from the site's copy, with the main photo as poster", async () => {
      const cid = modelFile.uri.slice("ipfs://".length);
      const media = {
        [umina.metadata.image]: { thumb: "media/QmA/thumb.webp", display: "media/QmA/display.webp" },
        [modelFile.uri]: { file: `media/${cid}/model.glb` },
      };
      render(<StoneModal open={umina} setOpen={jest.fn()} media={media} />);
      await userEvent.click(tile());
      await waitFor(() => expect(viewer()).not.toBeNull());
      expect(viewer()).toHaveAttribute("src", `./data/media/${cid}/model.glb`);
      expect(viewer()).toHaveAttribute("poster", "./data/media/QmA/display.webp");
      expect(viewer()).toHaveAttribute("alt", MODEL);
      expect(viewer()).toHaveAttribute("camera-controls");
      expect(viewer()).toHaveAttribute("auto-rotate");
      expect(viewer()).toHaveAttribute("ar");
      expect(tile()).toHaveAttribute("aria-current", "true");
      expect(screen.getByText(MODEL)).toBeInTheDocument();
      expect(screen.queryByRole("img", { name: umina.metadata.name })).not.toBeInTheDocument();
    });

    it("the arrow keys step onto it after the last photo and round to the first", async () => {
      render(<StoneModal open={umina} setOpen={jest.fn()} />);
      fireEvent.keyDown(document, { key: "ArrowLeft" });
      expect(tile()).toHaveAttribute("aria-current", "true");
      await waitFor(() => expect(viewer()).not.toBeNull());
      fireEvent.keyDown(document, { key: "ArrowLeft" });
      expect(screen.getByText("photo 6 of 6")).toBeInTheDocument();
      fireEvent.keyDown(document, { key: "ArrowRight" });
      fireEvent.keyDown(document, { key: "ArrowRight" });
      expect(screen.getByText("photo 1 of 6")).toBeInTheDocument();
      expect(viewer()).toBeNull();
    });

    it("a button pauses and restarts the turn", async () => {
      render(<StoneModal open={umina} setOpen={jest.fn()} />);
      await userEvent.click(tile());
      await waitFor(() => expect(viewer()).not.toBeNull());
      const pause = screen.getByRole("button", { name: "Pause the turn" });
      expect(pause).toHaveAttribute("aria-pressed", "false");
      await userEvent.click(pause);
      expect(pause).toHaveAttribute("aria-pressed", "true");
      expect(viewer()).not.toHaveAttribute("auto-rotate");
      await userEvent.click(pause);
      expect(viewer()).toHaveAttribute("auto-rotate");
    });

    it("starts still when the device asks for reduced motion", async () => {
      reducedMotion(true);
      render(<StoneModal open={umina} setOpen={jest.fn()} />);
      await userEvent.click(tile());
      await waitFor(() => expect(viewer()).not.toBeNull());
      expect(viewer()).not.toHaveAttribute("auto-rotate");
      expect(screen.getByRole("button", { name: "Pause the turn" })).toHaveAttribute("aria-pressed", "true");
    });

    it("without WebGL, or when the model fails, shows the main photo and says so", async () => {
      getContext.mockReturnValue(null);
      const { unmount } = render(<StoneModal open={umina} setOpen={jest.fn()} />);
      await userEvent.click(tile());
      expect(await screen.findByText("The 3D model cannot be shown on this device.")).toBeInTheDocument();
      expect(screen.getByRole("img", { name: MODEL })).toBeInTheDocument();
      expect(viewer()).toBeNull();
      unmount();

      getContext.mockReturnValue({} as unknown as ReturnType<HTMLCanvasElement["getContext"]>);
      render(<StoneModal open={umina} setOpen={jest.fn()} />);
      await userEvent.click(tile());
      await waitFor(() => expect(viewer()).not.toBeNull());
      fireEvent(viewer()!, new Event("error"));
      expect(await screen.findByText("The 3D model cannot be shown on this device.")).toBeInTheDocument();
    });

    it("an item with one photo and a model has two tiles", () => {
      render(<StoneModal open={withMetadata({ files: [modelFile] })} setOpen={jest.fn()} />);
      expect(screen.getAllByRole("button").filter((b) => b.querySelector("img"))).toHaveLength(2);
    });

    it("no tile without a model, nor for an Achala whose stone has one", () => {
      render(<StoneModal open={achala} setOpen={jest.fn()} />);
      expect(screen.queryByRole("button", { name: "3D model" })).not.toBeInTheDocument();
    });

    it("names the tile in Spanish", async () => {
      await i18n.changeLanguage("es");
      render(<StoneModal open={umina} setOpen={jest.fn()} />);
      expect(screen.getByRole("button", { name: "Modelo 3D" })).toBeInTheDocument();
      await i18n.changeLanguage("en");
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

  describe("documents (#132)", () => {
    const RECEIPT = "Store receipt (sample, fake)";
    const PERMIT = "Mining concession and extraction permit (sample, fake)";
    const pdfs = umina.metadata.files.filter((f) => f.type === "application/pdf");
    const section = () => screen.getByRole("heading", { name: "Documents" }).parentElement!;

    it("lists the item's PDFs in metadata order, by description, each opening in a new tab", () => {
      render(<StoneModal open={umina} setOpen={jest.fn()} />);
      const links = within(section()).getAllByRole("link");
      expect(links.map((a) => a.textContent)).toEqual([RECEIPT, PERMIT]);
      expect(links[0]).toHaveAttribute("href", `https://gateway.pinata.cloud/ipfs/${pdfs[0].uri.slice(7)}`);
      for (const a of links) {
        expect(a).toHaveAttribute("target", "_blank");
        expect(a).toHaveAttribute("rel", "noopener noreferrer");
      }
      // the 3D model is not a document here (#119)
      expect(within(section()).queryByText(/3D model/)).not.toBeInTheDocument();
    });

    it("opens the catalog's copy when it has one (umina-achala-chain#46)", () => {
      const media = { [pdfs[0].uri]: { file: "media/QmR/document.pdf" } };
      render(<StoneModal open={umina} setOpen={jest.fn()} media={media} />);
      expect(screen.getByRole("link", { name: RECEIPT })).toHaveAttribute("href", "./data/media/QmR/document.pdf");
      expect(screen.getByRole("link", { name: PERMIT }).getAttribute("href")).toMatch(/^https:\/\/gateway/);
    });

    it("names a PDF with no description by its place", () => {
      const files = umina.metadata.files.map((f) =>
        f.type === "application/pdf" ? { ...f, metadata: { ...f.metadata, description: "" } } : f,
      );
      render(<StoneModal open={withMetadata({ files })} setOpen={jest.fn()} />);
      expect(within(section()).getAllByRole("link").map((a) => a.textContent)).toEqual(["Document 1", "Document 2"]);
    });

    it("has no section for an item without PDFs", () => {
      render(<StoneModal open={withMetadata({ files: umina.metadata.files.filter((f) => f.type !== "application/pdf") })} setOpen={jest.fn()} />);
      expect(screen.queryByRole("heading", { name: "Documents" })).not.toBeInTheDocument();
    });

    it("has no section for an Achala without its own PDFs, though its stone has some", () => {
      render(<StoneModal open={achala} setOpen={jest.fn()} />);
      expect(screen.queryByRole("heading", { name: "Documents" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: RECEIPT })).not.toBeInTheDocument();
    });

    it("every link that opens a new tab looks the same and says so to screen readers", () => {
      render(<StoneModal open={achala} setOpen={jest.fn()} />);
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(2);
      for (const a of links) {
        expect(a).toHaveAttribute("target", "_blank");
        expect(a).toHaveAccessibleDescription("(opens in a new tab)");
      }
      const record = screen.getByRole("heading", { name: "Blockchain record" }).parentElement!;
      expect(within(record).getAllByRole("link").map((a) => a.textContent)).toEqual([
        "View Minted Token on HashScan",
        "View Compliance Record on HashScan",
      ]);
    });

    it("names the section in Spanish", async () => {
      await i18n.changeLanguage("es");
      render(<StoneModal open={umina} setOpen={jest.fn()} />);
      expect(screen.getByRole("heading", { name: "Documentos" })).toBeInTheDocument();
      await i18n.changeLanguage("en");
    });
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
