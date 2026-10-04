/** @jest-environment jsdom */
import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import i18n from "../../frontend/src/i18n";
import { usePageMeta } from "../../frontend/src/hooks/usePageMeta";
import en from "../../frontend/src/locales/en.json";
import es from "../../frontend/src/locales/es.json";

const Page = ({ page, noindex }: { page: string; noindex?: boolean }) => {
  usePageMeta(page, { noindex });
  return null;
};

const setup = (path: string, page: string, noindex = false) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Page page={page} noindex={noindex} />
    </MemoryRouter>,
  );

const meta = (sel: string) => document.head.querySelector(sel);

describe("usePageMeta", () => {
  beforeEach(async () => {
    document.head.innerHTML = "";
    document.title = "";
    await i18n.changeLanguage("en");
  });

  it("sets the title, description and html lang", () => {
    setup("/marketplace", "marketplace");
    expect(document.title).toBe(en.seo.marketplace.title);
    expect(meta('meta[name="description"]')).toHaveAttribute("content", en.seo.marketplace.description);
    expect(document.documentElement.lang).toBe("en");
  });

  it("sets the canonical URL and sharing tags for the route", () => {
    setup("/contact", "contact");
    expect(meta('link[rel="canonical"]')).toHaveAttribute("href", "https://umina-achala.pe/contact");
    expect(meta('meta[property="og:url"]')).toHaveAttribute("content", "https://umina-achala.pe/contact");
    expect(meta('meta[property="og:title"]')).toHaveAttribute("content", en.seo.contact.title);
  });

  it("uses the bare domain as the canonical URL of the home page", () => {
    setup("/", "home");
    expect(meta('link[rel="canonical"]')).toHaveAttribute("href", "https://umina-achala.pe/");
  });

  it("follows the language", async () => {
    await i18n.changeLanguage("es");
    setup("/about", "about");
    expect(document.title).toBe(es.seo.about.title);
    expect(document.documentElement.lang).toBe("es");
  });

  it("does not add a robots tag to indexable pages", () => {
    setup("/privacy", "privacy");
    expect(meta('meta[name="robots"]')).toBeNull();
  });

  it("adds noindex for private pages and removes it when leaving", () => {
    const { unmount } = setup("/admin", "admin", true);
    expect(meta('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
    unmount();
    expect(meta('meta[name="robots"]')).toBeNull();
  });
});
