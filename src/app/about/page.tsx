"use client";

import Image from "next/image";
import { useSiteAssets } from "@/lib/site-assets";
import { useSiteSettings } from "@/lib/site-settings";

export default function AboutPage() {
  const { byKey } = useSiteAssets();
  const { settings } = useSiteSettings();

  return (
    <section className="section">
      <div className="container split-page">
        <div>
          <span className="badge">درباره ما</span>
          <h1>{settings.aboutTitle}</h1>
          <p>{settings.aboutBody}</p>
          <p>{settings.aboutSecondBody}</p>
        </div>
        <div className="split-image">
          <Image
            src={byKey["about-main"].imageUrl}
            alt="کارگاه چوب"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
