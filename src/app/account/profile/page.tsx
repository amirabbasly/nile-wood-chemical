"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LockKeyhole, LogOut, Save, ShoppingBag, UserRound } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Profile = {
  full_name: string;
  phone: string;
  email: string;
  role: string;
};

const emptyProfile: Profile = {
  full_name: "",
  phone: "",
  email: "",
  role: "user",
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!supabase) {
        setMessage("Supabase تنظیم نیست.");
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/auth/login");
        return;
      }

      setUser(userData.user);
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, email, role")
        .eq("id", userData.user.id)
        .single();

      setProfile({
        full_name: data?.full_name || userData.user.user_metadata?.full_name || "",
        phone: data?.phone || userData.user.user_metadata?.phone || "",
        email: data?.email || userData.user.email || "",
        role: data?.role || "user",
      });
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setSaving(false);
    setMessage(error ? `خطا در ذخیره اطلاعات: ${error.message}` : "اطلاعات پروفایل ذخیره شد.");
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setMessage("");
    if (passwords.password.length < 6) {
      setMessage("رمز عبور جدید باید حداقل ۶ کاراکتر باشد.");
      return;
    }
    if (passwords.password !== passwords.confirm) {
      setMessage("تکرار رمز عبور با رمز جدید یکسان نیست.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.password });
    setSaving(false);

    if (error) {
      setMessage(`خطا در تغییر رمز عبور: ${error.message}`);
      return;
    }

    setPasswords({ password: "", confirm: "" });
    setMessage("رمز عبور با موفقیت تغییر کرد.");
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/");
  }

  if (loading) {
    return <section className="section container">در حال بارگذاری پروفایل...</section>;
  }

  return (
    <section className="section profile-page">
      <div className="container">
        <div className="section-title">
          <div>
            <h1>پروفایل کاربری</h1>
            <p>اطلاعات حساب، سفارش‌ها و رمز عبور خود را مدیریت کنید.</p>
          </div>
          <Link className="btn ghost" href="/account/orders">
            <ShoppingBag size={18} />
            سفارش‌های من
          </Link>
        </div>

        {message && <p className="form-message">{message}</p>}

        <div className="profile-layout">
          <form className="panel profile-card" onSubmit={saveProfile}>
            <div className="profile-card-head">
              <UserRound size={26} />
              <div>
                <h2>اطلاعات حساب</h2>
                <span>{profile.role === "admin" ? "مدیر سایت" : "کاربر عادی"}</span>
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>نام و نام خانوادگی</label>
                <input
                  value={profile.full_name}
                  onChange={(event) => setProfile({ ...profile, full_name: event.target.value })}
                />
              </div>
              <div className="field">
                <label>شماره تماس</label>
                <input
                  value={profile.phone}
                  onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                />
              </div>
              <div className="field full">
                <label>ایمیل</label>
                <input value={profile.email} disabled />
              </div>
            </div>
            <button className="btn" disabled={saving}>
              <Save size={18} />
              {saving ? "در حال ذخیره..." : "ذخیره اطلاعات"}
            </button>
          </form>

          <form className="panel profile-card" onSubmit={changePassword}>
            <div className="profile-card-head">
              <LockKeyhole size={26} />
              <div>
                <h2>تغییر رمز عبور</h2>
                <span>بعد از تغییر رمز، ورودهای بعدی با رمز جدید انجام می‌شود.</span>
              </div>
            </div>
            <div className="field">
              <label>رمز عبور جدید</label>
              <input
                required
                minLength={6}
                type="password"
                value={passwords.password}
                onChange={(event) => setPasswords({ ...passwords, password: event.target.value })}
              />
            </div>
            <div className="field">
              <label>تکرار رمز عبور جدید</label>
              <input
                required
                minLength={6}
                type="password"
                value={passwords.confirm}
                onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
              />
            </div>
            <button className="btn" disabled={saving}>
              <LockKeyhole size={18} />
              تغییر رمز عبور
            </button>
            <button className="btn ghost profile-logout" type="button" onClick={signOut}>
              <LogOut size={18} />
              خروج از حساب
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
