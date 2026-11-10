"use client";
// مرز شهرستان‌ها حجیم است؛ فقط وقتی نقشه روی یک استان می‌رود بارگذاری می‌شود.
import { useEffect, useState } from "react";
import type { County } from "@/data/iran-counties";

let cache: Record<string, County[]> | null = null;
let pending: Promise<Record<string, County[]>> | null = null;
export const loadCounties = () => (pending ??= import("@/data/iran-counties").then((m) => (cache = m.counties)));

export function useCounties(province: string | null): County[] {
  const [, tick] = useState(0);
  useEffect(() => { if (province && !cache) loadCounties().then(() => tick((n) => n + 1)); }, [province]);
  return province && cache ? cache[province] ?? [] : [];
}
