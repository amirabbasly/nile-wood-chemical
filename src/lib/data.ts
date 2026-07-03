import { BlogCategory, BlogPost, Product, ProductCategory } from "./types";

export const productCategories: ProductCategory[] = [
  {
    id: "wood-stain",
    title: "رنگ چوب",
    slug: "wood-stain",
    description: "رنگ‌های پایه آب و پایه حلال برای چوب خام، ترمووود و MDF.",
  },
  {
    id: "wood-oil",
    title: "روغن چوب",
    slug: "wood-oil",
    description: "روغن‌های محافظ، دکوراتیو و فضای باز برای بافت طبیعی چوب.",
  },
  {
    id: "clear-coat",
    title: "کیلر و سیلر",
    slug: "clear-coat",
    description: "سیلر، کیلر، نیم پلی‌استر و پوشش‌های شفاف صنعتی.",
  },
  {
    id: "chemicals",
    title: "مواد شیمیایی",
    slug: "chemicals",
    description: "تینر، رزین، خشک‌کن، پاک‌کننده و مکمل‌های تخصصی کارگاه رنگ.",
  },
  {
    id: "putty",
    title: "بتونه و ترمیم",
    slug: "putty",
    description: "بتونه چوب، خمیر ترمیم، پرکننده ترک و آماده‌سازی سطح.",
  },
];

export const products: Product[] = [
  {
    id: "p1",
    title: "رنگ پوششی چوب سبز زیتونی Nile Pro حجم ۱ لیتر",
    slug: "nile-pro-olive-wood-stain",
    price: 690000,
    oldPrice: 780000,
    stock: 18,
    category: "wood-stain",
    image:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=80",
    summary: "رنگ پوششی مقاوم برای مبلمان، کابینت و سازه‌های دکوراتیو چوبی.",
    description:
      "فرمول صنعتی با پوشش یکنواخت، چسبندگی بالا و خشک‌شدن کنترل‌شده برای کارگاه‌های رنگ چوب. مناسب استفاده با قلم، غلتک و پیستوله.",
    features: ["پایه آب کم‌بو", "پوشش مات ابریشمی", "قابل تینت", "خشک شدن سطحی ۲ ساعت"],
    published: true,
    brand: "Nile Pro",
  },
  {
    id: "p2",
    title: "روغن محافظ ترمووود فضای باز حجم ۲.۵ لیتر",
    slug: "outdoor-thermowood-oil",
    price: 1850000,
    stock: 9,
    category: "wood-oil",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
    summary: "محافظ UV و رطوبت برای نما، پرگولا، کفپوش و چوب فضای باز.",
    description:
      "روغن نفوذی با دوام بالا که بافت طبیعی چوب را حفظ می‌کند و در برابر آفتاب، باران و تغییرات دمایی مقاومت ایجاد می‌کند.",
    features: ["مقاوم در برابر UV", "نفوذ عمیق", "بدون پوسته شدن", "مناسب ترمووود"],
    published: true,
    brand: "Nile Outdoor",
  },
  {
    id: "p3",
    title: "سیلر فوری صنعتی مخصوص MDF حجم ۴ کیلوگرم",
    slug: "industrial-fast-sealer-mdf",
    price: 1420000,
    stock: 14,
    category: "clear-coat",
    image:
      "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=900&q=80",
    summary: "زیرکار پرکننده برای آماده‌سازی سریع سطوح MDF و چوب طبیعی.",
    description:
      "سیلر با قابلیت سنباده‌خوری عالی و پرکنندگی منافذ که سطح را برای اجرای کیلر یا رنگ نهایی آماده می‌کند.",
    features: ["سنباده‌خوری نرم", "خشک شدن سریع", "پرکنندگی بالا", "مناسب پیستوله"],
    published: true,
    brand: "Nile Industrial",
  },
  {
    id: "p4",
    title: "کیلر پلی‌یورتان شفاف ضد خش ۱+۱",
    slug: "pu-clear-coat-scratch-resistant",
    price: 2360000,
    oldPrice: 2550000,
    stock: 6,
    category: "clear-coat",
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80",
    summary: "پوشش نهایی شفاف با مقاومت مکانیکی بالا برای میز و کابینت.",
    description:
      "کیلر دو جزئی پلی‌یورتان با شفافیت بالا، مقاومت در برابر خط و خش و لکه، مناسب پروژه‌های لوکس و پرتردد.",
    features: ["دو جزئی", "مقاوم به لکه", "براقیت عمیق", "دوام صنعتی"],
    published: true,
    brand: "Nile Shield",
  },
  {
    id: "p5",
    title: "تینر فوری ۲۰۰۰۰ ویژه رنگ چوب گالن ۴ لیتری",
    slug: "fast-thinner-20000",
    price: 520000,
    stock: 31,
    category: "chemicals",
    image:
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80",
    summary: "حلال کنترل‌شده برای رقیق‌سازی سیلر، کیلر و رنگ‌های فوری.",
    description:
      "تینر با خلوص مناسب برای کاهش ریسک سفیدک، شره و ناهماهنگی سطح در اجرای پیستوله‌ای.",
    features: ["تبخیر متعادل", "شفافیت بالا", "مناسب سیلر و کیلر", "گالن فلزی"],
    published: true,
    brand: "Nile Chem",
  },
  {
    id: "p6",
    title: "بتونه چوب آماده رنگ‌پذیر گردویی ۷۵۰ گرم",
    slug: "walnut-ready-wood-putty",
    price: 340000,
    stock: 22,
    category: "putty",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=80",
    summary: "ترمیم ترک، سوراخ و لب‌پریدگی چوب با قابلیت سنباده و رنگ‌پذیری.",
    description:
      "بتونه آماده با چسبندگی مناسب برای سطوح داخلی و قطعات دکوراتیو، قابل اجرا با لیسه و کاردک.",
    features: ["رنگ‌پذیر", "بدون ترک پس از خشک شدن", "قابل سنباده", "آماده مصرف"],
    published: true,
    brand: "Nile Repair",
  },
];

