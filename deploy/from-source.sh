#!/usr/bin/env bash
# ============================================================================
# بیلد Next.js روی خود سرور و سپس استقرار آن (بدون آپلود بسته از بیرون)
# مناسب وقتی سرور به GitHub و npm دسترسی دارد یا آپلود بسته بزرگ کند است.
#
# استفاده روی سرور:
#   DOMAIN=nilewoodchem.com BRANCH=main bash from-source.sh
# ============================================================================
set -euo pipefail

DOMAIN="${DOMAIN:-nilewoodchem.com}"
BRANCH="${BRANCH:-main}"
REPO_URL="${REPO_URL:-https://github.com/amirabbasly/nile-wood-chemical.git}"
SRC_DIR="${SRC_DIR:-/tmp/nilewood-src}"
BUILD_DIR="${BUILD_DIR:-/tmp/nilewood-build}"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
BUNDLE="${SCRIPTS_DIR}/nilewood-next.tar.gz"

log()  { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m[!] %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m[x] %s\033[0m\n' "$*" >&2; exit 1; }

command -v git  >/dev/null || die "git نصب نیست."
command -v node >/dev/null || die "Node.js نصب نیست."
command -v npm  >/dev/null || die "npm نصب نیست."

log "دریافت سورس از GitHub (شاخه ${BRANCH})"
rm -rf "$SRC_DIR"
git clone --depth=1 --single-branch --branch "$BRANCH" "$REPO_URL" "$SRC_DIR" \
  || die "git clone ناموفق بود؛ اتصال سرور به GitHub را بررسی کنید یا از حالت bundle استفاده کنید."

# .env.local را از استقرار قبلی نگه می‌داریم
for f in /var/www/nile-wood/.env.local /var/www/nile-wood-chemical/.env.local; do
  if [ -f "$f" ]; then
    cp -f "$f" "$SRC_DIR/.env.local"
    log "فایل env از ${f} کپی شد."
    break
  fi
done
if [ ! -f "$SRC_DIR/.env.local" ] && [ -f "${SCRIPTS_DIR}/.env.local" ]; then
  cp -f "${SCRIPTS_DIR}/.env.local" "$SRC_DIR/.env.local"
fi
[ -f "$SRC_DIR/.env.local" ] || warn "بدون .env.local بیلد می‌شود (Supabase/زرین‌پال غیرفعال)."

cd "$SRC_DIR"

log "نصب وابستگی‌ها (npm ci)"
if ! npm ci --no-audit --no-fund --registry=https://registry.npmjs.org/; then
  warn "نصب از registry.npmjs.org ناموفق بود؛ تلاش با npmmirror"
  rm -rf node_modules
  npm ci --no-audit --no-fund --registry=https://registry.npmmirror.com/
fi

log "بیلد production"
npm run build

log "ساخت بسته standalone"
rm -rf "$BUILD_DIR"
mkdir -p "${BUILD_DIR}/bundle/.next"
cp -a .next/standalone/. "${BUILD_DIR}/bundle/"
cp -a .next/static "${BUILD_DIR}/bundle/.next/static"
cp -a public "${BUILD_DIR}/bundle/public"
if [ -f .env.local ]; then cp -f .env.local "${BUILD_DIR}/bundle/.env.local"; fi
tar -czf "$BUNDLE" -C "${BUILD_DIR}/bundle" .
log "بسته ساخته شد: $(du -h "$BUNDLE" | cut -f1)"

log "اجرای استقرار"
DOMAIN="$DOMAIN" bash "${SCRIPTS_DIR}/deploy-nextjs.sh" "$BUNDLE"
