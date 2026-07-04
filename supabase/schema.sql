create extension if not exists "pgcrypto";

-- Username login/register note:
-- The app stores usernames in public.profiles.username and uses a synthetic
-- auth email like username@nilewoodchemicals.local for Supabase Auth.
-- In Supabase Dashboard, disable:
-- Authentication > Providers > Email > Confirm email
-- This setting cannot be changed from the SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  username text,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists username text;
create unique index if not exists profiles_username_unique
on public.profiles (lower(username))
where username is not null and username <> '';

create table if not exists public.product_categories (
  id text primary key,
  title text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  price numeric(12, 0) not null check (price >= 0),
  old_price numeric(12, 0),
  stock integer not null default 0 check (stock >= 0),
  category_id text references public.product_categories(id) on delete set null,
  brand text,
  image_url text,
  summary text,
  description text,
  features text[] not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  total_amount numeric(12, 0) not null default 0,
  payment_status text not null default 'در انتظار پرداخت',
  order_status text not null default 'در انتظار پرداخت',
  customer_name text,
  customer_phone text,
  customer_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 0) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_categories (
  id text primary key,
  title text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  author text,
  category_id text references public.blog_categories(id) on delete set null,
  image_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wholesale_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  company text,
  product_type text not null,
  quantity text not null,
  description text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  authority text,
  ref_id text,
  status text not null default 'pending',
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site_assets (
  key text primary key,
  label text not null,
  image_url text not null,
  group_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, username, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    nullif(lower(coalesce(new.raw_user_meta_data->>'username', '')), ''),
    new.email,
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.wholesale_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.site_assets enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_content enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
drop policy if exists "profiles_update_self_or_admin" on public.profiles;
drop policy if exists "categories_public_read" on public.product_categories;
drop policy if exists "categories_admin_all" on public.product_categories;
drop policy if exists "products_public_read_published" on public.products;
drop policy if exists "products_admin_all" on public.products;
drop policy if exists "cart_owner_all" on public.cart_items;
drop policy if exists "orders_owner_or_admin_select" on public.orders;
drop policy if exists "orders_owner_insert" on public.orders;
drop policy if exists "orders_owner_update_pending_or_admin" on public.orders;
drop policy if exists "order_items_owner_or_admin_select" on public.order_items;
drop policy if exists "order_items_owner_insert" on public.order_items;
drop policy if exists "order_items_admin_all" on public.order_items;
drop policy if exists "blog_categories_public_read" on public.blog_categories;
drop policy if exists "blog_categories_admin_all" on public.blog_categories;
drop policy if exists "blog_posts_public_read_published" on public.blog_posts;
drop policy if exists "blog_posts_admin_all" on public.blog_posts;
drop policy if exists "wholesale_insert_anyone" on public.wholesale_requests;
drop policy if exists "wholesale_admin_read_update" on public.wholesale_requests;
drop policy if exists "contact_insert_anyone" on public.contact_messages;
drop policy if exists "contact_admin_read_update" on public.contact_messages;
drop policy if exists "payments_owner_or_admin_select" on public.payment_transactions;
drop policy if exists "payments_insert_anyone_for_order" on public.payment_transactions;
drop policy if exists "payments_admin_all" on public.payment_transactions;
drop policy if exists "site_assets_public_read" on public.site_assets;
drop policy if exists "site_assets_admin_all" on public.site_assets;
drop policy if exists "site_settings_public_read" on public.site_settings;
drop policy if exists "site_settings_admin_all" on public.site_settings;
drop policy if exists "site_content_public_read" on public.site_content;
drop policy if exists "site_content_admin_all" on public.site_content;

create policy "profiles_select_self_or_admin" on public.profiles
for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_self_or_admin" on public.profiles
for update using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

create policy "categories_public_read" on public.product_categories
for select using (true);
create policy "categories_admin_all" on public.product_categories
for all using (public.is_admin()) with check (public.is_admin());

create policy "products_public_read_published" on public.products
for select using (published = true or public.is_admin());
create policy "products_admin_all" on public.products
for all using (public.is_admin()) with check (public.is_admin());

create policy "cart_owner_all" on public.cart_items
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "orders_owner_or_admin_select" on public.orders
for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_owner_insert" on public.orders
for insert with check (auth.uid() = user_id or user_id is null);
create policy "orders_owner_update_pending_or_admin" on public.orders
for update using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

create policy "order_items_owner_or_admin_select" on public.order_items
for select using (
  public.is_admin()
  or exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.user_id = auth.uid()
  )
);
create policy "order_items_owner_insert" on public.order_items
for insert with check (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and (orders.user_id = auth.uid() or orders.user_id is null)
  )
);
create policy "order_items_admin_all" on public.order_items
for all using (public.is_admin()) with check (public.is_admin());

