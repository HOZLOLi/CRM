import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-turquoise text-white hover:brightness-110 active:brightness-95 shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]",
  secondary:
    "bg-surface text-ink border border-line hover:border-line-strong hover:bg-surface-2",
  ghost: "text-ink-soft hover:text-ink hover:bg-surface-2",
  danger: "bg-clay text-white hover:brightness-110",
  accent: "bg-saffron text-white hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-[6px]",
  md: "h-10 px-4 text-sm gap-2 rounded-[8px]",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-[10px]",
  icon: "h-9 w-9 rounded-[8px] justify-center",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium select-none",
        "whitespace-nowrap",
        "transition-[background-color,color,border-color,filter,transform] duration-[var(--dur-2)] ease-[var(--ease-out-quart)]",
        "active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
