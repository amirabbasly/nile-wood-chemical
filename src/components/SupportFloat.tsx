"use client";

import { MessageCircle, Phone, Send } from "lucide-react";
import { telHref, useSiteSettings } from "@/lib/site-settings";

export function SupportFloat() {
  const { settings } = useSiteSettings();

  return (
    <div className="support-float" aria-label="پشتیبانی">
      <a href={settings.whatsappUrl} title="واتساپ">
        <MessageCircle size={20} />
      </a>
      <a href={settings.telegramUrl} title="تلگرام">
        <Send size={20} />
      </a>
      <a href={telHref(settings.phonePrimary)} title="تماس تلفنی">
        <Phone size={20} />
      </a>
    </div>
  );
}