create policy "blog_categories_public_read" on public.blog_categories
for select using (true);
create policy "blog_categories_admin_all" on public.blog_categories
for all using (public.is_admin()) with check (public.is_admin());

create policy "blog_posts_public_read_published" on public.blog_posts
for select using (published = true or public.is_admin());
create policy "blog_posts_admin_all" on public.blog_posts
for all using (public.is_admin()) with check (public.is_admin());

create policy "wholesale_insert_anyone" on public.wholesale_requests
for insert with check (true);
create policy "wholesale_admin_read_update" on public.wholesale_requests
for all using (public.is_admin()) with check (public.is_admin());

create policy "contact_insert_anyone" on public.contact_messages
for insert with check (true);
create policy "contact_admin_read_update" on public.contact_messages
for all using (public.is_admin()) with check (public.is_admin());

create policy "payments_owner_or_admin_select" on public.payment_transactions
for select using (
  public.is_admin()
  or exists (
    select 1 from public.orders
    where orders.id = payment_transactions.order_id and orders.user_id = auth.uid()
  )
);
create policy "payments_insert_anyone_for_order" on public.payment_transactions
for insert with check (true);
create policy "payments_admin_all" on public.payment_transactions
for all using (public.is_admin()) with check (public.is_admin());

create policy "site_assets_public_read" on public.site_assets
for select using (true);
create policy "site_assets_admin_all" on public.site_assets
for all using (public.is_admin()) with check (public.is_admin());

create policy "site_settings_public_read" on public.site_settings
for select using (true);
create policy "site_settings_admin_all" on public.site_settings
for all using (public.is_admin()) with check (public.is_admin());

create policy "site_content_public_read" on public.site_content
for select using (true);
create policy "site_content_admin_all" on public.site_content
for all using (public.is_admin()) with check (public.is_admin());

insert into public.product_categories (id, title, slug, description) values
('wood-stain', 'رنگ چوب', 'wood-stain', 'رنگ‌های پایه آب و پایه حلال برای چوب'),
('wood-oil', 'روغن چوب', 'wood-oil', 'روغن‌های محافظ و دکوراتیو'),
('clear-coat', 'کیلر و سیلر', 'clear-coat', 'پوشش‌های شفاف صنعتی'),
('chemicals', 'مواد شیمیایی', 'chemicals', 'تینر، رزین و مکمل‌ها'),
('putty', 'بتونه و ترمیم', 'putty', 'بتونه و محصولات آماده‌سازی سطح')
on conflict (id) do nothing;

insert into public.blog_categories (id, title, slug) values
('guides', 'راهنمای اجرا', 'guides'),
('industry', 'دانش صنعتی', 'industry'),
('maintenance', 'نگهداری چوب', 'maintenance')
on conflict (id) do nothing;

