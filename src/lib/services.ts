"use client";

import { productCategories } from "./data";
import { supabase } from "./supabase";

export async function getProducts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error || !data?.length) return [];
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    price: Number(item.price),
    oldPrice: item.old_price ? Number(item.old_price) : undefined,
    stock: item.stock,
    category: item.category_id,
    image: item.image_url || "/logo/logo-image.jpg",
    summary: item.summary || "",
    description: item.description || "",
    features: item.features || [],
    published: item.published,
    brand: item.brand || "Nile",
  }));
}

export async function getCategories() {
  if (!supabase) return productCategories;
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .order("title");
  if (error || !data?.length) return productCategories;
  return data;
}

export async function getBlogPosts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error || !data?.length) return [];
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt || "",
    content: item.content || "",
    author: item.author || "تیم Nile",
    category: item.category_id,
    image: item.image_url || "/logo/logo-image.jpg",
    publishedAt: item.published_at || "",
    published: item.published,
  }));
}
