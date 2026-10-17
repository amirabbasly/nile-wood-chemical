import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Clock3 } from "lucide-react";
import { editorialArticles } from "@/lib/editorial";
import { DatabaseBlogExtras } from "@/components/DatabaseBlogExtras";

export const metadata: Metadata = {
  title: "مجله تخصصی رنگ و پوشش چوب | راهنمای اجرا و انتخاب محصول",
  description: "مقاله‌ها و راهنماهای تخصصی نایل وود درباره رنگ چوب، روغن چوب، سیلر و کیلر، آماده‌سازی سطح و نگهداری چوب.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return <main className="editorial-page">
    <section className="editorial-hero"><div className="container editorial-hero-inner">
      <span className="editorial-kicker"><BookOpen size={17} /> مجله تخصصی نایل وود</span>
      <h1>دانش درست، <em>اجرای ماندگار</em></h1>
      <p>راهنماهای کاربردی برای انتخاب پوشش، آماده‌سازی چوب و اجرای بهتر در کارگاه و خانه.</p>
      <div className="editorial-hero-meta"><span>راهنمای رنگ و پوشش چوب</span><span>•</span><span>{editorialArticles.length} مقاله تخصصی</span></div>
    </div></section>
    <section className="container editorial-list-section">
      <div className="editorial-section-heading"><div><span className="editorial-kicker">از مجله بخوانید</span><h2>راهنماهای کاربردی چوب</h2></div><p>پاسخ‌های روشن برای انتخاب و اجرای پوشش‌های چوب</p></div>
      <div className="editorial-grid">
        {editorialArticles.map((article, index) => <article className={`editorial-card ${index === 0 ? "featured" : ""}`} key={article.slug}>
          <Link href={`/blog/${article.slug}`} className="editorial-card-image" aria-label={article.title}>
            <Image src={article.image} alt={article.title} fill sizes={index === 0 ? "(max-width: 760px) 100vw, 60vw" : "(max-width: 760px) 100vw, 33vw"} />
            <span>{article.category}</span>
          </Link>
          <div className="editorial-card-body"><div className="editorial-card-meta"><span>{article.publishedAt}</span><span><Clock3 size={14} /> {article.readTime}</span></div>
            <h2><Link href={`/blog/${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt}</p>
            <Link className="editorial-read-more" href={`/blog/${article.slug}`}>مطالعه راهنما <ArrowLeft size={16} /></Link>
          </div>
        </article>)}
      </div>
    </section>
    <DatabaseBlogExtras />
    <section className="editorial-cta"><div className="container"><div><span>برای انتخاب دقیق‌تر</span><h2>پروژه‌تان را با ما در میان بگذارید</h2><p>نوع چوب، محل اجرا و نتیجه دلخواه را بگویید تا برای بررسی گزینه‌های مناسب راهنمایی‌تان کنیم.</p></div><Link href="/contact">دریافت مشاوره <ArrowLeft size={17} /></Link></div></section>
  </main>;
}
