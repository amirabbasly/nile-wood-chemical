"use client";

import { BlogCard } from "@/components/BlogCard";
import { useBlogPosts } from "@/lib/blog";

export default function BlogPage() {
  const { posts, loading, error } = useBlogPosts();

  return (
    <section className="section">
      <div className="container">
        <div className="section-title">
          <div>
            <h1>مجله Nile</h1>
            <p>آموزش، راهنمای خرید و نکات فنی اجرای رنگ و پوشش چوب.</p>
          </div>
        </div>
        {loading && <p className="form-message">در حال دریافت مطالب مجله...</p>}
        {error && <p className="form-message danger">خطا در دریافت مجله: {error}</p>}
        {!loading && !posts.length && !error && (
          <p className="panel empty-state">هنوز مقاله‌ای منتشر نشده است.</p>
        )}
        <div className="blog-grid">
          {posts.map((post) => (
            <BlogCard post={post} key={post.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
