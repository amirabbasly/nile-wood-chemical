"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Edit3, PackagePlus, Save, Trash2, Upload } from "lucide-react";
import { productCategories } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import {
  defaultHomeContent,
  HomeContent,
  mergeHomeContent,
  persistLocalHomeContent,
  persistRemoteHomeContent,
  readLocalHomeContent,
} from "@/lib/home-content";
import {
  defaultSiteAssets,
  mergeAssets,
  persistLocalAssets,
  readLocalAssets,
  SiteAsset,
} from "@/lib/site-assets";
import {
  defaultSiteSettings,
  mergeSettings,
  persistLocalSettings,
  readLocalSettings,
  SiteSettings,
} from "@/lib/site-settings";

type Tab = "products" | "blog" | "users" | "orders" | "wholesale" | "contacts" | "home" | "media" | "settings";

type AdminOrder = {
  id: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
};

type AdminUser = {
  id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role: string;
};

type AdminWholesale = {
  id?: string;
  full_name: string;
  phone: string;
  company?: string;
  product_type: string;
  quantity: string;
  description?: string;
  status?: string;
  created_at?: string;
};

type AdminContactMessage = {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  status?: string;
  created_at?: string;
};

type EntityItem = {
  id: string;
  title: string;
  stock?: number;
  author?: string;
  published: boolean;
};

