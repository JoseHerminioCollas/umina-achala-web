// src/config.ts
// Google Form for contact and launch notifications (one form, English and Spanish).
// Replace with the site's own form backend later.
export const CONTACT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeV9wc3fhp8_fteFPzxYqGsEGWLvuHtTMynaBJ2fa3bYjJ1Fg/viewform";

// Public address of the live site, used for canonical URLs, the sitemap and sharing tags.
export const SITE_URL = "https://umina-achala.pe/";

// Umami Cloud analytics (cookie-free). Paste the website ID from the Umami dashboard;
// while it is empty, no analytics script is loaded. Data region: EU.
export const UMAMI_WEBSITE_ID = "8d41a361-a437-43cd-a4fc-8e933fee9e18";
export const UMAMI_SCRIPT_URL = "https://cloud.umami.is/script.js";
export const SITE_HOST = new URL(SITE_URL).hostname;
