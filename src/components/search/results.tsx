"use client";
// صفحه پروژه‌ها: اول «اطلاعات پایه» (دسته اصلی، محدوده، بودجه) پرسیده می‌شود و بعد نتایج می‌آید.
// در نتایج: دسته‌های اصلی (تک‌انتخابی) و فیلترهای اصلی بالای صفحه، فیلتر پیشرفته کنار نتایج.
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowDown2, ArrowLeft, ArrowRight, Category2, CloseCircle, InfoCircle, Location, Save2, SearchNormal1, Sort, WalletMoney } from "@/components/iconsax";
import { Header, Footer } from "@/components/site/header";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { ListingCard } from "@/components/listing/listing-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { groupIcons, routeIcons } from "@/components/icons";
import { sortOptions } from "@/data/fields";
import { convertAmount, routes, routeSubcategories, routeTools } from "@/data/routes";
import { LegacyTool } from "@/components/tools/engine";
import { toolById } from "@/data/tools";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { listingById } from "@/lib/listings";
import { projectGroups } from "@/data/taxonomy";
import { describeCriteria, hasAnyCriteria, type CriteriaChip } from "@/lib/criteria";
import { listings } from "@/lib/listings";
import { forRoute, rank } from "@/lib/match";
import { useHydrated, useStore } from "@/lib/store";
import type { MatchResult, Opportunity, RouteId } from "@/types";
import { cn, faNumber } from "@/lib/utils";
import { AdvancedFilter } from "./advanced-filter";
import { Chip } from "./controls";
import { BudgetField } from "./budget-field";
import { LocationFields, ProvincePicker } from "./province-picker";
import { SaveCriteriaDialog, SavedCriteriaMenu, useProfileStats } from "./save-criteria";

const PAGE = 12;
const SUITABLE = 50;
const subKey: Record<string, string> = { fund: "fundType", buyer: "saleCategory", charity: "charityType" };
const routeCounts = Object.fromEntries(routes.map((r) => [r.id, forRoute(listings, r.id).length])) as Record<RouteId, number>;
// بیشترین تعداد رقم شمارنده مسیرها (عرض ثابت برچسب شمارنده)
const countDigits = Math.max(2, ...Object.values(routeCounts).map((n) => String(n).length));

function useRoute() {
  const id = useStore((s) => s.criteria.route);
  return routes.find((r) => r.id === id)!;
}
// با تغییر مسیر، استان‌ها و بودجه کاربر حفظ می‌شود (بودجه به واحد مسیر تازه تبدیل می‌شود)
const changeRoute = (id: RouteId) => { const c = useStore.getState().criteria; if (id !== c.route) useStore.getState().setCriteria({ route: id, groups: [], amount: convertAmount(c.amount, c.route, id), filters: {} }); };

/** مبلغ پروژه‌های مسیر در استان‌ها و حوزه‌های انتخاب‌شده؛ برای نمودار و شمار بازه‌های بودجه */
function useBudgetAmounts() {
  const { route, provinces, groups } = useStore((s) => s.criteria);
  return useMemo(() => {
    const all = forRoute(listings, route).filter((l) => l.amount != null);
    return { all: all.map((l) => l.amount!), mine: all.filter((l) => (!provinces.length || route === "fund" || provinces.includes(l.province!)) && (!groups.length || !l.group || groups.includes(l.group))).map((l) => l.amount!) };
  }, [route, provinces, groups]);
}

function Budget() {
  const { criteria, setCriteria } = useStore();
  const route = useRoute();
  const amounts = useBudgetAmounts();
  if (!route.amount) return null;
  return <BudgetField key={route.id} min={route.amount.min} max={route.amount.max} step={route.amount.step} unit={route.amount.unit} value={criteria.amount} onChange={(v) => setCriteria({ amount: v })} amounts={amounts.mine} basis={amounts.all} />;
}

