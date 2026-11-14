"use client";
// مرز شهرستان‌های هر استان فایل جدا دارد و فقط وقتی همان استان نمایش داده می‌شود بارگذاری می‌شود.
import { useEffect, useState } from "react";
import { countyLoaders, type ProvinceCounties } from "@/data/iran-counties";

const cache: Record<string, ProvinceCounties> = {};
const pending: Record<string, Promise<ProvinceCounties>> = {};
// اگر بارگذاری فایل یک استان (مثلاً به‌خاطر شبکه) شکست بخورد، تا سه بار دوباره تلاش می‌شود و خطا در حافظه نمی‌ماند
const attempt = (province: string, left: number): Promise<ProvinceCounties> =>
  countyLoaders[province]().then((m) => (cache[province] = { counties: m.counties, outline: m.outline }))
    .catch((e) => { if (left <= 0) { delete pending[province]; throw e; } return new Promise<ProvinceCounties>((r) => setTimeout(r, 1200)).then(() => attempt(province, left - 1)); });
export const loadCounties = (province: string) =>
  countyLoaders[province] ? (pending[province] ??= attempt(province, 3)).catch(() => null) : Promise.resolve(null);

const empty: ProvinceCounties = { counties: [], outline: "" };
export function useCounties(province: string | null): ProvinceCounties {
  const [, tick] = useState(0);
  useEffect(() => { if (province && !cache[province]) { let live = true; loadCounties(province).then(() => live && tick((n) => n + 1)); return () => { live = false; }; } }, [province]);
  return (province && cache[province]) || empty;
}

/** شهرستان‌های بارگذاری‌شده یک استان (بدون انتظار) */
export const countiesOf = (province: string) => cache[province]?.counties ?? [];
