# Deploy notes

The live site is served by Nginx on AWS Ubuntu from the `build/` folder of a clone of this
repository on the server (`root /home/ubuntu/umina-achala-web/build;`). Deploying means
updating that clone (`git pull`), so `build/` is committed.

## Nginx config

`nginx/umina-achala.conf` is the master copy of the site file. The server's
`/etc/nginx/sites-available/umina-achala` (linked from `sites-enabled/`) is always copied
from it and never edited on the server: change the file here, commit it, and install it on
the next deploy. The lines marked `# managed by Certbot` are written by Certbot; keep them.
No certificate keys are stored here, only their file paths.

The `/api/` block proxies the site's sale calls to the sale backend (umina-achala-server,
pm2, `127.0.0.1:8787`). Until the backend runs, `/api/` answers 502; the rest of the site
works.

To install it, after `git pull` on the server (check `df -h /` first: a full disk can leave
the file empty):

1. See what will change. A line that is only on the server is lost when the file is
   copied, so add it here first if it is needed:

   ```
   diff /etc/nginx/sites-available/umina-achala /home/ubuntu/umina-achala-web/deploy/nginx/umina-achala.conf
   ```

2. Back up the current file outside `sites-enabled` (Nginx loads every file in that
   folder):

   ```
   cp /etc/nginx/sites-available/umina-achala ~/umina-achala.nginx.bak
   ```

3. Copy the repo file in:

   ```
   sudo cp /home/ubuntu/umina-achala-web/deploy/nginx/umina-achala.conf /etc/nginx/sites-available/umina-achala
   ```

4. Test it. Only if it says OK, reload:

   ```
   sudo nginx -t
   ```

   ```
   sudo systemctl reload nginx
   ```

   If the test fails, copy the backup back and run the test again.