/** حوزه و نوع دقیق پروژه: نوع دقیق فقط بعد از انتخاب حوزه باز می‌شود */
function TypePicker() {
  const { criteria, setCriteria, setFilter } = useStore();
  const route = useRoute();
  const subs = routeSubcategories[route.id];
  const sKey = subKey[route.id];
  const subValue = (criteria.filters[sKey] as string[]) ?? [];
  const types = (criteria.filters.subtypes as string[] | undefined) ?? [];
  const provinces = criteria.provinces;
  const counts = useMemo(() => { const c: Record<string, number> = {}; for (const l of forRoute(listings, route.id)) { if (provinces.length && route.id !== "fund" && !provinces.includes(l.province!)) continue; if (l.group) c[l.group] = (c[l.group] ?? 0) + 1; const st = (l.raw as Opportunity).subtype; if (st) c[`s:${st}`] = (c[`s:${st}`] ?? 0) + 1; } return c; }, [route.id, provinces]);
  if (!route.usesProjectGroups) {
    if (!subs) return null;
    return <div className="flex flex-wrap gap-2">{subs.map((s) => { const on = subValue.includes(s.id); return <Chip key={s.id} active={on} onClick={() => setFilter(sKey, on ? subValue.filter((x) => x !== s.id) : [...subValue, s.id])}>{s.name}</Chip>; })}</div>;
  }
  const chosen = projectGroups.filter((g) => criteria.groups.includes(g.id));
  const toggleGroup = (id: string) => {
    const next = criteria.groups.includes(id) ? criteria.groups.filter((x) => x !== id) : [...criteria.groups, id];
    setCriteria({ groups: next });
    // نوع‌های دقیقِ حوزه‌ای که برداشته شد هم حذف می‌شوند
    const keep = projectGroups.filter((g) => next.includes(g.id)).flatMap((g) => g.subtypes.map((s) => s.id));
    if (types.length) setFilter("subtypes", types.filter((t) => keep.includes(t)));
  };
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2.5 text-[13px] font-bold text-ink/80">حوزه</p>
        <div className="flex flex-wrap gap-2">
          {projectGroups.map((g) => { const I = groupIcons[g.id]; const on = criteria.groups.includes(g.id);
            return <Chip key={g.id} active={on} onClick={() => toggleGroup(g.id)}><I size={15} variant="Bulk" />{g.name}{counts[g.id] ? <span className="opacity-60">({faNumber(counts[g.id])})</span> : null}</Chip>; })}
        </div>
      </div>
      <div>
        <p className="mb-2.5 text-[13px] font-bold text-ink/80">نوع دقیق پروژه</p>
        {chosen.length === 0 ? (
          <p className="flex items-center gap-2 rounded-2xl border border-dashed border-border px-4 py-3 text-[13px] font-semibold text-muted-foreground"><InfoCircle size={16} variant="Bulk" className="shrink-0 text-primary" />اول حوزه را انتخاب کنید تا نوع‌های دقیق همان حوزه این‌جا بیاید.</p>
        ) : (
          <div className="space-y-3">
            {chosen.map((g) => (
              <div key={g.id} className="flex flex-wrap items-center gap-2">
                {chosen.length > 1 && <span className="ml-1 min-w-16 text-xs font-extrabold text-muted-foreground">{g.name}</span>}
                {g.subtypes.map((s) => { const on = types.includes(s.id);
                  return <Chip key={s.id} active={on} onClick={() => setFilter("subtypes", on ? types.filter((x) => x !== s.id) : [...types, s.id])} className="px-3 py-1 text-xs">{s.name}{counts[`s:${s.id}`] ? <span className="opacity-60">({faNumber(counts[`s:${s.id}`])})</span> : null}</Chip>; })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ——— گام اول: اطلاعات پایه ——— */
// عنوان و توضیح یک‌خطی هر بخش بالای همان بخش می‌آید تا محتوا تمام عرض را داشته باشد.
function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-7 first:border-t-0 first:pt-0">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-pine text-sm font-black text-white">{faNumber(n)}</span>
        <h2 className="shrink-0 text-lg font-extrabold text-ink">{title}</h2>
        {hint && <p className="truncate text-[13px] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Intake({ count }: { count: number }) {
  const { criteria, setCriteria, setStarted, profiles, applyProfile } = useStore();
  const stats = useProfileStats();
  const route = useRoute();
  const hasTypes = route.usesProjectGroups || !!routeSubcategories[route.id];
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-5xl">
      <span className="inline-flex items-center gap-2 text-[13px] font-extrabold text-primary"><NodeMark />گام ۱ از ۲</span>
      <h1 className="mt-2 text-4xl font-black leading-[1.4] text-ink">{hasTypes ? "چهار" : "سه"} پرسش کوتاه، بعد پروژه‌های مناسب شما.</h1>
      <p className="mt-2 text-[15px] leading-7 text-muted-foreground">جزئیات بیشتر را بعداً کنار نتایج تنظیم می‌کنید.</p>

      {profiles.length > 0 && (
        <div className="surface mt-6 flex flex-wrap items-center gap-2 rounded-3xl p-4">
          <span className="ml-1 text-[13px] font-bold text-ink">از جست‌وجوهای ذخیره‌شده ادامه دهید:</span>
          {profiles.map((p) => (
            <Button key={p.id} variant="outline" onClick={() => applyProfile(p.id)} className="h-10 gap-2 rounded-full bg-white px-4 text-[13px] font-bold shadow-none hover:border-primary hover:text-primary">
              {p.name}{(stats[p.id]?.fresh ?? 0) > 0 && <Badge className="px-2 text-[11px]">{faNumber(stats[p.id].fresh)} تازه</Badge>}
            </Button>
          ))}
        </div>
      )}

      <Card className="surface mt-6 block gap-0 rounded-[2rem] p-8 shadow-none">
        <Step n={1} title="چطور وارد می‌شوید؟" hint="یک مسیر را انتخاب کنید؛ پروژه‌ها و فیلترهای هر مسیر فرق دارد.">
          <ToggleGroup type="single" spacing={2} value={criteria.route} onValueChange={(v) => v && changeRoute(v as RouteId)} className="grid w-full grid-cols-4 items-stretch">
            {routes.map((r) => { const I = routeIcons[r.id];
              return (
                <ToggleGroupItem key={r.id} value={r.id} className="group/r h-full min-h-[6.5rem] min-w-0 flex-col items-start justify-between gap-2 whitespace-normal rounded-2xl border border-border bg-white p-3.5 text-right shadow-none hover:border-primary/40 hover:bg-white data-[state=on]:border-primary data-[state=on]:bg-primary/[0.05]">
                  <span className="flex w-full items-center justify-between">
                    <span className="grid size-9 place-items-center rounded-xl bg-muted text-ink/70 group-data-[state=on]/r:bg-primary group-data-[state=on]/r:text-white"><I size={18} variant="Bulk" /></span>
                    <span className="text-[11px] font-semibold text-muted-foreground">{faNumber(routeCounts[r.id])} پروژه</span>
                  </span>
                  <span className="text-[13px] font-extrabold leading-5 text-ink">{r.name}</span>
                </ToggleGroupItem>
              ); })}
          </ToggleGroup>
        </Step>

        <Step n={2} title="کجا؟" hint={route.id === "fund" ? undefined : "روی نقشه یا از فهرست، یک یا چند استان انتخاب کنید. بدون انتخاب، همه ایران را می‌بینید."}>
          {route.id === "fund"
            ? <p className="rounded-2xl bg-muted p-4 text-sm font-semibold text-ink/75">صندوق‌ها و طرح‌های جمعی به استان خاصی وابسته نیستند.</p>
            : <ProvincePicker route={route.id} value={criteria.provinces} onChange={(v) => setCriteria({ provinces: v })} />}
        </Step>

        {hasTypes && (
          <Step n={3} title={route.usesProjectGroups ? "در چه حوزه‌ای؟" : "چه نوعی؟"} hint="اختیاری است؛ بدون انتخاب، همه نوع‌ها را می‌بینید.">
            <TypePicker />
          </Step>
        )}

        <Step n={hasTypes ? 4 : 3} title="با چه بودجه‌ای؟" hint={route.amount ? `${route.amount.label} را مشخص کنید.` : undefined}>
          {route.amount
            ? <div className="max-w-3xl"><Budget /></div>
            : <p className="rounded-2xl bg-muted p-4 text-sm font-semibold text-ink/75">در این مسیر بودجه پرسیده نمی‌شود.</p>}
        </Step>

        <div className="flex items-center gap-4 border-t border-border pt-7">
          <Button variant="plain" size="auto" onClick={() => { setStarted(true); requestAnimationFrame(() => window.scrollTo({ top: 0 })); }} className="group h-14 gap-3 rounded-full bg-primary pl-2 pr-7 text-base font-extrabold text-white shadow-[0_18px_40px_-20px_var(--primary)] hover:bg-deep">
            دیدن {faNumber(count)} پروژه<span className="grid size-10 place-items-center rounded-full bg-white/15 transition-transform group-hover:-translate-x-1"><ArrowLeft size={18} /></span>
          </Button>
          <Button variant="ghost" onClick={() => { setCriteria({ provinces: [], amount: null }); setStarted(true); requestAnimationFrame(() => window.scrollTo({ top: 0 })); }} className="h-12 rounded-full px-5 font-bold text-ink/70">بعداً مشخص می‌کنم</Button>
        </div>
      </Card>
    </motion.div>
  );
}

/* ——— فیلترهای اصلی بالای نتایج ——— */
function BarItem({ icon, label, value, active, width = "w-[22rem]", children }: { icon: React.ReactNode; label: string; value: string; active: boolean; width?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="plain" size="auto" className={cn("h-14 min-w-0 flex-1 justify-start gap-2.5 rounded-full px-4 text-right hover:bg-muted", open && "bg-muted")}>
          <span className={cn("shrink-0", active ? "text-primary" : "text-ink/45")}>{icon}</span>
          <span className="min-w-0 flex-1"><span className="block text-[11px] font-semibold text-muted-foreground">{label}</span><span className="block truncate text-sm font-extrabold text-ink">{value}</span></span>
          <ArrowDown2 size={15} className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={10} className={cn("rounded-3xl p-5 shadow-2xl", width)}>{children}</PopoverContent>
    </Popover>
  );
}

function FilterBar() {
  const { criteria, setCriteria } = useStore();
  const route = useRoute();
  const subs = routeSubcategories[route.id];
  const sKey = subKey[route.id];
  const subValue = (criteria.filters[sKey] as string[]) ?? [];
  const groupText = route.usesProjectGroups
    ? criteria.groups.length ? criteria.groups.map((g) => projectGroups.find((x) => x.id === g)?.name).join("، ") + ((criteria.filters.subtypes as string[] | undefined)?.length ? `، ${faNumber((criteria.filters.subtypes as string[]).length)} نوع` : "") : "همه حوزه‌ها"
    : subs ? (subValue.length ? subValue.map((s) => subs.find((x) => x.id === s)?.name).join("، ") : "همه") : "";
  return (
    <div className="surface flex items-center gap-1 rounded-full p-1">
      {route.id !== "fund" && <>
        <BarItem icon={<Location size={20} variant="Bulk" />} label="محدوده" value={criteria.provinces.length ? criteria.provinces.join("، ") + ((criteria.filters.cities as string[] | undefined)?.length ? `، ${faNumber(new Set(criteria.filters.cities as string[]).size)} شهر` : "") : "همه ایران"} active={criteria.provinces.length > 0} width="w-[28rem]">
          <LocationFields route={route.id} value={criteria.provinces} onChange={(v) => setCriteria({ provinces: v })} />
        </BarItem>
        <span className="h-7 w-px shrink-0 bg-border" />
      </>}
      {route.amount && <>
        <BarItem icon={<WalletMoney size={20} variant="Bulk" />} label="بودجه" value={criteria.amount ? `${faNumber(criteria.amount[0])} تا ${faNumber(criteria.amount[1])} ${route.amount.unit}` : "هر مبلغی"} active={criteria.amount != null} width="w-[34rem]">
          <Budget />
        </BarItem>
        <span className="h-7 w-px shrink-0 bg-border" />
      </>}
      {(route.usesProjectGroups || subs) && (
        <BarItem icon={<Category2 size={20} variant="Bulk" />} label={route.usesProjectGroups ? "حوزه و نوع" : "نوع"} value={groupText} active={route.usesProjectGroups ? criteria.groups.length > 0 : subValue.length > 0} width="w-[38rem]">
          <TypePicker />
        </BarItem>
      )}
    </div>
  );
}

function ActiveChips({ chips }: { chips: CriteriaChip[] }) {
  const { criteria, setCriteria, setFilter, resetFilters } = useStore();
  if (!chips.length) return <span />;
  const remove = (c: CriteriaChip) =>
    c.kind === "group" ? setCriteria({ groups: criteria.groups.filter((x) => x !== c.value) })
    : c.kind === "province" ? setCriteria({ provinces: criteria.provinces.filter((x) => x !== c.value) })
    : c.kind === "amount" ? setCriteria({ amount: null }) : setFilter(c.value!, undefined);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
        <Badge key={c.key} variant="outline" className="gap-1 border-primary/25 bg-primary/[0.05] py-1 pl-1 pr-3 text-[12px] font-bold text-ink">
          {c.label}
          <Button variant="plain" size="auto" aria-label={`حذف ${c.label}`} onClick={() => remove(c)} className="grid size-5 place-items-center rounded-full text-ink/50 hover:bg-destructive/10 hover:text-destructive"><CloseCircle size={15} variant="Bold" /></Button>
        </Badge>
      ))}
      <Button variant="ghost" size="xs" onClick={resetFilters} className="font-bold text-destructive hover:bg-destructive/10 hover:text-destructive">پاک کردن همه</Button>
    </div>
  );
}

/** تب مسیرها: یک ردیف با اسکرول افقی؛ چرخ ماوس، کشیدن و دکمه‌های کناری همه کار می‌کنند */
function RouteTabs({ routeCounts, active, onChange }: { routeCounts: Record<string, number>; active: RouteId; onChange: (r: RouteId) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: false, end: false });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    // در RTL مقدار scrollLeft صفر یا منفی است
    const update = () => { const x = Math.abs(el.scrollLeft), max = el.scrollWidth - el.clientWidth; setEdge({ start: x > 4, end: x < max - 4 }); };
    const wheel = (e: WheelEvent) => { if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; e.preventDefault(); el.scrollLeft -= e.deltaY; };
    update(); el.addEventListener("scroll", update, { passive: true }); el.addEventListener("wheel", wheel, { passive: false }); window.addEventListener("resize", update);
    return () => { el.removeEventListener("scroll", update); el.removeEventListener("wheel", wheel); window.removeEventListener("resize", update); };
  }, []);
  // تب فعال اگر بیرون از دید باشد فقط افقی به داخل می‌آید (بدون جابه‌جایی عمودی صفحه)
  useEffect(() => {
    const el = ref.current, t = el?.querySelector<HTMLElement>('[aria-selected="true"]'); if (!el || !t) return;
    const a = t.getBoundingClientRect(), b = el.getBoundingClientRect();
    if (a.left < b.left + 48) el.scrollBy({ left: a.left - b.left - 60, behavior: "smooth" }); else if (a.right > b.right - 48) el.scrollBy({ left: a.right - b.right + 60, behavior: "smooth" });
  }, [active]);
  const move = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * -320, behavior: "smooth" });
  const arrow = "absolute top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-white text-ink shadow-md hover:border-primary hover:text-primary";
  return (
    <div className="relative">
      <div ref={ref} role="tablist" aria-label="مسیر ورود" className="no-scrollbar -mx-3 -my-2 flex gap-2 overflow-x-auto px-3 py-4">
        {routes.map((r) => { const I = routeIcons[r.id]; const on = r.id === active;
          return (
            <Button key={r.id} role="tab" aria-selected={on} type="button" variant="plain" size="auto" onClick={() => onChange(r.id)}
              className={cn("h-11 flex-none gap-2 whitespace-nowrap rounded-full border px-4 text-[13px] font-extrabold transition-[background-color,border-color,color,box-shadow]", on ? "border-primary bg-primary text-white shadow-[0_6px_14px_-6px_rgb(15_118_110/0.55)]" : "border-border bg-white text-ink/70 hover:border-primary/40 hover:text-primary")}>
              <I size={17} variant="Bulk" className="shrink-0" />{r.name}
              {/* عرض ثابت به اندازه بزرگ‌ترین عدد، تا با تغییر عدد یا انتخاب، اندازه دکمه عوض نشود */}
              <span style={{ width: `${countDigits + 1.2}ch` }} className={cn("inline-block shrink-0 rounded-full text-center text-[11px] font-bold tabular-nums", on ? "bg-white/20 text-white" : "bg-muted text-ink/60")}>{faNumber(routeCounts[r.id])}</span>
            </Button>
          ); })}
      </div>
      {edge.start && <><span className="pointer-events-none absolute inset-y-0 -right-2 w-20 bg-gradient-to-l from-background to-transparent" /><Button type="button" variant="plain" size="auto" aria-label="مسیرهای قبلی" onClick={() => move(-1)} className={cn(arrow, "-right-1")}><ArrowRight size={17} /></Button></>}
      {edge.end && <><span className="pointer-events-none absolute inset-y-0 -left-2 w-20 bg-gradient-to-r from-background to-transparent" /><Button type="button" variant="plain" size="auto" aria-label="مسیرهای بعدی" onClick={() => move(1)} className={cn(arrow, "-left-1")}><ArrowLeft size={17} /></Button></>}
    </div>
  );
}

