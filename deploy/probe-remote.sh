#!/usr/bin/env bash
# تست‌های خواندنی روی سرور (برای عیب‌یابی اتصال و وضعیت استقرار)
echo "=== date ==="; date -Is
echo "=== /tmp/nilewood-next ==="; ls -lh /tmp/nilewood-next/ 2>&1
S1=$(stat -c %s /tmp/nilewood-next/nilewood-next.tar.gz 2>/dev/null || echo 0)
sleep 5
S2=$(stat -c %s /tmp/nilewood-next/nilewood-next.tar.gz 2>/dev/null || echo 0)
echo "tarball bytes: $S1 -> $S2 in 5s"
echo "=== processes ==="; ps aux | grep -E "scp|deploy-nextjs|server.js|next-server|sshpass|certbot" | grep -v grep
echo "=== ports ==="; ss -ltnp 2>/dev/null | grep -E ":(3000|80|443)"
echo "=== service ==="; systemctl status nile-wood --no-pager 2>&1 | head -12
echo "=== /var/www ==="; ls -la /var/www/ 2>&1
echo "=== backups ==="; ls -lht /root/nile-wood-backups/ 2>&1 | head -10
echo "=== disk ==="; df -h / | tail -1
echo "=== site local ==="; curl -s -o /dev/null -w "next health: %{http_code}\n" --max-time 5 http://127.0.0.1:3000/api/health || true
echo "=== network tests ==="
timeout 20 curl -sS -o /dev/null -w "npmjs: %{http_code} in %{time_total}s\n" https://registry.npmjs.org/next 2>&1 || echo "npmjs: FAILED"
timeout 20 curl -sS -o /dev/null -w "npmmirror: %{http_code} in %{time_total}s\n" https://registry.npmmirror.com/next 2>&1 || echo "npmmirror: FAILED"
timeout 20 curl -sS -o /dev/null -w "github: %{http_code} in %{time_total}s\n" https://github.com 2>&1 || echo "github: FAILED"
timeout 20 curl -sS -o /dev/null -w "codeload: %{http_code} in %{time_total}s\n" https://codeload.github.com/amirabbasly/nile-wood-chemical/tar.gz/refs/heads/main 2>&1 || echo "codeload: FAILED"
echo "=== git clone test (depth 1) ==="
rm -rf /tmp/probe-clone
START=$(date +%s)
timeout 180 git clone --depth=1 --single-branch --branch arena/6171edff-nile-wood-chemical https://github.com/amirabbasly/nile-wood-chemical.git /tmp/probe-clone 2>&1 | tail -5
RC=$?
END=$(date +%s)
echo "clone exit=$RC duration=$((END-START))s size=$(du -sh /tmp/probe-clone 2>/dev/null | cut -f1)"
echo "=== nginx active site ==="; grep -R "proxy_pass\|root " /etc/nginx/sites-enabled/ 2>/dev/null | head
echo "=== nginx error tail ==="; tail -n 20 /var/log/nginx/error.log 2>/dev/null
