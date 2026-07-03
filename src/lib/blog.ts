"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { BlogPost } from "./types";

type DbBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  author: string | null;
  category_id: string | null;
  image_url: string | null;
  published_at: string | null;
  published: boolean;
};

function formatPublishedAt(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("fa-IR");
}

export function mapDbBlogPost(post: DbBlogPost): BlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    content: post.content || "",
    author: post.author || "تیم Nile",
    category: post.category_id || "guides",
    image: post.image_url || "/logo/logo-image.jpg",
    publishedAt: formatPublishedAt(post.published_at),
    published: post.published,
  };
}

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadPosts() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error: postsError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (!alive) return;
      if (postsError) {
        setError(postsError.message);
        setLoading(false);
        return;
      }

      setPosts(data?.map((post) => mapDbBlogPost(post as DbBlogPost)) || []);
      setLoading(false);
    }

    loadPosts();
    return () => {
      alive = false;
    };
  }, []);

  return { posts, loading, error };
}

export function useBlogPostBySlug(slug?: string) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase && slug));
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadPost() {
      if (!supabase || !slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error: postError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", decodeURIComponent(slug))
        .eq("published", true)
        .maybeSingle();

      if (!alive) return;
      if (postError) {
        setError(postError.message);
        setLoading(false);
        return;
      }

      setPost(data ? mapDbBlogPost(data as DbBlogPost) : null);
      setLoading(false);
    }

    loadPost();
    return () => {
      alive = false;
    };
  }, [slug]);

  return { post, loading, error };
}
