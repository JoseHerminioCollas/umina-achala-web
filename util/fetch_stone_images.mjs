/**
 * Umiña Stone Image Fetcher (Node.js)
 * ====================================
 * Fetches real images from Unsplash and saves them into the exact folder
 * structure expected by the Umiña `images` JS object.
 *
 * Requirements:
 *   Node 18+ (fetch is built-in)
 *   npm install   ← only needed for the fs/path/stream helpers (all built-in)
 *   No external dependencies required.
 *
 * Setup:
 *   1. Get a free Unsplash API key at https://unsplash.com/developers
 *   2. Set it below or pass via env:  UNSPLASH_ACCESS_KEY=your_key node fetch_stone_images.mjs
 *
 * Usage:
 *   node fetch_stone_images.mjs
 *   node fetch_stone_images.mjs --output ./images
 */

import fs   from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

// ── Config ────────────────────────────────────────────────────────────────────
const ACCESS_KEY      = process.env.UNSPLASH_ACCESS_KEY ?? "YOUR_UNSPLASH_ACCESS_KEY_HERE";
const BASE_URL        = "https://api.unsplash.com/search/photos";
const IMAGES_PER_SLOT = 2;    // stone_1.jpg and stone_2.jpg
const DELAY_MS        = 500;  // between requests — free tier: 50 req/hr

// ── Output dir from --output flag ─────────────────────────────────────────────
const outputArg = process.argv.indexOf("--output");
const ROOT      = outputArg !== -1 ? process.argv[outputArg + 1] : "images";

// ── Stone → search query map ──────────────────────────────────────────────────
const QUERIES = {
  amethyst: {
    uncut:         "raw amethyst crystal rough stone",
    cut:           "amethyst cut polished gemstone faceted",
    mounted_uncut: "amethyst rough stone silver jewelry pendant",
    mounted_cut:   "amethyst gemstone ring necklace jewelry",
  },
  quartz: {
    uncut:         "raw quartz crystal rough stone",
    cut:           "quartz crystal polished cut gemstone",
    mounted_uncut: "raw quartz crystal pendant jewelry",
    mounted_cut:   "quartz gemstone ring jewelry",
  },
  chrysocolla: {
    uncut:         "chrysocolla raw rough mineral stone",
    cut:           "chrysocolla polished cabochon gemstone",
    mounted_uncut: "chrysocolla rough stone pendant jewelry",
    mounted_cut:   "chrysocolla gemstone jewelry ring",
  },
  obsidian: {
    uncut:         "obsidian raw volcanic glass rough stone",
    cut:           "obsidian polished black stone gemstone",
    mounted_uncut: "obsidian rough stone pendant jewelry",
    mounted_cut:   "obsidian black gemstone jewelry",
  },
  jade: {
    uncut:         "jade raw rough nephrite stone",
    cut:           "jade polished green gemstone carved",
    mounted_uncut: "raw jade stone pendant jewelry",
    mounted_cut:   "jade gemstone ring jewelry green",
  },
  tourmaline: {
    uncut:         "tourmaline raw crystal rough mineral",
    cut:           "tourmaline faceted cut gemstone",
    mounted_uncut: "tourmaline rough crystal pendant jewelry",
    mounted_cut:   "tourmaline gemstone ring jewelry",
  },
  lapis_lazuli: {
    uncut:         "lapis lazuli raw rough stone mineral",
    cut:           "lapis lazuli polished cabochon gemstone",
    mounted_uncut: "lapis lazuli rough stone pendant jewelry",
    mounted_cut:   "lapis lazuli gemstone jewelry ring",
  },
  malachite: {
    uncut:         "malachite raw rough green mineral stone",
    cut:           "malachite polished cabochon green gemstone",
    mounted_uncut: "malachite rough stone pendant jewelry",
    mounted_cut:   "malachite gemstone jewelry ring",
  },
  ruby: {
    uncut:         "ruby raw rough red corundum crystal",
    cut:           "ruby faceted cut red gemstone",
    mounted_uncut: "ruby rough crystal pendant jewelry",
    mounted_cut:   "ruby red gemstone ring jewelry",
  },
  sapphire: {
    uncut:         "sapphire raw rough blue corundum crystal",
    cut:           "sapphire faceted cut blue gemstone",
    mounted_uncut: "sapphire rough crystal pendant jewelry",
    mounted_cut:   "sapphire blue gemstone ring jewelry",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const log = {
  info:  (msg) => console.log(`  ✓ ${msg}`),
  error: (msg) => console.error(`  ✗ ${msg}`),
  head:  (msg) => console.log(`\n── ${msg} ──`),
};

async function fetchImages(query, count, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });

  const url = new URL(BASE_URL);
  url.searchParams.set("query",       query);
  url.searchParams.set("per_page",    count);
  url.searchParams.set("order_by",    "relevant");
  url.searchParams.set("orientation", "squarish");

  let results;
  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();
    results = data.results ?? [];
  } catch (err) {
    log.error(`API error for "${query}": ${err.message}`);
    return;
  }

  if (results.length === 0) {
    log.error(`No results for "${query}"`);
    return;
  }

  for (let i = 0; i < Math.min(count, results.length); i++) {
    const imgUrl   = results[i].urls.regular;   // ~1080px wide
    const filename = path.join(outputDir, `stone_${i + 1}.jpg`);

    try {
      const imgRes = await fetch(imgUrl);
      if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);
      await pipeline(Readable.fromWeb(imgRes.body), fs.createWriteStream(filename));
      log.info(`Saved ${filename}`);
    } catch (err) {
      log.error(`Download failed for stone_${i + 1}: ${err.message}`);
    }

    await delay(DELAY_MS);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (ACCESS_KEY === "YOUR_UNSPLASH_ACCESS_KEY_HERE") {
    console.error("ERROR: Set your Unsplash API key.");
    console.error("  export UNSPLASH_ACCESS_KEY=your_key");
    console.error("  node fetch_stone_images.mjs");
    console.error("\nGet a free key at https://unsplash.com/developers");
    process.exit(1);
  }

  console.log(`Saving images to: ${path.resolve(ROOT)}`);

  for (const [stone, categories] of Object.entries(QUERIES)) {
    log.head(stone.toUpperCase());
    await fetchImages(categories.uncut,         IMAGES_PER_SLOT, path.join(ROOT, stone, "uncut"));
    await fetchImages(categories.cut,           IMAGES_PER_SLOT, path.join(ROOT, stone, "cut"));
    await fetchImages(categories.mounted_uncut, IMAGES_PER_SLOT, path.join(ROOT, stone, "mounted", "uncut"));
    await fetchImages(categories.mounted_cut,   IMAGES_PER_SLOT, path.join(ROOT, stone, "mounted", "cut"));
  }

  console.log("\nDone! All images fetched.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
