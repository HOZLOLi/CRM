"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronsLeft,
  ChevronsRight,
  Menu,
  Search,
  X,
  LogOut,
  Moon,
  Sun,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  enabledModules,
  mobileModules,
  GROUP_LABELS,
  type ModuleDef,
} from "@/modules/registry";
import type { SessionUser } from "@/server/auth";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ theme */

function useTheme() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = React.useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("crm-theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }, []);

  return { dark, toggle };
}

/* ------------------------------------------------------------------ brand */

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="flex h-14 items-center gap-2.5 px-4 outline-none"
      aria-label="فیروزه — داشبورد"
    >
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
        <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
          <path
            d="M16 2.5 29 9.5v13L16 29.5 3 22.5v-13z"
            fill="none"
            stroke="var(--turquoise)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M16 9.5 22.5 13v6L16 22.5 9.5 19v-6z"
            fill="var(--turquoise)"
            opacity="0.16"
          />
          <circle cx="16" cy="16" r="2.4" fill="var(--saffron)" />
        </svg>
      </span>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="flex flex-col leading-none"
          >
            <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-tight text-ink">
              فیروزه
            </span>
            <span className="mt-1 text-[10.5px] text-ink-faint">مدیریت ارتباط با مشتری</span>
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

/* ------------------------------------------------------------------ nav */

function NavItem({
  module,
  active,
  collapsed,
  onNavigate,
}: {
  module: ModuleDef;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = module.icon;
  return (
    <Link
      href={module.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? module.label : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-2.5 rounded-[7px] px-2.5 text-[13.5px]",
        "transition-colors duration-[var(--dur-2)] ease-[var(--ease-out-quart)]",
        active ? "nav-active font-medium" : "text-ink-soft hover:bg-surface-2 hover:text-ink",
        collapsed && "justify-center px-0",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-marker"
          className="absolute inset-y-1.5 -right-1 w-[2px] rounded-full bg-turquoise"
          transition={{ duration: 0.24, ease: EASE }}
        />
      )}
      <Icon size={17} strokeWidth={active ? 2.1 : 1.7} className="shrink-0" />
      {!collapsed && <span className="truncate">{module.label}</span>}
    </Link>
  );
}

