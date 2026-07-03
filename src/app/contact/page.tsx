"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { telHref, useSiteSettings } from "@/lib/site-settings";

export default function ContactPage() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (supabase) {
      await supabase.from("contact_messages").insert({
        name: form.name,
        phone: form.phone,
        email: form.email,
        message: form.message,
      });
    }
    setStatus("پیام شما ثبت شد و تیم پشتیبانی پیگیری می‌کند.");
    setForm({ name: "", phone: "", email: "", message: "" });
  }

  return (
    <section className="section">
      <div className="container contact-layout">
        <div>
          <span className="badge">تماس با ما</span>
          <h1>{settings.contactTitle}</h1>
          <p>{settings.contactIntro}</p>
          <div className="contact-list">
            <a href={telHref(settings.phonePrimary)}>
              <Phone />
              {settings.phonePrimary}
            </a>
            <a href={`mailto:${settings.email}`}>
              <Mail />
              {settings.email}
            </a>
            <span>
              <MapPin />
              {settings.address}
            </span>
          </div>
        </div>
        <form className="panel contact-form" onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>نام</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>شماره تماس</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="field full">
              <label>ایمیل</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="field full">
              <label>پیام</label>
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
          </div>
          {status && <p className="form-message">{status}</p>}
          <button className="btn">ارسال پیام</button>
        </form>
      </div>
    </section>
  );
}
