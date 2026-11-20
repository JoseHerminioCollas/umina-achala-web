import {
  attribute,
  complianceEvent,
  documents,
  formatPrice,
  imageUrl,
  photos,
  stoneTypes,
  title,
} from "../frontend/src/utils/item";
import { achala, umina } from "./fixtures/catalog";

const GATEWAY = "https://gateway.pinata.cloud/ipfs/";

describe("item helpers", () => {
  it("attribute reads an attribute as text, and undefined when absent", () => {
    expect(attribute(umina, "Stone Cut")).toBe("Tumbled");
    expect(attribute(umina, "Mounted By")).toBeUndefined();
  });

  it("title is an Umiña's stone type and an Achala's piece type", () => {
    expect(title(umina)).toBe("Agate");
    expect(title(achala)).toBe("Pendant");
    expect(title(achala.stones[0])).toBe("Gold");
  });

  it("stoneTypes is an Umiña's own type, or each of an Achala's stones", () => {
    expect(stoneTypes(umina)).toEqual(["Agate"]);
    expect(stoneTypes(achala)).toEqual(["Gold"]);
  });

  it("imageUrl is the main photo through the gateway when the catalog has no copy", () => {
    expect(imageUrl(umina)).toBe(GATEWAY + umina.metadata.image.slice("ipfs://".length));
    expect(imageUrl(umina, "thumb", {})).toBe(imageUrl(umina));
  });

  it("imageUrl is the site's copy of that size, next to catalog.json (umina-achala-chain#45)", () => {
    const cid = umina.metadata.image.slice("ipfs://".length);
    const media = {
      [umina.metadata.image]: { thumb: `media/${cid}/thumb.webp`, display: `media/${cid}/display.webp` },
    };
    expect(imageUrl(umina, "thumb", media)).toBe(`./data/media/${cid}/thumb.webp`);
    expect(imageUrl(umina, "display", media)).toBe(`./data/media/${cid}/display.webp`);
    expect(imageUrl(achala, "thumb", media)).toMatch(/^https:\/\/gateway\.pinata\.cloud\/ipfs\//);
  });

  it("photos are the main photo, then the image files, with no PDF or 3D model", () => {
    const urls = photos(achala.stones[0]);
    expect(urls[0]).toBe(imageUrl(achala.stones[0]));
    expect(urls).toHaveLength(3); // main photo + 2 image files
    expect(urls.every((u) => u.startsWith(GATEWAY))).toBe(true);
  });

  it("documents are the PDFs and the 3D model, with their descriptions", () => {
    const docs = documents(achala.stones[0]);
    expect(docs.map((d) => d.type)).toEqual([
      "model/gltf-binary",
      "application/pdf",
      "application/pdf",
    ]);
    expect(docs[1].description).toBe("Store receipt (sample, fake)");
    expect(docs[1].url.startsWith(GATEWAY)).toBe(true);
    expect(documents(umina).map((d) => d.type).sort()).toEqual([
      "application/pdf",
      "application/pdf",
      "model/gltf-binary",
    ]);
  });

  it("complianceEvent is the item's own COMPLIANCE, not another NFT's", () => {
    expect(complianceEvent(umina)?.seq).toBe(63);
    expect(complianceEvent(achala)?.event.stone_id).toBe(achala.stone_id);
    // the mounted gold's events also hold its Achalas' COMPLIANCE events
    const gold = achala.stones[0];
    expect(gold.events.filter((e) => e.event.event === "COMPLIANCE").length).toBeGreaterThan(1);
    expect(complianceEvent(gold)?.event.stone_id).toBe(gold.stone_id);
    expect(complianceEvent({ ...umina, events: [] })).toBeUndefined();
  });

  it("formatPrice shows the amount and the currency", () => {
    expect(formatPrice(umina.price)).toBe("45 HBAR");
    expect(formatPrice(achala.price)).toBe("120 HBAR");
  });
});
