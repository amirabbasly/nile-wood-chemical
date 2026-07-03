"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { startZarinpalPayment } from "@/lib/zarinpal";

type Order = {
  id: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setOrders([
          {
            id: "demo-order",
            total_amount: 2360000,
            payment_status: "در انتظار پرداخت",
            order_status: "در انتظار پرداخت",
            created_at: new Date().toISOString(),
          },
        ]);
        return;
      }
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      setOrders(data || []);
    }
    load();
  }, []);

  async function pay(order: Order) {
    try {
      await startZarinpalPayment({
        amount: order.total_amount,
        orderId: order.id,
        description: "پرداخت سفارش Nile Wood Chemicals",
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "خطا در اتصال پرداخت");
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-title">
          <div>
            <h1>سفارشات کاربر</h1>
            <p>وضعیت پرداخت و پردازش سفارش‌های شما.</p>
          </div>
        </div>
        {message && <p className="form-message">{message}</p>}
        <div className="panel table-panel">
          {orders.map((order) => (
            <div className="order-row" key={order.id}>
              <div>
                <strong>سفارش #{order.id.slice(0, 8)}</strong>
                <span>{new Date(order.created_at).toLocaleDateString("fa-IR")}</span>
              </div>
              <span>{formatPrice(order.total_amount)}</span>
              <span>{order.payment_status}</span>
              <span>{order.order_status}</span>
              <button className="btn" onClick={() => pay(order)}>
                نهایی کردن سفارش
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
