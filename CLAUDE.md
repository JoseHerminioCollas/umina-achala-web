# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Umiña Achala: provenance/compliance platform for Peruvian gemstones and jewelry on Hedera (HTS NFTs + HCS notarization). *Umiña* = single stone/mineral NFT; *Achala* = jewelry NFT referencing multiple Umiña IDs. The repo has three loosely coupled parts: a React marketplace frontend, Node scripts that talk to Hedera/IPFS, and Markdown docs (`umina-documents/`, linked from README). "Umina" is the internal name for a stone record.

## Commands

- `npm run dev` — Vite dev server (root is `frontend/`)
- `npm run build` — builds to `build/` (committed to git; the history has "build" commits)
- `npm test` — Jest (ts-jest ESM preset for `.ts`, babel-jest for `.js`); single test: `npx jest __tests__/filterItems.test.ts` (add `-t "name"` for one case). Package is `"type": "module"`, so if ESM issues arise try `NODE_OPTIONS=--experimental-vm-modules npx jest`.
- `npm run check` — runs the tests, then builds into `/tmp/umina-build` (leaves the tracked `build/` alone). `npm run check:preview` serves that build at http://localhost:4173 (Vite uses the next free port if it is busy) for manual testing; it does not rebuild, so re-run `check` after changes. This is the local equivalent of CI.
- `npm run deploy` — `gh-pages -d docs`, but no `docs/` dir exists; the build output goes to `build/`, so this script looks stale/misconfigured. Check before using.
- Hedera scripts run directly, from the repo root: `node hedera-scripts/mintUminaNFT.js`, `node hedera-scripts/validateMetadata.js <file.json>`.
- Utility scripts in `util/` use relative paths (`../json/example.json`), so run them from inside `util/`: `cd util && node generate-uminas.js`. `fetch_stone_images.mjs` needs `UNSPLASH_ACCESS_KEY`.

No lint script is configured. `tsconfig.json` only covers `frontend/src` (strict, noEmit).

## Architecture

**Frontend** (`frontend/src`): Vite + React 18 + react-router (BrowserRouter, routes declared in `App.tsx`) + CSS Modules (one `.module.css` per component) + react-i18next (`i18n.ts`, strings in `locales/en.json` and `es.json` — add keys to both). There is no backend: stone data is bundled from `data/uminas.json` and accessed through `UminaFacade` (`fromJSON()`, `getAll`, `getFeatured`, `findById` by `properties.stone_id`). Types are in `types/umina.ts`; filtering logic is in `utils/filterItems.ts` (unit tested). Static images live in `build/images/<stone>/{cut,uncut,mounted/cut,mounted/uncut}/stone_N.jpg`.