5. Check it from outside (more `curl` checks in issue #98). The catalog is revalidated:

   ```
   curl -sI https://umina-achala.pe/data/catalog.json
   ```

   Its `Cache-Control` is `no-cache`. The sale backend answers through the proxy, naming
   testnet and the last catalog build:

   ```
   curl -s https://umina-achala.pe/api/health
   ```

## Site catalog (`build/data/`)

The site reads its items at run time from `build/data/catalog.json`, with copies of the
photos, 3D models and PDFs in `build/data/media/`. Both are built from the chain by
umina-achala-chain's catalog builder (`src/catalog/buildCatalog.js`). They are **not in
git**: they change with every listing and sale, and `git pull` leaves them alone. A new
catalog shows on the next page load, with no site build (Nginx sends `catalog.json` with
`no-cache`; see the `/data/` blocks in `nginx/umina-achala.conf`).

Never edit the catalog by hand. A wrong catalog is fixed by rebuilding it.

### Way 1 (the intended setup): built on this server

The sale backend (umina-achala-server, run by pm2) writes the catalog here itself. In its
env file (outside any repository, `chmod 600`, the name contains `testnet`):

```
CATALOG_DIR=/home/ubuntu/umina-achala-web/build/data
```

It rebuilds the catalog once at start, after each sale on the site, and within about a
minute of each new display topic message, so a listing made with `displayEvent.js` from
any computer reaches the site with nothing to copy. Install, Nginx `/api/` and update
steps: umina-achala-server's README, and umina-achala-documents `scripts.md`, "Running
the sale backend".

The folder must exist before the backend starts, be writable by the account that runs
pm2 (`ubuntu`), and be readable by Nginx:

```
mkdir -p /home/ubuntu/umina-achala-web/build/data
```

With umina-achala-chain cloned on this server too (#134), a build by hand also writes in
place. Run it from the chain clone, first as a dry run:

```
NETWORK=testnet node src/catalog/buildCatalog.js /home/ubuntu/umina-achala-web/build/data --dry-run
```

Then for real:

```
NETWORK=testnet node src/catalog/buildCatalog.js /home/ubuntu/umina-achala-web/build/data
```

Only one build at a time: while the backend is running, let it do the rebuild (list or
unlist, then wait a minute) rather than building by hand.

### Way 2 (fallback): built on another computer, then copied

When the catalog is built elsewhere (the backend is not running here yet), build it into a
local folder, then send it to the server, **`media/` first**, so the new catalog never
names a file that has not arrived yet.

Build it locally, from umina-achala-chain:

```
NETWORK=testnet node src/catalog/buildCatalog.js ../umina-achala-web/frontend/public/data
```

Send the media copies. Only new files go, since a copy never changes:

```
rsync -av ../umina-achala-web/frontend/public/data/media/ ubuntu@<server>:/home/ubuntu/umina-achala-web/build/data/media/
```

Then the catalog:

```
rsync -av ../umina-achala-web/frontend/public/data/catalog.json ubuntu@<server>:/home/ubuntu/umina-achala-web/build/data/
```

Do not use `rsync --delete` on `media/`: a file still named by an older catalog in a
visitor's browser would disappear.

### Check it

The catalog is served, with `no-cache`:

```
curl -sI https://umina-achala.pe/data/catalog.json
```

When it was built and how many items it has:

```
curl -s https://umina-achala.pe/data/catalog.json | jq '.built_at, (.items | length)'
```

A model is served as `model/gltf-binary` with the long cache (take a `.glb` path from
the catalog):

```
curl -sI https://umina-achala.pe/data/media/<cid>/<file>.glb
```

### Do not commit the catalog

`npm run build` copies `frontend/public/data/` into `build/data/`, and `build/` is
committed. Both folders are git-ignored, so the catalog and its media (about 13 MB on
testnet) stay out of a build commit. If a build commit ever seems too large, check that
nothing under `build/data/` is staged; this should print nothing:

```
git diff --cached --name-only -- build/data
```

## Restocking the demo

Every sale on the site moves one item out of the Treasury, so the demo stock runs down.
It is restocked, as often as needed, in two ways:

- **Return items** from our own test buyer accounts to the Treasury, then list them again
  (step 2). This is the usual way: nothing is pinned or minted, and the catalog already
  has the photos.
- **Mint new items** from form posts not minted yet (step 3), when returns are not enough.

Visitors who bought are not asked to send items back. One may still do it with a plain
**Send** in HashPack; it costs only the network fee (the Treasury is the token's fee
collector, so no royalty and no fallback fee apply).

The commands run from `umina-achala-chain`, with `testnet/` linked to
`umina-achala-testnet` (see that repo's README).

1. See what the Treasury holds and what is listed. It only reads:

   ```
   NETWORK=testnet node src/display/displayEvent.js status
   ```

2. Return items from a test buyer. In HashPack, on the test buyer's account, open each
   NFT, choose **Send** and send it to the Treasury (`TREASURY_ACCOUNT_ID` in
   `frontend/src/config.ts`, now `0.0.4631334`). Only the sender signs. A piece of jewelry
   goes back whole: the Achala and each stone in it, one NFT at a time. Then run `status`
   (step 1): each returned item shows as `not listed`. List it again (step 4), even at the
   same price: a listing from before it left the Treasury no longer counts. Details in
   umina-achala-documents, `nft-transfers-and-sales.md`, "Returning an NFT to the Treasury
   From a Wallet, Then Selling It Again".

3. New stock: mint a form post from `umina-achala-testnet` that has not been minted yet.
   `displayEvent.js status` and the provenance topic show what has been; a post whose
   `stone_id` already has a MINT is refused. First as a dry run:

   ```
   NETWORK=testnet node src/mint/mintNFT.js --form testnet/<post>.json --dry-run
   ```

   Then for real:

   ```
   NETWORK=testnet node src/mint/mintNFT.js --form testnet/<post>.json
   ```

   - **Jewelry:** mint its stones first, write their new serials into the Achala post
     (`stones[].serial`), commit the post in `umina-achala-testnet`, then mint it with
     `--token achala`. Its stones leave the catalog as single items once mounted.
   - **Not stock:** `ammonite_a.json` (a fossil) and `achala_f.json` (a stone already
     mounted) are refusal tests; the mint must refuse them.
   - **Do not use `--force`** to mint a `stone_id` again: it makes a second live NFT for the
     same stone.
   - Record each mint in the testnet mint results table (umina-achala-chain#22).

4. List each new item. Keep testnet prices under 10 HBAR: the faucet sends 10 test HBAR a
   day without signing in, and the buyer also pays a small fee to associate the tokens.

   ```
   NETWORK=testnet node src/display/displayEvent.js listed <serial> --price <hbar> --dry-run
   ```

   ```
   NETWORK=testnet node src/display/displayEvent.js listed <serial> --price <hbar>
   ```

   For a piece of jewelry, add `--token achala`.

5. The site catches up by itself: the sale backend reads the display topic about once a
   minute and rebuilds the catalog. Check `/marketplace` after a minute. If the backend is
   not running, build and publish the catalog by hand (Way 2 above).

## If testnet is reset

Hedera resets testnet now and then, announced in advance. A reset deletes every account,
token, topic and NFT on testnet; the files pinned on IPFS (Pinata) stay, so a remint pins
nothing new. Signs of a reset: the mirror node answers 404 for the token or Treasury IDs,
the catalog build stops, and `/api/health` reports an error.

Each step needs the IDs from the one before, so keep the order. The chain commands run from
`umina-achala-chain`, with `.env.testnet`.

1. **Accounts.** Create new testnet accounts in the Hedera portal: the operator and
   Treasury, and the test buyer. Fund them from the faucet (signed in: up to 100 HBAR a
   day; a token costs about 50 HBAR to create). Put the IDs and keys in `.env.testnet`.

2. **Tokens.** Check `FALLBACK_FEE_HBAR` (about USD 3 in HBAR on the day), then create
   both classes and save each printed ID (`UMINA_TOKEN_ID`, `ACHALA_TOKEN_ID`):

   ```
   NETWORK=testnet node src/token/createToken.js
   ```

   ```
   NETWORK=testnet node src/token/createToken.js --token achala
   ```

3. **Topics.** Create both and save each printed ID (`HCS_TOPIC_ID`,
   `HCS_DISPLAY_TOPIC_ID`):

   ```
   NETWORK=testnet node src/topic/createTopic.js provenance
   ```

   ```
   NETWORK=testnet node src/topic/createTopic.js display
   ```

4. **Stock.** Mint and list as in "Restocking the demo" (steps 3 and 4): the stones first,
   then the Achala posts with the stones' new serials. Commit the posts in
   `umina-achala-testnet`.

5. **The site.** Set the new IDs as the defaults in `frontend/src/config.ts`: the two
   token IDs, the two topic IDs and the Treasury account (`/testnet` shows the token IDs
   from there). Then `npm run check`, build, commit, push, tag, and `git pull` on the
   server, as for any launch.

6. **The sale backend.** Put the new IDs and keys in its testnet env file on the server,
   then restart it with the new values:

   ```
   pm2 restart umina-achala-sale --update-env
   ```

   Check that it answers and that `pm2 logs umina-achala-sale` shows a catalog build with
   the new items:

   ```
   curl -s https://umina-achala.pe/api/health
   ```

7. **Not affected:** the Reown project and its domain allowlist, Nginx, and the photos
   already on IPFS.
