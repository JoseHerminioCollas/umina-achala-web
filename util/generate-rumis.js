// generate-rumis.js
import fs from "fs";

const stoneTypes = [ "Amethyst", "Quartz", "Chrysocolla", "Obsidian", "Jade",
  "Tourmaline", "Lapis Lazuli", "Malachite", "Ruby", "Sapphire" ];

const stoneCuts = [ "Cabochon", "Faceted", "Brilliant Cut", "Step Cut", "Rose Cut",
  "Emerald Cut", "Oval Cut", "Pear Cut", "Princess Cut", "Cushion Cut" ];

const artisanTechniques = [ "Wire Wrapping", "Bezel Setting", "Channel Setting", "Pavé",
  "Engraving", "Prong Setting", "Inlay", "Filigree" ];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeRumi(index, type) {
  const id = `RUMI-2026-${type.substring(0,2).toUpperCase()}-${String(index).padStart(2,"0")}`;
  return {
    name: `Rumi Stone #${String(index).padStart(3,"0")} - ${type}`,
    creator: "Rumi Project",
    description: `Certified Mine-to-Market ${type} from Peru.`,
    image: `ipfs://Qm${type.replace(" ","")}ThumbHash`,
    type: "image/jpg",
    format: "HIP412@2.0.0",
    metadata_version: "1.0.0",
    properties: {
      stone_id: id,
      hs_code: "7103.99.00.00",
      jurisdiction: "Peru",
      legal_uri: "https://rumi.earth",
      vendor_ruc: "20999887766",
      artisan_rna: "RNA-112233",
      mining_concession: `Peru-${type}-${index}`,
      reinfo_id: `PERU-MIN-${100000+index}`,
      reinfo_status: "Vigente",
      cod_reference: `VUCE-ORIGIN-2026-${index}`,
      standard_compliance: "DS Nº 014-92-EM",
      compliance_proof_hcs: "0.0.987654",
      audit_log_uri: "hcs://0.0.987654",
      last_regulatory_check: "2026-05-10T12:00:00Z",
      vuce_xml_hash: "sha256-abc123def456...",
      sunafil_payroll_verified: true,
      census_status: "Finalized",
      sinceramiento_timestamp: "2026-05-20T09:45:00Z",
      export_status: {
        is_exported: false,
        export_timestamp: null,
        export_permit_id: `VUCE-2026-EXP-${200+index}`,
        current_location: "Peru - Pending Export"
      },
      store_receipt_hash: "sha256-abc123def456...",
      sinceramiento_status: "Verified (Georeferenced)",
      inei_census_id: `INEI-2026-MAPE-${8800+index}`,
      hcs_compliance_topic: "0.0.987654"
    },
    files: [
      {
        uri: `ipfs://Qm${type.replace(" ","")}FullResHash`,
        type: "image/jpg",
        is_default_file: true,
        metadata: {
          description: "High-Resolution Master Image",
          resolution: "4000x3000",
          scan_method: "Macro Photography"
        }
      }
    ],
    attributes: [
      { trait_type: "Stone Type", value: type },
      { trait_type: "HS Code", value: "7103.99.00.00" },
      { trait_type: "Weight", value: `${10+index} carats` },
      { trait_type: "Grading", value: "Collector Grade" },
      { trait_type: "Date Mined", value: `2026-03-${10+index}` },
      { trait_type: "Stone Cut", value: randomChoice(stoneCuts) },
      { trait_type: "Artisan", value: `Artisan ${index}` },
      { trait_type: "Artisan Technique", value: randomChoice(artisanTechniques) },
      { trait_type: "Track", value: "Track A: Mine-to-Market" },
      { trait_type: "Mining Concession", value: `Peru-${type}-${index}` },
      { trait_type: "Legal Status", value: "Certified Origin & Artisan Transformation" },
      { trait_type: "Verification Level", value: "Full 2026 Compliance" },
      { trait_type: "Current Location", value: "Peru" }
    ]
  };
}

// Quantity comes from command line argument, default 10
const quantity = parseInt(process.argv[2], 10) || 10;

// Iterate through stoneTypes cyclically if quantity > stoneTypes.length
const rumis = Array.from({ length: quantity }, (_, idx) => {
  const type = stoneTypes[idx % stoneTypes.length];
  return makeRumi(idx+1, type);
});

fs.writeFileSync("rumis.json", JSON.stringify(rumis, null, 2));
console.log(`Generated rumis.json with ${rumis.length} stones`);
