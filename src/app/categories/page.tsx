import Link from "next/link";
import { productCategories } from "@/lib/data";

export default function CategoriesPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-title">
          <div>
            <h1>منو و دسته‌بندی‌ها</h1>
            <p>محصولات را بر اساس نیاز اجرایی و نوع پوشش انتخاب کنید.</p>
          </div>
        </div>
        <div className="category-grid large">
          {productCategories.map((category) => (
            <Link href={`/products?category=${category.slug}`} className="category-card" key={category.id}>
              <span>{category.title}</span>
              <p>{category.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
