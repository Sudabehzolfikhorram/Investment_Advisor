"use client";
// فیلتر پیشرفته کنار نتایج. همه فیلدهای اختیاری از data/fields.ts خوانده می‌شوند.
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown2, Refresh2, Setting4 } from "@/components/iconsax";
import { advancedFields, advancedSections, profileFields } from "@/data/fields";
import { routes, routeSubcategories } from "@/data/routes";
import { projectGroups } from "@/data/taxonomy";
import { listings } from "@/lib/listings";
import { useStore } from "@/lib/store";
import type { FieldDef, FieldOption, FilterValue, RouteId } from "@/types";
import { cn, faNumber } from "@/lib/utils";
import { FieldControl, RangeField } from "./controls";
import { Slider } from "@/components/ui/slider";
import { amountPresets } from "./search-bar";

const noLocation: RouteId[] = ["fund"];
const propertyRoutes: RouteId[] = ["buyer", "lessee"];

function visible(f: FieldDef, route: RouteId, filters: Record<string, FilterValue>) {
  if (f.routes && !f.routes.includes(route)) return false;
  if (!f.routes && f.section === "location" && noLocation.includes(route)) return false;
  if (!f.routes && (f.id === "usage" || f.id === "area") && !propertyRoutes.includes(route)) return false;
  if (f.showWhen) {
    const v = filters[f.showWhen.field];
    if (f.showWhen.filled) return v != null && v !== 0;
    if (f.showWhen.in) return Array.isArray(v) ? (v as string[]).some((x) => f.showWhen!.in!.includes(x)) : f.showWhen.in.includes(v as string);
  }
  return true;
}

