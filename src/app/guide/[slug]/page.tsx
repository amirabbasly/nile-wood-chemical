import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, BookOpenCheck } from "lucide-react";
import { buyingGuides, getBuyingGuide } from "@/lib/guides";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return buyingGuides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getBuyingGuide(slug);
  if (!guide) return { title: "راهنما پیدا نشد | نایل وود", robots: { index: false, follow: true } };
  return { title: `${guide.title} | نایل وود`, description: guide.description, alternates: { canonical: `/guide/${slug}` }, openGraph: { type: "article", locale: "fa_IR", title: guide.title, description: guide.description, images: [{ url: guide.image, alt: guide.title }] } };
}

export default async function BuyingGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getBuyingGuide(slug);
  if (!guide) notFound();
  const faq = { "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.description, image: `https://nilewoodchem.com${guide.image}`, author: { "@type": "Organization", name: "تیم نایل وود" }, publisher: { "@type": "Organization", name: "Nile Wood Chemicals" }, mainEntityOfPage: `https://nilewoodchem.com/guide/${guide.slug}` };
  return <main className="article-layout"><div className="container article-container"><nav className="article-breadcrumb" aria-label="مسیر صفحه"><Link href="/">خانه</Link><span>/</span><Link href="/guide">راهنمای خرید</Link><span>/</span><span>{guide.category}</span></nav>
    <article className="editorial-article"><header className="article-header"><span className="article-category"><BookOpenCheck size={15} /> راهنمای انتخاب {guide.category}</span><h1>{guide.title}</h1><p className="article-excerpt">{guide.subtitle}</p></header>
      <div className="article-cover"><Image src={guide.image} alt={guide.title} fill priority sizes="(max-width: 900px) 100vw, 900px" /></div>
      <div className="article-body"><p>{guide.description}</p><div className="article-table-of-contents"><strong>در این راهنما</strong><ol>{guide.points.map((point, i) => <li key={point.title}><a href={`#guide-${i + 1}`}>{point.title}</a></li>)}</ol></div>
        {guide.points.map((point, i) => <section id={`guide-${i + 1}`} key={point.title}><h2>{point.title}</h2><p>{point.text}</p></section>)}
        <section><h2>چک‌لیست پیش از خرید</h2><ul>{guide.steps.map((step) => <li key={step}>{step}</li>)}</ul></section>
        <aside className="article-safety"><strong>نکته ایمنی و فنی</strong><p>فرمول و روش استفاده محصولات با هم متفاوت است. برچسب و برگه فنی و ایمنی محصول را بخوانید و در صورت تردید با متخصص مشورت کنید.</p></aside>
        <div className="guide-actions"><Link className="btn" href={guide.productHref}>دیدن محصولات {guide.category} <ArrowLeft size={17} /></Link><Link className="guide-article-link" href={`/blog/${guide.articleSlug}`}><BadgeCheck size={17} /> مطالعه مقاله تخصصی مرتبط</Link></div>
      </div>
    </article>
  </div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq).replace(/</g, "\\u003c") }} /></main>;
}
