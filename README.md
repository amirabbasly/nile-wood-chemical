# Nile Wood Chemicals

فروشگاه کامل فارسی و راست‌چین برای محصولات رنگ چوب، مواد شیمیایی، پوشش‌های محافظتی، روغن چوب، کیلر، سیلر، بتونه، تینر و رزین.

## اجرا

```bash
npm install
npm run dev
```

فایل `.env.example` را به `.env.local` تبدیل کنید و مقادیر Supabase و زرین‌پال را وارد کنید.

## Supabase

اسکریپت کامل دیتابیس، RLS، trigger ساخت profile و policyهای Storage در مسیر زیر قرار دارد:

```text
supabase/schema.sql
```

بعد از اجرای SQL، برای ادمین کردن یک کاربر:

```sql
update public.profiles set role = 'admin' where email = 'admin@example.com';
```

## مسیرهای اصلی

- `/` صفحه اصلی
- `/shop` و `/products` فروشگاه و محصولات
- `/products/[slug]` جزئیات محصول
- `/cart` سبد خرید
- `/account/orders` سفارشات کاربر و دکمه نهایی کردن سفارش
- `/payment/callback` callback پرداخت
- `/blog` و `/blog/[slug]` مجله
- `/wholesale` فرم خرید عمده
- `/nile-admin-wood-control` مسیر مخفی پنل ادمین

مسیر `/admin` عمداً 404 است و در منوی سایت هم لینک ادمین نمایش داده نمی‌شود.
برای ورود اولیه پنل، مقادیر زیر را در `.env.local` تنظیم کنید. بعد از این مرحله،
اگر Supabase فعال باشد نقش `admin` از جدول `profiles` هم بررسی می‌شود.

```text
NEXT_PUBLIC_ADMIN_PANEL_USERNAME=
NEXT_PUBLIC_ADMIN_PANEL_PASSWORD=
```

در پنل ادمین، تب «مدیریت تصاویر سایت» برای تغییر همه تصاویر استفاده‌شده در
صفحه اصلی، درباره ما، محصولات، مقالات و اسلایدر برندها اضافه شده است. این بخش
در Supabase از جدول `site_assets` و bucket `public-assets` استفاده می‌کند.

## پرداخت زرین‌پال

متغیرهای زیر را تنظیم کنید:

```text
NEXT_PUBLIC_ZARINPAL_MERCHANT_ID=
NEXT_PUBLIC_ZARINPAL_CALLBACK_URL=http://localhost:3000/payment/callback
```

برای production توصیه می‌شود مرحله verification و نگهداری Merchant ID در Supabase Edge Function انجام شود.
