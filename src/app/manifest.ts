import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "فیروزه — مدیریت ارتباط با مشتری",
    short_name: "فیروزه",
    description:
      "CRM سبک و سریع برای تیم‌های فروش: قیف فروش، مخاطبین، شرکت‌ها، وظایف و دستیار هوش مصنوعی.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f2f5f3",
    theme_color: "#0b6e6b",
    dir: "rtl",
    lang: "fa-IR",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
