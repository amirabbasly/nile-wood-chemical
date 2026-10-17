# راهنمای استقرار Next.js روی سرور و حذف وردپرس

این سند دقیقاً همان کاری را توضیح می‌دهد که برای رفع خطای **502 Bad Gateway** (که فقط روی موبایل دیده می‌شد) انجام شد.

---

## ۱) چرا روی موبایل 502 می‌داد ولی دسکتاپ خوب بود؟

502 یعنی «کسی که جلوی سایت است (nginx) از سرویس پشت آن (PHP-FPM در وردپرس یا Node در Next) جواب نگرفت».
با وردپرس + Nginx + PHP-FPM روی همین سرور، سه علت رایج و دقیقاً «موبایل‌محور» وجود دارد:

1. **تمام‌شدن کارگرهای PHP-FPM (مهم‌ترین علت)**
   تنظیمات پیش‌فرض Ubuntu برای PHP-FPM مقدار `pm.max_children = 5` دارد. وردپرس + ووکامرس هر درخواست را سنگین می‌کند و موبایل‌ها به‌خاطر شبکه کندتر و باز کردن چند اتصال همزمان، هر کارگر را بیشتر اشغال می‌کنند. وقتی هر ۵ کارگر مشغول باشند، nginx خطای
   `connect() to unix:/run/php/php8.3-fpm.sock failed (11: Resource temporarily unavailable)`
   می‌دهد و همان **502** را نشان می‌دهد. دسکتاپ چون سریع‌تر پاسخ می‌گیرد، کمتر به این وضعیت می‌خورد.
2. **CrowdSec / محدودیت IP اپراتورهای موبایل**
   شبکه موبایل از CGNAT استفاده می‌کند؛ یعنی هزاران کاربر یک IP مشترک دارند. یک بلاک یا rate-limit روی آن IP، همه کاربران موبایل را می‌بندد.
   با `cscli decisions list` روی سرور قابل بررسی است.
3. **کش اپراتور / DNS متفاوت موبایل**
   بعضی اپراتورها پاسخ‌ها را کش می‌کنند؛ اگر سایتی لحظه‌ای پایین بوده باشد، ممکن است مدتی همان 502 کش‌شده به موبایل تحویل داده شود، در حالی که Wi‑Fi/دسکتاپ پاسخ تازه می‌گیرد.

برای همین، در استقرار جدید:

- وردپرس، PHP-FPM و MariaDB به‌طور کامل کنار گذاشته شدند.
- Next.js به‌جای PM2 با **systemd** اجرا می‌شود: ری‌استارت خودکار، لاگ کامل، بدون خواب‌رفتن پروسه.
- nginx به‌صورت reverse proxy با `keepalive`، تایم‌اوت‌های مناسب موبایل، gzip و کش فایل‌های استاتیک تنظیم شد.
- یک مسیر سلامت `/api/health` اضافه شد تا هر لحظه بشود بررسی کرد سرویس بالاست یا نه.

---

## ۲) استقرار خودکار (پیشنهادی)

فایل `.github/workflows/deploy-next.yml` این کارها را انجام می‌دهد:

1. بیلد Next.js را روی GitHub Actions انجام می‌دهد (سرور ایران به npm و GitHub نیاز پیدا نمی‌کند).
2. `.env.local` موجود روی سرور را می‌خواند تا متغیرهای Supabase/زرین‌پال حفظ شوند.
3. بسته آماده (`standalone`) را با SCP روی سرور می‌فرستد.
4. اسکریپت `deploy/deploy-nextjs.sh` را اجرا می‌کند که:
   - از وردپرس و دیتابیسش بکاپ می‌گیرد،
   - بسته Next را در `/var/www/nile-wood` مستقر می‌کند،
   - سرویس `nile-wood.service` را می‌سازد،
   - کانفیگ nginx را جایگزین می‌کند و SSL موجود Let's Encrypt را حفظ می‌کند،
   - بعد از سالم‌بودن سایت، وردپرس/PHP/MariaDB را غیرفعال و دیتابیس وردپرس را حذف می‌کند.

اجرای دستی از تب Actions:

> Actions → **Deploy Next.js to production** → Run workflow

اگر فقط می‌خواهید لاگ‌های سرور را ببینید (بدون تغییر)، گزینه **diagnose_only** را روشن کنید.

