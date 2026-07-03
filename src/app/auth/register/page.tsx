"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!supabase) {
      setMessage("برای ثبت‌نام، متغیرهای Supabase را در env تنظیم کنید.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, phone: form.phone } },
    });

    setLoading(false);
    setMessage(error ? error.message : "ثبت‌نام انجام شد. ایمیل خود را بررسی کنید.");
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

        <h1 className="text-center"></h1>
        <div className="field">
          <label>نام و نام خانوادگی</label>
          <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div className="field">
          <label>شماره تماس</label>
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="field">
          <label>ایمیل</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <label>رمز عبور</label>
          <input required minLength={6} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <p className="auth-terms">
          ثبت‌نام در این سایت به منزله قبول کردن تمامی{" "}
          <Link href="/terms">قوانین</Link>
          {" "}است.
        </p>
        {message && <p className="form-message">{message}</p>}
        <button className="btn" disabled={loading}>
          {loading ? "در حال ثبت..." : "ثبت‌نام"}
        </button>
        <Link href="/auth/login">قبلاً ثبت‌نام کرده‌اید؟ ورود</Link>
      </form>
    </section>
  );
}
