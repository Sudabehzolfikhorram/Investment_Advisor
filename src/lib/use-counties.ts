"use client";
// مرز شهرستان‌های هر استان فایل جدا دارد و فقط وقتی همان استان نمایش داده می‌شود بارگذاری می‌شود.
import { useEffect, useState } from "react";
import { countyLoaders, type ProvinceCounties } from "@/data/iran-counties";

const cache: Record<string, ProvinceCounties> = {};
const pending: Record<string, Promise<ProvinceCounties>> = {};
export const loadCounties = (province: string) =>
  countyLoaders[province] ? (pending[province] ??= countyLoaders[province]().then((m) => (cache[province] = { counties: m.counties, outline: m.outline }))) : Promise.resolve(null);

const empty: ProvinceCounties = { counties: [], outline: "" };
export function useCounties(province: string | null): ProvinceCounties {
  const [, tick] = useState(0);
  useEffect(() => { if (province && !cache[province]) { let live = true; loadCounties(province).then(() => live && tick((n) => n + 1)); return () => { live = false; }; } }, [province]);
  return (province && cache[province]) || empty;
}
