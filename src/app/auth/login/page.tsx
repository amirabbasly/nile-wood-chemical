"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MathCaptcha } from "@/components/MathCaptcha";
import { showErrorAlert } from "@/lib/alerts";
import { authEmailFromIdentifier } from "@/lib/auth-identity";
import { createMathCaptcha } from "@/lib/math-captcha";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState(() => createMathCaptcha());
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function refreshCaptcha() {
    setCaptcha(createMathCaptcha());
    setCaptchaAnswer("");
  }

  async function showFormError(text: string) {
    setMessage(text);
    await showErrorAlert(text);
  }

  async function validateForm() {
    if (!identifier.trim()) {
      await showFormError("نام کاربری یا ایمیل را وارد کنید.");
      return false;
    }

    if (password.length < 6) {
      await showFormError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      return false;
    }

    if (Number(captchaAnswer) !== captcha.answer) {
      refreshCaptcha();
      await showFormError("پاسخ اعتبارسنجی ریاضی درست نیست.");
      return false;
    }

    return true;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const valid = await validateForm();
    if (!valid) {
      setLoading(false);
      return;
    }

    if (!supabase) {
      await showFormError("برای ورود، متغیرهای Supabase را در env تنظیم کنید.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmailFromIdentifier(identifier),
      password,
    });
    setLoading(false);

    if (error) {
      refreshCaptcha();
      await showFormError(error.message);
    }
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
          <label>نام کاربری یا ایمیل</label>
          <input
            required
            dir="ltr"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="نام کاربری"
          />
        </div>
        <div className="field">
          <label>رمز عبور</label>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <MathCaptcha
          challenge={captcha}
          value={captchaAnswer}
          onChange={setCaptchaAnswer}
          onRefresh={refreshCaptcha}
        />
        {message && <p className="form-message">{message}</p>}
        <button className="btn" disabled={loading}>
          {loading ? "در حال ورود..." : "ورود"}
        </button>
        <Link href="/auth/register">
          حساب ندارید؟ <span className="text-green-600">ثبت‌نام کنید</span>
        </Link>
      </form>
    </section>
  );
}
