"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

export type SiteSettings = {
  businessName: string;
  footerText: string;
  aboutTitle: string;
  aboutBody: string;
  aboutSecondBody: string;
  contactTitle: string;
  contactIntro: string;
  phonePrimary: string;
  phoneSecondary: string;
  email: string;
  address: string;
  whatsappUrl: string;
  telegramUrl: string;
  footerBottomRight: string;
  footerBottomLeft: string;
};

export const defaultSiteSettings: SiteSettings = {
  businessName: "Nile Wood Chemicals",
  footerText:
    "تأمین تخصصی رنگ چوب، روغن چوب، کیلر، سیلر، بتونه، تینر، رزین و پوشش‌های محافظتی برای مصرف حرفه‌ای، پروژه‌ای و کارگاهی.",
  aboutTitle: "Nile Wood Chemicals",
  aboutBody:
    "نیل وود کمیکالز یک مرکز تخصصی برای تأمین رنگ چوب، مواد شیمیایی، پوشش‌های محافظتی و محصولات آماده‌سازی سطح است. تمرکز ما روی انتخاب درست محصول، پشتیبانی فنی و تأمین پایدار برای مصرف‌کننده حرفه‌ای است.",
  aboutSecondBody:
    "از پروژه‌های دکوراتیو تا خط تولید کارگاهی، تلاش می‌کنیم خرید مواد رنگ چوب شفاف، مطمئن و سریع باشد.",
  contactTitle: "مشاوره خرید و پشتیبانی فنی",
  contactIntro:
    "برای انتخاب رنگ، بررسی سازگاری محصول یا سفارش عمده با ما تماس بگیرید.",
  phonePrimary: "۰۲۱-۹۱۳۰۲۰۸۸",
  phoneSecondary: "۰۹۱۲-۰۰۰-۰۰۰۰",
  email: "sales@nilewoodchemicals.com",
  address: "تهران، بازار رنگ و ابزار، مرکز فروش Nile Wood Chemicals",
  whatsappUrl: "https://wa.me/989120000000",
  telegramUrl: "https://t.me/nilewoodchemicals",
  footerBottomRight: "تمام حقوق برای Nile Wood Chemicals محفوظ است.",
  footerBottomLeft: "فروش آنلاین و عمده مواد تخصصی رنگ چوب",
};

const STORAGE_KEY = "nile-site-settings";
const OPTIONAL_TABLE_MISSING_KEY = "nile-site-settings-table-missing";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(
    () =>
      typeof window === "undefined"
        ? defaultSiteSettings
        : mergeSettings(readLocalSettings()),
  );

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!supabase || sessionStorage.getItem(OPTIONAL_TABLE_MISSING_KEY) === "1") return;
      const { data, error } = await supabase.from("site_settings").select("key,value");
      if (error) {
        if (error.code === "PGRST205" || error.message.includes("site_settings")) {
          sessionStorage.setItem(OPTIONAL_TABLE_MISSING_KEY, "1");
        }
        return;
      }
      if (!alive || !data?.length) return;

      const remote = data.reduce<Partial<SiteSettings>>((acc, item) => {
        acc[item.key as keyof SiteSettings] = item.value;
        return acc;
      }, {});
      setSettings(mergeSettings(remote));
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  return useMemo(() => ({ settings, setSettings }), [settings]);
}

export function readLocalSettings() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<SiteSettings>;
  } catch {
    return {};
  }
}

export function persistLocalSettings(settings: SiteSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("site-settings-updated"));
}

export function mergeSettings(overrides: Partial<SiteSettings>) {
  return { ...defaultSiteSettings, ...overrides };
}

export function telHref(phone: string) {
  const normalized = phone.replace(/[^\d+۰-۹٠-٩]/g, "");
  return `tel:${normalized}`;
}
