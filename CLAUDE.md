# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Umiña Achala: provenance/compliance platform for Peruvian gemstones and jewelry on Hedera (HTS NFTs + HCS notarization). *Umiña* = single stone/mineral NFT; *Achala* = jewelry NFT referencing multiple Umiña IDs. The repo has three loosely coupled parts: a React marketplace frontend, Node scripts that talk to Hedera/IPFS, and Markdown docs (`umina-documents/`, linked from README). "Umina" is the internal name for a stone record.

## Commands

- `npm run dev` — Vite dev server (root is `frontend/`)
- `npm run build` — builds to `build/` (committed to git; the history has "build" commits)
- `npm test` — Jest (ts-jest ESM preset for `.ts`, babel-jest for `.js`); single test: `npx jest __tests__/filterItems.test.ts` (add `-t "name"` for one case). Package is `"type": "module"`, so if ESM issues arise try `NODE_OPTIONS=--experimental-vm-modules npx jest`.
- `npm run deploy` — `gh-pages -d docs`, but no `docs/` dir exists; the build output goes to `build/`, so this script looks stale/misconfigured. Check before using.
- Hedera scripts run directly, from the repo root: `node hedera-scripts/mintUminaNFT.js`, `node hedera-scripts/validateMetadata.js <file.json>`.
- Utility scripts in `util/` use relative paths (`../json/example.json`), so run them from inside `util/`: `cd util && node generate-uminas.js`. `fetch_stone_images.mjs` needs `UNSPLASH_ACCESS_KEY`.

No lint script is configured. `tsconfig.json` only covers `frontend/src` (strict, noEmit).

## Architecture

**Frontend** (`frontend/src`): Vite + React 18 + react-router (BrowserRouter, routes declared in `App.tsx`) + CSS Modules (one `.module.css` per component) + react-i18next (`i18n.ts`, strings in `locales/en.json` and `es.json` — add keys to both). There is no backend: stone data is bundled from `data/uminas.json` and accessed through `UminaFacade` (`fromJSON()`, `getAll`, `getFeatured`, `findById` by `properties.stone_id`). Types are in `types/umina.ts`; filtering logic is in `utils/filterItems.ts` (unit tested). Static images live in `build/images/<stone>/{cut,uncut,mounted/cut,mounted/uncut}/stone_N.jpg`.

**Metadata pipeline**: `schema/hip412-umina-schema.json` (HIP-412 NFT metadata + Umiña provenance fields: concession ID, REINFO, vendor RUC, mount/cut/artisan info) is the source of truth. `json/example.json` is the template; `util/generate-uminas.js` (using `util/image_map.js`) expands it into the sample stones consumed by the frontend. `hedera-scripts/metadataValidator.js` validates against the schema with Ajv, and `mintUminaNFT.js` validates → pins metadata to IPFS → mints via `TokenMintTransaction` → submits a provenance message to an HCS topic. `createUminaToken.js` creates the HTS token.

**Tests** (`__tests__`): `mintUminaNFT.test.js` mocks `@hashgraph/sdk` and uses `__mocks__/ipfs-http-client.js`, so no network is needed.

## Gotchas

- Hedera scripts load credentials from `.env.testnet` via dotenv (mainnet line is commented in the script; switch it manually). `.env*` files are gitignored and hold real operator/admin/supply/wipe keys — never print or commit them.
- Changes to the frontend are only visible in the deployed site after `npm run build`, since `build/` is tracked.
- The project was renamed from "Rumi" to "Umiña Achala". Code uses `Umina` (`Umina` type, `UMINA_TOKEN_ID`, stone IDs like `UMINA-2026-CH-03`); the brand is "Umiña Achala". Search for `rumi` to find any remnant. Everything built before the rename (the `build/` bundle) still shows the old name until rebuilt.
- Known issues in the Hedera scripts (`createUminaToken.js`, `mintUminaNFT.js`) are tracked in #71–#74; check them before running a script on testnet.
- `npx tsc --noEmit` currently reports 4 errors in `StoneModal.tsx` (missing `tokenId` / `serialNumber` on `Umina`; see #89), and `vite build` does not type-check.

## Project management

- Issues and the board live in the org repo `umina-achala/umina-achala-web` (project: https://github.com/orgs/umina-achala/projects/1). The `origin` remote is a personal fork and `upstream` is the org repo, so pass `-R umina-achala/umina-achala-web` to `gh issue` commands.
- The site is built in four phases, each a parent issue with its tasks as sub-issues and a matching milestone: Phase 1 demo site, no contract (#64), Phase 2 testnet (#15), Phase 3 mainnet (#39), Phase 4 UMA coin (#21). When a task moves between phases, change both its parent and its milestone.
- Board fields: Status (Todo / In Progress / Done) and Priority (P0–P3, P0 most urgent). Labels: `frontend`, `blockchain`, `payments`, `infra`, `refactor`, `production`, `marketing`, plus GitHub's defaults.
- The project's item list (`gh project item-list`) and the board lag by up to a minute after changes; re-check before assuming an update failed.

### Work summary comments

When posting a work-summary comment (e.g. on an issue/PR in Project #1), include these two tags so a downstream parser can extract it:

```
work_summary
worked_on_task_for_hours: <N>
```

- `work_summary` marks the comment as a work summary.
- `worked_on_task_for_hours: <N>` records hours worked, as a number (e.g. `2.5`).

Both tags must appear verbatim in the comment body, followed by the prose summary.