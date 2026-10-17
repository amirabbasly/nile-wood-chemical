#!/usr/bin/env bash
# جمع‌آوری اطلاعات سرور برای تشخیص علت 502 (فقط خواندن، بدون تغییر)
# اجرا: bash diagnose.sh
DOMAIN="${DOMAIN:-nilewoodchem.com}"
echo "=========== DIAGNOSTICS $(date -Is) ==========="
echo "--- hostname / uptime ---"
hostname; uptime
echo
echo "--- nginx error log (آخرین ۳۰۰ خط) ---"
tail -n 300 /var/log/nginx/error.log 2>/dev/null || echo "no error log"
echo
echo "--- پاسخ‌های 502 در access log ---"
zgrep -h " 502 " /var/log/nginx/access.log* 2>/dev/null | tail -n 100 || echo "no 502 in logs"
echo
echo "--- درخواست‌های موبایل با کد 502 ---"
zgrep -hiE "(iphone|android|mobile).* 502 |502 .*(iphone|android|mobile)" /var/log/nginx/access.log* 2>/dev/null | tail -n 50 || echo "none"
echo
echo "--- سرویس php-fpm ---"
systemctl status php8.3-fpm --no-pager 2>&1 | head -40 || true
echo
echo "--- تنظیمات PHP-FPM pool ---"
grep -R "^pm\|max_children\|request_terminate" /etc/php/8.3/fpm/pool.d/ 2>/dev/null || echo "no pool config"
echo
echo "--- خطاهای php-fpm ---"
tail -n 120 /var/log/php8.3-fpm.log 2>/dev/null || echo "no php-fpm log"
echo
echo "--- OOM / kill در kernel ---"
journalctl -k --since "14 days ago" --no-pager 2>/dev/null | grep -iE "out of memory|oom-kill|killed process" | tail -n 30 || echo "none"
echo
echo "--- تصمیم‌های CrowdSec (بلاک IP) ---"
cscli decisions list 2>&1 | head -60 || echo "crowdsec not available"
echo
echo "--- پورت‌های LISTEN ---"
ss -tlnp 2>/dev/null | head -30
echo
echo "--- تست محلی با User-Agent موبایل ---"
echo -n "desktop UA : "
curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36" -H "Host: ${DOMAIN}" http://127.0.0.1/ || true
echo -n "iPhone UA  : "
curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" -H "Host: ${DOMAIN}" http://127.0.0.1/ || true
echo -n "Android UA : "
curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36" -H "Host: ${DOMAIN}" http://127.0.0.1/ || true
echo
echo "--- کانفیگ فعال nginx ---"
nginx -T 2>/dev/null | grep -vE "ssl_certificate|ssl_trusted" | head -n 400 || true
echo
echo "--- وضعیت PM2 ---"
pm2 ls 2>/dev/null || echo "pm2 not running"
echo "=========== END DIAGNOSTICS ==========="
