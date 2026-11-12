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
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "قیف فروش", url: "/deals" },
      { name: "وظایف", url: "/tasks" },
      { name: "مخاطبین", url: "/contacts" },
    ],
  };
}
