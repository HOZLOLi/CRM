"use client";

import * as React from "react";
import { motion } from "motion/react";
import { RotateCcw, Save, Check, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea, Field } from "@/components/ui/input";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import {
  BAND_KEYS,
  BAND_LABELS,
  RANGE_KEYS,
  RANGE_LABELS,
  STAGE_LABELS,
  type AppSettings,
  type SettingsKey,
} from "@/lib/settings";

const EASE = [0.16, 1, 0.3, 1] as const;

type Status = "idle" | "saving" | "saved" | "error";

function useSaver() {
  const [status, setStatus] = React.useState<Status>("idle");

  const save = React.useCallback(async (key: SettingsKey, value: unknown) => {
    setStatus("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1800);
      return true;
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3500);
      return false;
    }
  }, []);

  const reset = React.useCallback(async (key: SettingsKey) => {
    setStatus("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1800);
      return (await res.json()) as { key: string; value: unknown };
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3500);
      return null;
    }
  }, []);

  return { status, save, reset };
}

function SaveRow({
  status,
  onSave,
  onReset,
}: {
  status: Status;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {status === "saved" ? (
        <motion.span
          initial={{ opacity: 0, x: 4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="flex items-center gap-1 text-[12px] text-moss"
        >
          <Check size={13} /> ذخیره شد
        </motion.span>
      ) : null}
      {status === "error" ? (
        <span className="flex items-center gap-1 text-[12px] text-clay">
          <AlertTriangle size={13} /> ذخیره نشد
        </span>
      ) : null}
      <Button variant="ghost" size="sm" onClick={onReset} title="بازگشت به پیش‌فرض">
        <RotateCcw size={14} />
      </Button>
      <Button size="sm" onClick={onSave} disabled={status === "saving"}>
        {status === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        ذخیره
      </Button>
    </div>
  );
}

function NumberBox({
  value,
  onChange,
  min = 0,
  max = 100,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <Input
      type="number"
      dir="ltr"
      min={min}
      max={max}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn("tnum h-9 w-20 text-center text-[13px]", className)}
    />
  );
}

export function SettingsEditor({ initial }: { initial: AppSettings }) {
  const { status, save, reset } = useSaver();

  const [criteria, setCriteria] = React.useState(initial.temperatureCriteria);
  const [bands, setBands] = React.useState(initial.temperatureBands);
  const [coverage, setCoverage] = React.useState(initial.coverageThreshold);
  const [matrix, setMatrix] = React.useState(initial.followupMatrix);
  const [channels, setChannels] = React.useState(initial.followupChannels);
  const [messages, setMessages] = React.useState(initial.followupMessages);
  const [spacing, setSpacing] = React.useState(initial.spacing);
  const [maxCalls, setMaxCalls] = React.useState(initial.safetyMaxUnansweredCalls);

  const totalMax = criteria.reduce((sum, c) => sum + c.max, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* -------------------------------------------------- criteria */}
      <Panel>
        <PanelHeader
          title="معیارهای دمای مشتری"
          subtitle={
            totalMax === 100
              ? `مجموع سقف امتیازها: ${totalMax.toLocaleString("fa-IR")}`
              : `مجموع سقف امتیازها ${totalMax.toLocaleString("fa-IR")} است — باید ۱۰۰ باشد`
          }
          action={
            <SaveRow
              status={status}
              onSave={() => save("temperatureCriteria", criteria)}
              onReset={async () => {
                const result = await reset("temperatureCriteria");
                if (result) setCriteria(result.value as typeof criteria);
              }}
            />
          }
        />
        <div className="rule mx-5" />
        <div className="flex flex-col divide-y divide-line">
          {criteria.map((criterion, ci) => (
            <div key={criterion.key} className="px-5 py-4">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="tnum text-[11px] text-ink-faint">
                    {(ci + 1).toLocaleString("fa-IR")}
                  </span>
                  <span className="text-[13.5px] font-medium text-ink">{criterion.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11.5px] text-ink-faint">سقف</span>
                  <NumberBox
                    value={criterion.max}
                    min={1}
                    max={100}
                    onChange={(max) =>
                      setCriteria((prev) =>
                        prev.map((c, i) => (i === ci ? { ...c, max } : c)),
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                {criterion.options.map((option, oi) => {
                  const isUnknown = option.points === null;
                  return (
                    <div
                      key={oi}
                      className="flex items-center gap-2 rounded-[6px] bg-surface-2/60 px-2.5 py-1.5"
                    >
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-[12.5px]",
                          isUnknown ? "text-ink-faint" : "text-ink-soft",
                        )}
                      >
                        {option.label}
                      </span>
                      {isUnknown ? (
                        <Badge tone="neutral">خارج از پوشش</Badge>
                      ) : (
                        <NumberBox
                          value={option.points ?? 0}
                          max={criterion.max}
                          onChange={(points) =>
                            setCriteria((prev) =>
                              prev.map((c, i) =>
                                i === ci
                                  ? {
                                      ...c,
                                      options: c.options.map((o, j) =>
                                        j === oi ? { ...o, points } : o,
                                      ),
                                    }
                                  : c,
                              ),
                            )
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* -------------------------------------------------- bands */}
        <Panel>
          <PanelHeader
            title="آستانهٔ دسته‌بندی"
            subtitle="مرز بالای هر دسته بر پایهٔ نمرهٔ خام"
            action={
              <SaveRow
                status={status}
                onSave={() => save("temperatureBands", bands)}
                onReset={async () => {
                  const r = await reset("temperatureBands");
                  if (r) setBands(r.value as typeof bands);
                }}
              />
            }
          />
          <div className="rule mx-5" />
          <div className="flex flex-col gap-3 px-5 py-4">
            {(
              [
                ["cold", "سرد", "۰ تا"],
                ["warm", "نیمه‌گرم", "تا"],
                ["hot", "گرم", "تا"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-[12.5px] text-ink-soft">{label}</span>
                <div className="flex items-center gap-2">
                  <NumberBox
                    value={bands[key]}
                    onChange={(v) => setBands((prev) => ({ ...prev, [key]: v }))}
                  />
                  <span className="text-[11.5px] text-ink-faint">امتیاز</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 rounded-[6px] bg-moss-soft px-2.5 py-2">
              <span className="text-[12.5px] text-moss">داغ</span>
              <span className="tnum text-[12px] text-moss">
                {(bands.hot + 1).toLocaleString("fa-IR")} تا ۱۰۰
              </span>
            </div>
          </div>
        </Panel>

        {/* -------------------------------------------------- coverage + safety */}
        <Panel>
          <PanelHeader
            title="پوشش و قواعد ایمنی"
            subtitle="حداقل اطلاعات برای ارزیابی معتبر"
            action={
              <SaveRow
                status={status}
                onSave={async () => {
                  await save("coverageThreshold", coverage);
                  await save("safetyMaxUnansweredCalls", maxCalls);
                }}
                onReset={async () => {
                  const a = await reset("coverageThreshold");
                  const b = await reset("safetyMaxUnansweredCalls");
                  if (a) setCoverage(a.value as number);
                  if (b) setMaxCalls(b.value as number);
                }}
              />
            }
          />
          <div className="rule mx-5" />
          <div className="flex flex-col gap-4 px-5 py-4">
            <Field
              label="حداقل پوشش اطلاعات"
              hint="زیر این مقدار، ارزیابی «موقت» علامت می‌خورد"
            >
              <div className="flex items-center gap-2">
                <NumberBox
                  value={Math.round(coverage * 100)}
                  min={10}
                  max={100}
                  onChange={(v) => setCoverage(v / 100)}
                />
                <span className="text-[12px] text-ink-faint">درصد</span>
              </div>
            </Field>
            <Field
              label="حداکثر تماس بی‌پاسخ"
              hint="بعد از این تعداد، تماس تلفنی ممنوع و کانال به پیام تغییر می‌کند"
            >
              <NumberBox value={maxCalls} min={1} max={10} onChange={setMaxCalls} />
            </Field>
          </div>
        </Panel>
      </div>

      {/* -------------------------------------------------- matrix */}
      <Panel>
        <PanelHeader
          title="ماتریس تصمیم کارتابل"
          subtitle="دما × فاصله تا خرید احتمالی ← مرحلهٔ اقدام"
          action={
            <SaveRow
              status={status}
              onSave={() => save("followupMatrix", matrix)}
              onReset={async () => {
                const r = await reset("followupMatrix");
                if (r) setMatrix(r.value as typeof matrix);
              }}
            />
          }
        />
        <div className="rule mx-5" />
        <div className="overflow-x-auto px-5 py-4">
          <table className="w-full min-w-[640px] border-separate border-spacing-1 text-center">
            <thead>
              <tr>
                <th className="w-24" />
                {RANGE_KEYS.map((range) => (
                  <th key={range} className="px-1 pb-1 text-[11px] font-medium text-ink-faint">
                    {RANGE_LABELS[range]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BAND_KEYS.map((band) => (
                <tr key={band}>
                  <th className="px-2 text-right text-[12px] font-medium text-ink-soft">
                    {BAND_LABELS[band]}
                  </th>
                  {RANGE_KEYS.map((range) => (
                    <td key={range}>
                      <Select
                        value={matrix[band][range]}
                        onChange={(e) =>
                          setMatrix((prev) => ({
                            ...prev,
                            [band]: { ...prev[band], [range]: Number(e.target.value) },
                          }))
                        }
                        className="h-9 px-1 text-center text-[12px]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((stage) => (
                          <option key={stage} value={stage}>
                            {stage.toLocaleString("fa-IR")}
                          </option>
                        ))}
                      </Select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-faint">
            {Object.entries(STAGE_LABELS).map(([stage, label]) => (
              <span key={stage}>
                <span className="tnum">{stage}</span> — {label}
              </span>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* -------------------------------------------------- channels */}
        <Panel>
          <PanelHeader
            title="کانال پیشنهادی"
            subtitle="بر پایهٔ دمای مشتری"
            action={
              <SaveRow
                status={status}
                onSave={() => save("followupChannels", channels)}
                onReset={async () => {
                  const r = await reset("followupChannels");
                  if (r) setChannels(r.value as typeof channels);
                }}
              />
            }
          />
          <div className="rule mx-5" />
          <div className="flex flex-col gap-3 px-5 py-4">
            {BAND_KEYS.map((band) => (
              <div key={band} className="flex items-center justify-between gap-3">
                <span className="text-[12.5px] text-ink-soft">{BAND_LABELS[band]}</span>
                <Select
                  value={channels[band]}
                  onChange={(e) =>
                    setChannels((prev) => ({ ...prev, [band]: e.target.value as never }))
                  }
                  className="h-9 w-40 text-[12.5px]"
                >
                  <option value="call">تماس تلفنی</option>
                  <option value="whatsapp">واتساپ</option>
                  <option value="sms">پیامک</option>
                </Select>
              </div>
            ))}
          </div>
        </Panel>

        {/* -------------------------------------------------- spacing */}
        <Panel>
          <PanelHeader
            title="فاصله‌گذاری برند"
            subtitle="یادآوری نام برند برای مشتریان خارج از چرخه"
            action={
              <SaveRow
                status={status}
                onSave={() => save("spacing", spacing)}
                onReset={async () => {
                  const r = await reset("spacing");
                  if (r) setSpacing(r.value as typeof spacing);
                }}
              />
            }
          />
          <div className="rule mx-5" />
          <div className="flex flex-col gap-3 px-5 py-4">
            <label className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-ink">فعال باشد</span>
              <input
                type="checkbox"
                checked={spacing.enabled}
                onChange={(e) => setSpacing((p) => ({ ...p, enabled: e.target.checked }))}
                className="h-4 w-4 accent-[var(--turquoise)]"
              />
            </label>

            <div className="flex flex-col gap-1.5">
              {spacing.buckets.map((bucket, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-[6px] bg-surface-2/60 px-2.5 py-1.5"
                >
                  <span className="min-w-0 flex-1 text-[12px] text-ink-soft">
                    نگهداری تا {bucket.maxDays.toLocaleString("fa-IR")} روز
                  </span>
                  <NumberBox
                    value={bucket.minInterval}
                    min={1}
                    max={90}
                    onChange={(v) =>
                      setSpacing((p) => ({
                        ...p,
                        buckets: p.buckets.map((b, j) => (j === i ? { ...b, minInterval: v } : b)),
                      }))
                    }
                  />
                  <span className="text-[11px] text-ink-faint">تا</span>
                  <NumberBox
                    value={bucket.maxInterval}
                    min={1}
                    max={90}
                    onChange={(v) =>
                      setSpacing((p) => ({
                        ...p,
                        buckets: p.buckets.map((b, j) => (j === i ? { ...b, maxInterval: v } : b)),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* -------------------------------------------------- messages */}
      <Panel>
        <PanelHeader
          title="متن آمادهٔ هر مرحله"
          subtitle="متغیرها: {{customer}} {{product}} {{brand}} {{repName}}"
          action={
            <SaveRow
              status={status}
              onSave={() => save("followupMessages", messages)}
              onReset={async () => {
                const r = await reset("followupMessages");
                if (r) setMessages(r.value as typeof messages);
              }}
            />
          }
        />
        <div className="rule mx-5" />
        <div className="flex flex-col gap-3 px-5 py-4">
          {[1, 2, 3, 4, 5, 6, 7].map((stage) => (
            <div key={stage} className="flex flex-col gap-1">
              <span className="text-[11.5px] font-medium text-ink-faint">
                {stage.toLocaleString("fa-IR")} — {STAGE_LABELS[stage]}
              </span>
              <Textarea
                value={messages[String(stage)] ?? ""}
                onChange={(e) =>
                  setMessages((prev) => ({ ...prev, [String(stage)]: e.target.value }))
                }
                className="min-h-16 text-[12.5px] leading-6"
              />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
