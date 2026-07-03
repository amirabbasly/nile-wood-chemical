"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, Search } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { productCategories } from "@/lib/data";
import { useProducts } from "@/lib/products";

export default function ProductsPage() {
  return (
    <Suspense fallback={<section className="section container">در حال بارگذاری محصولات...</section>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const { products, loading, error } = useProducts();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [inStock, setInStock] = useState(false);

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const matchQuery =
          !query ||
          product.title.includes(query) ||
          product.summary.includes(query) ||
          product.features.some((item) => item.includes(query));
        const matchCategory = category === "all" || product.category === category;
        const matchStock = !inStock || product.stock > 0;
        return matchQuery && matchCategory && matchStock;
      }),
    [products, query, category, inStock],
  );

  return (
    <section className="section">
      <div className="container shop-layout">
        <aside className="filters panel">
          <h2>
            <Filter size={20} />
            فیلتر محصولات
          </h2>
          <div className="field">
            <label>جستجو</label>
            <div className="filter-search">
              <Search size={18} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="نام محصول..." />
            </div>
          </div>
          <div className="field">
            <label>دسته‌بندی</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">همه دسته‌ها</option>
              {productCategories.map((item) => (
                <option value={item.slug} key={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
          <label className="check-row">
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
            فقط کالاهای موجود
          </label>
        </aside>

        <div>
          <div className="section-title">
            <div>
              <h1>محصولات</h1>
              <p>
                {loading
                  ? "در حال دریافت محصولات..."
                  : `${filtered.length} محصول برای انتخاب شما آماده است.`}
              </p>
            </div>
          </div>
          {error && <p className="form-message danger">خطا در دریافت محصولات: {error}</p>}
          <div className="products-grid">
            {filtered.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
