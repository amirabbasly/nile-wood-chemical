"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Product } from "./types";

type DbProduct = {
  id: string;
  title: string;
  slug: string;
  price: number | string;
  old_price?: number | string | null;
  stock: number | null;
  category_id: string | null;
  brand: string | null;
  image_url: string | null;
  summary: string | null;
  description: string | null;
  features: string[] | null;
  published: boolean;
};

const fallbackImage = "/logo/logo-image.jpg";

export function mapDbProduct(product: DbProduct): Product {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: Number(product.price || 0),
    oldPrice: product.old_price ? Number(product.old_price) : undefined,
    stock: Number(product.stock || 0),
    category: product.category_id || "wood-stain",
    image: product.image_url || fallbackImage,
    summary: product.summary || "",
    description: product.description || product.summary || "",
    features: product.features?.length ? product.features : [],
    published: product.published,
    brand: product.brand || "Nile Wood",
  };
}

export function useProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadProducts() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (!alive) return;
      if (productsError) {
        setError(productsError.message);
        setLoading(false);
        return;
      }

      setItems(data?.map((product) => mapDbProduct(product as DbProduct)) || []);
      setLoading(false);
    }

    loadProducts();
    return () => {
      alive = false;
    };
  }, []);

  return { products: items, loading, error };
}

export function useProductBySlug(slug?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase && slug));
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadProduct() {
      if (!supabase || !slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("slug", decodeURIComponent(slug))
        .eq("published", true)
        .maybeSingle();

      if (!alive) return;
      if (productError) {
        setError(productError.message);
        setLoading(false);
        return;
      }

      setProduct(data ? mapDbProduct(data as DbProduct) : null);
      setLoading(false);
    }

    loadProduct();
    return () => {
      alive = false;
    };
  }, [slug]);

  return { product, loading, error };
}
