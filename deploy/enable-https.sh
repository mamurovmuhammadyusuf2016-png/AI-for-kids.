#!/bin/bash
# Retry safely until public DNS reaches airnet; only writes Nimi's nginx file.
set -euo pipefail
exec 9>/opt/nimi/shared/tls-setup.lock
flock -n 9 || exit 0
status=/opt/nimi/shared/tls-status.txt
expected=176.96.243.122
if [[ -f /opt/nimi/shared/tls-ready ]]; then exit 0; fi
for resolver in 1.1.1.1 8.8.8.8; do
  for domain in nimi.uz www.nimi.uz; do
    addresses=$(dig +time=4 +tries=1 +short "@$resolver" "$domain" A | grep -E '^[0-9.]+$' || true)
    ipv6=$(dig +time=4 +tries=1 +short "@$resolver" "$domain" AAAA | grep ':' || true)
    if [[ "$addresses" != "$expected" || -n "$ipv6" ]]; then
      printf '%s Waiting for public DNS: %s via %s\n' "$(date -u +%FT%TZ)" "$domain" "$resolver" | tee "$status"
      exit 0
    fi
  done
done
curl --fail --silent --max-time 15 http://127.0.0.1:18320/health >/dev/null
printf '%s Public DNS ready; requesting certificate\n' "$(date -u +%FT%TZ)" | tee "$status"
certbot certonly --non-interactive --webroot -w /root/nexus_ai/certbot/www \
  --account 7c0dc3d2b7a51c4ea0095e75234b451d \
  --cert-name nimi.uz -d nimi.uz -d www.nimi.uz --keep-until-expiring
conf=/root/nexus_ai/nginx/conf.d/nimi.uz.conf
cp "$conf" /opt/nimi/backups/nimi-before-https.conf
install -m 644 /opt/nimi/current/deploy/nginx-https.conf "${conf}.new"
mv "${conf}.new" "$conf"
if ! docker exec nexus_ai-nginx-1 nginx -t; then
  cp /opt/nimi/backups/nimi-before-https.conf "$conf"
  exit 1
fi
docker exec nexus_ai-nginx-1 nginx -s reload
curl --fail --silent --retry 3 --retry-delay 2 --max-time 20 \
  --resolve nimi.uz:443:127.0.0.1 https://nimi.uz/health >/dev/null
printf '%s HTTPS ready: https://nimi.uz\n' "$(date -u +%FT%TZ)" | tee "$status"
touch /opt/nimi/shared/tls-ready
systemctl disable --now nimi-tls-setup.timer
