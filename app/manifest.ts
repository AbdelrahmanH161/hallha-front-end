import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: new URL("/", siteUrl).toString(),
    name: "Hallha",
    short_name: "Hallha",
    description:
      "أتمتة الامتثال الشرعي للشركات الصغيرة والمتوسطة — التدقيق والتصفية وتقارير الزكاة.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f8fafc",
    theme_color: "#064e3b",
    lang: "ar",
    dir: "rtl",
    categories: ["finance", "business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