export const blogCategories: BlogCategory[] = [
  { id: "guides", title: "راهنمای اجرا", slug: "guides" },
  { id: "industry", title: "دانش صنعتی", slug: "industry" },
  { id: "maintenance", title: "نگهداری چوب", slug: "maintenance" },
];

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    title: "تفاوت سیلر، کیلر و روغن چوب در انتخاب پوشش نهایی",
    slug: "sealer-clearcoat-wood-oil-difference",
    excerpt: "انتخاب پوشش نهایی به نوع چوب، محل استفاده و سطح براقیت مورد انتظار بستگی دارد.",
    content:
      "برای چوب داخلی معمولاً سیلر به عنوان زیرکار و کیلر به عنوان پوشش نهایی استفاده می‌شود. روغن چوب زمانی انتخاب بهتری است که حفظ لمس طبیعی چوب، تعمیرپذیری و ظاهر گرم اهمیت بیشتری دارد. در پروژه‌های فضای باز باید مقاومت UV و رطوبت را جدی گرفت.",
    author: "تیم فنی Nile",
    category: "guides",
    image:
      "https://images.unsplash.com/photo-1523413184730-e85dbbd04aba?auto=format&fit=crop&w=900&q=80",
    publishedAt: "۱۴۰۵/۰۴/۰۳",
    published: true,
  },
  {
    id: "b2",
    title: "چطور قبل از رنگ چوب سطح را آماده کنیم؟",
    slug: "prepare-wood-before-stain",
    excerpt: "سنباده، غبارگیری، بتونه‌کاری و تست رنگ چهار قدم کلیدی قبل از اجرای پوشش هستند.",
    content:
      "سطح تمیز و یکنواخت کیفیت رنگ نهایی را تعیین می‌کند. از سنباده زبر به نرم حرکت کنید، گرد و غبار را کامل حذف کنید، ترک‌ها را با بتونه سازگار پر کنید و قبل از اجرای نهایی یک تست کوچک بگیرید.",
    author: "واحد آموزش Nile",
    category: "maintenance",
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
    publishedAt: "۱۴۰۵/۰۳/۲۸",
    published: true,
  },
  {
    id: "b3",
    title: "راهنمای خرید عمده مواد شیمیایی رنگ چوب برای کارگاه‌ها",
    slug: "wholesale-wood-chemicals-guide",
    excerpt: "برای خرید عمده باید مصرف ماهانه، شرایط نگهداری و ثبات تأمین را مشخص کنید.",
    content:
      "در خرید عمده، علاوه بر قیمت، پایداری کیفیت، تاریخ تولید، بسته‌بندی و مشاوره فنی اهمیت دارد. بهتر است لیست مصرفی کارگاه و حجم تقریبی سفارش ثبت شود تا پیشنهاد اقتصادی دقیق ارائه شود.",
    author: "واحد فروش سازمانی",
    category: "industry",
    image:
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=80",
    publishedAt: "۱۴۰۵/۰۳/۲۰",
    published: true,
  },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("fa-IR").format(value) + " تومان";
