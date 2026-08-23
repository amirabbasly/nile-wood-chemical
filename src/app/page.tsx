"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, ChevronLeft, ChevronRight, Headphones, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { BlogCard } from "@/components/BlogCard";
import { ProductCard } from "@/components/ProductCard";
import { productCategories } from "@/lib/data";
import { useBlogPosts } from "@/lib/blog";
import { useHomeContent } from "@/lib/home-content";
import { useProducts } from "@/lib/products";
import { useSiteAssets } from "@/lib/site-assets";

const categoryAssets: Record<string, string> = {
  "wood-stain": "/images/landing/category-stain.png",
  "wood-oil": "/images/landing/category-oil.png",
  "clear-coat": "/images/landing/category-clear.png",
  chemicals: "/images/landing/category-chemicals.png",
  putty: "category-putty",
};

const heroImages = [
  "/images/landing/hero-finish.png",
  "/images/landing/hero-workshop.png",
  "/images/landing/hero-outdoor.png",
];

const benefits = [
  { icon: PackageCheck, title: "تضمین اصالت محصول", text: "کالای اصل و تخصصی" },
  { icon: ShieldCheck, title: "ضمانت کیفیت", text: "انتخاب مطمئن برای چوب" },
  { icon: Truck, title: "ارسال سریع", text: "بسته‌بندی ایمن سفارش" },
  { icon: Headphones, title: "مشاوره تخصصی", text: "همراه شما پیش از خرید" },
];

const palette = [
  ["بلوط روشن", "#e5bd81", "#b77b42"], ["راش", "#d7a162", "#a96832"],
  ["گردویی", "#9a5426", "#54260f"], ["فندقی", "#7c421e", "#3e210f"],
  ["ماهاگونی", "#a74620", "#681e10"], ["ساج", "#b66b32", "#743616"],
  ["ونگه", "#4a342b", "#1f1511"], ["عسلی", "#dc984c", "#92501e"],
  ["رز وود", "#a44930", "#661f18"],
];

