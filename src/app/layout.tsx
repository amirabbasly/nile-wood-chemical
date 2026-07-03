import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RouteProgress } from "@/components/RouteProgress";
import { SupportFloat } from "@/components/SupportFloat";

export const metadata: Metadata = {
  title: "Nile Wood Chemicals | فروشگاه رنگ و پوشش چوب",
  description:
    "فروش تخصصی رنگ چوب، روغن چوب، سیلر، کیلر، رزین، تینر و مواد شیمیایی مرتبط با چوب.",
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
        <main>{children}</main>
        <Footer />
        <SupportFloat />
      </body>
    </html>
  );
}
