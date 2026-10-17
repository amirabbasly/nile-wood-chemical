import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RouteProgress } from "@/components/RouteProgress";
import { SupportFloat } from "@/components/SupportFloat";

export const metadata: Metadata = {
  metadataBase: new URL("https://nilewoodchem.com"),
  title: {
    default: "نایل وود | فروشگاه تخصصی رنگ و پوشش چوب",
    template: "%s",
  },
  description:
    "فروشگاه تخصصی رنگ چوب، روغن چوب، سیلر، کیلر و مواد مصرفی کارگاه؛ همراه با راهنمای انتخاب و اجرای پوشش چوب.",
  applicationName: "Nile Wood Chemicals",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "نایل وود | Nile Wood Chemicals",
    title: "نایل وود | فروشگاه تخصصی رنگ و پوشش چوب",
    description: "محصولات و راهنمای تخصصی برای انتخاب و اجرای پوشش چوب.",
    url: "https://nilewoodchem.com",
  },
  twitter: { card: "summary_large_image", title: "نایل وود | رنگ و پوشش چوب", description: "فروشگاه و مجله تخصصی رنگ و پوشش چوب" },
  robots: { index: true, follow: true },
  category: "shopping",
  icons: {
    icon: "/logo/logo-image.jpg",
    shortcut: "/logo/logo-image.jpg",
    apple: "/logo/logo-image.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <RouteProgress />
        <Header />
        {children}
        <Footer />
        <SupportFloat />
      </body>
    </html>
  );
}