function NavGroups({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = ["main", "work", "system"] as const;

  return (
    <nav className="flex flex-col gap-5 px-2 py-2">
      {groups.map((group) => {
        const items = enabledModules.filter((m) => m.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group} className="flex flex-col gap-0.5">
            {!collapsed && (
              <p className="px-2.5 pb-1 text-[10.5px] font-medium tracking-wide text-ink-faint">
                {GROUP_LABELS[group]}
              </p>
            )}
            {items.map((m) => (
              <NavItem
                key={m.id}
                module={m}
                active={pathname === m.href || pathname.startsWith(`${m.href}/`)}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ shell */

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawer, setDrawer] = React.useState(false);
  const { dark, toggle } = useTheme();
  const pathname = usePathname();

  React.useEffect(() => {
    setDrawer(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  return (
    <div className="flex min-h-dvh bg-paper">
      {/* ---------------------------------------------------- desktop rail */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-l border-line bg-surface md:flex",
          "transition-[width] duration-[var(--dur-3)] ease-[var(--ease-out-quart)]",
          collapsed ? "w-[68px]" : "w-[248px]",
        )}
      >
        <Brand collapsed={collapsed} />
        <div className="rule mx-3" />
        <div className="flex-1 overflow-y-auto py-2">
          <NavGroups collapsed={collapsed} />
        </div>
        <div className="rule mx-3" />
        <div className="p-2">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex h-8 w-full items-center justify-center gap-2 rounded-[7px] text-[12px] text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label={collapsed ? "باز کردن نوار کناری" : "جمع کردن نوار کناری"}
          >
            {collapsed ? <ChevronsLeft size={15} /> : <ChevronsRight size={15} />}
            {!collapsed && <span>جمع کردن</span>}
          </button>
        </div>
      </aside>

      {/* ---------------------------------------------------- main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-paper/85 px-3 backdrop-blur-md md:px-5">
          <button
            onClick={() => setDrawer(true)}
            className="flex h-11 w-11 items-center justify-center rounded-[7px] text-ink-soft transition-colors hover:bg-surface-2 md:hidden"
            aria-label="باز کردن منو"
          >
            <Menu size={19} />
          </button>

          <div className="md:hidden">
            <Brand collapsed />
          </div>

          <div className="hidden flex-1 md:block">
            <button
              className="group flex h-9 w-full max-w-md items-center gap-2 rounded-[8px] border border-line bg-surface px-3 text-[13px] text-ink-faint transition-colors hover:border-line-strong"
              aria-label="جست‌وجو"
            >
              <Search size={15} />
              <span>جست‌وجو در مخاطبین، شرکت‌ها و معاملات…</span>
              <kbd dir="ltr" className="mr-auto hidden rounded border border-line px-1.5 py-0.5 text-[10px] text-ink-faint lg:block">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="mr-auto flex items-center gap-1">
            <button
              onClick={toggle}
              className="flex h-11 w-11 items-center justify-center rounded-[7px] text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink md:h-9 md:w-9"
              aria-label={dark ? "حالت روشن" : "حالت تاریک"}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-[7px] p-1 transition-colors hover:bg-surface-2"
            >
              <Avatar name={user.name} hue={user.avatarHue} size={30} />
              <span className="hidden text-[12.5px] font-medium text-ink lg:block">{user.name}</span>
            </Link>
          </div>
        </header>

        <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>
      </div>

      {/* ---------------------------------------------------- mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setDrawer(false)}
              className="fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px] md:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: EASE }}
              className="fixed inset-y-0 right-0 z-50 flex w-[280px] flex-col border-l border-line bg-surface md:hidden"
            >
              <div className="flex h-14 items-center justify-between pl-2">
                <Brand collapsed={false} />
                <button
                  onClick={() => setDrawer(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-[7px] text-ink-soft hover:bg-surface-2"
                  aria-label="بستن منو"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="rule mx-3" />
              <div className="flex-1 overflow-y-auto py-2">
                <NavGroups collapsed={false} onNavigate={() => setDrawer(false)} />
              </div>
              <div className="rule mx-3" />
              <div className="flex items-center gap-2.5 p-3">
                <Avatar name={user.name} hue={user.avatarHue} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{user.name}</p>
                  <p className="truncate text-[11.5px] text-ink-faint">{user.title ?? user.email}</p>
                </div>
                <form action="/api/auth/logout" method="post">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-faint hover:bg-surface-2 hover:text-clay"
                    aria-label="خروج"
                  >
                    <LogOut size={16} />
                  </button>
                </form>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- mobile tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="flex h-14 items-stretch">
          {mobileModules.map((m) => {
            const active = pathname === m.href || pathname.startsWith(`${m.href}/`);
            const Icon = m.icon;
            return (
              <Link
                key={m.id}
                href={m.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px]",
                  "transition-colors duration-[var(--dur-2)]",
                  active ? "text-turquoise" : "text-ink-faint",
                )}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="tab-marker"
                    className="absolute inset-x-4 top-0 h-[2px] rounded-full bg-turquoise"
                    transition={{ duration: 0.24, ease: EASE }}
                  />
                )}
                <Icon size={19} strokeWidth={active ? 2.1 : 1.7} />
                <span>{m.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function QuickAddButton() {
  return (
    <Link
      href="/deals?new=1"
      className="fixed bottom-[72px] left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-turquoise text-white shadow-[var(--shadow-pop)] transition-transform active:scale-95 md:hidden"
      aria-label="معامله جدید"
    >
      <Plus size={22} />
    </Link>
  );
}
