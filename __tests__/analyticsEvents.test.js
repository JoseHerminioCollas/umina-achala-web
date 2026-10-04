import fs from "fs";

// Header.tsx cannot be rendered in Jest (it uses import.meta), so check its source.
const header = fs.readFileSync("frontend/src/components/Header.tsx", "utf8");

describe("analytics events in the header", () => {
  test("the demo notice link is tracked", () => {
    expect(header).toContain('data-umami-event="header-contact-link"');
  });

  test("language switches are tracked, with the target language", () => {
    expect(header).toContain('"language-switch"');
    expect(header).toContain('data-umami-event-to="es"');
    expect(header).toContain('data-umami-event-to="en"');
  });

  test("no personal data is put into event attributes", () => {
    const attrs = header.match(/data-umami-event[\w-]*=/g) || [];
    attrs.forEach((a) => expect(a).not.toMatch(/email|name|phone/i));
  });
});
