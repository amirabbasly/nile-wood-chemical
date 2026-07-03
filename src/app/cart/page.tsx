"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { useProducts } from "@/lib/products";
import { clearCart, readCart, updateCart } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export default function CartPage() {
  const [items, setItems] = useState(readCart());
  const [message, setMessage] = useState("");
  const { products } = useProducts();

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);

  const cart = items
    .map((item) => ({ ...item, product: products.find((product) => product.id === item.productId) }))
    .filter((item) => item.product);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
    [cart],
  );

  async function createOrder() {
    if (!cart.length) return;
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const { data: order } = await supabase
        .from("orders")
        .insert({
          user_id: userData.user?.id,
          total_amount: total,
          payment_status: "در انتظار پرداخت",
          order_status: "در انتظار پرداخت",
        })
        .select()
        .single();
      if (order) {
        await supabase.from("order_items").insert(
          cart.map((item) => ({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.product?.price || 0,
          })),
        );
        clearCart();
        window.location.href = "/account/orders";
        return;
      }
    }
    setMessage("سفارش نمونه ثبت شد. برای ثبت واقعی، Supabase را تنظیم کنید.");
  }

  return (
    <section className="section">
      <div className="container cart-page">
        <div>
          <h1>سبد خرید</h1>
          <div className="panel table-panel">
            {cart.length === 0 ? (
              <p>سبد خرید خالی است.</p>
            ) : (
              cart.map((item) => (
                <div className="cart-row" key={item.productId}>
                  <Link href={`/products/${item.product?.slug}`}>{item.product?.title}</Link>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateCart(item.productId, Number(e.target.value))}
                  />
                  <strong>{formatPrice((item.product?.price || 0) * item.quantity)}</strong>
                  <button
                    className="btn ghost cart-remove"
                    type="button"
                    onClick={() => updateCart(item.productId, 0)}
                    aria-label="حذف محصول از سبد"
                    title="حذف"
                  >
                    <Trash2 size={17} />
                    حذف
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <aside className="panel cart-summary">
          <h2>خلاصه سفارش</h2>
          <div>
            <span>جمع کل</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          {message && <p className="form-message">{message}</p>}
          <button className="btn" onClick={createOrder} disabled={!cart.length}>
            ثبت سفارش
          </button>
          <Link className="btn ghost" href="/products">ادامه خرید</Link>
        </aside>
      </div>
    </section>
  );
}
