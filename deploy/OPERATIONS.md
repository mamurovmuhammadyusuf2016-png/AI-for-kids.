# Nimi on airnet

Production host: SSH alias `airnet`, address `176.96.243.122`.
Domain: `https://nimi.uz`; `www.nimi.uz` redirects to the apex after TLS activation.
This is a fresh database, as requested. The Render service and its data were not modified.

Verified on 2026-10-30: public DNS resolves to airnet, HTTPS is active for both names,
and HTTP/www redirect to `https://nimi.uz`. The Let's Encrypt certificate expires
2027-01-27; a simulated renewal succeeded. Initial TLS setup completed automatically
on 2026-10-29 at 22:56 Tashkent time and disabled its setup timer. Regular renewal
continues through `certbot.timer`.

## Layout and isolation

- `/opt/nimi/current` points to the active release under `/opt/nimi/releases`.
- Compose project `nimi`; containers `nimi-app-1`, `nimi-postgres-1`.
- PostgreSQL volume `nimi_postgres_data`, private network `nimi_database`, no published database port.
- App port `18320` bound only to loopback and the existing Docker bridge `172.18.0.1`.
- App: 384 MiB RAM, 0.75 CPU, unprivileged user, read-only filesystem. Database: 256 MiB RAM, 0.5 CPU.
- Existing edge container `nexus_ai-nginx-1` receives only an additional `/root/nexus_ai/nginx/conf.d/nimi.uz.conf` file. Use `nginx -t` before every graceful reload. Never restart the shared stack for Nimi.
- Secrets: `/opt/nimi/shared/app.env`, `/opt/nimi/shared/postgres.env`, root-only permissions. Never commit or print these.
- Administrator login/password: `/opt/nimi/shared/admin-access.txt`; local private copy in `.deployment/admin-access.txt`.
- Google login is intentionally unconfigured: the old Render OAuth client's allowed origins are not known to include `https://nimi.uz`. Email/password registration and parent/admin logins work. Set `GOOGLE_CLIENT_ID` only after its owner configures the new origin.

## Status

```sh
ssh airnet 'cd /opt/nimi/current && sudo docker compose --env-file deploy/.env -f deploy/compose.yaml ps'
ssh airnet 'curl -fsS http://127.0.0.1:18320/health?db=1'
ssh airnet 'docker logs --tail 50 nimi-app-1'
ssh airnet 'sudo cat /opt/nimi/shared/tls-status.txt'
```

`/health?db=1` checks PostgreSQL and returns 503 on failure (the Docker health check uses it); plain `/health` never touches the database, because on Render it is the keep-awake target. `STRICT_STARTUP=on` (set in `compose.yaml`) makes the app refuse startup with missing secrets or a database initialization error; Render runs without it. Containers restart automatically after host reboot or a process crash.

## DNS and TLS

The aHOST DNS zone serves `nimi.uz A 176.96.243.122`, `www CNAME nimi.uz` from `rdns1.ahost.uz`, `rdns2.ahost.uz`, `rdns3.ahost.uz`. At initial deployment the `.uz` registry still delegated to older aHOST DNS servers returning REFUSED. The DNS-manager selection was saved again in aHOST. Do not change unrelated domains.

`nimi-tls-setup.timer` checks public DNS every five minutes. When both Cloudflare and Google DNS return the expected IPv4 address for both hostnames, and neither returns IPv6, `enable-https.sh` obtains a Let's Encrypt certificate using the existing Certbot account and webroot, validates Nginx, gracefully reloads it, verifies HTTPS, writes `/opt/nimi/shared/tls-ready`, and disables its own timer. Until then HTTP deliberately returns 503 and does not accept login credentials.

Normal renewals use the existing `certbot.timer` and existing `/etc/letsencrypt/renewal-hooks/deploy/00-reload-nginx.sh`. The new certificate has its own renewal configuration. After activation, verify renewal with:

```sh
ssh airnet 'sudo certbot renew --cert-name nimi.uz --dry-run --no-random-sleep-on-renew'
curl -fsS https://nimi.uz/health
```

## Backups

`nimi-backup.timer` runs daily at 03:40 Tashkent time (22:40 UTC), plus up to five minutes of jitter. PostgreSQL custom-format dumps are stored in `/opt/nimi/backups`, with 14-day retention. The first dump was restored successfully to an isolated temporary verification database. Backups are on the same server; a separate off-server destination is not configured.

```sh
ssh airnet 'sudo systemctl start nimi-backup.service'
ssh airnet 'sudo systemctl status nimi-backup.timer --no-pager'
```

## Update and rollback

Upload a release to a NEW directory, excluding `.git`, `.env*`, `.deployment`, and `node_modules`. Write its unique image tag to `deploy/.env` as `RELEASE_TAG=...`. Keep `/opt/nimi/shared` and the named database volume. Build before switching. Run backups before migrations. Never run `docker compose down -v`.

```sh
cd /opt/nimi/releases/RELEASE
sudo docker compose --env-file deploy/.env -f deploy/compose.yaml build app
sudo docker compose --env-file deploy/.env -f deploy/compose.yaml up -d --wait --wait-timeout 120
ln -sfn /opt/nimi/releases/RELEASE /opt/nimi/current
```

If an update fails, run `up -d --wait` with the previous release's compose file/tag, then restore the `current` symlink. This does not roll back database migrations; inspect them before updating. The predeployment shared Nginx snapshot is `/opt/nimi/backups/nginx-before.tar.gz`; restore only Nimi's file when reverting Nimi.

## Validation

`scripts/smoke-test.js` creates a uniquely named disposable test student and parent, checks assets, accounts, sessions, access controls, progress data, trial grant and an actual Gemini streamed answer, then removes only its own records. It consumes one AI request. Run from the app container:

```sh
docker exec nimi-app-1 node scripts/smoke-test.js
# After public TLS is active:
docker exec -e SMOKE_BASE_URL=https://nimi.uz nimi-app-1 node scripts/smoke-test.js
```

Local build and syntax checks passed. Startup with missing configuration and an unreachable database was tested. Temporarily stopping only Nimi's database produced HTTP 503; restarting it restored HTTP 200. Existing shared-edge sites retained their baseline responses.
