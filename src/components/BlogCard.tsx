"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteAssets } from "@/lib/site-assets";
import { BlogPost } from "@/lib/types";

export function BlogCard({ post }: { post: BlogPost }) {
  const { byKey } = useSiteAssets();
  const imageUrl = byKey[`blog-${post.id}`]?.imageUrl || post.image;

  return (
    <article className="blog-card">
      <Link href={`/blog/${post.slug}`} className="blog-image">
        <Image src={imageUrl} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
      </Link>
      <div>
        <span className="badge">{post.publishedAt}</span>
        <h3>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p>{post.excerpt}</p>
        <Link className="read-more" href={`/blog/${post.slug}`}>
          ادامه مطلب
        </Link>
      </div>
    </article>
  );
}
