"use client";
// انتخاب محدوده با نقشه نقطه‌ای ایران: هر نود یک شهر دارای پروژه است و با کلیک، استانش انتخاب می‌شود.
// فهرست کنار نقشه همه استان‌ها را دارد تا استان‌های بدون پروژه هم قابل انتخاب باشند.
import { useMemo } from "react";
import { IranMap } from "@/components/brand/iran-map";
import { provinces } from "@/data/provinces";
import { listings } from "@/lib/listings";
import { forRoute } from "@/lib/match";
import type { RouteId } from "@/types";
import { cn, faNumber } from "@/lib/utils";
import { ComboList } from "./controls";

export function ProvincePicker({ route, value, onChange, className }: { route: RouteId; value: string[]; onChange: (v: string[]) => void; className?: string }) {
  const { points, counts } = useMemo(() => {
    const m = new Map<string, { city: string; province: string; count: number }>(); const counts: Record<string, number> = {};
    for (const l of forRoute(listings, route)) if (l.city && l.province) { m.set(l.city, { city: l.city, province: l.province, count: (m.get(l.city)?.count ?? 0) + 1 }); counts[l.province] = (counts[l.province] ?? 0) + 1; }
    return { points: [...m.values()], counts };
  }, [route]);
  const toggle = (p: string) => onChange(value.includes(p) ? value.filter((x) => x !== p) : [...value, p]);
  const options = useMemo(() => [...provinces].sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0)).map((p) => ({ value: p, label: counts[p] ? `${p} (${faNumber(counts[p])})` : p })), [counts]);
  return (
    <div className={cn("grid grid-cols-[1.25fr_1fr] items-center gap-5", className)}>
      <div>
        <IranMap points={points} active={value} onToggle={toggle} links={false} pulse={false} />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <ComboList options={options} value={value} onChange={onChange} placeholder="جست‌وجوی استان…" empty="استانی پیدا نشد" />
      </div>
    </div>
  );
}