پوش به شاخه `main` هم به‌صورت خودکار مستقر می‌کند.

### سکرت‌های لازم (Settings → Secrets and variables → Actions)

| نام | توضیح |
|---|---|
| `SERVER_HOST` | IP سرور |
| `SERVER_PORT` | پورت SSH (مثلاً 22) |
| `SERVER_USER` | کاربر SSH (root) |
| `SERVER_PASSWORD` | رمز SSH |

سکرت‌های قدیمی `WP_ADMIN_*` را می‌توانید حذف کنید.

---

## ۳) استقرار دستی روی سرور (بدون GitHub Actions)

اگر می‌خواهید همه‌چیز را دستی انجام دهید:

```bash
# ۱) روی کامپیوتر خودتان: بیلد و بسته‌بندی
npm ci
npm run build
rm -rf bundle nilewood-next.tar.gz && mkdir -p bundle
cp -a .next/standalone/. bundle/
mkdir -p bundle/.next && cp -a .next/static bundle/.next/static
cp -a public bundle/public
[ -f .env.local ] && cp .env.local bundle/.env.local
tar -czf nilewood-next.tar.gz -C bundle .

# ۲) ارسال به سرور
scp nilewood-next.tar.gz deploy/deploy-nextjs.sh root@SERVER_IP:/tmp/nilewood-next/

# ۳) اجرا روی سرور
ssh root@SERVER_IP
DOMAIN=nilewoodchem.com bash /tmp/nilewood-next/deploy-nextjs.sh /tmp/nilewood-next/nilewood-next.tar.gz
```

اسکریپت خودش بکاپ می‌گیرد، سرویس می‌سازد و وردپرس را کنار می‌گذارد. اگر جایی خطا بدهد، وردپرس دست‌نخورده می‌ماند.

---

## ۴) حذف کامل وردپرس (چک‌لیست دستی)

اسکریپت استقرار این کارها را خودکار انجام می‌دهد، ولی برای مرجع:

```bash
# بکاپ
mkdir -p /root/nile-wood-backups
mysqldump --single-transaction --all-databases | gzip > /root/nile-wood-backups/wp-db.sql.gz
tar -czf /root/nile-wood-backups/wordpress.tar.gz -C /var/www nilewoodchem.com

# توقف سرویس‌ها
systemctl stop php8.3-fpm mariadb
systemctl disable php8.3-fpm mariadb

# حذف فایل‌ها و دیتابیس
mv /var/www/nilewoodchem.com /root/nile-wood-backups/wordpress-live
mysql -e "DROP DATABASE IF EXISTS wordpress; DROP USER IF EXISTS 'wp_user'@'localhost'; FLUSH PRIVILEGES;"

# حذف کانفیگ nginx وردپرس
rm -f /etc/nginx/sites-enabled/nilewoodchem.com
nginx -t && systemctl reload nginx
```

> اگر دیگر به PHP و MariaDB نیازی ندارید (مثلاً سرور فقط برای همین سایت است):
> `apt-get purge -y php8.3-* mariadb-server mariadb-client` — اختیاری.

از نظر گیت هم:

- پوشه `wordpress/` در `.gitignore` قرار گرفت و هرگز دوباره کامیت نمی‌شود.
- شاخه‌ای که کد وردپرس و ورک‌فلو `deploy-wordpress.yml` روی آن بود حذف شد؛ بنابراین در مخزن هیچ فایل وردپرسی باقی نمانده است.

---

## ۵) بررسی سلامت بعد از استقرار

```bash
systemctl status nile-wood          # باید active (running) باشد
curl -s http://127.0.0.1:3000/api/health
curl -sI https://nilewoodchem.com  # باید 200 بدهد
journalctl -u nile-wood -f         # لاگ لحظه‌ای سایت
tail -f /var/log/nginx/error.log   # خطاهای nginx
```

اگر دوباره 502 دیدید:

```bash
curl -s http://127.0.0.1:3000/api/health   # اگر جواب نداد، مشکل خود سرویس است
systemctl restart nile-wood
journalctl -u nile-wood -n 100 --no-pager
```

و اگر فقط روی موبایل بود، احتمالاً کش اپراتور یا DNS موبایل است؛ با داده موبایل و یک DNS دیگر (مثلاً ۱.۱.۱.۱) تست کنید و `cscli decisions list` را روی سرور ببینید.