export default function Home() {
  const { assets } = useSiteAssets();
  const { content } = useHomeContent();
  const { products } = useProducts();
  const { posts } = useBlogPosts();
  const brands = assets.filter((asset) => asset.group === "برندها");
  const groups = [products.slice(0, 8), products.slice(4, 12), [...products].reverse().slice(0, 8)];

  const productSlider = (id: string, title: string, subtitle: string, items: typeof products) => items.length ? (
    <section className="reference-products" key={id}>
      <div className="container">
        <div className="reference-heading">
          <div><span>انتخاب حرفه‌ای‌ها</span><h2>{title}</h2><p>{subtitle}</p></div>
          <div className="reference-slider-actions">
            <button className={`${id}-prev`} aria-label="قبلی"><ChevronRight size={19} /></button>
            <button className={`${id}-next`} aria-label="بعدی"><ChevronLeft size={19} /></button>
            <Link href="/products">مشاهده همه <ArrowLeft size={16} /></Link>
          </div>
        </div>
        <Swiper modules={[Navigation]} navigation={{ prevEl: `.${id}-prev`, nextEl: `.${id}-next` }} spaceBetween={14} slidesPerView={2.05}
          breakpoints={{ 640: { slidesPerView: 3 }, 900: { slidesPerView: 4 }, 1200: { slidesPerView: 5 } }} className="reference-product-swiper">
          {items.map((product) => <SwiperSlide className="!h-auto" key={`${id}-${product.id}`}><ProductCard product={product} /></SwiperSlide>)}
        </Swiper>
      </div>
    </section>
  ) : null;

  return (
    <main className="reference-home">
      <section className="reference-hero">
        <Swiper modules={[Autoplay, Pagination]} loop autoplay={{ delay: 5200, disableOnInteraction: false }} pagination={{ clickable: true }}>
          {content.heroes.map((slide, index) => (
            <SwiperSlide key={slide.title}>
              <div className="reference-hero-slide">
                <Image src={heroImages[index] || heroImages[0]} alt={slide.title} fill priority={index === 0} sizes="100vw" className="object-cover" />
                <div className="reference-hero-shade" />
                <div className="container reference-hero-copy">
                  <span>{slide.eyebrow}</span>
                  <h1>{slide.title}</h1>
                  <p>{slide.text}</p>
                  <div><Link className="btn" href="/shop">مشاهده محصولات <ArrowLeft size={17} /></Link><Link className="btn outline-light" href="/contact">مشاوره خرید</Link></div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="reference-benefits"><div className="container">
        {benefits.map(({ icon: Icon, title, text }) => <div key={title}><Icon size={28} /><p><strong>{title}</strong><small>{text}</small></p></div>)}
      </div></section>

      <section className="reference-categories"><div className="container">
        <div className="reference-centered-title"><span>دسترسی سریع</span><h2>{content.categoryTitle}</h2><p>{content.categoryText}</p></div>
        <div className="reference-category-grid">
          {productCategories.slice(0, 4).map((category) => <Link href={`/products?category=${category.slug}`} key={category.id}>
            <div><Image src={categoryAssets[category.slug]} alt={category.title} fill sizes="(max-width: 760px) 50vw, 25vw" className="object-cover" /></div>
            <h3>{category.title}</h3><p>{category.description}</p><span>مشاهده محصولات <ArrowLeft size={15} /></span>
          </Link>)}
        </div>
      </div></section>

      {productSlider("best", "پرفروش‌ترین محصولات", "محصولات محبوب و امتحان‌شده برای اجرای حرفه‌ای", groups[0])}

      <section className="reference-story"><div className="container">
        <div className="reference-story-copy"><span>چرا نایل وود؟</span><h2>زیبایی طبیعی چوب را ماندگار کنید</h2><p>از انتخاب پوشش مناسب تا اجرای نهایی، محصولات تخصصی و مشاوره فنی نایل وود کنار شماست تا سطحی زیبا، مقاوم و ماندگار بسازید.</p>
          <ul><li><BadgeCheck /> انتخاب تخصصی بر اساس نوع چوب</li><li><BadgeCheck /> محصولات مناسب فضای داخلی و خارجی</li><li><BadgeCheck /> راهنمای اجرای صحیح و میزان مصرف</li><li><BadgeCheck /> تأمین مطمئن برای پروژه و کارگاه</li></ul>
          <Link className="btn" href="/about">درباره نایل وود <ArrowLeft size={17} /></Link>
        </div>
        <div className="reference-story-image"><Image src="/images/landing/about-craft.png" alt="اجرای پوشش محافظ چوب" fill sizes="(max-width: 900px) 100vw, 55vw" className="object-cover" /></div>
      </div></section>

      {productSlider("workshop", "پیشنهادهای ویژه کارگاهی", "انتخاب‌های کاربردی برای مصرف حرفه‌ای و پروژه‌ای", groups[1])}

      <section className="reference-palette"><div className="container">
        <div className="reference-centered-title"><span>رنگ دلخواه شما</span><h2>مجموعه رنگ‌های چوب</h2><p>طیفی از رنگ‌های طبیعی برای هماهنگی کامل با سبک پروژه شما</p></div>
        <div className="reference-palette-grid">{palette.map(([name, light, dark]) => <Link href="/products?category=wood-stain" key={name} className="reference-swatch" style={{ background: `linear-gradient(100deg, ${light}, ${dark} 55%, ${light})` }}><span>{name}</span></Link>)}</div>
        <Link className="reference-palette-more" href="/products?category=wood-stain">مشاهده همه رنگ‌ها</Link>
      </div></section>

      {productSlider("latest", "جدیدترین محصولات", "تازه‌ترین محصولات اضافه‌شده به فروشگاه نایل وود", groups[2])}

      {!!brands.length && <section className="reference-brands"><div className="container"><div className="reference-centered-title"><span>همکاران تجاری</span><h2>برندهای معتبر</h2></div>
        <Swiper modules={[Autoplay]} loop autoplay={{ delay: 1800 }} slidesPerView={2.5} spaceBetween={16} breakpoints={{ 700: { slidesPerView: 4 }, 1050: { slidesPerView: 6 } }}>
          {[...brands, ...brands].map((brand, index) => <SwiperSlide key={`${brand.key}-${index}`}><div className="reference-brand"><Image src={brand.imageUrl} alt={brand.label} width={150} height={65} className="object-contain" /></div></SwiperSlide>)}
        </Swiper>
      </div></section>}

      <section className="reference-journal"><div className="container"><div className="reference-heading"><div><span>دانش و تجربه</span><h2>از مجله نایل وود</h2><p>راهنمای انتخاب محصول، آماده‌سازی و اجرای صحیح پوشش چوب</p></div><Link className="btn ghost" href="/blog">همه مطالب</Link></div>
        <div className="reference-blog-grid">{posts.slice(0, 4).map((post) => <BlogCard post={post} key={post.id} />)}</div>
      </div></section>
    </main>
  );
}
