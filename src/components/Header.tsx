"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { readCart } from "@/lib/store";

const links = [
  ["خانه", "/"],
  ["فروشگاه", "/shop"],
  ["محصولات", "/products"],
  ["دسته‌بندی‌ها", "/categories"],
  ["مجله", "/blog"],
  ["خرید عمده", "/wholesale"],
  ["تماس", "/contact"],
];

function startRouteProgress() {
  window.dispatchEvent(new Event("nile-route-start"));
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const sync = () =>
      setCount(readCart().reduce((sum, item) => sum + item.quantity, 0));
    sync();
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="topbar">
          <div className="container topbar-inner">
            <span>فروشگاه تخصصی رنگ و پوشش چوب Nile Wood Chemicals</span>
            <div>
              <a href="tel:+982191302088">۰۲۱-۹۱۳۰۲۰۸۸</a>
              <span> | مشاوره خرید، ارسال تخصصی و فروش عمده</span>
            </div>
          </div>
        </div>

        <div className="container header-main">
          <Link href="/" className="brand" aria-label="Nile Wood Chemicals" onClick={startRouteProgress}>
            <Image
              src="/logo/logo-image.jpg"
              alt="لوگو"
              width={54}
              height={54}
              className="brand-logo"
              priority
            />
            <Image
              src="/logo/logo-brandname.jpg"
              alt="Nile Wood Chemicals"
              width={170}
              height={48}
              className="brand-name"
              priority
            />
          </Link>

          <form className="searchbar" action="/products">
            <Search size={18} />
            <input name="q" placeholder="جستجوی رنگ، روغن، کیلر، سیلر..." />
          </form>

          <div className="header-actions">
            <Link
              className="icon-link"
              href={user ? "/account/profile" : "/auth/login"}
              title={user ? "پروفایل" : "ورود"}
              onClick={startRouteProgress}
            >
              <UserRound size={20} />
              <span>{user ? "پروفایل" : "ورود / ثبت‌نام"}</span>
            </Link>
            <Link className="cart-pill" href="/cart" onClick={startRouteProgress}>
              <ShoppingBag size={20} />
              <span>{count} محصول</span>
            </Link>
            <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="منو">
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <nav className="nav desktop-nav">
          <div className="container nav-inner">
            {links.map(([label, href]) => {
              const active =
                href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={active ? "active" : ""}
                  onClick={startRouteProgress}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <button
        className={`mobile-menu-backdrop ${open ? "open" : ""}`}
        aria-label="بستن منو"
        onClick={() => setOpen(false)}
      />

      <nav className={`mobile-drawer ${open ? "open" : ""}`} aria-label="منوی موبایل">
        <button className="mobile-drawer-close" onClick={() => setOpen(false)} aria-label="بستن منو">
          <X size={22} />
        </button>
        <div className="mobile-drawer-inner">
          {links.map(([label, href]) => {
            const active =
              href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={active ? "active" : ""}
                onClick={() => {
                  startRouteProgress();
                  setOpen(false);
                }}
              >
                {label}
              </Link>
            );
          })}
          {user && (
            <Link
              href="/account/profile"
              className={pathname === "/account/profile" ? "active" : ""}
              onClick={() => {
                startRouteProgress();
                setOpen(false);
              }}
            >
              پروفایل
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
