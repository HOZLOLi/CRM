"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";

const EASE = [0.16, 1, 0.3, 1] as const;

const DEMO_ACCOUNTS = [
  { email: "admin@firoozeh.ir", label: "مدیرعامل" },
  { email: "manager@firoozeh.ir", label: "مدیر فروش" },
  { email: "rep@firoozeh.ir", label: "کارشناس فروش" },
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("manager@firoozeh.ir");
  const [password, setPassword] = React.useState("demo1234");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "ورود ناموفق بود");
        setPending(false);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد");
      setPending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="w-full max-w-[380px]"
    >
      <div className="mb-8">
        <div className="mb-5 flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" className="h-9 w-9" aria-hidden>
            <path
              d="M16 2.5 29 9.5v13L16 29.5 3 22.5v-13z"
              fill="none"
              stroke="var(--turquoise)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path d="M16 9.5 22.5 13v6L16 22.5 9.5 19v-6z" fill="var(--turquoise)" opacity="0.16" />
            <circle cx="16" cy="16" r="2.4" fill="var(--saffron)" />
          </svg>
          <div>
            <p className="font-[family-name:var(--font-display)] text-[17px] font-semibold leading-none text-ink">
              فیروزه
            </p>
            <p className="mt-1 text-[11px] text-ink-faint">مدیریت ارتباط با مشتری</p>
          </div>
        </div>

        <h1 className="text-[26px] leading-tight text-ink">خوش برگشتی</h1>
        <p className="mt-1.5 text-[13.5px] leading-6 text-ink-soft">
          برای دیدن قیف فروش و کارهای امروز وارد شو.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="ایمیل">
          <Input
            type="email"
            dir="ltr"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-left"
            required
          />
        </Field>

        <Field label="گذرواژه">
          <Input
            type="password"
            dir="ltr"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-left"
            required
          />
        </Field>

        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[7px] bg-clay-soft px-3 py-2 text-[12.5px] text-clay"
            role="alert"
          >
            {error}
          </motion.p>
        ) : null}

        <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
          {pending ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <>
              ورود
              <ArrowLeft size={17} />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="rule flex-1" />
          <span className="text-[11px] text-ink-faint">حساب‌های نمونه</span>
          <span className="rule flex-1" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword("demo1234");
              }}
              className="rounded-full border border-line px-2.5 py-1 text-[11.5px] text-ink-soft transition-colors hover:border-turquoise hover:text-turquoise"
            >
              {account.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] leading-5 text-ink-faint">
          گذرواژه همه حساب‌های نمونه: <span dir="ltr" className="font-medium">demo1234</span>
        </p>
      </div>
    </motion.div>
  );
}
