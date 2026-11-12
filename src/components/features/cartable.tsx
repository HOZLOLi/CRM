"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Phone,
  MessageCircle,
  MessageSquare,
  Check,
  X,
  Copy,
  ChevronDown,
  Clock,
  Package,
  Flame,
  Snowflake,
  Thermometer,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/panel";
import { STAGE_LABELS, BAND_LABELS, type BandKey } from "@/lib/settings";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface CartableCardData {
  customerId: string;
  customerName: string;
  industryType: string | null;
  band: BandKey;
  bandLabel: string;
  rawScore: number;
  coverage: number;
  isProvisional: boolean;
  productId: string | null;
  productName: string | null;
  cycleDays: number | null;
  daysUntil: number | null;
  expectedDate: string | null;
  stage: number;
  channel: string;
  priority: "P1" | "P2" | "P3";
  annualValue: number;
  annualValueEstimated: boolean;
  estimatedStock: number;
  suggestedQuantity: number | null;
  suggestedMessage: string;
  reasons: string[];
  attempts: number;
  ownerName: string | null;
  agreedDate: string | null;
}

const INDUSTRY_LABEL: Record<string, string> = {
  restaurant: "رستوران",
  fastfood: "فست‌فود",
  catering: "کترینگ",
  hall: "تالار",
  heyat: "هیئت",
  other: "سایر",
};

const BAND_STYLE: Record<BandKey, { tone: "neutral" | "saffron" | "turquoise" | "clay"; icon: typeof Flame }> = {
  cold: { tone: "neutral", icon: Snowflake },
  warm: { tone: "saffron", icon: Thermometer },
  hot: { tone: "turquoise", icon: Sun },
  veryHot: { tone: "clay", icon: Flame },
};

const PRIORITY_STYLE: Record<string, string> = {
  P1: "bg-clay text-white",
  P2: "bg-saffron text-white",
  P3: "bg-surface-2 text-ink-faint",
};

const PRIORITY_LABEL: Record<string, string> = {
  P1: "فوری",
  P2: "مهم",
  P3: "عادی",
};

/** موجودی تخمینی معمولاً زیر ۱۰ است؛ یک رقم اعشار آن را خوانا می‌کند. */
function formatStock(value: number): string {
  const rounded = value < 10 ? Math.round(value * 10) / 10 : Math.round(value);
  return rounded.toLocaleString("fa-IR", { maximumFractionDigits: 1 });
}

const CHANNEL = {
  call: { icon: Phone, label: "تماس" },
  whatsapp: { icon: MessageCircle, label: "واتساپ" },
  sms: { icon: MessageSquare, label: "پیامک" },
} as const;

function daysLabel(days: number | null): { text: string; tone: string } {
  if (days === null) return { text: "بدون پیش‌بینی", tone: "text-ink-faint" };
  if (days < 0) return { text: `${Math.abs(days).toLocaleString("fa-IR")} روز تأخیر`, tone: "text-clay" };
  if (days === 0) return { text: "امروز", tone: "text-saffron" };
  return { text: `${days.toLocaleString("fa-IR")} روز دیگر`, tone: "text-ink-soft" };
}

