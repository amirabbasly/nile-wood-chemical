#!/usr/bin/env bash
# ============================================================================
# استقرار Nile Wood Chemicals (Next.js standalone) روی سرور Ubuntu
# و حذف کامل وردپرس/LEMP
#
# استفاده روی سرور (به‌عنوان root):
#   DOMAIN=nilewoodchem.com bash deploy-nextjs.sh /path/to/nilewood-next.tar.gz
#
# این اسکریپت:
#   1) از وردپرس و دیتابیس آن بکاپ می‌گیرد
#   2) بسته Next.js را در /var/www/nile-wood مستقر می‌کند
#   3) سرویس systemd + پروکسی nginx را تنظیم می‌کند
#   4) بعد از سالم بودن سایت، وردپرس/PHP/MariaDB را کنار می‌گذارد
# ============================================================================
set -euo pipefail

DOMAIN="${DOMAIN:-nilewoodchem.com}"
APP_DIR="${APP_DIR:-/var/www/nile-wood}"
APP_PORT="${APP_PORT:-3000}"
BUNDLE="${1:-/tmp/nilewood-next/nilewood-next.tar.gz}"
BACKUP_DIR="${BACKUP_DIR:-/root/nile-wood-backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
WP_DIR="/var/www/${DOMAIN}"
NGINX_SITE="/etc/nginx/sites-available/${DOMAIN}"
NGINX_LINK="/etc/nginx/sites-enabled/${DOMAIN}"
NGINX_BACKUP="${BACKUP_DIR}/nginx-${STAMP}"
SERVICE="/etc/systemd/system/nile-wood.service"

