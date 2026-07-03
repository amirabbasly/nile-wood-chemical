"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { useSiteAssets } from "@/lib/site-assets";
import { addToCart } from "@/lib/store";
import { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { byKey } = useSiteAssets();
  const imageUrl = byKey[`product-${product.id}`]?.imageUrl || product.image;
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-image">
        {discount > 0 && <span className="discount">-{discount}%</span>}
        <Image src={imageUrl} alt={product.title} fill sizes="(max-width: 768px) 50vw, 25vw" />
      </Link>
      <div className="product-info">
        <span className="product-brand">{product.brand}</span>
        <Link href={`/products/${product.slug}`}>
          <h3>{product.title}</h3>
        </Link>
        <div className="price-row">
          <strong>{formatPrice(product.price)}</strong>
          {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
        </div>
        <button className="btn" onClick={() => addToCart(product)}>
          <ShoppingCart size={18} />
          افزودن به سبد خرید
        </button>
      </div>
    </article>
  );
}
