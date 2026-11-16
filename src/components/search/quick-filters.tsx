"use client";
// فیلترهای یک‌کلیکی: پرکاربردترین شرط‌ها به‌صورت دکمه، با شمار پروژه‌هایی که پس از زدن هر کدام می‌ماند.
// همان فیلدهای فیلتر پیشرفته‌اند (چیزی اضافه نشده)؛ فقط به‌جای اسلایدر، یک مقدار رایج با یک کلیک تنظیم می‌شود.
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TickCircle } from "@/components/iconsax";
import { listings } from "@/lib/listings";
import { rank } from "@/lib/match";
import { useStore } from "@/lib/store";
import type { FilterValue, RouteId } from "@/types";
import { cn, faNumber } from "@/lib/utils";

type Preset = { label: string; field: string; value: FilterValue };
const presets: Partial<Record<RouteId, Preset[]>> = {
  investor: [
    { label: "بازگشت تا ۷ سال", field: "horizon", value: 7 },
    { label: "اولین دریافت تا ۲ سال", field: "firstIncome", value: 24 },
    { label: "درآمد دوره‌ای", field: "income", value: "periodic" },
    { label: "قفل سرمایه تا ۵ سال", field: "lockup", value: 60 },
    { label: "طرح نیمه‌تمام", field: "phase", value: ["unfinished"] },
    { label: "صاحب پروژه خصوصی", field: "owner", value: "private" },
  ],
  fund: [{ label: "ریسک کم", field: "risk", value: "low" }],
};
presets.heritage = presets.investor!.slice(0, 4);

export const hasQuickFilters = (route: RouteId) => !!presets[route]?.length;
const same =(a: FilterValue, b: FilterValue) => JSON.stringify(a) === JSON.stringify(b);

export function QuickFilters() {
  const { criteria, setFilter } = useStore();
  const list = presets[criteria.route];
  const counts = useMemo(() => (list ?? []).map((p) => rank(listings, { ...criteria, filters: { ...criteria.filters, [p.field]: p.value } }).filter((r) => r.score >= 50).length), [list, criteria]);
  if (!list?.length) return null;
  // به‌عنوان آخرین بخش فیلترهای اختیاری نمایش داده می‌شود (عنوان و توضیحش در همان بخش است)
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {list.map((p, i) => {
          const on = same(criteria.filters[p.field], p.value);
          return (
            <Button key={p.label} type="button" variant="plain" size="auto" aria-pressed={on} onClick={() => setFilter(p.field, on ? undefined : p.value)} disabled={!on && counts[i] === 0}
              className={cn("h-9 gap-1.5 rounded-full border px-3 text-[12.5px] font-bold transition-colors disabled:opacity-40", on ? "border-cobalt bg-cobalt text-white" : "border-border bg-white text-ink hover:border-cobalt/40")}>
              {on && <TickCircle size={15} variant="Bold" />}{p.label}
              {!on && <span className="rounded-full bg-muted px-1.5 text-[10.5px] font-extrabold text-ink/60">{faNumber(counts[i])}</span>}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
