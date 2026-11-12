import { format as formatJalali, formatDistanceToNow as distanceJalali } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";
import { toPersianDigits } from "./money";

/** Jalali (Solar Hijri) formatting — the calendar our users actually read. */
export function formatDate(value: Date | string | null | undefined, pattern = "d MMM yyyy"): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return toPersianDigits(formatJalali(date, pattern, { locale: faIR }));
}

export function formatDateTime(value: Date | string | null | undefined): string {
  return formatDate(value, "d MMM yyyy، HH:mm");
}

export function formatRelative(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return toPersianDigits(distanceJalali(date, { addSuffix: true, locale: faIR }));
}

export function isOverdue(value: Date | string | null | undefined): boolean {
  if (!value) return false;
  const date = typeof value === "string" ? new Date(value) : value;
  return date.getTime() < Date.now();
}

export function daysUntil(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}
