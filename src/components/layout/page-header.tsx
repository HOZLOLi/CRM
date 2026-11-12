import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-line px-4 py-5 sm:flex-row sm:items-end sm:justify-between md:px-7 md:py-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-[22px] leading-tight text-ink md:text-[26px]">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-ink-soft">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-4 py-5 md:px-7 md:py-6", className)}>{children}</div>;
}
