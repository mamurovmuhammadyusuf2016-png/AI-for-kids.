#!/bin/bash
set -euo pipefail
umask 077
exec 9>/opt/nimi/backups/.lock
flock -n 9 || exit 0
cd /opt/nimi/current
backup="/opt/nimi/backups/nimi-$(date -u +%Y%m%dT%H%M%SZ).dump"
trap 'rm -f "${backup}.partial"' EXIT
docker compose --env-file deploy/.env -f deploy/compose.yaml exec -T postgres pg_dump -U nimi -d nimi -Fc > "${backup}.partial"
test -s "${backup}.partial"
mv "${backup}.partial" "$backup"
# Retain two weeks; only this project's timestamped database dumps are pruned.
find /opt/nimi/backups -maxdepth 1 -type f -name 'nimi-????????T??????Z.dump' -mtime +14 -delete
