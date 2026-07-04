"use client";

import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BadgeCheck,
  Beaker,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Factory,
  FlaskConical,
  Layers3,
  PackageCheck,
  Paintbrush,
  PhoneCall,
  ShieldCheck,
  Truck,
  WandSparkles,
  Wrench,
} from "lucide-react";
import { Autoplay, EffectFade, FreeMode, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { BlogCard } from "@/components/BlogCard";
import { ProductCard } from "@/components/ProductCard";
import { productCategories } from "@/lib/data";
import { useBlogPosts } from "@/lib/blog";
import { useHomeContent } from "@/lib/home-content";
import { useProducts } from "@/lib/products";
import { useSiteAssets } from "@/lib/site-assets";

const serviceIcons: LucideIcon[] = [WandSparkles, Factory, Beaker];

const categoryMeta: Record<string, { assetKey: string; icon: LucideIcon }> = {
  "wood-stain": { assetKey: "category-wood-stain", icon: Paintbrush },
  "wood-oil": { assetKey: "category-wood-oil", icon: Droplets },
  "clear-coat": { assetKey: "category-clear-coat", icon: Layers3 },
  chemicals: { assetKey: "category-chemicals", icon: FlaskConical },
  putty: { assetKey: "category-putty", icon: Wrench },
};

const trustItems = [
  {
    title: "اصالت و ثبات کیفیت",
    text: "تأمین از برندهای معتبر و کنترل بچ تولید",
    icon: ShieldCheck,
  },
  {
    title: "مشاوره فنی کارگاهی",
    text: "انتخاب محصول بر اساس نوع چوب و روش اجرا",
    icon: PhoneCall,
  },
  {
    title: "ارسال سریع و ایمن",
    text: "بسته‌بندی مناسب مواد شیمیایی و پوشش‌ها",
    icon: Truck,
  },
  {
    title: "موجودی قابل اتکا",
    text: "تأمین منظم برای پروژه‌ها و مصرف عمده",
    icon: Boxes,
  },
];

export default function Home() {
  const { assets, byKey } = useSiteAssets();
  const { content } = useHomeContent();
  const { products } = useProducts();
  const { posts } = useBlogPosts();
  const featured = products.slice(0, 6);
  const productGroups = [
    products.slice(0, 6),
    products.slice(2, 8),
    [...products].reverse().slice(0, 6),
  ];
  const latestPosts = posts.slice(0, 3);
  const brandAssets = assets.filter((asset) => asset.group === "برندها");
  const renderProductSlider = (
    id: string,
    title: string,
    text: string,
    items = featured,
  ) => {
    if (!items.length) return null;
    return (
    <section className="w-full overflow-hidden bg-[#eef5ef] py-12">
      <div className="w-full bg-gradient-to-l from-[#103f2a] via-[#153f2d] to-[#eef5ef] px-4 py-7 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1480px] items-center gap-7 lg:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-bold text-[#cce66c]">
              <PackageCheck size={18} />
              پیشنهادات شگفت‌انگیز
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
              {title}
            </h2>
            <p className="mt-3 leading-8 text-white/75">{text}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className={`${id}-prev btn ghost !bg-white/95`} aria-label="قبلی">
                <ChevronRight size={18} />
              </button>
              <button className={`${id}-next btn ghost !bg-white/95`} aria-label="بعدی">
                <ChevronLeft size={18} />
              </button>
              <Link className="btn ghost !bg-white/95" href="/products">
                مشاهده همه
              </Link>
            </div>
          </aside>

          <div className="min-w-0 rounded-lg bg-black/10 p-3 backdrop-blur md:p-5 lg:-ml-12">
            <Swiper
              modules={[Navigation]}
              navigation={{ nextEl: `.${id}-next`, prevEl: `.${id}-prev` }}
              spaceBetween={18}
              slidesPerView={1.15}
              breakpoints={{
                640: { slidesPerView: 2.1 },
                900: { slidesPerView: 3 },
                1180: { slidesPerView: 4 },
              }}
            >
              {items.map((product) => (
                <SwiperSlide key={`${id}-${product.id}`} className="!h-auto">
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
    );
  };

  return (
    <>
      <section className="bg-gradient-to-b from-white to-[#edf5ef] py-8 lg:py-12">
        <div className="container relative">
          <Swiper
            modules={[Autoplay, EffectFade, Pagination]}
            loop
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={900}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true, el: ".hero-pagination" }}
            className="hero-swiper"
          >
            {content.heroes.map((slide) => (
              <SwiperSlide key={slide.title}>
                <div className="grid items-center gap-7 lg:grid-cols-[1fr_minmax(360px,0.9fr)]">
                  <div className="transition-all duration-700">
                    <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
                      {slide.eyebrow}
                    </span>
                    <h1 className="mt-5 text-4xl font-black leading-tight text-[#101411] md:text-6xl">
                      {slide.title}
                    </h1>
                    <p className="mt-5 max-w-2xl leading-9 text-[#687268]">
                      {slide.text}
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link className="btn" href="/shop">
                        مشاهده فروشگاه
                        <ArrowLeft size={18} />
                      </Link>
                      <Link className="btn secondary" href="/wholesale">
                        درخواست خرید عمده
                      </Link>
                    </div>
                  </div>

                  <div className="image-skeleton relative min-h-[330px] overflow-hidden rounded-lg shadow-[0_16px_45px_rgba(18,33,22,0.12)] md:min-h-[460px]">
                    <Image
                      src={byKey[slide.assetKey]?.imageUrl}
                      alt={slide.title}
                      fill
                      priority={slide.assetKey === "hero-main"}
                      sizes="(max-width: 900px) 100vw, 50vw"
                      className="object-cover transition duration-700"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 text-white">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 backdrop-blur">
                        <BadgeCheck size={18} />
                        <span>۳۵۰+ محصول تخصصی و قابل تأمین</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="mt-5 flex items-center justify-center lg:absolute lg:bottom-4 lg:right-4 lg:z-10 lg:mt-0">
            <div className="hero-pagination flex w-auto items-center justify-center gap-2" />
          </div>
        </div>
      </section>

      <section className="border-y border-[#e2e8df] bg-white py-5">
        <div className="container grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 rounded-lg bg-[#f8fbf7] p-4" key={item.title}>
                <Icon className="row-span-2 text-[#168447]" size={28} />
                <strong>{item.title}</strong>
                <span className="text-sm leading-7 text-[#687268]">{item.text}</span>
              </div>
            );
          })}
        </div>
      </section>

      {renderProductSlider(
        "product-after-trust",
        "محصولات منتخب رنگ چوب",
        "پرفروش‌های تخصصی برای رنگ‌کاری، محافظت و ترمیم چوب، با قیمت مناسب و موجودی قابل اتکا.",
        productGroups[0],
      )}

      <section className="py-12 bg-white">
        <div className="container">
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <h2 className="text-2xl font-black md:text-3xl">{content.categoryTitle}</h2>
            <p className="max-w-2xl leading-8 text-[#687268]">
              {content.categoryText}
            </p>
            <div className="flex items-center gap-2">
              <button className="category-prev btn ghost" aria-label="دسته قبلی">
                <ChevronRight size={18} />
              </button>
              <Link className="btn ghost" href="/categories">
                همه دسته‌ها
              </Link>
              <button className="category-next btn ghost" aria-label="دسته بعدی">
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>

          <Swiper
            modules={[Navigation]}
            navigation={{ nextEl: ".category-next", prevEl: ".category-prev" }}
            spaceBetween={26}
            slidesPerView={2.1}
            breakpoints={{
              520: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
              1280: { slidesPerView: 6 },
            }}
            className="category-round-swiper !pb-2"
          >
            {productCategories.map((category) => {
              const meta = categoryMeta[category.slug];
              return (
                <SwiperSlide key={category.id}>
                  <Link className="category-round-card" href={`/products?category=${category.slug}`}>
                    <span className="category-round-image">
                      <Image
                        src={byKey[meta.assetKey]?.imageUrl}
                        alt={category.title}
                        fill
                        sizes="180px"
                        className="object-cover"
                      />
                    </span>
                    <strong>{category.title}</strong>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </section>

      {renderProductSlider(
        "product-after-categories",
        "پیشنهادهای ویژه کارگاهی",
        "محصولات مناسب کارگاه‌های رنگ، نجاری و پروژه‌های ساختمانی برای خرید سریع‌تر و مطمئن‌تر.",
        productGroups[1],
      )}

      <section className="nile-service-band py-12">
        <div className="container">
          <div className="mb-7 text-right text-white">
            <h2 className="text-2xl font-black md:text-3xl">{content.servicesTitle}</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {content.services.map((service, index) => {
              const Icon = serviceIcons[index] || Beaker;
              return (
                <article className="nile-service-card" key={service.title}>
                  <div className="nile-service-copy">
                    <span>نایل ارائه‌دهنده</span>
                    <Icon size={22} />
                    <h3>{service.title}</h3>
                    <Link href="/contact">بیشتر بدانید</Link>
                  </div>
                  <div className="nile-service-image">
                    <Image
                      src={byKey[service.assetKey]?.imageUrl}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {renderProductSlider(
        "product-after-services",
        "محصولات پیشنهادی خدمات فنی",
        "انتخاب‌های کاربردی برای آماده‌سازی سطح، اجرای لایه‌های پایه و پوشش نهایی چوب.",
        productGroups[2],
      )}

      <section className="bg-white py-12 text-center">
        <div className="container">
          <h2 className="mb-7 text-2xl font-black text-[#168447] md:text-3xl">
            برندهای تخصصی رنگ و پوشش چوب
          </h2>
          <div className="rounded-[18px] border border-[#e2e8df] bg-[#f8faf9] px-5 py-8 shadow-inner">
            <Swiper
              modules={[Autoplay, FreeMode]}
              loop
              freeMode
              speed={5000}
              autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
              slidesPerView="auto"
              spaceBetween={18}
              className="!py-1"
            >
              {[...brandAssets, ...brandAssets].map((brand, index) => (
                <SwiperSlide className="!w-[220px]" key={`${brand.key}-${index}`}>
                  <div className="grid h-36 place-items-center rounded-lg border border-[#e2e8df] bg-white p-4 shadow-sm">
                    <Image src={brand.imageUrl} alt={brand.label} width={160} height={72} className="max-h-16 object-contain" />
                    <strong className="text-[#334155]">{brand.label}</strong>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {renderProductSlider(
        "product-after-brands",
        "پرفروش‌های برندهای معتبر",
        "کالاهایی که برای سفارش‌های تکرارشونده و مصرف حرفه‌ای بیشتر انتخاب می‌شوند.",
        productGroups[0],
      )}

      <section className="bg-[#101411] py-12 text-white">
        <div className="container flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-[#cce66c]">
              <PackageCheck size={18} />
              فروش سازمانی
            </span>
            <h2 className="mt-4 text-2xl font-black md:text-3xl">
              برای کارگاه‌ها و پروژه‌های بزرگ، قیمت همکاری بگیرید.
            </h2>
            <p className="mt-3 max-w-3xl leading-8 text-white/75">
              نیاز مصرفی ماهانه، برند مورد نظر و حجم سفارش را ثبت کنید تا تیم
              فروش سازمانی پیشنهاد دقیق ارائه کند.
            </p>
          </div>
          <Link className="btn secondary bg-white !text-[#101411]" href="/wholesale">
            ثبت درخواست عمده
          </Link>
        </div>
      </section>

      {renderProductSlider(
        "product-before-blog",
        "آخرین فرصت‌های خرید",
        "چند پیشنهاد دیگر قبل از رفتن به مجله، مناسب سفارش‌های سریع و خریدهای تکمیلی.",
        productGroups[1],
      )}

      <section className="py-12">
        <div className="container">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-black md:text-3xl">آخرین مطالب مجله</h2>
              <p className="mt-2 text-[#687268]">
                راهنمای انتخاب، آماده‌سازی و اجرای پوشش‌های چوب.
              </p>
            </div>
            <Link className="btn ghost" href="/blog">
              همه مقالات
            </Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {latestPosts.length ? (
              latestPosts.map((post) => <BlogCard post={post} key={post.id} />)
            ) : (
              <p className="panel empty-state lg:col-span-3">هنوز مقاله‌ای منتشر نشده است.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
