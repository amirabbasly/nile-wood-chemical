"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useBlogPosts } from "@/lib/blog";
import { editorialArticles } from "@/lib/editorial";
import { BlogCard } from "@/components/BlogCard";

export function DatabaseBlogExtras() {
  const { posts } = useBlogPosts();
  const editorialSlugs = new Set(editorialArticles.map((article) => article.slug));
  const managedPosts = posts.filter((post) => !editorialSlugs.has(post.slug));
  if (!managedPosts.length) return null;
  return <section className="container editorial-list-section" aria-label="مقاله‌های تازه منتشرشده">
    <div className="editorial-section-heading"><div><span className="editorial-kicker">تازه منتشرشده</span><h2>از نویسندگان نایل وود</h2></div><Link className="editorial-read-more" href="/contact">پیشنهاد موضوع <ArrowLeft size={16} /></Link></div>
    <div className="editorial-grid">{managedPosts.map((post) => <BlogCard key={post.id} post={post} />)}</div>
  </section>;
}
