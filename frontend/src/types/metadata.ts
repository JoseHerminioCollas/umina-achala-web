// src/types/metadata.ts
// HIP-412 metadata of a minted Umiña (stone) and Achala (jewelry), written by
// hand from schema/hip412-umina-schema.json and schema/hip412-achala-schema.json
// (copies of umina-achala-chain/schema; #124). Field names are the schema's.

export interface Attribute {
  trait_type: string;
  value: string | number | boolean;
}

/** One file of the NFT: a photo, a PDF document or a 3D model. */
export interface MetadataFile {
  uri: string; // ipfs://
  type: string; // MIME type
  is_default_file?: boolean;
  checksum?: string; // SHA-256 of the pinned file
  metadata?: { description?: string; [key: string]: unknown };
}

/** The fields every HIP-412 file of UA has. */
interface Hip412<P> {
  name: string;
  creator: string;
  description: string;
  image: string; // ipfs://
  type?: string; // MIME type of image
  format: string;
  metadata_version: string;
  properties: P;
  files: MetadataFile[];
  attributes: Attribute[];
}

export interface ExportStatus {
  is_exported: boolean;
  export_timestamp?: string | null;
  export_permit_id: string;
}

/** One material of a specimen made of several, e.g. quartz with gold. */
export interface Material {
  stone_type: string;
  role: "host" | "inclusion";
  form?: "crystal" | "leaf" | "wire" | "nugget";
  weight_g?: number;
}

/** A third-party certificate of the stone's type and/or quality (umina-achala-chain#38). */
export interface Certification {
  issuer: string;
  report_no: string;
  date: string;
  verify_url?: string;
  covers: ("type" | "quality")[];
  identification?: string; // when covers includes "type"
  grade?: string; // when covers includes "quality"
  document: string; // ipfs://, one of files
}

export interface UminaProperties {
  stone_id: string;
  stone_type: string; // an id from schema/stone-types.json
  materials?: Material[];
  specimen_form: "natural" | "worked" | "crafted";
  hs_code: string;
  jurisdiction: string;
  legal_uri: string;
  vendor_name: string;
  vendor_ruc: string;
  artisan_rna?: string;
  mining_concession: string;
  reinfo_id: string;
  reinfo_status?: string;
  certifications?: Certification[];
  cod_reference?: string;
  standard_compliance?: string;
  compliance_proof_hcs?: string;
  audit_log_uri?: string;
  last_regulatory_check?: string;
  vuce_xml_hash?: string;
  sunafil_payroll_verified?: boolean;
  census_status?: string;
  sinceramiento_timestamp?: string;
  export_status?: ExportStatus;
  store_receipt_hash?: string;
  sinceramiento_status?: string;
  inei_census_id?: string;
  hcs_compliance_topic?: string;
}

export type UminaMetadata = Hip412<UminaProperties>;

/** An Umiña the piece is made of, by its serial in umina_token_id. */
export interface StoneRef {
  serial: number;
  stone_id: string;
}

/** The metal of a piece; source "umina" when the metal is one of its stones. */
export interface Metal {
  stone_type: string;
  fineness: string;
  weight_g: number;
  source: "umina" | "invoice";
  stone_id?: string;
}

export type PieceType = "ring" | "pendant" | "necklace" | "earrings" | "bracelet" | "brooch";

export interface AchalaProperties {
  stone_id: string;
  piece_type: PieceType;
  umina_token_id: string;
  stones: StoneRef[];
  metals?: Metal[];
  technique: string;
  artisan_rna: string;
  hs_code: string;
  jurisdiction: string;
  legal_uri: string;
  vendor_name: string;
  vendor_ruc: string;
  compliance_proof_hcs?: string;
  hcs_compliance_topic?: string;
  audit_log_uri?: string;
  export_status?: ExportStatus;
}

export type AchalaMetadata = Hip412<AchalaProperties>;
