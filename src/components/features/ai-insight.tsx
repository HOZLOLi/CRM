"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, Loader2, X, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface AiInsightProps {
  scope: "cartable" | "customer" | "dashboard" | "orders" | "settings";
  entityId?: string;
  title: string;
  suggestions?: string[];
  /** اگر false باشد، دکمه غیرفعال با راهنما نمایش داده می‌شود */
  configured: boolean;
  className?: string;
}

/**
 * نقطهٔ ورود هوش مصنوعی هر ماژول.
 *
 * پاسخ استریمی در همان پنل، نه مدال. اگر AI پیکربندی نشده باشد، دکمه غیرفعال
 * است و راهنمای تنظیم .env نشان داده می‌شود — هرگز خطا نمی‌دهد.
 */
export function AiInsight({
  scope,
  entityId,
  title,
  suggestions = [],
  configured,
  className,
}: AiInsightProps) {
  const [open, setOpen] = React.useState(false);
  const [answer, setAnswer] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [question, setQuestion] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function ask(text: string) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setQuestion(text);
    setAnswer("");
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/ai/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, entityId, question: text }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "پاسخی دریافت نشد");
        setPending(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnswer((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError("ارتباط قطع شد");
    } finally {
      setPending(false);
    }
  }

  return (
    <Panel className={cn("overflow-hidden", className)}>
      <PanelHeader
        title={title}
        subtitle="تحلیل بر پایهٔ دادهٔ همین CRM"
        action={
          open ? (
            <button
              onClick={() => {
                abortRef.current?.abort();
                setOpen(false);
                setPending(false);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
              aria-label="بستن تحلیل"
            >
              <X size={15} />
            </button>
          ) : (
            <Button size="sm" variant="secondary" disabled={!configured} onClick={() => setOpen(true)}>
              <Sparkles size={14} />
              تحلیل با هوش مصنوعی
            </Button>
          )
        }
      />

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="rule mx-5" />

            {!configured ? (
              <p className="flex items-start gap-2 px-5 py-4 text-[12.5px] leading-6 text-ink-faint">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                برای فعال‌سازی، <code dir="ltr">AI_BASE_URL</code> و{" "}
                <code dir="ltr">AI_API_KEY</code> را در فایل <code dir="ltr">.env</code> تنظیم کنید.
              </p>
            ) : (
              <div className="flex flex-col gap-3 px-5 py-4">
                {!answer && !pending ? (
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => ask(suggestion)}
                        className="rounded-full border border-line px-2.5 py-1 text-[11.5px] text-ink-soft transition-colors hover:border-turquoise hover:text-turquoise"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                ) : null}

                {question ? (
                  <p className="text-[12px] text-ink-faint">«{question}»</p>
                ) : null}

                {answer ? (
                  <div className="whitespace-pre-wrap text-[13px] leading-7 text-ink-soft">
                    {answer}
                  </div>
                ) : null}

                {pending ? (
                  <p className="flex items-center gap-1.5 text-[12px] text-ink-faint">
                    <Loader2 size={13} className="animate-spin" />
                    در حال تحلیل…
                  </p>
                ) : null}

                {error ? (
                  <p className="rounded-[7px] bg-clay-soft px-2.5 py-1.5 text-[12px] text-clay" role="alert">
                    {error}
                  </p>
                ) : null}

                {answer && !pending ? (
                  <button
                    onClick={() => question && ask(question)}
                    className="flex items-center gap-1 self-start text-[11.5px] text-turquoise hover:underline"
                  >
                    <RefreshCw size={11} />
                    تحلیل دوباره
                  </button>
                ) : null}
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Panel>
  );
}

/** نسخهٔ کوچک برای قرار گرفتن در PageHeader. */
export function AiInsightButton({
  scope,
  entityId,
  suggestions = [],
  configured,
}: Omit<AiInsightProps, "title" | "className">) {
  return (
    <AiInsight
      scope={scope}
      entityId={entityId}
      title="تحلیل با هوش مصنوعی"
      suggestions={suggestions}
      configured={configured}
      className="mt-4"
    />
  );
}
