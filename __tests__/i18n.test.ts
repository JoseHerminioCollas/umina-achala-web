import en from "../frontend/src/locales/en.json";
import es from "../frontend/src/locales/es.json";

// Flatten nested translation objects to "a.b.c" => value (arrays keep their index)
const flatten = (obj: unknown, prefix = ""): Record<string, unknown> =>
  Object.entries(obj as Record<string, unknown>).reduce(
    (acc, [key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object") {
        Object.assign(acc, flatten(value, path));
      } else {
        acc[path] = value;
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );

const enFlat = flatten(en);
const esFlat = flatten(es);

describe("translations", () => {
  it("English and Spanish have the same keys", () => {
    const enKeys = Object.keys(enFlat).sort();
    const esKeys = Object.keys(esFlat).sort();
    expect(esKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
    expect(enKeys.filter((k) => !esKeys.includes(k))).toEqual([]);
  });

  it("has no empty strings", () => {
    const empty = [
      ...Object.entries(enFlat).map(([k, v]) => ["en." + k, v]),
      ...Object.entries(esFlat).map(([k, v]) => ["es." + k, v]),
    ]
      .filter(([, v]) => typeof v === "string" && v.trim() === "")
      .map(([k]) => k);
    expect(empty).toEqual([]);
  });

  it("contains no remnants of the old Rumi name", () => {
    expect(JSON.stringify(en)).not.toMatch(/rumi/i);
    expect(JSON.stringify(es)).not.toMatch(/rumi/i);
  });
});

describe("demo notice (#84)", () => {
  it("has the English message", () => {
    expect(en.demo.notice).toBe(
      "Web page for demonstration purposes only, launching soon",
    );
  });

  it("has the Spanish message", () => {
    expect(es.demo.notice).toBe(
      "Página web solo con fines de demostración, próximamente",
    );
  });
});

describe("demo notice contact link (#68)", () => {
  it("has the English and Spanish link text", () => {
    expect(en.demo.contactLink).toBe("Contact us to be notified.");
    expect(es.demo.contactLink).toBe("Contáctenos para que le avisemos.");
  });
});

describe("page titles and descriptions (#86)", () => {
  const pages = ["home", "marketplace", "about", "faqs", "privacy", "contact", "admin", "compliance"];

  it.each(pages)("%s has a title and description in both languages", (page) => {
    for (const lang of [en, es] as const) {
      const entry = (lang as any).seo[page];
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });

  it("titles are short enough for search results and descriptions are not too long", () => {
    for (const lang of [en, es] as const) {
      for (const page of pages) {
        const entry = (lang as any).seo[page];
        expect(entry.title.length).toBeLessThanOrEqual(65);
        expect(entry.description.length).toBeLessThanOrEqual(160);
      }
    }
  });
});
