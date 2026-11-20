// src/types/catalog.ts
// catalog.json exactly as schema/catalog-schema.json describes it (a copy of
// umina-achala-chain/schema; #124). The catalog is built from the chain by
// umina-achala-chain#44 and holds only what UA has for sale.
import { AchalaMetadata, UminaMetadata } from "./metadata";

/** Where the catalog was read from, and how far each topic was read. */
export interface CatalogSource {
  mirror: string;
  ipfs_gateway: string;
  umina_token_id: string;
  achala_token_id: string;
  provenance_topic: string;
  display_topic: string;
  treasury_id: string;
  provenance_seq: number;
  display_seq: number;
}

/** A provenance event about the NFT (MINT, COMPLIANCE, …), as on the topic. */
export interface CatalogEvent {
  seq: number;
  consensus_timestamp: string | null;
  event: { event: string; [key: string]: unknown };
}

/** The asking price from the item's latest LISTED display event. */
export interface Price {
  amount: string; // decimal, e.g. "45"
  currency: "HBAR";
  listed_seq: number;
  listed_at: string;
}

interface Nft<M> {
  stone_id: string;
  token_id: string;
  serial: number;
  metadata_cid: string;
  metadata: M;
  events: CatalogEvent[];
}

/** An Umiña mounted in an Achala: sold with it, never listed alone. */
export type MountedStone = Nft<UminaMetadata>;

export interface UminaItem extends Nft<UminaMetadata> {
  kind: "umina";
  price: Price;
}

export interface AchalaItem extends Nft<AchalaMetadata> {
  kind: "achala";
  price: Price;
  stones: MountedStone[];
}

export type CatalogItem = UminaItem | AchalaItem;

/** The site's copies of one photo, WebP, relative to catalog.json (umina-achala-chain#45). */
export interface MediaCopies {
  thumb: string; // for the cards, about 400 px
  display: string; // for the detail view, about 1080 px
}

/** Each photo's ipfs:// URI to its copies. A photo with no entry is loaded through the gateway. */
export type Media = Record<string, MediaCopies>;

export interface Catalog {
  schema_version: 1;
  network: "testnet" | "mainnet";
  built_at: string;
  source: CatalogSource;
  items: CatalogItem[];
  media?: Media; // absent in a catalog built before umina-achala-chain#45
}
