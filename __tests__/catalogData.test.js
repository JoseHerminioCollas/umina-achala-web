// The test catalog against the schemas the site's types are written from
// (#124): catalog-schema.json, and each item's metadata against its HIP-412
// schema, as the catalog builder checks them (umina-achala-chain#44).
import fs from "fs";
import Ajv from "ajv";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const catalog = read("./__tests__/fixtures/catalog.json");

const compile = (AjvClass, schema) => {
  const ajv = new AjvClass({ allErrors: true, allowUnionTypes: true });
  addFormats(ajv);
  return ajv.compile(schema);
};
const validateCatalog = compile(Ajv2020, read("./schema/catalog-schema.json"));
const validateUmina = compile(Ajv, read("./schema/hip412-umina-schema.json"));
const validateAchala = compile(Ajv, read("./schema/hip412-achala-schema.json"));

describe("__tests__/fixtures/catalog.json", () => {
  test("matches catalog-schema.json", () => {
    expect(validateCatalog(catalog) || validateCatalog.errors).toBe(true);
  });

  test("has both kinds, and an Achala with its stones", () => {
    const kinds = catalog.items.map((i) => i.kind);
    expect(kinds).toEqual(expect.arrayContaining(["umina", "achala"]));
    const achala = catalog.items.find((i) => i.kind === "achala");
    expect(achala.stones.length).toBeGreaterThan(0);
  });

  test("each item's metadata, and each mounted stone's, matches its HIP-412 schema", () => {
    const failures = [];
    const check = (validate, nft) => {
      if (!validate(nft.metadata)) failures.push({ id: nft.stone_id, errors: validate.errors });
    };
    for (const item of catalog.items) {
      check(item.kind === "achala" ? validateAchala : validateUmina, item);
      for (const stone of item.stones ?? []) check(validateUmina, stone);
    }
    expect(failures).toEqual([]);
  });
});
