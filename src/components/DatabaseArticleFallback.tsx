"use client";

import Image from "next/image";
import Link from "next/link";
import { useBlogPostBySlug } from "@/lib/blog";
import { useSiteAssets } from "@/lib/site-assets";

export function DatabaseArticleFallback({ slug }: { slug: string }) {
  const { post, loading, error } = useBlogPostBySlug(slug);
  const { byKey } = useSiteAssets();
  if (loading) return <main className="section container"><p>در حال بارگذاری مقاله...</p></main>;
  if (!post) return <main className="section container"><div className="panel auth-card"><h1>مقاله پیدا نشد</h1><p>{error || "ممکن است مقاله حذف شده یا هنوز منتشر نشده باشد."}</p><Link className="btn" href="/blog">بازگشت به مجله</Link></div></main>;
  const imageUrl = byKey[`blog-${post.id}`]?.imageUrl || post.image;
  return <main className="article-layout"><div className="container article-container"><article className="editorial-article"><header className="article-header"><span className="article-category">{post.category}</span><h1>{post.title}</h1><p className="article-excerpt">{post.excerpt}</p><div className="article-byline"><span>{post.author}</span><span>•</span><span>{post.publishedAt}</span></div></header><div className="article-cover"><Image src={imageUrl} alt={post.title} fill priority sizes="(max-width: 900px) 100vw, 900px" /></div><div className="article-body"><p>{post.content}</p><p>برای انتخاب محصول، سازگاری آن را با نوع چوب و شرایط پروژه بررسی کنید و پیش از اجرای اصلی روی نمونه آزمایش کنید. دستور مصرف و اطلاعات ایمنی محصول را همواره رعایت کنید.</p><Link href="/contact" className="btn">دریافت مشاوره</Link></div></article></div></main>;
}
