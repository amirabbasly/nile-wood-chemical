"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!supabase) {
      setMessage("برای ورود، متغیرهای Supabase را در env تنظیم کنید.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) setMessage(error.message);
    else router.push("/account/orders");
  }

  return (
    <section className="section auth-page">
      <form className="auth-card panel" onSubmit={submit}>
        <div className="auth-brand">
          <Image
            src="/logo/logo-brandname.jpg"
            alt="Nile Wood Chemicals"
            width={210}
            height={60}
            priority
          />
          <strong>Nile Wood Chemicals</strong>
        </div>

        <h1></h1>
        <div className="field">
          <label>ایمیل</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>رمز عبور</label>
          <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {message && <p className="form-message">{message}</p>}
        <button className="btn" disabled={loading}>
          {loading ? "در حال ورود..." : "ورود"}
        </button>
        <Link href="/auth/register">حساب ندارید؟ ثبت‌نام کنید</Link>
      </form>
    </section>
  );
}
