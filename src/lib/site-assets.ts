"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

export type SiteAsset = {
  key: string;
  label: string;
  imageUrl: string;
  group: "خانه" | "دسته‌بندی" | "خدمات" | "برندها" | "محصولات" | "مجله";
};

export const defaultSiteAssets: SiteAsset[] = [
  {
    key: "hero-main",
    label: "تصویر هیرو اسلاید ۱",
    group: "خانه",
    imageUrl:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=85",
  },
  {
    key: "hero-slide-2",
    label: "تصویر هیرو اسلاید ۲",
    group: "خانه",
    imageUrl:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    key: "hero-slide-3",
    label: "تصویر هیرو اسلاید ۳",
    group: "خانه",
    imageUrl:
      "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1200&q=85",
  },
  {
    key: "about-main",
    label: "تصویر درباره ما",
    group: "خانه",
    imageUrl:
      "https://images.unsplash.com/photo-1604014238170-4def1e4e6fcf?auto=format&fit=crop&w=1000&q=80",
  },
  {
    key: "category-wood-stain",
    label: "دسته‌بندی رنگ چوب",
    group: "دسته‌بندی",
    imageUrl:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=700&q=85",
  },
  {
    key: "category-wood-oil",
    label: "دسته‌بندی روغن چوب",
    group: "دسته‌بندی",
    imageUrl:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=700&q=85",
  },
  {
    key: "category-clear-coat",
    label: "دسته‌بندی کیلر و سیلر",
    group: "دسته‌بندی",
    imageUrl:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=700&q=85",
  },
  {
    key: "category-chemicals",
    label: "دسته‌بندی مواد شیمیایی",
    group: "دسته‌بندی",
    imageUrl:
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=700&q=85",
  },
  {
    key: "category-putty",
    label: "دسته‌بندی بتونه و ترمیم",
    group: "دسته‌بندی",
    imageUrl:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=700&q=85",
  },
  {
    key: "service-consulting",
    label: "خدمت مشاوره انتخاب پوشش",
    group: "خدمات",
    imageUrl:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=85",
  },
  {
    key: "service-workshop",
    label: "خدمت تأمین کارگاهی",
    group: "خدمات",
    imageUrl:
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=700&q=85",
  },
  {
    key: "service-formulas",
    label: "خدمت فرمول‌های تخصصی",
    group: "خدمات",
    imageUrl:
      "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=700&q=85",
  },
  {
    key: "brand-remmers",
    label: "Remmers",
    group: "برندها",
    imageUrl: "https://dummyimage.com/220x120/ffffff/168447.png?text=Remmers",
  },
  {
    key: "brand-osmo",
    label: "Osmo",
    group: "برندها",
    imageUrl: "https://dummyimage.com/220x120/ffffff/111111.png?text=OSMO",
  },
  {
    key: "brand-adler",
    label: "Adler",
    group: "برندها",
    imageUrl: "https://dummyimage.com/220x120/ffffff/0f5f35.png?text=ADLER",
  },
  {
    key: "brand-sayerlack",
    label: "Sayerlack",
    group: "برندها",
    imageUrl: "https://dummyimage.com/220x120/ffffff/168447.png?text=Sayerlack",
  },
  {
    key: "brand-ica",
    label: "ICA",
    group: "برندها",
    imageUrl: "https://dummyimage.com/220x120/ffffff/111111.png?text=ICA",
  },
  {
    key: "brand-renner",
    label: "Renner",
    group: "برندها",
    imageUrl: "https://dummyimage.com/220x120/ffffff/0f5f35.png?text=Renner",
  },
  {
    key: "brand-milesi",
    label: "Milesi",
    group: "برندها",
    imageUrl: "https://dummyimage.com/220x120/ffffff/168447.png?text=Milesi",
  },
];

const STORAGE_KEY = "nile-site-assets";
const OPTIONAL_TABLE_MISSING_KEY = "nile-site-assets-table-missing";

export function useSiteAssets() {
  const [assets, setAssets] = useState<SiteAsset[]>(defaultSiteAssets);

  useEffect(() => {
    let alive = true;

    async function load() {
      const localAssets = readLocalAssets();
      if (localAssets.length) {
        setAssets(mergeAssets(localAssets));
      }

      if (!supabase || sessionStorage.getItem(OPTIONAL_TABLE_MISSING_KEY) === "1") return;
      const { data, error } = await supabase.from("site_assets").select("*").order("key");
      if (error) {
        if (error.code === "PGRST205" || error.message.includes("site_assets")) {
          sessionStorage.setItem(OPTIONAL_TABLE_MISSING_KEY, "1");
        }
        return;
      }
      if (!alive || !data?.length) return;

      const remoteAssets = data.map((item) => ({
        key: item.key,
        label: item.label,
        imageUrl: item.image_url,
        group: item.group_name,
      })) as SiteAsset[];
      setAssets(mergeAssets(remoteAssets));
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const byKey = useMemo(
    () =>
      assets.reduce<Record<string, SiteAsset>>((map, asset) => {
        map[asset.key] = asset;
        return map;
      }, {}),
    [assets],
  );

  return { assets, byKey, setAssets };
}

export function readLocalAssets() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as SiteAsset[];
  } catch {
    return [];
  }
}

export function persistLocalAssets(assets: SiteAsset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  window.dispatchEvent(new Event("site-assets-updated"));
}

export function mergeAssets(overrides: SiteAsset[]) {
  const map = new Map(defaultSiteAssets.map((asset) => [asset.key, asset]));
  overrides.forEach((asset) => {
    map.set(asset.key, { ...map.get(asset.key), ...asset });
  });
  return Array.from(map.values());
}