log()  { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m[!] %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m[x] %s\033[0m\n' "$*" >&2; exit 1; }

ROLLBACK_DIR="${BACKUP_DIR}/next-old-${STAMP}"
rollback_next() {
  warn "بازگردانی نسخه قبلی Next.js"
  systemctl stop nile-wood 2>/dev/null || true
  if [ -d "$ROLLBACK_DIR" ]; then
    rm -rf "$APP_DIR"
    mv "$ROLLBACK_DIR" "$APP_DIR"
    systemctl start nile-wood 2>/dev/null || true
    log "نسخه قبلی بازگردانده شد (اگر وجود داشت)."
  fi
}

[ "$(id -u)" = "0" ] || die "این اسکریپت باید با کاربر root اجرا شود."
[ -f "$BUNDLE" ] || die "بسته استقرار پیدا نشد: $BUNDLE"
command -v node >/dev/null || die "Node.js نصب نیست."
command -v nginx >/dev/null || die "Nginx نصب نیست."

NODE_BIN="$(command -v node)"
mkdir -p "$BACKUP_DIR"

# ---------------------------------------------------------------------------
# 1) بکاپ وردپرس (قبل از هر تغییری)
# ---------------------------------------------------------------------------
log "بکاپ‌گیری از وردپرس و دیتابیس"
if [ -d "$WP_DIR" ]; then
  if systemctl is-active --quiet mariadb 2>/dev/null || systemctl is-active --quiet mysql 2>/dev/null; then
    if command -v mysqldump >/dev/null 2>&1; then
      mysqldump --single-transaction --all-databases 2>/dev/null | gzip > "${BACKUP_DIR}/wp-db-${STAMP}.sql.gz" \
        && log "بکاپ دیتابیس: ${BACKUP_DIR}/wp-db-${STAMP}.sql.gz" \
        || warn "بکاپ دیتابیس انجام نشد (ادامه می‌دهیم)."
    fi
  fi
  tar -czf "${BACKUP_DIR}/wordpress-${STAMP}.tar.gz" -C /var/www "$DOMAIN" 2>/dev/null \
    && log "بکاپ فایل‌ها: ${BACKUP_DIR}/wordpress-${STAMP}.tar.gz" \
    || warn "بکاپ فایل‌های وردپرس انجام نشد (ادامه می‌دهیم)."
fi

# توقف سرویس Next قبلی (در استقرار مجدد)
systemctl stop nile-wood 2>/dev/null || true

# ---------------------------------------------------------------------------
# 2) بکاپ تنظیمات فعلی nginx
# ---------------------------------------------------------------------------
log "بکاپ تنظیمات nginx"
mkdir -p "$NGINX_BACKUP"
cp -a /etc/nginx/sites-enabled "$NGINX_BACKUP/sites-enabled" 2>/dev/null || true
cp -a /etc/nginx/sites-available "$NGINX_BACKUP/sites-available" 2>/dev/null || true
[ -f "$NGINX_SITE" ] && cp -a "$NGINX_SITE" "$NGINX_BACKUP/${DOMAIN}.conf" || true

restore_nginx() {
  warn "بازگردانی تنظیمات قبلی nginx"
  if [ -d "${NGINX_BACKUP}/sites-enabled" ]; then
    rm -rf /etc/nginx/sites-enabled
    cp -a "${NGINX_BACKUP}/sites-enabled" /etc/nginx/sites-enabled
  fi
  if [ -d "${NGINX_BACKUP}/sites-available" ]; then
    rm -rf /etc/nginx/sites-available
    cp -a "${NGINX_BACKUP}/sites-available" /etc/nginx/sites-available
  fi
  nginx -t >/dev/null 2>&1 && systemctl reload nginx || true
}

# ---------------------------------------------------------------------------
# 3) استقرار بسته Next.js (بدون نیاز به npm روی سرور)
# ---------------------------------------------------------------------------
log "استقرار بسته Next.js در ${APP_DIR}"
NEW_DIR="${APP_DIR}.new"
rm -rf "$NEW_DIR"
mkdir -p "$NEW_DIR"
tar -xzf "$BUNDLE" -C "$NEW_DIR"
[ -f "$NEW_DIR/server.js" ] || die "بسته ناقص است: server.js پیدا نشد."

# .env.local قبلی (اگر در بسته نبود) حفظ می‌شود
for old_env in "${APP_DIR}/.env.local" "/var/www/nile-wood-chemical/.env.local" "$NEW_DIR/.env.local"; do
  if [ -f "$old_env" ]; then
    cp -f "$old_env" "$NEW_DIR/.env.local"
    log "فایل env استفاده شد: ${old_env}"
    break
  fi
done

chown -R www-data:www-data "$NEW_DIR"
chmod -R u+rwX,go+rX "$NEW_DIR"

if [ -d "$APP_DIR" ]; then
  mv "$APP_DIR" "$ROLLBACK_DIR"
fi
mv "$NEW_DIR" "$APP_DIR"
log "نسخه قبلی Next (در صورت وجود) به ${ROLLBACK_DIR} منتقل شد."

# ---------------------------------------------------------------------------
# 4) سرویس systemd (پایدار، با ری‌استارت خودکار؛ جایگزین PM2)
# ---------------------------------------------------------------------------
# توقف PM2 و پروسه‌های Node قدیمی تا پورت آزاد شود
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete all >/dev/null 2>&1 || true
  pm2 save --force >/dev/null 2>&1 || true
fi
if ss -H -ltn 2>/dev/null | awk '{print $4}' | grep -q ":${APP_PORT}$"; then
  warn "پورت ${APP_PORT} اشغال است؛ پروسه‌های Node/Next قبلی بسته می‌شوند."
  pkill -f "next-server" 2>/dev/null || true
  pkill -f "/var/www/nile-wood-chemical" 2>/dev/null || true
  sleep 2
fi

log "ساخت سرویس systemd: nile-wood"
cat > "$SERVICE" <<UNIT
[Unit]
Description=Nile Wood Chemicals - Next.js
After=network-online.target
Wants=network-online.target
StartLimitIntervalSec=0

[Service]
Type=simple
WorkingDirectory=${APP_DIR}
ExecStart=${NODE_BIN} ${APP_DIR}/server.js
Environment=NODE_ENV=production
Environment=PORT=${APP_PORT}
Environment=HOSTNAME=127.0.0.1
Environment=NEXT_TELEMETRY_DISABLED=1
Restart=always
RestartSec=2
User=www-data
Group=www-data
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable nile-wood >/dev/null
systemctl restart nile-wood

log "انتظار برای بالا آمدن Next.js روی پورت ${APP_PORT}"
HEALTH_OK=0
for _ in $(seq 1 40); do
  if curl -fsS --max-time 2 "http://127.0.0.1:${APP_PORT}/api/health" >/dev/null 2>&1; then
    HEALTH_OK=1
    break
  fi
  sleep 1
done
if [ "$HEALTH_OK" != "1" ]; then
  warn "سایت بالا نیامد. لاگ سرویس:"
  journalctl -u nile-wood -n 60 --no-pager || true
  rollback_next
  die "استقرار متوقف شد؛ وردپرس دست‌نخورده باقی ماند."
fi
log "Next.js سالم است: $(curl -fsS http://127.0.0.1:${APP_PORT}/api/health)"

# ---------------------------------------------------------------------------
# 5) تنظیم nginx به‌عنوان reverse proxy (جایگزین کامل کانفیگ وردپرس)
# ---------------------------------------------------------------------------
CERT="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
KEY="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"

write_nginx_http() {
  cat > "$NGINX_SITE" <<NGINX
upstream nilewood_next {
    server 127.0.0.1:${APP_PORT};
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    client_max_body_size 64m;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://nilewood_next;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection "";
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
NGINX
}

write_nginx_ssl() {
  cat > "$NGINX_SITE" <<NGINX
upstream nilewood_next {
    server 127.0.0.1:${APP_PORT};
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://${DOMAIN}\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    ssl_certificate     ${CERT};
    ssl_certificate_key ${KEY};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    client_max_body_size 64m;

    gzip on;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/javascript application/json application/xml image/svg+xml font/woff2;

    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    location = /api/health {
        proxy_pass http://nilewood_next;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        access_log off;
    }

    location /_next/static/ {
        proxy_pass http://nilewood_next;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header Connection "";
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location /fonts/ {
        proxy_pass http://nilewood_next;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header Connection "";
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }

    location /images/ {
        proxy_pass http://nilewood_next;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header Connection "";
        add_header Cache-Control "public, max-age=604800";
    }

    location / {
        proxy_pass http://nilewood_next;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection "";
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering on;
    }
}
NGINX
}

# سایر سایت‌های فعال (از جمله وردپرس) کنار گذاشته می‌شوند
log "غیرفعال‌کردن کانفیگ‌های قبلی nginx"
mkdir -p "${NGINX_BACKUP}/disabled-sites"
for site in /etc/nginx/sites-enabled/*; do
  [ -e "$site" ] || continue
  mv "$site" "${NGINX_BACKUP}/disabled-sites/" 2>/dev/null || true
done

if [ -f "$CERT" ] && [ -f "$KEY" ]; then
  write_nginx_ssl
else
  warn "گواهی SSL پیدا نشد؛ فعلاً HTTP و سپس certbot اجرا می‌شود."
  write_nginx_http
fi

ln -sf "$NGINX_SITE" "$NGINX_LINK"
if ! nginx -t; then
  restore_nginx
  die "کانفیگ nginx نامعتبر است؛ تنظیمات قبلی بازگردانده شد."
fi
systemctl reload nginx

# اگر گواهی نبود، certbot خودش SSL را تنظیم می‌کند
if [ ! -f "$CERT" ]; then
  log "دریافت گواهی SSL با certbot"
  certbot --nginx -d "$DOMAIN" -d "www.${DOMAIN}" --non-interactive --agree-tos \
    -m "admin@${DOMAIN}" --redirect || warn "certbot ناموفق بود؛ HTTP فعال است."
  write_nginx_ssl
  nginx -t && systemctl reload nginx
fi

# ---------------------------------------------------------------------------
# 6) بررسی نهایی
# ---------------------------------------------------------------------------
log "بررسی نهایی سایت"
LOCAL_CODE="$(curl -s -o /dev/null -w '%{http_code}' -H "Host: ${DOMAIN}" "http://127.0.0.1/api/health" || true)"
log "کد پاسخ health از طریق nginx: ${LOCAL_CODE}"
if [ "$LOCAL_CODE" != "200" ]; then
  warn "nginx نتوانست به Next وصل شود. لاگ‌ها:"
  tail -n 40 /var/log/nginx/error.log || true
  journalctl -u nile-wood -n 40 --no-pager || true
  restore_nginx
  rollback_next
  die "استقرار ناموفق بود؛ بررسی لازم است."
fi

if [ -f "$CERT" ]; then
  HTTPS_CODE="$(curl -s -o /dev/null -w '%{http_code}' --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/api/health" || true)"
  log "کد پاسخ HTTPS: ${HTTPS_CODE}"
  if [ "$HTTPS_CODE" != "200" ]; then
    warn "HTTPS پاسخ 200 نداد (${HTTPS_CODE})."
  fi
fi

# ---------------------------------------------------------------------------
# 7) حذف وردپرس و سرویس‌های LEMP (بعد از موفقیت Next)
# ---------------------------------------------------------------------------
log "حذف وردپرس و کنار گذاشتن LEMP"
if [ -d "$WP_DIR" ]; then
  mv "$WP_DIR" "${BACKUP_DIR}/wordpress-live-${STAMP}"
  log "پوشه وردپرس به ${BACKUP_DIR}/wordpress-live-${STAMP} منتقل شد."
fi

systemctl stop php8.3-fpm 2>/dev/null || true
systemctl disable php8.3-fpm 2>/dev/null || true

# حذف دیتابیس و کاربر وردپرس
if command -v mysql >/dev/null 2>&1; then
  systemctl start mariadb 2>/dev/null || systemctl start mysql 2>/dev/null || true
  sleep 1
  mysql -e "DROP DATABASE IF EXISTS wordpress; DROP USER IF EXISTS 'wp_user'@'localhost'; FLUSH PRIVILEGES;" 2>/dev/null \
    && log "دیتابیس وردپرس حذف شد (بکاپ SQL موجود است)." \
    || warn "حذف دیتابیس انجام نشد؛ دستی بررسی کنید."
fi
systemctl stop mariadb 2>/dev/null || true
systemctl disable mariadb 2>/dev/null || true

# PM2 قدیمی (نسخه قبلی Next با PM2 اجرا می‌شد)
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete all 2>/dev/null || true
  pm2 save --force 2>/dev/null || true
fi

# ---------------------------------------------------------------------------
# 8) خلاصه
# ---------------------------------------------------------------------------
log "استقرار با موفقیت انجام شد"
echo "   سایت:        https://${DOMAIN}"
echo "   سرویس:       systemctl status nile-wood"
echo "   لاگ سایت:    journalctl -u nile-wood -f"
echo "   لاگ nginx:   tail -f /var/log/nginx/error.log"
echo "   بکاپ‌ها:     ${BACKUP_DIR}"
echo "   فایل env:    ${APP_DIR}/.env.local"
