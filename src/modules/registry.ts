import {
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  Repeat,
  BarChart3,
  Users,
  Building2,
  Target,
  KanbanSquare,
  CheckSquare,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * Module registry.
 *
 * The navigation, the mobile tab bar, and the command palette are all derived
 * from this list. To add a module: create `src/app/(app)/<id>/page.tsx`, add an
 * entry here, and it appears everywhere. To remove one: set `enabled: false`.
 */
export interface ModuleDef {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  group: "main" | "work" | "system";
  /** Show in the mobile bottom bar (max 5). */
  mobile?: boolean;
  enabled: boolean;
  description?: string;
}

export const MODULES: ModuleDef[] = [
  {
    id: "dashboard",
    label: "داشبورد",
    href: "/dashboard",
    icon: LayoutDashboard,
    group: "main",
    mobile: true,
    enabled: true,
    description: "نمای کلی فروش و فعالیت‌ها",
  },
  {
    id: "cartable",
    label: "کارتابل امروز",
    href: "/cartable",
    icon: ClipboardList,
    group: "main",
    mobile: true,
    enabled: true,
    description: "چه کسی را امروز پیگیری کنیم و چه بگوییم",
  },
  {
    id: "deals",
    label: "قیف فروش",
    href: "/deals",
    icon: KanbanSquare,
    group: "main",
    mobile: true,
    enabled: true,
    description: "معاملات در مراحل فروش",
  },
  {
    id: "orders",
    label: "سفارش‌ها",
    href: "/orders",
    icon: ShoppingCart,
    group: "main",
    enabled: true,
    description: "ثبت سفارش و سود ناخالص",
  },
  {
    id: "cycles",
    label: "چرخهٔ خرید",
    href: "/cycles",
    icon: Repeat,
    group: "work",
    enabled: true,
    description: "پیش‌بینی خرید بعدی هر مشتری",
  },
  {
    id: "contacts",
    label: "مخاطبین",
    href: "/contacts",
    icon: Users,
    group: "main",
    mobile: true,
    enabled: true,
    description: "افراد و شماره تماس‌ها",
  },
  {
    id: "companies",
    label: "شرکت‌ها",
    href: "/companies",
    icon: Building2,
    group: "main",
    mobile: false,
    enabled: true,
    description: "سازمان‌ها و مشتریان",
  },
  {
    id: "leads",
    label: "سرنخ‌ها",
    href: "/leads",
    icon: Target,
    group: "work",
    enabled: true,
    description: "سرنخ‌های فروش و امتیازدهی",
  },
  {
    id: "tasks",
    label: "وظایف",
    href: "/tasks",
    icon: CheckSquare,
    group: "work",
    mobile: true,
    enabled: true,
    description: "کارهای پیگیری",
  },
  {
    id: "reports",
    label: "گزارش‌ها",
    href: "/reports",
    icon: BarChart3,
    group: "work",
    enabled: true,
    description: "پرخریدها، رقبا، دلایل عدم خرید، عملکرد تیم",
  },
  {
    id: "assistant",
    label: "دستیار هوش مصنوعی",
    href: "/assistant",
    icon: Sparkles,
    group: "work",
    enabled: true,
    description: "پرسش از داده‌های CRM",
  },
  {
    id: "settings",
    label: "تنظیمات",
    href: "/settings",
    icon: Settings,
    group: "system",
    enabled: true,
    description: "حساب، تیم و هوش مصنوعی",
  },
];

export const enabledModules = MODULES.filter((m) => m.enabled);
export const mobileModules = enabledModules.filter((m) => m.mobile).slice(0, 5);

export const GROUP_LABELS: Record<ModuleDef["group"], string> = {
  main: "فروش",
  work: "کار روزانه",
  system: "سیستم",
};
