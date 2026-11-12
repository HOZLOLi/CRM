import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full bg-surface text-ink placeholder:text-ink-faint border border-line rounded-[8px] " +
  "transition-[border-color,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-out-quart)] " +
  "hover:border-line-strong focus:border-turquoise focus:outline-none " +
  "focus:shadow-[0_0_0_3px_var(--turquoise-soft)] disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(base, "h-11 px-3 text-[16px] md:h-10 md:text-sm", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(base, "min-h-24 px-3 py-2 text-[16px] leading-6 md:text-sm", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(base, "h-11 px-3 text-[16px] appearance-none md:h-10 md:text-sm", className)} {...props} />
));
Select.displayName = "Select";

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[13px] font-medium text-ink-soft">{label}</span>
      {children}
      {error ? (
        <span className="text-[12px] text-clay">{error}</span>
      ) : hint ? (
        <span className="text-[12px] text-ink-faint">{hint}</span>
      ) : null}
    </label>
  );
}
