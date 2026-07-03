"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShoppingCart } from "lucide-react";
import { useParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/data";
import { useProductBySlug, useProducts } from "@/lib/products";
import { useSiteAssets } from "@/lib/site-assets";
import { addToCart } from "@/lib/store";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { byKey } = useSiteAssets();
  const { product, loading, error } = useProductBySlug(params.slug);
  const { products } = useProducts();
  if (loading) return <section className="section container">در حال بارگذاری محصول...</section>;
  if (!product) {
    return (
      <section className="section container">
        <div className="panel auth-card">
          <h1>محصول پیدا نشد</h1>
          <p>{error || "ممکن است محصول حذف شده یا هنوز منتشر نشده باشد."}</p>
          <Link className="btn" href="/products">بازگشت به محصولات</Link>
        </div>
      </section>
    );
  }
  const imageUrl = byKey[`product-${product.id}`]?.imageUrl || product.image;

  const related = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <section className="section">
        <div className="container product-detail">
          <div className="detail-image panel">
            <Image src={imageUrl} alt={product.title} fill sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
          <div className="detail-info">
            <span className="badge">{product.brand}</span>
            <h1>{product.title}</h1>
            <p>{product.description}</p>
            <div className="detail-price">
              <strong>{formatPrice(product.price)}</strong>
              {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
            </div>
            <div className="stock">موجودی: {product.stock} عدد</div>
            <div className="feature-list">
              {product.features.map((feature) => (
                <span key={feature}>
                  <CheckCircle2 size={18} />
                  {feature}
                </span>
              ))}
            </div>
            <div className="hero-actions">
              <button className="btn" onClick={() => addToCart(product)}>
                <ShoppingCart size={18} />
                افزودن به سبد خرید
              </button>
              <Link className="btn secondary" href="/wholesale">
                استعلام عمده
              </Link>
            </div>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section product-band">
          <div className="container">
            <div className="section-title">
              <h2>محصولات مرتبط</h2>
            </div>
            <div className="products-grid">
              {related.map((item) => (
                <ProductCard product={item} key={item.id} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
