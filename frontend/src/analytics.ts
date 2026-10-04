// src/analytics.ts
// Loads the Umami analytics script. Does nothing until a website ID is configured, and
// the script only records visits to the live domain (data-domains), not localhost.
import { UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID, SITE_HOST } from "./config";

export function loadAnalytics(
  doc: Document = document,
  websiteId: string = UMAMI_WEBSITE_ID,
  src: string = UMAMI_SCRIPT_URL,
  domain: string = SITE_HOST,
): HTMLScriptElement | null {
  if (!websiteId) return null;
  if (doc.querySelector(`script[data-website-id="${websiteId}"]`)) return null;

  const script = doc.createElement("script");
  script.defer = true;
  script.src = src;
  script.setAttribute("data-website-id", websiteId);
  script.setAttribute("data-domains", domain);
  doc.head.appendChild(script);
  return script;
}
