"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MathCaptcha } from "@/components/MathCaptcha";
import { showErrorAlert, showSuccessAlert } from "@/lib/alerts";
import {
  authEmailFromIdentifier,
  normalizeUsername,
  validateUsername,
} from "@/lib/auth-identity";
import { createMathCaptcha } from "@/lib/math-captcha";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    username: "",
    password: "",
  });
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
    if (form.fullName.trim().length < 3) {
      await showFormError("نام و نام خانوادگی را کامل وارد کنید.");
      return false;
    }

    if (!/^09\d{9}$|^\+?\d{8,15}$/.test(form.phone.trim())) {
      await showFormError("شماره تماس معتبر وارد کنید.");
      return false;
    }

    const username = normalizeUsername(form.username);
    if (!validateUsername(username)) {
      await showFormError("نام کاربری باید ۳ تا ۳۲ کاراکتر انگلیسی، عدد، نقطه، خط تیره یا زیرخط باشد.");
      return false;
    }

    if (form.password.length < 6) {
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
      await showFormError("برای ثبت‌نام، متغیرهای Supabase را در env تنظیم کنید.");
      setLoading(false);
      return;
    }

    const username = normalizeUsername(form.username);
    const { error } = await supabase.auth.signUp({
      email: authEmailFromIdentifier(username),
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          phone: form.phone,
          username,
          synthetic_email: true,
        },
      },
    });

    setLoading(false);
    if (error) {
      refreshCaptcha();
      await showFormError(error.message);
      return;
    }

    const successMessage = "ثبت‌نام انجام شد. اکنون می‌توانید با نام کاربری وارد شوید.";
    setMessage(successMessage);
    await showSuccessAlert(successMessage);
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
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>
        <div className="field">
          <label>شماره تماس</label>
          <input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="field">
          <label>نام کاربری</label>
          <input
            required
            dir="ltr"
            value={form.username}
            placeholder="نام کاربری"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div className="field">
          <label>رمز عبور</label>
          <input
            required
            minLength={6}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <p className="auth-terms">
          ثبت‌نام در این سایت به منزله قبول کردن تمامی{" "}
          <Link href="/terms">قوانین</Link> است.
        </p>
        <MathCaptcha
          challenge={captcha}
          value={captchaAnswer}
          onChange={setCaptchaAnswer}
          onRefresh={refreshCaptcha}
        />
        {message && <p className="form-message">{message}</p>}
        <button className="btn" disabled={loading}>
          {loading ? "در حال ثبت..." : "ثبت‌نام"}
        </button>
        <Link href="/auth/login">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <span className="text-green-600 hover:text-green-700 transition-colors">
            ورود
          </span>
        </Link>
      </form>
    </section>
  );
}
