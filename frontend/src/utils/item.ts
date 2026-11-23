// src/utils/item.ts
// What the site shows of a catalog item (#124), for both kinds.
import { CATALOG_URL } from "../config";
import { CatalogEvent, CatalogItem, Media, MediaCopies, MountedStone, Price } from "../types/catalog";
import { MetadataFile } from "../types/metadata";
import { ipfsToGatewayUrl } from "./chainLinks";

type WithMetadata = Pick<CatalogItem | MountedStone, "metadata">;

/** The value of an attribute as text, or undefined when absent or empty. */
export function attribute(item: WithMetadata, trait: string): string | undefined {
  const value = item.metadata.attributes.find((a) => a.trait_type === trait)?.value;
  return value === undefined || value === "" ? undefined : String(value);
}

/** The heading: an Umiña's stone type, an Achala's piece type. */
export function title(item: CatalogItem | MountedStone): string {
  if ("kind" in item && item.kind === "achala") {
    return attribute(item, "Piece Type") ?? item.metadata.properties.piece_type;
  }
  return attribute(item, "Stone Type") ?? (item as MountedStone).metadata.properties.stone_type;
}

/** The stone types an item is made of: its own, or each of an Achala's stones. */
export function stoneTypes(item: CatalogItem): string[] {
  return item.kind === "achala" ? item.stones.map((s) => title(s)) : [title(item)];
}

// media paths are relative to catalog.json: "media/<cid>/thumb.webp" → "./data/media/<cid>/thumb.webp"
const CATALOG_FOLDER = CATALOG_URL.replace(/[^/]*$/, "");

/**
 * The main photo: the site's copy of that size when the catalog has one
 * (umina-achala-chain#45), the original through the IPFS gateway otherwise.
 */
export function imageUrl(
  item: WithMetadata,
  size: keyof MediaCopies = "display",
  media: Media = {},
): string {
  return photoUrl(item.metadata.image, size, media);
}

/** One photo's URL at a size: the site's copy when the catalog has one, the gateway otherwise. */
function photoUrl(uri: string, size: keyof MediaCopies, media: Media): string {
  const copies = media[uri];
  return copies && "thumb" in copies ? CATALOG_FOLDER + copies[size] : ipfsToGatewayUrl(uri);
}

/**
 * A 3D model's or PDF document's URL: the site's copy when the catalog has
 * one (umina-achala-chain#46), the IPFS gateway otherwise.
 */
export function fileUrl(uri: string, media: Media = {}): string {
  const copy = media[uri];
  return copy && "file" in copy ? CATALOG_FOLDER + copy.file : ipfsToGatewayUrl(uri);
}

const isImage = (f: MetadataFile) => f.type.startsWith("image/");

export interface Photo {
  uri: string; // ipfs://
  thumb: string; // URL of the thumbnail, for the gallery's row
  display: string; // URL of the display copy, for the large photo
  description: string; // the file's description; empty for the main photo
}

/**
 * Every photo of an item (#130): the main one (`image`), then the image
 * files in metadata order, each once, with the site's copies when the catalog
 * has them (umina-achala-chain#45) and the IPFS gateway otherwise. The mint
 * puts the main photo only in `image` and the other photos in `files`
 * (umina-achala-chain#42).
 */
export function photos(item: WithMetadata, media: Media = {}): Photo[] {
  const described = new Map<string, string>();
  described.set(item.metadata.image, "");
  for (const f of item.metadata.files.filter((f) => isImage(f))) {
    if (!described.has(f.uri)) described.set(f.uri, f.metadata?.description ?? "");
  }
  return [...described].map(([uri, description]) => ({
    uri,
    thumb: photoUrl(uri, "thumb", media),
    display: photoUrl(uri, "display", media),
    description,
  }));
}

export interface Model {
  uri: string; // ipfs://
  url: string; // the site's copy (data/media/<cid>/model.glb), or the gateway
  description: string;
}

/**
 * The item's 3D model (#119): the first file of type model/gltf-binary, from
 * the site's copy when the catalog has one (umina-achala-chain#46), or
 * undefined when it has none.
 */
export function model(item: WithMetadata, media: Media = {}): Model | undefined {
  const file = item.metadata.files.find((f) => f.type === "model/gltf-binary");
  return file && { uri: file.uri, url: fileUrl(file.uri, media), description: file.metadata?.description ?? "" };
}

export interface Document {
  uri: string; // ipfs://
  url: string; // the site's copy, or the gateway
  type: string;
  description: string;
}

/**
 * The documents: PDFs (receipts, permits, certificates) and 3D models, each
 * from the site's copy when the catalog has one, the gateway otherwise.
 */
export function documents(item: WithMetadata, media: Media = {}): Document[] {
  return item.metadata.files
    .filter((f) => !isImage(f))
    .map((f) => ({
      uri: f.uri,
      url: fileUrl(f.uri, media),
      type: f.type,
      description: f.metadata?.description ?? "",
    }));
}

/**
 * The item's own latest COMPLIANCE event on the provenance topic, if it has
 * one with a consensus timestamp. An item's events can include events about
 * other NFTs (e.g. the Achala a stone is mounted in), so they are matched by
 * stone_id.
 */
export function complianceEvent(item: CatalogItem | MountedStone): CatalogEvent | undefined {
  return item.events
    .filter(
      (e) =>
        e.event.event === "COMPLIANCE" &&
        e.event.stone_id === item.stone_id &&
        e.consensus_timestamp,
    )
    .at(-1);
}

/** The price as shown, e.g. "45 HBAR". */
export const formatPrice = (price: Price) => `${price.amount} ${price.currency}`;
