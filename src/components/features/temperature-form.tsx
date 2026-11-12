"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  evaluateTemperature,
  BAND_LABEL_FA,
  type TemperatureBands,
  type TemperatureCriterion,
} from "@/lib/temperature";
import type { BandKey } from "@/lib/settings";

const EASE = [0.16, 1, 0.3, 1] as const;

const BAND_TONE: Record<BandKey, "neutral" | "saffron" | "turquoise" | "clay"> = {
  cold: "neutral",
  warm: "saffron",
  hot: "turquoise",
  veryHot: "clay",
};

export function TemperatureForm({
  customerId,
  criteria,
  bands,
  coverageThreshold,
  onSaved,
}: {
  customerId: string;
  criteria: TemperatureCriterion[];
  bands: TemperatureBands;
  coverageThreshold: number;
  onSaved?: () => void;
}) {
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [note, setNote] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  // پیش‌نمایش زنده با همان موتور سمت سرور — یک منبع حقیقت برای فرمول
  const preview = React.useMemo(
    () => evaluateTemperature({ criteria, bands, coverageThreshold, answers }),
    [criteria, bands, coverageThreshold, answers],
  );

  const answered = preview.answeredKeys.length + preview.unknownKeys.length;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/temperature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, answers, note: note || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "ثبت ارزیابی ناموفق بود");
        return;
      }
      setSaved(true);
      setAnswers({});
      setNote("");
      onSaved?.();
    } catch {
      setError("ارتباط با سرور برقرار نشد");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col">
      <div className="flex flex-col divide-y divide-line">
        {criteria.map((criterion, index) => {
          const selected = answers[criterion.key];
          return (
            <div key={criterion.key} className="px-5 py-3.5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="tnum text-[11px] text-ink-faint">
                    {(index + 1).toLocaleString("fa-IR")}
                  </span>
                  <span className="text-[13px] font-medium text-ink">{criterion.label}</span>
                </div>
                <span className="tnum text-[11px] text-ink-faint">
                  تا {criterion.max.toLocaleString("fa-IR")}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {criterion.options.map((option, optionIndex) => {
                  const active = selected === optionIndex;
                  const isUnknown = option.points === null;
                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => {
                          const next = { ...prev };
                          if (active) delete next[criterion.key];
                          else next[criterion.key] = optionIndex;
                          return next;
                        })
                      }
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11.5px] transition-colors duration-[var(--dur-2)] ease-[var(--ease-out-quart)]",
                        active
                          ? isUnknown
                            ? "border-line-strong bg-surface-2 font-medium text-ink-faint"
                            : "border-turquoise bg-turquoise-soft font-medium text-turquoise"
                          : "border-line text-ink-soft hover:border-line-strong",
                      )}
                    >
                      {option.label}
                      {!isUnknown && (
                        <span className="tnum ms-1 opacity-60">
                          {option.points?.toLocaleString("fa-IR")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* live preview */}
      <div className="sticky bottom-0 border-t border-line bg-surface/95 px-5 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div>
            <p className="text-[10.5px] text-ink-faint">نمرهٔ خام</p>
            <p className="tnum text-[19px] font-medium leading-none text-ink">
              {preview.rawScore.toLocaleString("fa-IR")}
              <span className="text-[11px] font-normal text-ink-faint"> / ۱۰۰</span>
            </p>
          </div>

          <div>
            <p className="text-[10.5px] text-ink-faint">پوشش</p>
            <p className="tnum text-[13px] text-ink">
              {Math.round(preview.coverage * 100).toLocaleString("fa-IR")}٪
            </p>
          </div>

          <Badge tone={BAND_TONE[preview.band]}>{BAND_LABEL_FA[preview.band]}</Badge>

          {preview.isProvisional ? (
            <Badge tone="saffron">ارزیابی موقت</Badge>
          ) : answered === criteria.length ? (
            <span className="flex items-center gap-1 text-[11.5px] text-moss">
              <Check size={12} /> کامل
            </span>
          ) : null}

          <span className="text-[11.5px] text-ink-faint">
            {answered.toLocaleString("fa-IR")} از {criteria.length.toLocaleString("fa-IR")} معیار
          </span>

          <Button type="submit" size="sm" className="ms-auto" disabled={pending || answered === 0}>
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            ثبت ارزیابی
          </Button>
        </div>

        <div className="mt-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="یادداشت اختیاری از مکالمه…"
            className="min-h-14 text-[12.5px]"
          />
        </div>

        {error ? (
          <p className="mt-2 rounded-[6px] bg-clay-soft px-2.5 py-1.5 text-[12px] text-clay" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="mt-2 rounded-[6px] bg-moss-soft px-2.5 py-1.5 text-[12px] text-moss"
          >
            ارزیابی ثبت شد و در کارتابل اثر گذاشت.
          </motion.p>
        ) : null}
      </div>
    </form>
  );
}
