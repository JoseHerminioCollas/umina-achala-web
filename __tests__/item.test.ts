import {
  attribute,
  complianceEvent,
  documents,
  fileUrl,
  formatPrice,
  model,
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

  it("photos are the main photo, then the image files, with no PDF or 3D model (#130)", () => {
    const list = photos(umina);
    expect(list).toHaveLength(6); // the main photo + 5 image files
    expect(list[0]).toEqual({
      uri: umina.metadata.image,
      thumb: imageUrl(umina, "thumb"),
      display: imageUrl(umina),
      description: "",
    });
    expect(list[1].description).toBe("Front view, turned left 25° (estimated from photo 1)");
    expect(list.map((p) => p.description).at(-1)).toBe("Back view (estimated from photo 1)");
    expect(list.every((p) => p.thumb.startsWith(GATEWAY) && p.display.startsWith(GATEWAY))).toBe(true);
  });

  it("photos use the catalog's copies when it has them", () => {
    const uri = umina.metadata.files[0].uri;
    const media = { [uri]: { thumb: "media/QmB/thumb.webp", display: "media/QmB/display.webp" } };
    const second = photos(umina, media)[1];
    expect(second).toMatchObject({ uri, thumb: "./data/media/QmB/thumb.webp", display: "./data/media/QmB/display.webp" });
    expect(photos(umina, media)[0].thumb.startsWith(GATEWAY)).toBe(true);
  });

  it("photos lists a photo once, even when image is also among the files", () => {
    const twice = {
      metadata: {
        ...umina.metadata,
        files: [{ uri: umina.metadata.image, type: "image/png" }, ...umina.metadata.files],
      },
    };
    expect(photos(twice)).toHaveLength(6);
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

  it("a model's or document's URL is the site's copy when the catalog has one, the gateway otherwise (umina-achala-chain#46)", () => {
    const [model, receipt] = documents(achala.stones[0]);
    const cid = (uri: string) => uri.slice("ipfs://".length);
    const media = {
      [model.uri]: { file: `media/${cid(model.uri)}/model.glb` },
      [receipt.uri]: { file: `media/${cid(receipt.uri)}/document.pdf` },
    };
    expect(fileUrl(model.uri, media)).toBe(`./data/media/${cid(model.uri)}/model.glb`);
    expect(fileUrl(model.uri)).toBe(GATEWAY + cid(model.uri));
    const local = documents(achala.stones[0], media);
    expect(local.map((d) => d.url)).toEqual([
      `./data/media/${cid(model.uri)}/model.glb`,
      `./data/media/${cid(receipt.uri)}/document.pdf`,
      expect.stringMatching(/^https:\/\/gateway\.pinata\.cloud\/ipfs\//),
    ]);
    // a photo's copies are not a file, and a file entry is not a photo's copies
    const photo = umina.metadata.image;
    expect(fileUrl(photo, { [photo]: { thumb: "media/x/thumb.webp", display: "media/x/display.webp" } })).toBe(GATEWAY + cid(photo));
    expect(imageUrl(umina, "thumb", { [photo]: { file: "media/x/document.pdf" } })).toBe(GATEWAY + cid(photo));
  });

  it("model is the first 3D model file, from the site's copy when the catalog has one (#119)", () => {
    const m = model(umina)!;
    expect(m.description).toBe("3D model, estimated from one photo (sample)");
    expect(m.url.startsWith(GATEWAY)).toBe(true);
    const cid = m.uri.slice("ipfs://".length);
    expect(model(umina, { [m.uri]: { file: `media/${cid}/model.glb` } })!.url).toBe(`./data/media/${cid}/model.glb`);
    expect(model(achala)).toBeUndefined(); // the pendant's own files; its gold has one
    expect(model(achala.stones[0])?.uri).toMatch(/^ipfs:\/\//);
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
