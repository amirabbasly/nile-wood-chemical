"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useBlogPostBySlug } from "@/lib/blog";
import { useSiteAssets } from "@/lib/site-assets";

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>();
  const { byKey } = useSiteAssets();
  const { post, loading, error } = useBlogPostBySlug(params.slug);

  if (loading) {
    return <section className="section container">در حال بارگذاری مقاله...</section>;
  }

  if (!post) {
    return (
      <section className="section container">
        <div className="panel auth-card">
          <h1>مقاله پیدا نشد</h1>
          <p>{error || "ممکن است مقاله حذف شده یا هنوز منتشر نشده باشد."}</p>
          <Link className="btn" href="/blog">
            بازگشت به مجله
          </Link>
        </div>
      </section>
    );
  }

  const imageUrl = byKey[`blog-${post.id}`]?.imageUrl || post.image;

  return (
    <article className="section article-page">
      <div className="container article-wrap">
        <span className="badge">{post.publishedAt}</span>
        <h1>{post.title}</h1>
        <p className="lead">{post.excerpt}</p>
        <div className="article-image">
          <Image src={imageUrl} alt={post.title} fill sizes="100vw" priority />
        </div>
        <p>{post.content}</p>
        <p>
          در پروژه‌های حساس، قبل از خرید نهایی با تیم فنی مشورت کنید تا محصول با
          شرایط محیط، نوع چوب و روش اجرا سازگار باشد.
        </p>
        <strong>نویسنده: {post.author}</strong>
      </div>
    </article>
  );
}
