/** @jest-environment jsdom */
import { loadAnalytics } from "../frontend/src/analytics";
import {
  SITE_HOST,
  SITE_URL,
  UMAMI_SCRIPT_URL,
  UMAMI_WEBSITE_ID,
} from "../frontend/src/config";

describe("loadAnalytics", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  it("does nothing while no website ID is configured", () => {
    expect(loadAnalytics(document, "", "https://example.test/script.js", "umina-achala.pe")).toBeNull();
    expect(document.head.querySelector("script")).toBeNull();
  });

  it("adds the Umami script with the website ID and the live domain only", () => {
    const script = loadAnalytics(document, "abc-123", "https://example.test/script.js", "umina-achala.pe");
    expect(script).not.toBeNull();
    expect(script!.src).toBe("https://example.test/script.js");
    expect(script!.defer).toBe(true);
    expect(script).toHaveAttribute("data-website-id", "abc-123");
    expect(script).toHaveAttribute("data-domains", "umina-achala.pe");
    expect(document.head.contains(script)).toBe(true);
  });

  it("does not add the script twice", () => {
    loadAnalytics(document, "abc-123", "https://example.test/script.js", "umina-achala.pe");
    expect(loadAnalytics(document, "abc-123", "https://example.test/script.js", "umina-achala.pe")).toBeNull();
    expect(document.head.querySelectorAll("script")).toHaveLength(1);
  });

  it("uses the configured website ID and script address by default", () => {
    const script = loadAnalytics(document);
    expect(script).toHaveAttribute("data-website-id", UMAMI_WEBSITE_ID);
    expect(script!.src).toBe(UMAMI_SCRIPT_URL);
  });
});

describe("analytics config", () => {
  it("has a website ID in UUID form and an https script address", () => {
    expect(UMAMI_WEBSITE_ID).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(UMAMI_SCRIPT_URL).toMatch(/^https:\/\//);
  });

  it("restricts tracking to the site's own host", () => {
    expect(SITE_HOST).toBe(new URL(SITE_URL).hostname);
    expect(SITE_HOST).toBe("umina-achala.pe");
  });
});
