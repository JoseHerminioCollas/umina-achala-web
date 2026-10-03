import fs from "fs";
import path from "path";
import { validateMetadata } from "../hedera-scripts/metadataValidator.js";

const uminas = JSON.parse(
  fs.readFileSync("./frontend/src/data/uminas.json", "utf8"),
);

describe("frontend/src/data/uminas.json", () => {
  test("has stones", () => {
    expect(Array.isArray(uminas)).toBe(true);
    expect(uminas.length).toBeGreaterThan(0);
  });

  // The demo site serves local images (/images/...), while minted metadata must
  // use ipfs:// images. Validate everything else against the schema.
  test("every stone validates against the HIP-412 schema (except the local demo image)", () => {
    const failures = uminas
      .map((u) => ({
        id: u.properties?.stone_id,
        ...validateMetadata({ ...u, image: "ipfs://placeholder" }),
      }))
      .filter((r) => !r.valid)
      .map((r) => `${r.id}: ${JSON.stringify(r.errors)}`);
    expect(failures).toEqual([]);
  });

  test("demo images are local paths, which the schema would reject for minting", () => {
    // Documents the demo-vs-mint difference; before minting, images move to IPFS.
    uminas.forEach((u) => {
      expect(u.image).toMatch(/^\/images\//);
      expect(validateMetadata(u).valid).toBe(false);
    });
  });

  test("stone_id values are unique and follow the UMINA-YYYY-XX-NN format", () => {
    const ids = uminas.map((u) => u.properties.stone_id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^UMINA-\d{4}-[A-Z]{2}-\d{2}$/));
  });

  test("every image exists under frontend/public", () => {
    const missing = uminas
      .map((u) => u.image)
      .filter((img) => !fs.existsSync(path.join("frontend/public", img)));
    expect(missing).toEqual([]);
  });

  test("every stone has a type attribute", () => {
    uminas.forEach((u) => {
      const type = u.attributes.find((a) => a.trait_type === "Stone Type");
      expect(type?.value).toBeTruthy();
    });
  });

  test("contains no remnants of the old Rumi name", () => {
    expect(JSON.stringify(uminas)).not.toMatch(/rumi/i);
  });
});
