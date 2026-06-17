// src/types/rumi.ts
export interface Rumi {
  name: string;
  creator: string;
  description: string;
  image: string;
  type: string;
  format: string;
  metadata_version: string;
  properties: {
    stone_id: string;
    hs_code: string;
    jurisdiction: string;
    hcs_compliance_topic: string;
    compliance_proof_hcs: string;
    mining_concession: string;
    vendor_ruc: string;
  };
  files: { uri: string; type: string }[];
  attributes: { trait_type: string; value: string }[];
}