function Card({
  card,
  onAction,
  busy,
}: {
  card: CartableCardData;
  onAction: (action: "done" | "attempt" | "skip") => void;
  busy: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const [showReasons, setShowReasons] = React.useState(false);

  const band = BAND_STYLE[card.band] ?? BAND_STYLE.cold;
  const BandIcon = band.icon;
  const channel = CHANNEL[card.channel as keyof typeof CHANNEL] ?? CHANNEL.call;
  const ChannelIcon = channel.icon;
  const days = daysLabel(card.daysUntil);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(card.suggestedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be blocked — the text is still selectable */
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.22, ease: EASE }}
      className="panel overflow-hidden"
    >
      {/* header */}
      <div className="flex flex-wrap items-start gap-2 px-4 pt-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-[14px] font-semibold text-ink">{card.customerName}</h3>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10.5px] font-medium",
                PRIORITY_STYLE[card.priority],
              )}
            >
              {PRIORITY_LABEL[card.priority] ?? card.priority}
            </span>
            {card.isProvisional ? (
              <Badge tone="neutral" className="text-[10px]">
                ارزیابی موقت
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11.5px] text-ink-faint">
            <span>{INDUSTRY_LABEL[card.industryType ?? ""] ?? "—"}</span>
            {card.ownerName ? <span>· {card.ownerName}</span> : null}
          </p>
        </div>

        <Badge tone={band.tone}>
          <BandIcon size={11} />
          {BAND_LABELS[card.band]}
          <span className="tnum opacity-70">{card.rawScore.toLocaleString("fa-IR")}</span>
        </Badge>
      </div>

      {/* metrics */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 px-4 sm:grid-cols-4">
        <Metric icon={<Package size={12} />} label="کالای موردنیاز">
          {card.productName ?? "—"}
        </Metric>
        <Metric icon={<Clock size={12} />} label="خرید احتمالی">
          <span className={days.tone}>{days.text}</span>
        </Metric>
        <Metric label="ارزش سالانه">
          <span className="tnum">
            {formatMoney(card.annualValue, { compact: true })}
            {card.annualValueEstimated ? (
              <span className="ms-1 text-[10px] text-ink-faint">تخمینی</span>
            ) : null}
          </span>
        </Metric>
        <Metric label="موجودی تخمینی">
          <span className="tnum">
            {formatStock(card.estimatedStock)}
            {card.suggestedQuantity ? (
              <span className="ms-1 text-[10px] text-ink-faint">
                / پیشنهاد {card.suggestedQuantity.toLocaleString("fa-IR")}
              </span>
            ) : null}
          </span>
        </Metric>
      </div>

      {/* action */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5">
        <Badge tone="turquoise">
          مرحله {card.stage.toLocaleString("fa-IR")} — {STAGE_LABELS[card.stage]}
        </Badge>
        <span className="flex items-center gap-1 text-[11.5px] text-ink-soft">
          <ChannelIcon size={12} />
          {channel.label}
        </span>
        {card.attempts > 0 ? (
          <span className="text-[11.5px] text-ink-faint">
            · {card.attempts.toLocaleString("fa-IR")} تماس بی‌پاسخ
          </span>
        ) : null}
        {card.agreedDate ? (
          <span className="text-[11.5px] text-turquoise">
            · توافق: {formatDate(card.agreedDate, "d MMM")}
          </span>
        ) : null}
      </div>

      {/* message */}
      <div className="mx-4 mb-3 rounded-[8px] bg-surface-2 p-2.5">
        <p className="text-[12.5px] leading-6 text-ink-soft">{card.suggestedMessage}</p>
        <button
          onClick={copyMessage}
          className="mt-1.5 flex items-center gap-1 text-[11px] text-turquoise transition-opacity hover:opacity-80"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "کپی شد" : "کپی متن"}
        </button>
      </div>

      {/* reasons */}
      {card.reasons.length > 0 ? (
        <div className="px-4 pb-2">
          <button
            onClick={() => setShowReasons((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-ink-faint hover:text-ink-soft"
          >
            <ChevronDown
              size={12}
              className={cn("transition-transform duration-200", showReasons && "rotate-180")}
            />
            چرا این پیشنهاد؟
          </button>
          <AnimatePresence initial={false}>
            {showReasons ? (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="overflow-hidden"
              >
                {card.reasons.map((reason, i) => (
                  <li key={i} className="mt-1 text-[11.5px] leading-5 text-ink-faint">
                    • {reason}
                  </li>
                ))}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}

      {/* actions */}
      <div className="flex items-center gap-1.5 border-t border-line px-4 py-2.5">
        <Button size="sm" variant="secondary" onClick={() => onAction("attempt")} disabled={busy}>
          <Phone size={13} />
          تماس گرفتم
        </Button>
        <Button size="sm" onClick={() => onAction("done")} disabled={busy}>
          <Check size={13} />
          انجام شد
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="ms-auto"
          onClick={() => onAction("skip")}
          disabled={busy}
        >
          <X size={13} />
          رد کردن
        </Button>
      </div>
    </motion.article>
  );
}

function Metric({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[10.5px] text-ink-faint">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 truncate text-[12.5px] text-ink">{children}</p>
    </div>
  );
}

export function Cartable({ initial }: { initial: CartableCardData[] }) {
  const [cards, setCards] = React.useState(initial);
  const [filter, setFilter] = React.useState<"all" | "P1" | "P2" | "overdue">("all");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const visible = cards.filter((card) => {
    if (filter === "all") return true;
    if (filter === "overdue") return (card.daysUntil ?? 1) <= 0;
    return card.priority === filter;
  });

  const counts = {
    all: cards.length,
    P1: cards.filter((c) => c.priority === "P1").length,
    P2: cards.filter((c) => c.priority === "P2").length,
    overdue: cards.filter((c) => (c.daysUntil ?? 1) <= 0).length,
  };

  async function act(card: CartableCardData, action: "done" | "attempt" | "skip") {
    setBusyId(card.customerId);
    try {
      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: card.customerId,
          action,
          stage: card.stage,
          channel: card.channel,
          priority: card.priority,
          reason: card.reasons[0],
          suggestedMessage: card.suggestedMessage,
        }),
      });

      if (res.ok) {
        if (action === "attempt") {
          setCards((prev) =>
            prev.map((c) =>
              c.customerId === card.customerId ? { ...c, attempts: c.attempts + 1 } : c,
            ),
          );
        } else {
          setCards((prev) => prev.filter((c) => c.customerId !== card.customerId));
        }
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {(
          [
            ["all", "همه"],
            ["P1", "اولویت ۱"],
            ["P2", "اولویت ۲"],
            ["overdue", "تأخیر"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12px] transition-colors duration-[var(--dur-2)]",
              filter === value
                ? "border-turquoise bg-turquoise-soft font-medium text-turquoise"
                : "border-line bg-surface text-ink-soft hover:border-line-strong",
            )}
          >
            {label}
            <span className="tnum ms-1.5 text-[11px] opacity-70">
              {counts[value].toLocaleString("fa-IR")}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<Check size={20} />}
            title="کارتابل خالی است"
            description="برای امروز کارت پیگیری‌ای باقی نمانده. کارهای انجام‌شده را در تاریخچه ببینید."
          />
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((card) => (
              <Card
                key={card.customerId}
                card={card}
                busy={busyId === card.customerId}
                onAction={(action) => act(card, action)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
