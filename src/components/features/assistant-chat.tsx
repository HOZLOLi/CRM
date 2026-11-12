"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Square, RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const EASE = [0.16, 1, 0.3, 1] as const;

const SUGGESTIONS = [
  "خلاصه‌ای از وضعیت قیف فروش بده",
  "کدام معاملات این هفته احتمال بسته‌شدن دارند؟",
  "برای معامله‌های راکد چه اقدامی پیشنهاد می‌کنی؟",
  "وظایف عقب‌افتاده را اولویت‌بندی کن",
];

export function AssistantChat({ configured }: { configured: boolean }) {
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, setMessages, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
  });

  const busy = status === "streaming" || status === "submitted";

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  function submit(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    setInput("");
    void sendMessage({ text: value });
  }

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col md:h-[calc(100dvh-9.5rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 md:px-7">
        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-5 py-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-turquoise-soft text-turquoise">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-[19px] text-ink">از داده‌های خودت بپرس</h2>
              <p className="mt-1.5 text-[13px] leading-6 text-ink-soft">
                دستیار فیروزه به معاملات، مخاطبین، شرکت‌ها و وظایف ثبت‌شده در همین CRM دسترسی
                دارد. پاسخ‌ها بر پایه همان داده‌هاست.
              </p>
            </div>

            {!configured ? (
              <div className="flex items-start gap-2.5 rounded-[9px] border border-saffron/30 bg-saffron-soft px-3.5 py-3 text-[12.5px] leading-6 text-saffron">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <p>
                  هوش مصنوعی هنوز پیکربندی نشده است. در فایل <code dir="ltr">.env</code> مقدار
                  <code dir="ltr"> AI_BASE_URL</code> و <code dir="ltr">AI_API_KEY</code> را تنظیم
                  کنید و سرور را دوباره اجرا کنید.
                </p>
              </div>
            ) : null}

            <div className="flex w-full flex-col gap-1.5">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => submit(suggestion)}
                  disabled={!configured}
                  className="rounded-[8px] border border-line bg-surface px-3.5 py-2.5 text-right text-[12.5px] text-ink-soft transition-colors duration-[var(--dur-2)] hover:border-turquoise hover:text-ink disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => {
                const text = message.parts
                  .filter((p) => p.type === "text")
                  .map((p) => (p as { text: string }).text)
                  .join("");

                const isUser = message.role === "user";

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className={cn("flex", isUser ? "justify-start" : "justify-end")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-[12px] px-3.5 py-2.5 text-[13px] leading-7 whitespace-pre-wrap",
                        isUser
                          ? "bg-turquoise text-white"
                          : "border border-line bg-surface text-ink",
                      )}
                    >
                      {text || (busy ? "…" : "")}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {busy ? (
              <div className="flex justify-end">
                <div className="flex items-center gap-1 rounded-[12px] border border-line bg-surface px-3.5 py-3">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-ink-faint"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {error ? (
              <p className="rounded-[8px] bg-clay-soft px-3 py-2 text-[12.5px] text-clay" role="alert">
                پاسخ دریافت نشد. پیکربندی هوش مصنوعی یا اتصال شبکه را بررسی کنید.
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="border-t border-line bg-paper/85 px-4 py-3 backdrop-blur-md md:px-7">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="mx-auto flex max-w-2xl items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              rows={1}
              placeholder={configured ? "سؤالت را بنویس…" : "هوش مصنوعی پیکربندی نشده است"}
              disabled={!configured}
              className="max-h-32 min-h-10 w-full resize-none rounded-[9px] border border-line bg-surface px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-[var(--dur-2)] focus:border-turquoise focus:outline-none focus:shadow-[0_0_0_3px_var(--turquoise-soft)] disabled:opacity-50"
            />
          </div>

          {messages.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMessages([])}
              aria-label="گفتگوی جدید"
            >
              <RotateCcw size={16} />
            </Button>
          ) : null}

          {busy ? (
            <Button type="button" variant="secondary" size="icon" onClick={stop} aria-label="توقف">
              <Square size={15} />
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={!configured || !input.trim()} aria-label="ارسال">
              <Send size={16} />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
