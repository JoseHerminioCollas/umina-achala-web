# Deploy notes

The live site is served by Nginx on AWS Ubuntu from the `build/` folder of a clone of this
repository on the server (`root /home/ubuntu/umina-achala-web/build;`). Deploying means
updating that clone (`git pull`), so `build/` is committed.

## Nginx config

`nginx/umina-achala.conf` is the site file, installed on the server as
`/etc/nginx/sites-enabled/umina-achala` (usually a link to `sites-available/`). The lines
marked `# managed by Certbot` are written by Certbot; keep them. No certificate keys are
stored here, only their file paths.

To apply a change:

1. Copy the file to the server and back up the current one outside `sites-enabled`
   (Nginx loads every file in that folder), for example `~/umina-achala.nginx.bak`.
2. `sudo nginx -t`. Only if it says OK, run `sudo systemctl reload nginx`.
3. Check it from outside (see issue #98 for the `curl` checks).

Do not save the file while the server disk is full: a full disk can leave it empty.
