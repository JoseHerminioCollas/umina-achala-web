// src/config.ts
import { env } from "./env";

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

// Chain settings (#123): every network, mirror node, token, topic and seller
// value the site reads. Each comes from a VITE_ variable at build time, with
// the testnet value as the default, so mainnet (Phase 3) is a settings change.
// Nothing else in frontend/src writes these values. The IDs are those of
// umina-achala-chain on testnet (umina-achala-chain#10).

export type HederaNetwork = "testnet" | "mainnet";

export const NETWORK: HederaNetwork =
  env.VITE_HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet";

/** The mirror node REST API, with no trailing slash. */
export const MIRROR_NODE_URL =
  env.VITE_MIRROR_NODE_URL || `https://${NETWORK}.mirrornode.hedera.com`;

/** The Umiña (stone) and Achala (jewelry) NFT tokens. */
export const UMINA_TOKEN_ID = env.VITE_UMINA_TOKEN_ID || "0.0.11400486";
export const ACHALA_TOKEN_ID = env.VITE_ACHALA_TOKEN_ID || "0.0.11400589";

/** The HCS topics: provenance events (MINT, SALE, …) and display events (LISTED, …). */
export const PROVENANCE_TOPIC_ID = env.VITE_PROVENANCE_TOPIC_ID || "0.0.11400670";
export const DISPLAY_TOPIC_ID = env.VITE_DISPLAY_TOPIC_ID || "0.0.11400772";

/** UA's Treasury account: it holds the NFTs UA sells and is the only seller. */
export const TREASURY_ACCOUNT_ID = env.VITE_TREASURY_ACCOUNT_ID || "0.0.4631334";

/**
 * The site's catalog (#89), built from the chain by umina-achala-chain#44 and
 * served next to the site (frontend/public/data/ in dev, build/data/ live).
 */
export const CATALOG_URL = env.VITE_CATALOG_URL || "./data/catalog.json";

/**
 * The IPFS gateway for ipfs:// links, ending in "/ipfs/": Pinata's public
 * gateway, the one the catalog builder uses (umina-achala-chain#44).
 */
export const IPFS_GATEWAY_URL =
  env.VITE_IPFS_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs/";

/**
 * The sale backend (umina-achala-server, #116), on the site's own domain:
 * Nginx sends /api/ to it live, and Vite's dev server does the same
 * (vite.config.ts), so there is no CORS.
 */
export const SALE_API_URL = env.VITE_SALE_API_URL || "/api";

/**
 * The WalletConnect (Reown) project the site connects wallets with (#58).
 * It is public: it ships in the site's code. Reown allows it only on the
 * domains on its allowlist (and on localhost).
 */
export const WALLETCONNECT_PROJECT_ID =
  env.VITE_WALLETCONNECT_PROJECT_ID || "9948d667a9b036be67a63e08e42b45dd";

/** Where a visitor gets HashPack, the wallet the site buys with (#58). */
export const HASHPACK_DOWNLOAD_URL = "https://www.hashpack.app/download";

/** Hedera's faucet: free test HBAR for a testnet account (#137). */
export const HEDERA_FAUCET_URL = "https://portal.hedera.com/faucet";
