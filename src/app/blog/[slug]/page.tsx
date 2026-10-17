import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DatabaseArticleFallback } from "@/components/DatabaseArticleFallback";
import { ArrowLeft, BookOpen, Clock3 } from "lucide-react";
import { editorialArticles, getEditorialArticle } from "@/lib/editorial";

const origin = "https://nilewoodchem.com";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return editorialArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getEditorialArticle(slug);
  if (!article) return { title: "مقاله پیدا نشد | مجله نایل وود" };
  return {
    title: `${article.title} | مجله نایل وود`,
    description: article.excerpt,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: { type: "article", locale: "fa_IR", title: article.title, description: article.excerpt, url: `${origin}/blog/${article.slug}`, images: [{ url: article.image, alt: article.title }] },
  };
}

export default async function EditorialArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getEditorialArticle(slug);
  if (!article) return <DatabaseArticleFallback slug={slug} />;
  const index = editorialArticles.findIndex((item) => item.slug === article.slug);
  const related = editorialArticles.filter((item) => item.slug !== article.slug).slice(Math.max(0, index - 1), Math.max(0, index - 1) + 3);
  const articleJsonLd = {
    "@context": "https://schema.org", "@type": "Article", headline: article.title,
    description: article.excerpt, image: [`${origin}${article.image}`], datePublished: article.publishedIso,
    dateModified: article.publishedIso, author: { "@type": "Organization", name: "تیم محتوای نایل وود", url: origin },
    publisher: { "@type": "Organization", name: "Nile Wood Chemicals", url: origin }, mainEntityOfPage: `${origin}/blog/${article.slug}`,
  };
  const faqJsonLd = article.faqs?.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: article.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) } : null;
  return <main className="article-layout">
    <div className="container article-container">
      <nav className="article-breadcrumb" aria-label="مسیر صفحه"><Link href="/">خانه</Link><span>/</span><Link href="/blog">مجله نایل وود</Link><span>/</span><span>{article.category}</span></nav>
      <article className="editorial-article">
        <header className="article-header"><span className="article-category"><BookOpen size={15} /> {article.category}</span><h1>{article.title}</h1><p className="article-excerpt">{article.excerpt}</p><div className="article-byline"><span>تیم محتوای نایل وود</span><span>•</span><span>{article.publishedAt}</span><span>•</span><span><Clock3 size={15} /> {article.readTime} مطالعه</span></div></header>
        <div className="article-cover"><Image src={article.image} alt={article.title} fill priority sizes="(max-width: 900px) 100vw, 900px" /></div>
        <div className="article-body">
          <div className="article-table-of-contents"><strong>در این راهنما می‌خوانید</strong><ol>{article.sections.map((section, i) => <li key={section.heading}><a href={`#section-${i + 1}`}>{section.heading}</a></li>)}</ol></div>
          {article.sections.map((section, i) => <section id={`section-${i + 1}`} key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}
          {article.faqs?.length ? <section className="article-faq"><h2>پرسش‌های متداول</h2>{article.faqs.map((faq) => <div key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></div>)}</section> : null}
          <aside className="article-safety"><strong>یادآوری مهم</strong><p>ویژگی‌ها و روش استفاده بین محصولات متفاوت است. پیش از اجرا، برچسب و برگه فنی و ایمنی همان محصول را بخوانید و توصیه‌های سازنده را رعایت کنید.</p></aside>
        </div>
      </article>
      <section className="related-articles"><div className="editorial-section-heading"><div><span className="editorial-kicker">ادامه مطالعه</span><h2>راهنماهای مرتبط</h2></div><Link href="/blog">همه مقاله‌ها <ArrowLeft size={16} /></Link></div><div className="related-grid">{related.map((item) => <Link className="related-card" href={`/blog/${item.slug}`} key={item.slug}><span>{item.category}</span><strong>{item.title}</strong><small>{item.readTime} مطالعه <ArrowLeft size={14} /></small></Link>)}</div></section>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }} />
    {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />}
  </main>;
}