type AdminProductItem = EntityItem & {
  price?: number;
  source: "supabase" | "demo";
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [adminGate, setAdminGate] = useState(
    () =>
      typeof window !== "undefined" &&
      sessionStorage.getItem("nile-admin-gate") === "ok",
  );
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [notice, setNotice] = useState("");
  const [productForm, setProductForm] = useState({
    title: "",
    price: "",
    stock: "",
    category: productCategories[0].slug,
    summary: "",
    description: "",
    features: "",
    published: true,
  });
  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "guides",
    published: true,
  });
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [wholesale, setWholesale] = useState<AdminWholesale[]>([]);
  const [contactMessages, setContactMessages] = useState<AdminContactMessage[]>([]);
  const [adminProducts, setAdminProducts] = useState<AdminProductItem[]>([]);
  const [adminBlogs, setAdminBlogs] = useState<EntityItem[]>([]);
  const [siteAssets, setSiteAssets] = useState<SiteAsset[]>(
    () =>
      typeof window === "undefined"
        ? defaultSiteAssets
        : mergeAssets(readLocalAssets()),
  );
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(
    () =>
      typeof window === "undefined"
        ? defaultSiteSettings
        : mergeSettings(readLocalSettings()),
  );
  const [homeContent, setHomeContent] = useState<HomeContent>(
    () =>
      typeof window === "undefined"
        ? defaultHomeContent
        : mergeHomeContent(readLocalHomeContent()),
  );

  const slug = useMemo(
    () =>
      productForm.title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\u0600-\u06FFa-z0-9-]/g, ""),
    [productForm.title],
  );

  useEffect(() => {
    async function guard() {
      if (!adminGate) {
        setChecking(false);
        return;
      }
      if (!supabase) {
        setIsAdmin(true);
        setChecking(false);
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setChecking(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();
      setIsAdmin(data?.role === "admin");
      setChecking(false);
    }
    guard();
  }, [adminGate]);

  useEffect(() => {
    async function load() {
      if (!supabase || !isAdmin) return;
      const [ordersRes, usersRes, wholesaleRes, contactsRes, productsRes, blogRes] = await Promise.all([
        supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("wholesale_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
      ]);
      const [assetsRes, settingsRes, contentRes] = await Promise.all([
        sessionStorage.getItem("nile-site-assets-table-missing") === "1"
          ? Promise.resolve({ data: null, error: null })
          : supabase.from("site_assets").select("*").order("key"),
        sessionStorage.getItem("nile-site-settings-table-missing") === "1"
          ? Promise.resolve({ data: null, error: null })
          : supabase.from("site_settings").select("key,value"),
        sessionStorage.getItem("nile-site-content-table-missing") === "1"
          ? Promise.resolve({ data: null, error: null })
          : supabase.from("site_content").select("value").eq("key", "home-page").maybeSingle(),
      ]);
      if (productsRes.error) {
        setNotice(`خطا در خواندن محصولات: ${productsRes.error.message}`);
      }
      if (blogRes.error) {
        setNotice(`خطا در خواندن مقالات: ${blogRes.error.message}`);
      }
      if (assetsRes.error) {
        sessionStorage.setItem("nile-site-assets-table-missing", "1");
      }
      if (settingsRes.error) {
        sessionStorage.setItem("nile-site-settings-table-missing", "1");
      }
      if (contentRes.error) {
        sessionStorage.setItem("nile-site-content-table-missing", "1");
      }
      setOrders(ordersRes.data || []);
      setUsers(usersRes.data || []);
      setWholesale(wholesaleRes.data || []);
      setContactMessages(contactsRes.data || []);
      setAdminProducts(
        productsRes.data?.map((product) => ({
          id: product.id,
          title: product.title,
          stock: product.stock,
          price: Number(product.price),
          published: product.published,
          source: "supabase",
        })) || [],
      );
      setAdminBlogs(
        blogRes.data?.map((post) => ({
          id: post.id,
          title: post.title,
          author: post.author,
          published: post.published,
        })) || [],
      );
      if (assetsRes.data?.length) {
        setSiteAssets(
          mergeAssets(
            assetsRes.data.map((item) => ({
              key: item.key,
              label: item.label,
              imageUrl: item.image_url,
              group: item.group_name,
            })) as SiteAsset[],
          ),
        );
      }
      if (settingsRes.data?.length) {
        const remoteSettings = settingsRes.data.reduce<Partial<SiteSettings>>((acc, item) => {
          acc[item.key as keyof SiteSettings] = item.value;
          return acc;
        }, {});
        setSiteSettings(mergeSettings(remoteSettings));
      }
      if (contentRes.data?.value) {
        setHomeContent(mergeHomeContent(contentRes.data.value as Partial<HomeContent>));
      }
    }
    load();
  }, [isAdmin]);


  async function uploadImage(file: File, bucket = "product-images") {
    if (!supabase) return "";
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (!supabase) {
        setNotice("Supabase تنظیم نیست؛ محصول در دیتابیس ذخیره نشد.");
        return;
      }

      const price = Number(productForm.price);
      const stock = Number(productForm.stock);
      if (!Number.isFinite(price) || price < 0) {
        setNotice("قیمت محصول باید عدد معتبر و بزرگ‌تر یا مساوی صفر باشد.");
        return;
      }
      if (!Number.isInteger(stock) || stock < 0) {
        setNotice("موجودی محصول باید عدد صحیح و بزرگ‌تر یا مساوی صفر باشد.");
        return;
      }

      const file = new FormData(event.currentTarget).get("image") as File;
      const imageUrl = file?.size ? await uploadImage(file) : "";
      const { data, error } = await supabase
        .from("products")
        .insert({
          title: productForm.title,
          slug,
          price,
          stock,
          category_id: productForm.category,
          brand: "Nile Wood",
          summary: productForm.summary,
          description: productForm.description,
          features: productForm.features.split("\n").filter(Boolean),
          published: productForm.published,
          image_url: imageUrl,
        })
        .select("*")
        .single();

      if (error) throw error;
      if (data) {
        setAdminProducts((current) => [
          {
            id: data.id,
            title: data.title,
            stock: data.stock,
            price: Number(data.price),
            published: data.published,
            source: "supabase",
          },
          ...current.filter((item) => item.source !== "demo"),
        ]);
      }

      setProductForm({
        title: "",
        price: "",
        stock: "",
        category: productCategories[0].slug,
        summary: "",
        description: "",
        features: "",
        published: true,
      });
      setNotice("محصول ذخیره شد.");
    } catch (error) {
      setNotice(`خطا در ذخیره محصول: ${error instanceof Error ? error.message : "نامشخص"}`);
    }
  }

  async function deleteProduct(item: AdminProductItem) {
    if (item.source !== "supabase") {
      setNotice("این محصول نمونه است و در دیتابیس نیست. محصولات واقعی Supabase قابل حذف هستند.");
      return;
    }
    if (!supabase) {
      setNotice("Supabase تنظیم نیست.");
      return;
    }

    const ok = window.confirm(`محصول «${item.title}» حذف شود؟`);
    if (!ok) return;

    const { error } = await supabase.from("products").delete().eq("id", item.id);
    if (error) {
      setNotice(`خطا در حذف محصول: ${error.message}`);
      return;
    }

    setAdminProducts((current) => current.filter((product) => product.id !== item.id));
    setNotice("محصول حذف شد.");
  }

  async function saveArticle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("image") as File;
    const imageUrl = file?.size ? await uploadImage(file, "blog-images") : "";
    if (supabase) {
      const { data, error } = await supabase.from("blog_posts").insert({
        title: articleForm.title,
        slug: articleForm.title.trim().replace(/\s+/g, "-"),
        excerpt: articleForm.excerpt,
        content: articleForm.content,
        author: articleForm.author,
        category_id: articleForm.category,
        published: articleForm.published,
        image_url: imageUrl,
        published_at: new Date().toISOString(),
      }).select("*").single();
      if (error) {
        setNotice(`خطا در ذخیره مقاله: ${error.message}`);
        return;
      }
      if (data) {
        setAdminBlogs((current) => [
          {
            id: data.id,
            title: data.title,
            author: data.author,
            published: data.published,
          },
          ...current,
        ]);
      }
    }
    setNotice("مقاله ذخیره شد.");
  }

  async function changeOrderStatus(id: string, value: string) {
    if (supabase) {
      await supabase.from("orders").update({ order_status: value }).eq("id", id);
    }
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, order_status: value } : order)),
    );
  }

  function changeSiteAsset(key: string, value: string) {
    setSiteAssets((current) =>
      current.map((asset) => (asset.key === key ? { ...asset, imageUrl: value } : asset)),
    );
  }

  async function saveSiteAsset(asset: SiteAsset, file?: File) {
    let imageUrl = asset.imageUrl;
    if (file?.size) {
      if (!supabase) {
        setNotice("برای آپلود فایل، Supabase Storage باید تنظیم باشد. در حالت لوکال از URL تصویر استفاده کنید.");
        return;
      }
      imageUrl = await uploadImage(file, "public-assets");
    }

    const nextAssets = siteAssets.map((item) =>
      item.key === asset.key ? { ...asset, imageUrl } : item,
    );
    setSiteAssets(nextAssets);
    persistLocalAssets(nextAssets);

    if (supabase) {
      await supabase.from("site_assets").upsert({
        key: asset.key,
        label: asset.label,
        image_url: imageUrl,
        group_name: asset.group,
      });
    }

    setNotice("تصویر سایت ذخیره شد.");
  }

  function changeSiteSetting(key: keyof SiteSettings, value: string) {
    setSiteSettings((current) => ({ ...current, [key]: value }));
  }

  async function saveSiteSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    persistLocalSettings(siteSettings);

    if (supabase) {
      await supabase.from("site_settings").upsert(
        Object.entries(siteSettings).map(([key, value]) => ({
          key,
          value,
        })),
      );
    }

    setNotice("اطلاعات سایت ذخیره شد.");
  }

  function changeHero(index: number, key: keyof HomeContent["heroes"][number], value: string) {
    setHomeContent((current) => ({
      ...current,
      heroes: current.heroes.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, [key]: value } : slide,
      ),
    }));
  }

  function changeService(index: number, key: keyof HomeContent["services"][number], value: string) {
    setHomeContent((current) => ({
      ...current,
      services: current.services.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, [key]: value } : service,
      ),
    }));
  }

  async function saveHomeContent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    persistLocalHomeContent(homeContent);
    try {
      await persistRemoteHomeContent(homeContent);
      setNotice("محتوای صفحه اصلی ذخیره شد.");
    } catch (error) {
      setNotice(`خطا در ذخیره محتوای صفحه اصلی: ${error instanceof Error ? error.message : "نامشخص"}`);
    }
  }

  function submitPanelLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const expectedUser = process.env.NEXT_PUBLIC_ADMIN_PANEL_USERNAME || "nileadmin";
    const expectedPass = process.env.NEXT_PUBLIC_ADMIN_PANEL_PASSWORD || "Nile@1405";

    if (loginForm.username === expectedUser && loginForm.password === expectedPass) {
      sessionStorage.setItem("nile-admin-gate", "ok");
      setAdminGate(true);
      setChecking(true);
      setLoginError("");
      return;
    }

    setLoginError("نام کاربری یا رمز عبور پنل ادمین اشتباه است.");
  }

  if (!adminGate) {
    return (
      <section className="section auth-page admin-login-page">
        <form className="auth-card panel admin-login-card" onSubmit={submitPanelLogin}>
          <span className="badge">ورود محرمانه</span>
          <h1>ورود به پنل مدیریت</h1>
          <p>
            مسیر پنل در منوی سایت نمایش داده نمی‌شود و بعد از این ورود، نقش
            admin در Supabase هم بررسی می‌شود.
          </p>
          <div className="field">
            <label>نام کاربری</label>
            <input
              required
              autoComplete="username"
              value={loginForm.username}
              onChange={(event) =>
                setLoginForm({ ...loginForm, username: event.target.value })
              }
            />
          </div>
          <div className="field">
            <label>رمز عبور</label>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm({ ...loginForm, password: event.target.value })
              }
            />
          </div>
          {loginError && <p className="form-message danger">{loginError}</p>}
          <button className="btn">ورود به پنل</button>
        </form>
      </section>
    );
  }

  if (checking) {
    return <section className="section container">در حال بررسی دسترسی...</section>;
  }

  if (!isAdmin) {
    return (
      <section className="section auth-page">
        <div className="auth-card panel">
          <h1>دسترسی غیرمجاز</h1>
          <p>ورود به پنل فقط برای کاربران دارای نقش admin مجاز است.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <h1>پنل ادمین</h1>
        {[
          ["products", "مدیریت محصولات"],
          ["blog", "مدیریت مجله"],
          ["users", "مدیریت کاربران"],
          ["orders", "مدیریت سفارشات"],
          ["wholesale", "خرید عمده"],
          ["contacts", "پیام‌های تماس"],
          ["home", "محتوای صفحه اصلی"],
          ["media", "مدیریت تصاویر سایت"],
          ["settings", "اطلاعات سایت"],
        ].map(([key, label]) => (
          <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key as Tab)}>
            {label}
          </button>
        ))}
      </aside>
      <div className="admin-content">
        {notice && <p className="form-message">{notice}</p>}
        {tab === "products" && (
          <AdminPanel title="مدیریت محصولات" subtitle="افزودن، ویرایش، حذف، آپلود تصویر و وضعیت انتشار">
            <form className="admin-form panel" onSubmit={saveProduct}>
              <div className="form-grid">
                <Input label="عنوان" value={productForm.title} onChange={(title) => setProductForm({ ...productForm, title })} />
                <Input label="قیمت" type="number" value={productForm.price} onChange={(price) => setProductForm({ ...productForm, price })} />
                <Input label="موجودی" type="number" value={productForm.stock} onChange={(stock) => setProductForm({ ...productForm, stock })} />
                <div className="field">
                  <label>دسته‌بندی</label>
                  <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                    {productCategories.map((item) => <option key={item.id} value={item.slug}>{item.title}</option>)}
                  </select>
                </div>
                <Input label="خلاصه" full value={productForm.summary} onChange={(summary) => setProductForm({ ...productForm, summary })} />
                <Text label="توضیحات" value={productForm.description} onChange={(description) => setProductForm({ ...productForm, description })} />
                <Text label="ویژگی‌ها، هر خط یک مورد" value={productForm.features} onChange={(features) => setProductForm({ ...productForm, features })} />
                <div className="field full">
                  <label>تصویر محصول</label>
                  <input name="image" type="file" accept="image/*" />
                </div>
              </div>
              <button className="btn"><PackagePlus size={18} /> ذخیره محصول</button>
            </form>
            <EntityList items={adminProducts} kind="product" onDelete={deleteProduct} />
          </AdminPanel>
        )}

        {tab === "blog" && (
          <AdminPanel title="مدیریت مجله" subtitle="افزودن مقاله، تصویر شاخص، دسته‌بندی و انتشار">
            <form className="admin-form panel" onSubmit={saveArticle}>
              <div className="form-grid">
                <Input label="عنوان" value={articleForm.title} onChange={(title) => setArticleForm({ ...articleForm, title })} />
                <Input label="نویسنده" value={articleForm.author} onChange={(author) => setArticleForm({ ...articleForm, author })} />
                <Input label="خلاصه" full value={articleForm.excerpt} onChange={(excerpt) => setArticleForm({ ...articleForm, excerpt })} />
                <Text label="محتوای کامل" value={articleForm.content} onChange={(content) => setArticleForm({ ...articleForm, content })} />
                <div className="field full">
                  <label>تصویر شاخص</label>
                  <input name="image" type="file" accept="image/*" />
                </div>
              </div>
              <button className="btn"><Save size={18} /> ذخیره مقاله</button>
            </form>
            <EntityList items={adminBlogs} kind="blog" />
          </AdminPanel>
        )}

        {tab === "users" && (
          <AdminPanel title="مدیریت کاربران" subtitle="مشاهده اطلاعات و نقش کاربران">
            <div className="panel table-panel">
              {(users.length ? users : [{ full_name: "کاربر نمونه", email: "demo@nile.test", role: "admin" }]).map((user, index) => (
                <div className="admin-row" key={user.id || index}>
                  <strong>{user.full_name || "بدون نام"}</strong>
                  <span>{user.email || user.phone}</span>
                  <span className="badge">{user.role}</span>
                </div>
              ))}
            </div>
          </AdminPanel>
        )}

        {tab === "orders" && (
          <AdminPanel title="مدیریت سفارشات" subtitle="مشاهده جزئیات، پرداخت و تغییر وضعیت">
            <div className="panel table-panel">
              {(orders.length ? orders : [{ id: "demo", total_amount: 2360000, payment_status: "در انتظار پرداخت", order_status: "در حال پردازش" }]).map((order) => (
                <div className="admin-row" key={order.id}>
                  <strong>#{String(order.id).slice(0, 8)}</strong>
                  <span>{Number(order.total_amount).toLocaleString("fa-IR")} تومان</span>
                  <span>{order.payment_status}</span>
                  <select value={order.order_status} onChange={(e) => changeOrderStatus(order.id, e.target.value)}>
                    <option>در انتظار پرداخت</option>
                    <option>پرداخت موفق</option>
                    <option>در حال پردازش</option>
                    <option>تکمیل شده</option>
                  </select>
                </div>
              ))}
            </div>
          </AdminPanel>
        )}

        {tab === "wholesale" && (
          <AdminPanel title="درخواست‌های خرید عمده" subtitle="بررسی اطلاعات تماس، محصول و توضیحات مشتری">
            <div className="panel table-panel">
              {!wholesale.length && <p className="empty-state">هنوز درخواست خرید عمده‌ای ثبت نشده است.</p>}
              {wholesale.map((item, index) => (
                <div className="admin-row" key={item.id || index}>
                  <strong>{item.full_name}</strong>
                  <span>{item.phone}</span>
                  <span>{item.company || "بدون شرکت"}</span>
                  <span>{item.product_type}</span>
                  <span>{item.quantity}</span>
                  <span>{item.description}</span>
                </div>
              ))}
            </div>
          </AdminPanel>
        )}

        {tab === "contacts" && (
          <AdminPanel title="پیام‌های تماس با ما" subtitle="فرم‌هایی که کاربران از صفحه تماس با ما ارسال کرده‌اند.">
            <div className="panel table-panel">
              {!contactMessages.length && <p className="empty-state">هنوز پیامی از فرم تماس ثبت نشده است.</p>}
              {contactMessages.map((item, index) => (
                <div className="admin-row contact-admin-row" key={item.id || index}>
                  <strong>{item.name}</strong>
                  <span>{item.phone}</span>
                  <span>{item.email || "بدون ایمیل"}</span>
                  <span>{item.status || "new"}</span>
                  <p>{item.message}</p>
                </div>
              ))}
            </div>
          </AdminPanel>
        )}

        {tab === "home" && (
          <AdminPanel
            title="محتوای صفحه اصلی"
            subtitle="متن‌های هیرو، عنوان دسته‌بندی‌ها و کارت‌های خدمات را ویرایش کنید. تصویرها از کلیدهای بخش مدیریت تصاویر خوانده می‌شوند."
          >
            <form className="panel admin-form" onSubmit={saveHomeContent}>
              <div className="form-grid">
                <Input
                  label="عنوان بخش دسته‌بندی"
                  full
                  value={homeContent.categoryTitle}
                  onChange={(categoryTitle) => setHomeContent({ ...homeContent, categoryTitle })}
                />
                <Text
                  label="متن بخش دسته‌بندی"
                  value={homeContent.categoryText}
                  onChange={(categoryText) => setHomeContent({ ...homeContent, categoryText })}
                />
                <Input
                  label="عنوان بخش خدمات"
                  full
                  value={homeContent.servicesTitle}
                  onChange={(servicesTitle) => setHomeContent({ ...homeContent, servicesTitle })}
                />
              </div>

              <h3 className="admin-subtitle">اسلایدهای هیرو</h3>
              <div className="admin-repeat-grid">
                {homeContent.heroes.map((slide, index) => (
                  <div className="panel nested-admin-card" key={`hero-${index}`}>
                    <Input label="بالانویس" value={slide.eyebrow} onChange={(value) => changeHero(index, "eyebrow", value)} />
                    <Input label="عنوان" value={slide.title} onChange={(value) => changeHero(index, "title", value)} />
                    <Text label="متن" value={slide.text} onChange={(value) => changeHero(index, "text", value)} />
                    <AssetSelect
                      label="تصویر اسلاید"
                      value={slide.assetKey}
                      assets={siteAssets}
                      onChange={(value) => changeHero(index, "assetKey", value)}
                    />
                  </div>
                ))}
              </div>

              <h3 className="admin-subtitle">کارت‌های خدمات</h3>
              <div className="admin-repeat-grid">
                {homeContent.services.map((service, index) => (
                  <div className="panel nested-admin-card" key={`service-${index}`}>
                    <Input label="عنوان خدمت" value={service.title} onChange={(value) => changeService(index, "title", value)} />
                    <Text label="متن خدمت" value={service.text} onChange={(value) => changeService(index, "text", value)} />
                    <AssetSelect
                      label="تصویر خدمت"
                      value={service.assetKey}
                      assets={siteAssets}
                      onChange={(value) => changeService(index, "assetKey", value)}
                    />
                  </div>
                ))}
              </div>

              <button className="btn">
                <Save size={18} />
                ذخیره محتوای صفحه اصلی
              </button>
            </form>
          </AdminPanel>
        )}

        {tab === "media" && (
          <AdminPanel
            title="مدیریت تصاویر سایت"
            subtitle="تصویرهای صفحه اصلی، دسته‌بندی‌ها، خدمات و برندها را با URL یا آپلود تغییر دهید."
          >
            <div className="media-manager">
              {siteAssets.map((asset) => (
                <form
                  className="panel media-card"
                  key={asset.key}
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const file = new FormData(event.currentTarget).get("file") as File;
                    await saveSiteAsset(asset, file);
                  }}
                >
                  <div className="media-preview">
                    <Image src={asset.imageUrl} alt={asset.label} fill sizes="220px" />
                  </div>
                  <div className="field">
                    <label>{asset.label}</label>
                    <input
                      className="ltr"
                      value={asset.imageUrl}
                      onChange={(event) => changeSiteAsset(asset.key, event.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>آپلود تصویر جدید</label>
                    <input name="file" type="file" accept="image/*" />
                  </div>
                  <span className="badge">{asset.group}</span>
                  <button className="btn">
                    <Save size={18} />
                    ذخیره تصویر
                  </button>
                </form>
              ))}
            </div>
          </AdminPanel>
        )}

        {tab === "settings" && (
          <AdminPanel
            title="اطلاعات سایت"
            subtitle="اطلاعات تماس، آدرس، لینک‌های پشتیبانی، متن فوتر و محتوای درباره ما را تغییر دهید."
          >
            <form className="panel admin-form" onSubmit={saveSiteSettings}>
              <div className="form-grid">
                <SettingInput label="نام مجموعه" id="businessName" value={siteSettings.businessName} onChange={changeSiteSetting} />
                <SettingInput label="ایمیل" id="email" value={siteSettings.email} onChange={changeSiteSetting} />
                <SettingInput label="شماره تماس اصلی" id="phonePrimary" value={siteSettings.phonePrimary} onChange={changeSiteSetting} />
                <SettingInput label="شماره تماس دوم" id="phoneSecondary" value={siteSettings.phoneSecondary} onChange={changeSiteSetting} />
                <SettingInput label="لینک واتساپ" id="whatsappUrl" value={siteSettings.whatsappUrl} onChange={changeSiteSetting} />
                <SettingInput label="لینک تلگرام" id="telegramUrl" value={siteSettings.telegramUrl} onChange={changeSiteSetting} />
                <SettingInput label="عنوان تماس با ما" id="contactTitle" value={siteSettings.contactTitle} onChange={changeSiteSetting} full />
                <SettingText label="متن معرفی تماس" id="contactIntro" value={siteSettings.contactIntro} onChange={changeSiteSetting} />
                <SettingText label="آدرس" id="address" value={siteSettings.address} onChange={changeSiteSetting} />
                <SettingInput label="عنوان درباره ما" id="aboutTitle" value={siteSettings.aboutTitle} onChange={changeSiteSetting} full />
                <SettingText label="متن اول درباره ما" id="aboutBody" value={siteSettings.aboutBody} onChange={changeSiteSetting} />
                <SettingText label="متن دوم درباره ما" id="aboutSecondBody" value={siteSettings.aboutSecondBody} onChange={changeSiteSetting} />
                <SettingText label="متن فوتر" id="footerText" value={siteSettings.footerText} onChange={changeSiteSetting} />
                <SettingInput label="متن پایین فوتر راست" id="footerBottomRight" value={siteSettings.footerBottomRight} onChange={changeSiteSetting} />
                <SettingInput label="متن پایین فوتر چپ" id="footerBottomLeft" value={siteSettings.footerBottomLeft} onChange={changeSiteSetting} />
              </div>
              <button className="btn">
                <Save size={18} />
                ذخیره اطلاعات سایت
              </button>
            </form>
          </AdminPanel>
        )}
      </div>
    </section>
  );
}

function AdminPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", full = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; full?: boolean }) {
  return (
    <div className={`field ${full ? "full" : ""}`}>
      <label>{label}</label>
      <input required type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="field full">
      <label>{label}</label>
      <textarea required rows={5} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SettingInput({
  label,
  id,
  value,
  onChange,
  full = false,
}: {
  label: string;
  id: keyof SiteSettings;
  value: string;
  onChange: (key: keyof SiteSettings, value: string) => void;
  full?: boolean;
}) {
  return (
    <div className={`field ${full ? "full" : ""}`}>
      <label>{label}</label>
      <input value={value} onChange={(event) => onChange(id, event.target.value)} />
    </div>
  );
}

function SettingText({
  label,
  id,
  value,
  onChange,
}: {
  label: string;
  id: keyof SiteSettings;
  value: string;
  onChange: (key: keyof SiteSettings, value: string) => void;
}) {
  return (
    <div className="field full">
      <label>{label}</label>
      <textarea rows={4} value={value} onChange={(event) => onChange(id, event.target.value)} />
    </div>
  );
}

function AssetSelect({
  label,
  value,
  assets,
  onChange,
}: {
  label: string;
  value: string;
  assets: SiteAsset[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {assets.map((asset) => (
          <option key={asset.key} value={asset.key}>
            {asset.label} - {asset.group}
          </option>
        ))}
      </select>
    </div>
  );
}

function EntityList({
  items,
  kind,
  onDelete,
}: {
  items: EntityItem[];
  kind: string;
  onDelete?: (item: AdminProductItem) => void;
}) {
  return (
    <div className="panel table-panel">
      {items.map((item) => (
        <div className="admin-row" key={item.id}>
          <strong>{item.title}</strong>
          <span>{kind === "product" ? item.stock + " عدد" : item.author}</span>
          <span className="badge">{item.published ? "منتشر شده" : "پیش‌نویس"}</span>
          <button className="btn ghost" title="ویرایش"><Edit3 size={16} /></button>
          <button
            className="btn ghost"
            title="حذف"
            type="button"
            onClick={() => onDelete?.(item as AdminProductItem)}
          >
            <Trash2 size={16} />
          </button>
          <button className="btn ghost" title="آپلود"><Upload size={16} /></button>
        </div>
      ))}
    </div>
  );
}
