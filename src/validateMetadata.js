/**
 * Stand-alone validator for HIP-412 Rumi metadata
 * Usage: node src/validateMetadata.js src/example_1.json
 */
import fs from "fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import schema from "../schema/hip412-rumi-schema.json" with { type: "json" };

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const filePath = process.argv[2];
if (!filePath) {
  console.error("❌ Please provide a JSON file path");
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(filePath, "utf8"));
const valid = validate(metadata);

if (valid) {
  console.log("✅ Metadata JSON is valid.");
} else {
  console.error("❌ Validation failed:", validate.errors);
  process.exit(1);
}
