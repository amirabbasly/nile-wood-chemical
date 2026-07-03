"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<CallbackShell message="در حال بررسی نتیجه پرداخت..." />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}

function PaymentCallbackContent() {
  const params = useSearchParams();
  const [message, setMessage] = useState("در حال بررسی نتیجه پرداخت...");

  useEffect(() => {
    async function verify() {
      const status = params.get("Status");
      const orderId = params.get("order_id");
      if (!orderId) {
        setMessage("شناسه سفارش در callback وجود ندارد.");
        return;
      }
      const success = status === "OK";
      if (supabase) {
        await supabase
          .from("orders")
          .update({
            payment_status: success ? "پرداخت موفق" : "پرداخت ناموفق",
            order_status: success ? "تکمیل شده" : "در انتظار پرداخت",
          })
          .eq("id", orderId);
        await supabase.from("payment_transactions").insert({
          order_id: orderId,
          authority: params.get("Authority"),
          status: success ? "success" : "failed",
          raw_payload: Object.fromEntries(params.entries()),
        });
      }
      setMessage(success ? "پرداخت با موفقیت ثبت شد." : "پرداخت ناموفق بود یا لغو شد.");
    }
    verify();
  }, [params]);

  return (
    <CallbackShell message={message} />
  );
}

function CallbackShell({ message }: { message: string }) {
  return (
    <section className="section auth-page">
      <div className="auth-card panel">
        <h1>نتیجه پرداخت</h1>
        <p>{message}</p>
        <Link className="btn" href="/account/orders">بازگشت به سفارشات</Link>
      </div>
    </section>
  );
}
