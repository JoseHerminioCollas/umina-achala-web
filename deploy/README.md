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
