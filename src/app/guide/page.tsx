import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpenCheck } from "lucide-react";
import { buyingGuides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "راهنمای خرید رنگ و پوشش چوب | نایل وود",
  description: "راهنمای تخصصی انتخاب رنگ چوب، روغن چوب، سیلر و کیلر؛ معیارهای خرید، آماده‌سازی و اجرای ایمن را بخوانید.",
  alternates: { canonical: "/guide" },
};

export default function GuidesIndexPage() {
  return <main className="editorial-page">
    <section className="editorial-hero"><div className="container editorial-hero-inner"><span className="editorial-kicker"><BookOpenCheck size={17} /> مرکز راهنمای انتخاب</span><h1>انتخاب بهتر، <em>نتیجه ماندگارتر</em></h1><p>راهنماهای روشن برای شناخت پوشش‌های چوب و انتخاب محصول متناسب با پروژه شما.</p></div></section>
    <section className="container editorial-list-section"><div className="editorial-section-heading"><div><span className="editorial-kicker">راهنمای خرید</span><h2>از کجا شروع کنید؟</h2></div><p>نوع چوب، محل اجرا و ظاهر دلخواهتان را مشخص کنید.</p></div>
      <div className="guide-index-grid">{buyingGuides.map((guide) => <article className="guide-index-card" key={guide.slug}><Link className="guide-index-image" href={`/guide/${guide.slug}`}><Image src={guide.image} alt={guide.title} fill sizes="(max-width: 760px) 100vw, 33vw" /></Link><div><span>{guide.category}</span><h2><Link href={`/guide/${guide.slug}`}>{guide.title}</Link></h2><p>{guide.subtitle}</p><Link className="editorial-read-more" href={`/guide/${guide.slug}`}>مطالعه راهنما <ArrowLeft size={16} /></Link></div></article>)}</div>
    </section>
    <section className="editorial-cta"><div className="container"><div><span>نیاز به راهنمایی دارید؟</span><h2>هر پروژه شرایط خاص خودش را دارد</h2><p>با مشخص‌کردن نوع چوب و محل مصرف، مسیر انتخاب را دقیق‌تر کنید.</p></div><Link href="/contact">تماس با ما <ArrowLeft size={17} /></Link></div></section>
  </main>;
}