**Site-level pieces** (all in `frontend/src`):
- `config.ts` holds the site URL (`https://umina-achala.pe/`), the Google Form link (`CONTACT_FORM_URL`) and the Umami settings (`UMAMI_WEBSITE_ID`, `UMAMI_SCRIPT_URL`).
- **SEO:** `hooks/usePageMeta.ts` sets each page's title, description, canonical URL, sharing tags and `<html lang>` from the `seo.*` strings in the locale files; `admin` and `compliance` send `noindex`. `frontend/index.html` carries the same defaults statically (for crawlers that do not run JavaScript) plus Organization structured data. `frontend/public/robots.txt` and `sitemap.xml` are edited by hand: update the sitemap when you add a public route. Every page component that is added should call `usePageMeta`.
- **Contact page:** it embeds the project's Google Form in an iframe on wide screens (fixed height set by `--form-height` in `Contact.module.css`, because a cross-origin frame cannot size itself) and shows an "Open the contact form" button on narrow screens (640px and below). There is no form of our own and nothing is logged. The own-backend replacement is #97 (Phase 3).
- **Analytics:** `analytics.ts` loads the Umami Cloud script (EU region, cookie-free) from `main.tsx`, restricted to the live domain with `data-domains`, so localhost is not counted. Events are `data-umami-event` attributes (`header-contact-link`, `contact-form-button`, `contact-form-newtab`, `language-switch`); never put personal data in an event. The Privacy page describes Umami and the server access logs; keep it in step with what is collected.
- The red demo notice under the header tagline and the "no compliance page yet" message on the stone modal are Phase 1 demo messaging, to be removed at launch (#96).

**Metadata pipeline**: `schema/hip412-umina-schema.json` (HIP-412 NFT metadata + Umiña provenance fields: concession ID, REINFO, vendor RUC, mount/cut/artisan info) is the source of truth. `json/example.json` is the template; `util/generate-uminas.js` (using `util/image_map.js`) expands it into the sample stones consumed by the frontend. `hedera-scripts/metadataValidator.js` validates against the schema with Ajv, and `mintUminaNFT.js` validates → pins metadata to IPFS → mints via `TokenMintTransaction` → submits a provenance message to an HCS topic. `createUminaToken.js` creates the HTS token.

**Tests** (`__tests__`): Jest, run in `node` by default. Component tests live in `__tests__/components/*.test.tsx` and opt into jsdom with a `/** @jest-environment jsdom */` docblock at the top (React Testing Library + jest-dom, CSS modules mapped to `identity-obj-proxy`, real i18n imported from `frontend/src/i18n`). `mintUminaNFT.test.js` mocks `@hashgraph/sdk` and uses `__mocks__/ipfs-http-client.js`, so no network is needed. Other suites cover `UminaFacade`, `uminas.json` against the schema, `metadataValidator`, `filterItems`, and en/es translation key parity. `Header.tsx` uses `import.meta`, which Jest cannot run, so it is not rendered in tests; test strings via the locale files instead.

**CI** (`.github/workflows`): `ci.yml` runs `npm ci`, `npm test` and `npm run build` on every push and pull request (no secrets needed). `scheduled.yml` runs weekly (Mondays 06:00 UTC, or on demand) and adds a smoke test of the served build plus a non-blocking `npm audit`; scheduled runs only happen from the default branch.

## Gotchas

- Hedera scripts load credentials from `.env.testnet` via dotenv (mainnet line is commented in the script; switch it manually). `.env*` files are gitignored and hold real operator/admin/supply/wipe keys — never print or commit them.
- Changes to the frontend are only visible in the deployed site after `npm run build`, since `build/` is tracked.
- The project was renamed from "Rumi" to "Umiña Achala". Code uses `Umina` (`Umina` type, `UMINA_TOKEN_ID`, stone IDs like `UMINA-2026-CH-03`); the brand is "Umiña Achala". Search for `rumi` to find any remnant. Everything built before the rename (the `build/` bundle) still shows the old name until rebuilt.
- Known issues in the Hedera scripts (`createUminaToken.js`, `mintUminaNFT.js`) are tracked in #71–#74; check them before running a script on testnet.
- `npx tsc --noEmit` currently reports 4 errors in `StoneModal.tsx` (missing `tokenId` / `serialNumber` on `Umina`; see #89), and `vite build` does not type-check.

## Live site and deploy

- **Host:** AWS Ubuntu server with Nginx, domain `umina-achala.pe` (HTTPS from Let's Encrypt via Certbot). The same server also hosts another site (`aaarto`, run with pm2); do not touch it.
- **How it is served:** the Nginx site file serves `root /home/ubuntu/umina-achala-web/build;`, so the live site is the `build/` folder of a clone of this repo on the server. **Deploying means `git pull` in that clone** (confirm which remote it tracks, and note the current commit first for rollback). That is why `build/` is committed. Do not build on the server; `node_modules` is not needed there.
- **Nginx file:** `deploy/nginx/umina-achala.conf` is the site file (installed as `/etc/nginx/sites-enabled/umina-achala`, a link into `sites-available/`); `deploy/README.md` has the apply steps. Back it up outside `sites-enabled` (Nginx loads every file there, and Emacs also leaves `file~` next to a saved file), run `sudo nginx -t`, then `sudo systemctl reload nginx`. Keep the Certbot-managed lines.
- **The server must:** fall back to `index.html` for client-side routes (`try_files $uri $uri/ /index.html`), send `Cache-Control: no-cache` for `index.html` (otherwise returning visitors can keep a stale page that points at deleted hashed files), cache `/assets/` for a year, compress JS/CSS/JSON/SVG, redirect `www` to the bare domain, and serve `robots.txt`, `sitemap.xml` and `og-image.png` as real files. `vite.config.ts` has `base: './'`, which is fine for one-level routes only; use `base: '/'` before adding nested routes such as `/marketplace/<stone-id>`.
- **Disk:** the server's root disk is small (about 7 GB) and was 100% full on 2026-10-04, which breaks saving files, `git pull`, logging and certificate renewal. Check `df -h /` before editing config or deploying. The certificate expires 2026-11-20; check that renewal works.
- **Check after a deploy:** the new title and the red notice on `/`; `/marketplace` and `/contact` open and refresh; `/robots.txt` is text, `/sitemap.xml` is XML; `curl -sI https://umina-achala.pe/ | grep -i cache-control` shows `no-cache`; the Umami dashboard shows the visit; the Google Form submits. The full list is #103.
- **Tags:** after both pushes are green, tag the build commit with an annotated tag (`git tag -a v0.1.0 -m "..."`) and push it to both remotes by name (`git push origin v0.1.0`, `git push upstream v0.1.0`). It marks what is deployed and is the rollback point (`git checkout <tag> -- build` on the server). Never move or reuse a tag; the next build is `v0.1.1`. `v0.1.0` is the Phase 1 demo site.
- Never write the project mailbox address in the repo or in issues (both are public); the Contact form's notification address is a setting in the Google account.

## Project management

- Issues and the board live in the org repo `umina-achala/umina-achala-web` (project: https://github.com/orgs/umina-achala/projects/1). The `origin` remote is a personal fork and `upstream` is the org repo, so pass `-R umina-achala/umina-achala-web` to `gh issue` commands.
- The site is built in four phases, each a parent issue with its tasks as sub-issues and a matching milestone: Phase 1 demo site, no contract (#64), Phase 2 testnet (#15), Phase 3 mainnet (#39), Phase 4 UMA coin (#21). When a task moves between phases, change both its parent and its milestone. Work that is not tied to a phase (recurring or never-finished tasks, such as SEO monitoring in #100) is a sub-issue of **#101 "Ongoing tasks"**, with no milestone. The Phase 1 launch checklist is #103; server work is #98 (before the first deploy) and #102 (tuning). An issue can have only one parent.
- Board fields: Status (Todo / In Progress / Done), Priority (P0–P3, P0 most urgent), and Delivery (Done in fork / Done in upstream / In production). Delivery is set by hand and is separate from Status. Labels: `frontend`, `blockchain`, `payments`, `infra`, `refactor`, `production`, `marketing`, plus GitHub's defaults.
- The project's item list (`gh project item-list`) and the board lag by up to a minute after changes; re-check before assuming an update failed.

### Git workflow

- Solo developer, no pull requests. Work on a branch and push the branch to `origin`; CI (`ci.yml`) runs on every branch push, so wait for a green run. Then merge to `main` with `git merge --ff-only`, push `main` to `origin` and wait for green again. Push `main` to `upstream` (the org repo, what goes to production) when the work is ready to ship, and wait for green there. Rebase the branch onto `main` first if `main` moved. Run `npm run check` (and `check:preview` for UI changes) before pushing.
- An issue is done when its work reaches `upstream/main`, not when it is on a branch or only on the fork. Put `Closes #N` in the message of the last commit for an issue (use `Refs #N` for partial work); it closes the issue when pushed to `upstream/main`. The fork has issues turned off, so the keyword does nothing on `origin`.
- Do not reword commits that are already pushed (it needs a force-push). Keep "build" commits (`build/` output) separate from code commits.
- Set **Delivery** on the board as work moves: "Done in fork" after pushing to `origin`, "Done in upstream" after pushing to `upstream`, "In production" when deployed. Work that was pushed with `Refs #N` is closed by hand once it is live.
- Component tests wrap pages in a `MemoryRouter` (the pages call `usePageMeta`, which needs the router). `jest.setup.js` provides `TextEncoder` for react-router in jsdom.
- Some browser consoles show many errors from a wallet extension (`inpage.js`, "Broadcast channel unavailable"); they are not from the site. Check in a private window.

### Work summary comments

When posting a work-summary comment (e.g. on an issue/PR in Project #1), include these two tags so a downstream parser can extract it:

```
work_summary
worked_on_task_for_hours: <N>
```

- `work_summary` marks the comment as a work summary.
- `worked_on_task_for_hours: <N>` records hours worked, as a number (e.g. `2.5`).

Both tags must appear verbatim in the comment body, followed by the prose summary.