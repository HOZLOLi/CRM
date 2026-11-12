import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "turquoise" | "saffron" | "clay" | "moss";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-soft border-line",
  turquoise: "bg-turquoise-soft text-turquoise border-transparent",
  saffron: "bg-saffron-soft text-saffron border-transparent",
  clay: "bg-clay-soft text-clay border-transparent",
  moss: "bg-moss-soft text-moss border-transparent",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] font-medium leading-5",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
