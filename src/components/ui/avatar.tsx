import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  hue = 180,
  size = 32,
  className,
}: {
  name: string;
  hue?: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `oklch(0.93 0.045 ${hue})`,
        color: `oklch(0.42 0.09 ${hue})`,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
