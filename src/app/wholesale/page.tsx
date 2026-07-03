"use client";

import { useState } from "react";
import { productCategories } from "@/lib/data";
import { supabase } from "@/lib/supabase";

export default function WholesalePage() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    company: "",
    productType: "",
    quantity: "",
    description: "",
  });
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (supabase) {
      await supabase.from("wholesale_requests").insert({
        full_name: form.fullName,
        phone: form.phone,
        company: form.company,
        product_type: form.productType,
        quantity: form.quantity,
        description: form.description,
      });
    }
    setStatus("درخواست خرید عمده ثبت شد. کارشناسان فروش تماس می‌گیرند.");
    setForm({ fullName: "", phone: "", company: "", productType: "", quantity: "", description: "" });
  }

  return (
    <section className="section">
      <div className="container wholesale-page">
        <div>
          <span className="badge">خرید عمده</span>
          <h1>فرم درخواست همکاری و سفارش حجمی</h1>
          <p>
            اطلاعات مصرف و نوع محصول را وارد کنید تا قیمت همکاری، زمان تأمین و
            شرایط ارسال به شما اعلام شود.
          </p>
        </div>
        <form className="panel contact-form" onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>نام و نام خانوادگی</label>
              <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="field">
              <label>شماره تماس</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="field">
              <label>نام شرکت یا مجموعه</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="field">
              <label>نوع محصول مورد نیاز</label>
              <select required value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })}>
                <option value="">انتخاب کنید</option>
                {productCategories.map((item) => (
                  <option key={item.id} value={item.title}>{item.title}</option>
                ))}
              </select>
            </div>
            <div className="field full">
              <label>حجم یا تعداد تقریبی سفارش</label>
              <input required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="field full">
              <label>توضیحات</label>
              <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          {status && <p className="form-message">{status}</p>}
          <button className="btn">ثبت درخواست</button>
        </form>
      </div>
    </section>
  );
}
