import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export function Stat({
  label,
  value,
  hint,
  delta,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  delta?: number | null;
  className?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className={cn("flex flex-col gap-2 bg-surface px-4 py-4 md:px-5 md:py-5", className)}>
      <p className="text-[11.5px] font-medium text-ink-faint">{label}</p>
      <p className="tnum font-[family-name:var(--font-display)] text-[19px] leading-tight text-ink sm:text-[22px] md:text-[26px]">
        {value}
      </p>
      <div className="flex items-center gap-1.5">
        {typeof delta === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[11.5px] font-medium",
              positive ? "text-moss" : "text-clay",
            )}
          >
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta).toLocaleString("fa-IR")}٪
          </span>
        ) : null}
        {hint ? <span className="text-[11.5px] text-ink-faint">{hint}</span> : null}
      </div>
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line lg:grid-cols-4">
      {children}
    </div>
  );
}