function Section({ title, count, defaultOpen = true, children }: { title: string; count: number; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/70 last:border-0">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between py-4 text-right">
        <span className="flex items-center gap-2 text-[15px] font-extrabold text-ink">{title}{count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">{faNumber(count)}</span>}</span>
        <ArrowDown2 size={16} className={cn("text-muted-foreground transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="space-y-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** جمله «تا سال X حداقل Y درصد» */
function ReturnSentence({ yearKey, pctKey, maxPct }: { yearKey?: string; pctKey: string; maxPct: number }) {
  const { criteria, setFilter } = useStore();
  const y = yearKey ? (criteria.filters[yearKey] as number | undefined) : undefined;
  const p = criteria.filters[pctKey] as number | undefined;
  const pill = (on: boolean) => cn("mx-1 inline-block rounded-lg px-2 py-0.5 font-black", on ? "bg-primary text-white" : "bg-primary/10 text-primary");
  return (
    <div className="rounded-3xl bg-gradient-to-br from-primary/[0.09] to-sand/[0.14] p-4">
      <p className="text-[15px] font-bold leading-9 text-ink">
        {yearKey && <>تا<span className={pill(y != null)}>{y != null ? `${faNumber(y)} سال` : "چند سال"}</span>دیگر، </>}
        حداقل<span className={pill(!!p)}>{p ? `${faNumber(p)}٪` : "چند درصد"}</span>بازده سالانه می‌خواهم.
      </p>
      {yearKey && (
        <label className="mt-3 block"><span className="mb-2 block text-[11px] font-semibold text-muted-foreground">افق بازگشت سرمایه (سال)</span>
          <Slider dir="rtl" min={1} max={25} value={[y ?? 1]} onValueChange={(v) => setFilter(yearKey, v[0])} className={cn(y == null && "opacity-50")} /></label>
      )}
      <label className="mt-4 block"><span className="mb-2 block text-[11px] font-semibold text-muted-foreground">بازده سالانه (درصد)</span>
        <Slider dir="rtl" min={0} max={maxPct} value={[p ?? 0]} onValueChange={(v) => setFilter(pctKey, v[0] || undefined)} className={cn(!p && "opacity-50")} /></label>
      {(y != null || !!p) && <button type="button" onClick={() => { if (yearKey) setFilter(yearKey, undefined); setFilter(pctKey, undefined); }} className="mt-3 text-xs font-semibold text-muted-foreground hover:text-destructive">حذف این شرط</button>}
    </div>
  );
}

export function AdvancedFilter({ className }: { className?: string }) {
  const { criteria, setCriteria, setFilter, resetFilters } = useStore();
  const route = routes.find((r) => r.id === criteria.route)!;
  const f = criteria.filters;

  const dynamicOptions = useMemo<Record<string, FieldOption[]>>(() => {
    const groups = criteria.groups.length ? projectGroups.filter((g) => criteria.groups.includes(g.id)) : projectGroups;
    const cities = [...new Set(listings.filter((l) => l.city && (!criteria.provinces.length || criteria.provinces.includes(l.province!))).map((l) => l.city!))];
    const sub = (r: RouteId) => (routeSubcategories[r] ?? []).map((s) => ({ value: s.id, label: s.name }));
    return {
      subtypes: groups.flatMap((g) => g.subtypes.map((s) => ({ value: s.id, label: s.name }))),
      cities: cities.map((c) => ({ value: c, label: c })),
      fundType: sub("fund"), saleCategory: sub("buyer"), charityType: sub("charity"),
    };
  }, [criteria.groups, criteria.provinces]);

  const special = new Set(["horizon", "irrMin", "fundReturnMin"]);
  const fields = advancedFields.filter((x) => visible(x, route.id, f));
  const profile = profileFields.filter((x) => !x.routes || x.routes.includes(route.id));
  const activeIn = (list: FieldDef[]) => list.filter((x) => f[x.id] != null).length;
  const total = Object.keys(f).length;
  const many = dynamicOptions.subtypes.length > 14;

  const row = (x: FieldDef) => (
    <div key={x.id} className={cn(x.control === "switch" && "flex items-center justify-between gap-3")}>
      <p className={cn("text-[13px] font-bold text-ink/80", x.control !== "switch" && "mb-2")}>{x.label}</p>
      <FieldControl field={x.id === "subtypes" && many ? { ...x, control: "multi-combobox" } : x} value={f[x.id]} onChange={(v) => setFilter(x.id, v)} options={dynamicOptions[x.id]} />
    </div>
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between pb-2">
        <h2 className="flex items-center gap-2 text-lg font-black text-ink"><Setting4 size={20} variant="Bulk" className="text-primary" />فیلتر پیشرفته</h2>
        {total > 0 && <button type="button" onClick={resetFilters} className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-destructive"><Refresh2 size={14} />پاک کردن ({faNumber(total)})</button>}
      </div>
      <p className="pb-2 text-xs leading-6 text-muted-foreground">همه موارد اختیاری‌اند. با هر تغییر، نتایج همان لحظه به‌روز می‌شود.</p>

      {advancedSections.map((s) => {
        const list = fields.filter((x) => x.section === s.id);
        const isAmount = s.id === "amount";
        if (!list.length && !(isAmount && route.amount)) return null;
        return (
          <Section key={s.id + route.id} title={s.name} count={activeIn(list) + (isAmount && criteria.amount ? 1 : 0)} defaultOpen={!("collapsed" in s && s.collapsed)}>
            {isAmount && route.amount && (
              <div><p className="mb-2 text-[13px] font-bold text-ink/80">{route.amount.label}</p>
                <RangeField min={route.amount.min} max={route.amount.max} step={route.amount.step} unit={route.amount.unit} value={criteria.amount ?? undefined} onChange={(v) => setCriteria({ amount: v })} presets={amountPresets(route.amount.min, route.amount.max)} /></div>
            )}
            {isAmount && list.some((x) => x.id === "irrMin") && <ReturnSentence yearKey="horizon" pctKey="irrMin" maxPct={80} />}
            {isAmount && list.some((x) => x.id === "fundReturnMin") && <ReturnSentence pctKey="fundReturnMin" maxPct={60} />}
            {list.filter((x) => !special.has(x.id)).map(row)}
          </Section>
        );
      })}
      {profile.length > 0 && (
        <Section title="اطلاعات تکمیلی شما" count={activeIn(profile)} defaultOpen={false}>
          <p className="text-xs leading-6 text-muted-foreground">یک‌بار وارد می‌کنید و همراه شرایط ذخیره می‌شود.</p>
          {profile.map(row)}
        </Section>
      )}
    </div>
  );
}
