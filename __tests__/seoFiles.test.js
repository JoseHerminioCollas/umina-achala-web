import fs from "fs";

const read = (p) => fs.readFileSync(p, "utf8");

describe("robots.txt", () => {
  const robots = read("frontend/public/robots.txt");

  test("allows crawling and points to the sitemap", () => {
    expect(robots).toMatch(/User-agent: \*/);
    expect(robots).toMatch(/^Allow: \/$/m);
    expect(robots).toMatch(/^Sitemap: https:\/\/umina-achala\.pe\/sitemap\.xml$/m);
  });

  test("keeps the admin and compliance pages out", () => {
    expect(robots).toMatch(/^Disallow: \/admin$/m);
    expect(robots).toMatch(/^Disallow: \/compliance$/m);
    expect(robots).not.toMatch(/^Disallow: \/$/m); // never block the whole site
  });
});

describe("sitemap.xml", () => {
  const sitemap = read("frontend/public/sitemap.xml");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  test("lists the public pages on the live domain", () => {
    expect(urls).toEqual(
      ["", "marketplace", "about", "faqs", "privacy", "contact"].map(
        (p) => `https://umina-achala.pe/${p}`,
      ),
    );
  });

  test("does not list the admin or compliance pages", () => {
    expect(sitemap).not.toMatch(/admin|compliance/);
  });
});

describe("index.html", () => {
  const html = read("frontend/index.html");

  test("has a title and description", () => {
    expect(html).toMatch(/<title>[^<]+<\/title>/);
    expect(html).toMatch(/<meta\s+name="description"\s+content="[^"]{50,}"/);
  });

  test("has a canonical link and sharing tags", () => {
    expect(html).toContain('<link rel="canonical" href="https://umina-achala.pe/" />');
    ["og:title", "og:description", "og:url", "og:image", "og:type"].forEach((p) =>
      expect(html).toContain(`property="${p}"`),
    );
    expect(html).toContain('name="twitter:card"');
  });

  test("does not block indexing", () => {
    expect(html).not.toMatch(/noindex/i);
  });

  test("has valid Organization structured data", () => {
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    const data = JSON.parse(json);
    expect(data["@type"]).toBe("Organization");
    expect(data.url).toBe("https://umina-achala.pe/");
  });

  test("the sharing image exists", () => {
    expect(fs.existsSync("frontend/public/og-image.png")).toBe(true);
  });
});
