import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fa = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 });
export const faNumber = (n: number) => fa.format(n);
export const faDigits = (s: string) => s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
export const formatMobile = (m: string) => faDigits(`${m.slice(0, 4)} ${m.slice(4, 7)} ${m.slice(7)}`);

export const riskLabel: Record<string, string> = { low: "کم", medium: "متوسط", high: "زیاد", unknown: "ارزیابی‌نشده" };
export const incomeLabel: Record<string, string> = { any: "بدون محدودیت", periodic: "درآمد دوره‌ای", end: "عایدی در پایان طرح" };
export const legalLabel: Record<string, string> = { review: "نیازمند بررسی حقوقی", sample: "نمونه؛ مستندات احراز نشده" };
