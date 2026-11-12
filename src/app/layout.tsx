import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/layout/service-worker";

const vazirmatn = localFont({
  src: "../../public/fonts/Vazirmatn-var.woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const estedad = localFont({
  src: "../../public/fonts/Estedad-var.woff2",
  variable: "--font-estedad",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: { default: "فیروزه — مدیریت ارتباط با مشتری", template: "%s · فیروزه" },
  description:
    "CRM سبک و سریع برای تیم‌های فروش ایرانی: قیف فروش، مخاطبین، شرکت‌ها، وظایف و دستیار هوش مصنوعی.",
  applicationName: "فیروزه",
  appleWebApp: { capable: true, title: "فیروزه", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f5f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1211" },
  ],
};

const themeScript = `
(function(){
  try {
    var stored = localStorage.getItem('crm-theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${vazirmatn.variable} ${estedad.variable}`}>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
