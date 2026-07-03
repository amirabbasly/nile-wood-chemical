"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

export type HomeHeroSlide = {
  eyebrow: string;
  title: string;
  text: string;
  assetKey: string;
};

export type HomeServiceContent = {
  title: string;
  text: string;
  assetKey: string;
};

export type HomeContent = {
  categoryTitle: string;
  categoryText: string;
  servicesTitle: string;
  heroes: HomeHeroSlide[];
  services: HomeServiceContent[];
};

export const defaultHomeContent: HomeContent = {
  categoryTitle: "خرید بر اساس دسته‌بندی",
  categoryText: "از رنگ چوب و روغن محافظ تا کیلر، سیلر، تینر و رزین را سریع‌تر پیدا کنید.",
  servicesTitle: "خدمات نایل",
  heroes: [
    {
      eyebrow: "مرکز تخصصی رنگ و مواد شیمیایی چوب",
      title: "Nile Wood Chemicals",
      text: "خرید تخصصی رنگ چوب، روغن محافظ، سیلر، کیلر، تینر، رزین و مواد آماده‌سازی سطح برای کارگاه‌ها، پروژه‌های ساختمانی و مصرف حرفه‌ای.",
      assetKey: "hero-main",
    },
    {
      eyebrow: "پوشش‌های حرفه‌ای برای چوب",
      title: "رنگ، روغن و محافظ چوب",
      text: "برای نما، مبلمان، کابینت و پروژه‌های لوکس، پوشش مناسب را با مشاوره تخصصی انتخاب کنید.",
      assetKey: "hero-slide-2",
    },
    {
      eyebrow: "تأمین پایدار برای کارگاه‌ها",
      title: "سیلر، کیلر، تینر و رزین",
      text: "مواد مصرفی کارگاه رنگ را با کیفیت ثابت، بسته‌بندی ایمن و شرایط خرید عمده تهیه کنید.",
      assetKey: "hero-slide-3",
    },
  ],
  services: [
    {
      title: "مشاوره انتخاب پوشش",
      text: "انتخاب محصول بر اساس نوع چوب، محیط اجرا و ابزار مصرف.",
      assetKey: "service-consulting",
    },
    {
      title: "تأمین کارگاهی",
      text: "قیمت همکاری برای مصرف ماهانه، پروژه‌های بزرگ و خطوط تولید.",
      assetKey: "service-workshop",
    },
    {
      title: "فرمول‌های تخصصی",
      text: "سیلر، کیلر، تینر، رزین و مکمل‌های سازگار با اجرای حرفه‌ای.",
      assetKey: "service-formulas",
    },
  ],
};

const STORAGE_KEY = "nile-home-content";
const REMOTE_KEY = "home-page";
const OPTIONAL_TABLE_MISSING_KEY = "nile-site-content-table-missing";

export function useHomeContent() {
  const [content, setContent] = useState<HomeContent>(
    () =>
      typeof window === "undefined"
        ? defaultHomeContent
        : mergeHomeContent(readLocalHomeContent()),
  );

  useEffect(() => {
    let alive = true;

    async function load() {
      const local = readLocalHomeContent();
      if (local) setContent(mergeHomeContent(local));

      if (!supabase || sessionStorage.getItem(OPTIONAL_TABLE_MISSING_KEY) === "1") return;
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", REMOTE_KEY)
        .maybeSingle();

      if (!alive) return;
      if (error) {
        if (error.code === "PGRST205" || error.message.includes("site_content")) {
          sessionStorage.setItem(OPTIONAL_TABLE_MISSING_KEY, "1");
        }
        return;
      }
      if (data?.value) setContent(mergeHomeContent(data.value as Partial<HomeContent>));
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  return useMemo(() => ({ content, setContent }), [content]);
}

export function readLocalHomeContent() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<HomeContent> | null;
  } catch {
    return null;
  }
}

export function persistLocalHomeContent(content: HomeContent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new Event("home-content-updated"));
}

export async function persistRemoteHomeContent(content: HomeContent) {
  if (!supabase) return;
  await supabase.from("site_content").upsert({
    key: REMOTE_KEY,
    value: content,
  });
}

export function mergeHomeContent(overrides?: Partial<HomeContent> | null): HomeContent {
  return {
    ...defaultHomeContent,
    ...overrides,
    heroes: overrides?.heroes?.length ? overrides.heroes : defaultHomeContent.heroes,
    services: overrides?.services?.length ? overrides.services : defaultHomeContent.services,
  };
}
