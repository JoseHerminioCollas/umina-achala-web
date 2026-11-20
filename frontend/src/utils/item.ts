// src/utils/item.ts
// What the site shows of a catalog item (#124), for both kinds.
import { CatalogItem, MountedStone, Price } from "../types/catalog";
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

/** The main photo, as a gateway URL. */
export function imageUrl(item: WithMetadata): string {
  return ipfsToGatewayUrl(item.metadata.image);
}

const isImage = (f: MetadataFile) => f.type.startsWith("image/");

/** Every photo: the main one, then the image files, as gateway URLs. */
export function photos(item: WithMetadata): string[] {
  const urls = [item.metadata.image, ...item.metadata.files.filter(isImage).map((f) => f.uri)];
  return Array.from(new Set(urls)).map(ipfsToGatewayUrl);
}

export interface Document {
  url: string;
  type: string;
  description: string;
}

/** The documents: PDFs (receipts, permits, certificates) and 3D models. */
export function documents(item: WithMetadata): Document[] {
  return item.metadata.files
    .filter((f) => !isImage(f))
    .map((f) => ({
      url: ipfsToGatewayUrl(f.uri),
      type: f.type,
      description: f.metadata?.description ?? "",
    }));
}

/** The price as shown, e.g. "45 HBAR". */
export const formatPrice = (price: Price) => `${price.amount} ${price.currency}`;