insert into public.site_assets (key, label, image_url, group_name) values
('hero-main', 'تصویر هیرو اسلاید ۱', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=85', 'خانه'),
('hero-slide-2', 'تصویر هیرو اسلاید ۲', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=85', 'خانه'),
('hero-slide-3', 'تصویر هیرو اسلاید ۳', 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1200&q=85', 'خانه'),
('about-main', 'تصویر درباره ما', 'https://images.unsplash.com/photo-1604014238170-4def1e4e6fcf?auto=format&fit=crop&w=1000&q=80', 'خانه'),
('category-wood-stain', 'دسته‌بندی رنگ چوب', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=700&q=85', 'دسته‌بندی'),
('category-wood-oil', 'دسته‌بندی روغن چوب', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=700&q=85', 'دسته‌بندی'),
('category-clear-coat', 'دسته‌بندی کیلر و سیلر', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=700&q=85', 'دسته‌بندی'),
('category-chemicals', 'دسته‌بندی مواد شیمیایی', 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=700&q=85', 'دسته‌بندی'),
('category-putty', 'دسته‌بندی بتونه و ترمیم', 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=700&q=85', 'دسته‌بندی'),
('service-consulting', 'خدمت مشاوره انتخاب پوشش', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=85', 'خدمات'),
('service-workshop', 'خدمت تأمین کارگاهی', 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=700&q=85', 'خدمات'),
('service-formulas', 'خدمت فرمول‌های تخصصی', 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=700&q=85', 'خدمات'),
('brand-remmers', 'Remmers', 'https://dummyimage.com/220x120/ffffff/168447.png?text=Remmers', 'برندها'),
('brand-osmo', 'Osmo', 'https://dummyimage.com/220x120/ffffff/111111.png?text=OSMO', 'برندها'),
('brand-adler', 'Adler', 'https://dummyimage.com/220x120/ffffff/0f5f35.png?text=ADLER', 'برندها'),
('brand-sayerlack', 'Sayerlack', 'https://dummyimage.com/220x120/ffffff/168447.png?text=Sayerlack', 'برندها'),
('brand-ica', 'ICA', 'https://dummyimage.com/220x120/ffffff/111111.png?text=ICA', 'برندها'),
('brand-renner', 'Renner', 'https://dummyimage.com/220x120/ffffff/0f5f35.png?text=Renner', 'برندها'),
('brand-milesi', 'Milesi', 'https://dummyimage.com/220x120/ffffff/168447.png?text=Milesi', 'برندها')
on conflict (key) do update set
  label = excluded.label,
  group_name = excluded.group_name,
  updated_at = now();

insert into public.site_content (key, value) values
(
  'home-page',
  '{
    "categoryTitle": "خرید بر اساس دسته‌بندی",
    "categoryText": "از رنگ چوب و روغن محافظ تا کیلر، سیلر، تینر و رزین را سریع‌تر پیدا کنید.",
    "servicesTitle": "خدمات نایل",
    "heroes": [
      {
        "eyebrow": "مرکز تخصصی رنگ و مواد شیمیایی چوب",
        "title": "Nile Wood Chemicals",
        "text": "خرید تخصصی رنگ چوب، روغن محافظ، سیلر، کیلر، تینر، رزین و مواد آماده‌سازی سطح برای کارگاه‌ها، پروژه‌های ساختمانی و مصرف حرفه‌ای.",
        "assetKey": "hero-main"
      },
      {
        "eyebrow": "پوشش‌های حرفه‌ای برای چوب",
        "title": "رنگ، روغن و محافظ چوب",
        "text": "برای نما، مبلمان، کابینت و پروژه‌های لوکس، پوشش مناسب را با مشاوره تخصصی انتخاب کنید.",
        "assetKey": "hero-slide-2"
      },
      {
        "eyebrow": "تأمین پایدار برای کارگاه‌ها",
        "title": "سیلر، کیلر، تینر و رزین",
        "text": "مواد مصرفی کارگاه رنگ را با کیفیت ثابت، بسته‌بندی ایمن و شرایط خرید عمده تهیه کنید.",
        "assetKey": "hero-slide-3"
      }
    ],
    "services": [
      {
        "title": "مشاوره انتخاب پوشش",
        "text": "انتخاب محصول بر اساس نوع چوب، محیط اجرا و ابزار مصرف.",
        "assetKey": "service-consulting"
      },
      {
        "title": "تأمین کارگاهی",
        "text": "قیمت همکاری برای مصرف ماهانه، پروژه‌های بزرگ و خطوط تولید.",
        "assetKey": "service-workshop"
      },
      {
        "title": "فرمول‌های تخصصی",
        "text": "سیلر، کیلر، تینر، رزین و مکمل‌های سازگار با اجرای حرفه‌ای.",
        "assetKey": "service-formulas"
      }
    ]
  }'::jsonb
)
on conflict (key) do nothing;

insert into storage.buckets (id, name, public) values
('product-images', 'product-images', true),
('blog-images', 'blog-images', true),
('public-assets', 'public-assets', true)
on conflict (id) do nothing;

drop policy if exists "public_storage_read" on storage.objects;
drop policy if exists "admin_storage_insert" on storage.objects;
drop policy if exists "admin_storage_update" on storage.objects;
drop policy if exists "admin_storage_delete" on storage.objects;

create policy "public_storage_read" on storage.objects
for select using (bucket_id in ('product-images', 'blog-images', 'public-assets'));

create policy "admin_storage_insert" on storage.objects
for insert with check (
  bucket_id in ('product-images', 'blog-images', 'public-assets') and public.is_admin()
);

create policy "admin_storage_update" on storage.objects
for update using (
  bucket_id in ('product-images', 'blog-images', 'public-assets') and public.is_admin()
) with check (
  bucket_id in ('product-images', 'blog-images', 'public-assets') and public.is_admin()
);

create policy "admin_storage_delete" on storage.objects
for delete using (
  bucket_id in ('product-images', 'blog-images', 'public-assets') and public.is_admin()
);