/* ——— مقایسه: تا سه پروژه کنار هم ——— */
function CompareBar() {
  const { compare, toggleCompare, clearCompare } = useStore();
  const [open, setOpen] = useState(false);
  const items = compare.map((id) => listingById(id)).filter(Boolean) as NonNullable<ReturnType<typeof listingById>>[];
  useEffect(() => { if (items.length < 2) setOpen(false); }, [items.length]);
  if (!items.length) return null;
  const labels = [...new Set(items.flatMap((l) => l.stats.map((s) => s.label)))];
  const rows: [string, (string | undefined)[]][] = [
    ["محل", items.map((l) => (l.city ? `${l.province}، ${l.city}` : l.province ?? undefined))],
    ...labels.map((lab) => [lab, items.map((l) => l.stats.find((s) => s.label === lab)?.value || undefined)] as [string, (string | undefined)[]]),
    ["ویژگی‌ها", items.map((l) => l.tags.join("، ") || undefined)],
  ];
  return (
    <>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed inset-x-0 bottom-5 z-40 mx-auto flex w-fit items-center gap-3 rounded-full bg-pine p-2 pr-5 text-white shadow-[0_18px_40px_-16px_rgb(8_59_55/0.6)]">
        <span className="text-sm font-extrabold">{faNumber(items.length)} پروژه برای مقایسه</span>
        <Button type="button" disabled={items.length < 2} onClick={() => setOpen(true)} className="h-10 rounded-full bg-primary px-5 font-extrabold text-white hover:bg-primary/90 disabled:opacity-60">{items.length < 2 ? "یک پروژه دیگر انتخاب کنید" : "مقایسه"}</Button>
        <Button type="button" variant="plain" size="auto" aria-label="پاک کردن مقایسه" onClick={clearCompare} className="grid size-10 place-items-center rounded-full text-ink/50 hover:bg-white hover:text-ink"><CloseCircle size={20} /></Button>
      </motion.div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" aria-describedby={undefined} className="thin-scroll max-h-[88dvh] overflow-y-auto rounded-[2rem] p-7 sm:max-w-5xl">
          <DialogTitle className="text-xl font-black text-ink">مقایسه پروژه‌ها</DialogTitle>
          <div className="mt-2 grid gap-x-4" style={{ gridTemplateColumns: `9rem repeat(${items.length}, minmax(0, 1fr))` }}>
            <span />
            {items.map((l) => (
              <div key={l.id} className="pb-4">
                <Link href={`/opportunities/${l.id}`} className="line-clamp-2 min-h-12 text-[15px] font-extrabold leading-6 text-ink hover:text-primary">{l.title}</Link>
                <Button type="button" variant="ghost" size="xs" onClick={() => toggleCompare(l.id)} className="-mr-2 mt-1 font-bold text-muted-foreground hover:text-destructive">حذف</Button>
              </div>
            ))}
            {rows.map(([lab, vals]) => (
              <div key={lab} className="col-span-full grid grid-cols-subgrid border-t border-border py-3 text-sm">
                <span className="text-[13px] font-semibold text-muted-foreground">{lab}</span>
                {vals.map((v, i) => <span key={i} className={cn("font-extrabold leading-7", v ? "text-ink" : "font-semibold text-ink/40")}>{v ?? "ثبت نشده"}</span>)}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function Results() {
  const hydrated = useHydrated();
  const { criteria, started, profiles } = useStore();
  const deferred = useDeferredValue(criteria);
  const [sort, setSort] = useState("relevance");
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [saveOpen, setSaveOpen] = useState(false);
  const route = useRoute();
  const hasCriteria = hydrated && hasAnyCriteria(deferred);
  const chips = useMemo(() => (hydrated ? describeCriteria(criteria) : []), [hydrated, criteria]);
  const isSaved = hydrated && profiles.some((p) => JSON.stringify(p.criteria) === JSON.stringify(criteria));

  const all = useMemo(() => (hydrated ? rank(listings, deferred) : []), [hydrated, deferred]);
  const { shown, hidden } = useMemo(() => {
    let list = all;
    if (q.trim()) list = list.filter((r) => `${r.listing.title} ${r.listing.city ?? ""} ${r.listing.province ?? ""} ${r.listing.tags.join(" ")}`.includes(q.trim()));
    const ok = hasCriteria && !showAll ? list.filter((r) => r.score >= SUITABLE) : list;
    const by: Record<string, (a: MatchResult, b: MatchResult) => number> = {
      relevance: () => 0,
      capital: (a, b) => (a.listing.amount ?? 1e9) - (b.listing.amount ?? 1e9),
      payback: (a, b) => ((a.listing.raw as Opportunity).paybackYears ?? 99) - ((b.listing.raw as Opportunity).paybackYears ?? 99),
      newest: (a, b) => b.listing.publishedAt.localeCompare(a.listing.publishedAt),
    };
    return { shown: [...ok].sort(by[sort]), hidden: list.length - ok.length };
  }, [all, q, sort, showAll, hasCriteria]);
  // شمار پروژه‌های هر مسیر با همین بودجه و استان‌ها، تا کاربر ببیند سرمایه‌اش کجا جواب می‌دهد
  const tabCounts = useMemo(() => {
    if (!hydrated || (!deferred.amount && !deferred.provinces.length)) return routeCounts;
    return Object.fromEntries(routes.map((r) => [r.id, rank(listings, { route: r.id, groups: [], filters: {}, provinces: r.id === "fund" ? [] : deferred.provinces, amount: r.id === deferred.route ? deferred.amount : convertAmount(deferred.amount, deferred.route, r.id) }).filter((x) => x.score >= SUITABLE).length])) as Record<RouteId, number>;
  }, [hydrated, deferred.amount, deferred.provinces, deferred.route]);
  const related = (routeTools[route.id] ?? []).filter((id) => !(route.id === "charity" && id === "charity")).map((id) => toolById(id)!).filter(Boolean);
  const suitable = useMemo(() => (hasCriteria ? all.filter((r) => r.score >= SUITABLE).length : all.length), [all, hasCriteria]);

  useEffect(() => setLimit(PAGE), [deferred, q, sort, showAll]);

  // پیشنهاد ذخیره جست‌وجو: نوار پررنگ بالای نتایج تا وقتی ذخیره یا بسته شود
  const [nudgeOff, setNudgeOff] = useState(false);

  return (
    <>
      <Header />
      <main className="relative mx-auto min-h-[70dvh] max-w-[90rem] px-6 pt-8">
        {!hydrated ? null : !started ? <Intake count={suitable} /> : (
          <>
            {/* مسیرها: تک‌انتخابی، یک ردیف با اسکرول افقی */}
            <RouteTabs routeCounts={tabCounts} active={criteria.route} onChange={changeRoute} />

            <div className="relative z-30 mt-4 flex items-center gap-3">
              <div className="min-w-0 flex-1"><FilterBar /></div>
              <SavedCriteriaMenu onSave={() => setSaveOpen(true)} saved={isSaved} />
            </div>

            <div className="mt-7 grid grid-cols-[21rem_1fr] gap-7">
              <aside>
                <Card className="surface thin-scroll sticky top-24 block max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-[1.75rem] p-5 shadow-none"><AdvancedFilter /></Card>
              </aside>

              <section className="min-w-0">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h1 className="shrink-0 text-xl font-black text-ink">{route.id === "charity" && all.length === 0 ? "همراهی در کار خیر" : <>{faNumber(shown.length)} پروژه <span className="text-sm font-semibold text-muted-foreground">{hasCriteria ? "نزدیک به خواسته شما" : `در ${route.name}`}</span></>}</h1>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 items-center gap-2 rounded-full border border-border bg-white px-3.5"><SearchNormal1 size={16} className="text-muted-foreground" />
                      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جست‌وجو در نتایج" aria-label="جست‌وجو در نتایج" className="h-8 w-36 border-0 !bg-transparent px-0 text-sm font-semibold shadow-none focus-visible:ring-0 placeholder:font-normal" />
                      {q && <Button variant="plain" size="auto" type="button" onClick={() => setQ("")} aria-label="پاک کردن"><CloseCircle size={16} className="text-muted-foreground" /></Button>}</div>
                    <Select dir="rtl" value={sort} onValueChange={setSort}>
                      <SelectTrigger aria-label="مرتب‌سازی" className="h-10 gap-2 rounded-full bg-white px-3.5 text-sm font-bold text-ink shadow-none data-[size=default]:h-10"><Sort size={16} className="text-primary" /><SelectValue /></SelectTrigger>
                      <SelectContent align="end" className="rounded-2xl">
                        {sortOptions.map((o) => <SelectItem key={o.value} value={o.value} className="rounded-xl">{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {chips.length > 0 && <div className="mb-5"><ActiveChips chips={chips} /></div>}

                {hasCriteria && (hidden > 0 || showAll) && (
                  <Label className="mb-5 flex w-fit items-center gap-3 text-sm font-semibold text-ink/75"><Switch dir="rtl" checked={showAll} onCheckedChange={setShowAll} />
                    پروژه‌های دورتر از خواسته من را هم نشان بده{!showAll && ` (${faNumber(hidden)} مورد)`}</Label>
                )}

                {hasCriteria && !isSaved && !nudgeOff && shown.length > 0 && (
                  <div className="relative mb-5 flex items-center gap-4 overflow-hidden rounded-[1.75rem] bg-pine-soft p-4 pr-5 text-ink">
                    <AlgoPattern className="-left-10 -top-10 h-48 w-72 text-pine/25" fade="radial" scale={0.6} />
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-pine-deep"><Save2 size={24} variant="Bulk" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-extrabold">فیلترهایی را که تنظیم کرده‌اید ذخیره کنید</p>
                      <p className="mt-0.5 text-[13px] leading-6 text-ink/70">دفعه بعد لازم نیست این مراحل را تکرار کنید؛ با یک کلیک به همین نتایج برمی‌گردید و پروژه‌های تازه را می‌بینید.</p>
                    </div>
                    <Button type="button" onClick={() => setSaveOpen(true)} className="relative h-11 shrink-0 gap-2 rounded-full bg-pine px-5 font-extrabold text-white hover:bg-pine-deep"><Save2 size={18} />ذخیره این جست‌وجو</Button>
                    <Button type="button" variant="plain" size="auto" aria-label="بستن" onClick={() => setNudgeOff(true)} className="relative grid size-9 shrink-0 place-items-center rounded-full text-ink/50 hover:bg-white hover:text-ink"><CloseCircle size={20} /></Button>
                  </div>
                )}

                {route.id === "charity" && all.length === 0 ? (
                  // مسیر خیریه در نسخه مرجع پروژه نمونه ندارد و جای آن، فرم همراهی و دورنمای اثر است
                  <Card className="surface block rounded-[2rem] p-7 shadow-none"><LegacyTool opener={toolById("charity")!.opener} root={toolById("charity")!.root} /></Card>
                ) : shown.length === 0 ? (
                  <Card className="surface grid place-items-center gap-0 rounded-[2rem] px-6 py-20 text-center shadow-none">
                    <span className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary"><SearchNormal1 size={28} variant="Bulk" /></span>
                    <h2 className="mt-5 text-xl font-extrabold text-ink">{all.length === 0 ? "در این مسیر هنوز پروژه‌ای نیست." : "با این فیلترها پروژه‌ای پیدا نشد."}</h2>
                    <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">{all.length === 0 ? "این جست‌وجو را ذخیره کنید تا پروژه‌های تازه را دفعه بعد همین‌جا ببینید." : "یکی دو فیلتر را بردارید تا نتایج بیشتری ببینید."}</p>
                    {all.length > 0 && hidden > 0 && <Button onClick={() => setShowAll(true)} className="mt-6 h-12 rounded-full px-6 font-bold">دیدن {faNumber(hidden)} پروژه نزدیک</Button>}
                    {all.length === 0 && <Button onClick={() => setSaveOpen(true)} className="mt-6 h-12 gap-2 rounded-full px-6 font-bold"><Save2 size={18} />ذخیره جست‌وجو</Button>}
                  </Card>
                ) : (
                  <div className={cn("grid grid-cols-2 gap-5 transition-opacity 2xl:grid-cols-3", deferred !== criteria && "opacity-60")}>
                    {shown.slice(0, limit).map((r, i) => <ListingCard key={r.listing.id} listing={r.listing} score={hasCriteria ? r.score : undefined} reasons={hasCriteria ? r.reasons : undefined} index={i % PAGE} comparable />)}
                  </div>
                )}
                {shown.length > limit && (
                  <div className="mt-10 flex flex-col items-center gap-2">
                    <Button variant="outline" onClick={() => setLimit(limit + PAGE)} className="h-12 rounded-full bg-white px-8 font-extrabold shadow-none hover:border-primary hover:text-primary">پروژه‌های بیشتر</Button>
                    <span className="text-xs text-muted-foreground">{faNumber(Math.min(limit, shown.length))} از {faNumber(shown.length)}</span>
                  </div>
                )}
                {related.length > 0 && (
                  <div className="mt-12 flex flex-wrap items-center gap-2.5 border-t border-border pt-6">
                    <span className="ml-1 text-[13px] font-extrabold text-ink">خدمات مرتبط با این مسیر</span>
                    {related.map((t) => <Button key={t.id} asChild variant="outline" className="h-10 rounded-full bg-white px-4 text-[13px] font-bold shadow-none hover:border-primary hover:text-primary"><Link href={`/tools/${t.id}`}>{t.name}</Link></Button>)}
                  </div>
                )}
              </section>
            </div>
            <CompareBar />
          </>
        )}
        <SaveCriteriaDialog open={saveOpen} onOpenChange={setSaveOpen} />
      </main>
      <Footer />
    </>
  );
}
