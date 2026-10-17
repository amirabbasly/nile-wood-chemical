import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/nile-admin-wood-control", "/account/", "/cart", "/auth/", "/payment/"] }],
    sitemap: "https://nilewoodchem.com/sitemap.xml",
  };
}
