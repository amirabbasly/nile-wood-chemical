"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { telHref, useSiteSettings } from "@/lib/site-settings";

export function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <Image src="/logo/logo-image.jpg" alt={settings.businessName} width={58} height={58} />
            <h3>{settings.businessName}</h3>
          </div>
          <p>{settings.footerText}</p>
        </div>
        <div>
          <h4>دسترسی سریع</h4>
          <Link href="/shop">فروشگاه</Link>
          <Link href="/products">محصولات</Link>
          <Link href="/blog">مجله</Link>
          <Link href="/terms">قوانین و مقررات</Link>
          <Link href="/account/orders">سفارشات کاربر</Link>
        </div>
        <div>
          <h4>اطلاعات تماس</h4>
          <a href={telHref(settings.phonePrimary)}>
            <Phone size={17} />
            {settings.phonePrimary}
          </a>
          <a href={telHref(settings.phoneSecondary)}>
            <Phone size={17} />
            {settings.phoneSecondary}
          </a>
          <span>
            <MapPin size={17} />
            {settings.address}
          </span>
          <a href={settings.whatsappUrl}>
            <MessageCircle size={17} />
            واتساپ پشتیبانی
          </a>
          <a href={settings.telegramUrl}>
            <Send size={17} />
            تلگرام پشتیبانی
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>{settings.footerBottomRight}</span>
        <span>{settings.footerBottomLeft}</span>
      </div>
    </footer>
  );
}
