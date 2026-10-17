import type { MetadataRoute } from "next";
import { editorialArticles } from "@/lib/editorial";
import { buyingGuides } from "@/lib/guides";

const siteUrl = "https://nilewoodchem.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = ["", "/shop", "/products", "/categories", "/about", "/contact", "/wholesale", "/guide", "/blog", "/terms"];
  return [
    ...staticPages.map((path) => ({ url: `${siteUrl}${path}`, lastModified: now, changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : path === "/blog" ? 0.9 : 0.7 })),
    ...editorialArticles.map((article) => ({ url: `${siteUrl}/blog/${article.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.75 })),
    ...buyingGuides.map((guide) => ({ url: `${siteUrl}/guide/${guide.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
