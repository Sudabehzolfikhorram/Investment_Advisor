"use client";
// صفحه پروژه‌ها: اول «اطلاعات پایه» (دسته اصلی، محدوده، بودجه) پرسیده می‌شود و بعد نتایج می‌آید.
// در نتایج: دسته‌های اصلی (تک‌انتخابی) و فیلترهای اصلی بالای صفحه، فیلتر پیشرفته کنار نتایج.
import { Fragment, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { ArrowDown2, ArrowLeft, Category2, CloseCircle, Convertshape2, Location, Routing2, Save2, SearchNormal1, Sort, WalletMoney } from "@/components/iconsax";
import { Header, Footer } from "@/components/site/header";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { ListingCard } from "@/components/listing/listing-card";
import { CompareTray } from "@/components/compare/tray";
import { QuickFilters } from "./quick-filters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { groupIcons, routeIcons } from "@/components/icons";
import { sortOptions } from "@/data/fields";
import { convertAmount, routes, routeSubcategories, routeTools } from "@/data/routes";
import { LegacyTool } from "@/components/tools/engine";
import { toolById } from "@/data/tools";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { projectGroups } from "@/data/taxonomy";
import { describeCriteria, hasAnyCriteria, withoutChip, type CriteriaChip } from "@/lib/criteria";
import { listingById, listings } from "@/lib/listings";
import { forRoute, rank } from "@/lib/match";
import { useHydrated, useStore } from "@/lib/store";
import type { MatchResult, Opportunity, RouteId } from "@/types";
import { cn, faNumber } from "@/lib/utils";
import { AdvancedFilter } from "./advanced-filter";
import { GroupTypePicker } from "./type-picker";
import { Chip } from "./controls";
import { BudgetField } from "./budget-field";
import { LocationFields, ProvincePicker } from "./province-picker";
import { ProProfileBar, ProProfileCard } from "./pro-profile";
import { SaveCriteriaDialog, SavedCriteriaMenu, useProfileStats } from "./save-criteria";

const PAGE = 12;
const SUITABLE = 50;
const subKey: Record<string, string> = { fund: "fundType", buyer: "saleCategory", charity: "charityType" };
const routeCounts = Object.fromEntries(routes.map((r) => [r.id, forRoute(listings, r.id).length])) as Record<RouteId, number>;
// بیشترین تعداد رقم شمارنده مسیرها (عرض ثابت برچسب شمارنده)

function useRoute() {
  const id = useStore((s) => s.criteria.route);
  return routes.find((r) => r.id === id)!;
}
// با تغییر مسیر، استان‌ها و بودجه کاربر حفظ می‌شود (بودجه به واحد مسیر تازه تبدیل می‌شود)
const changeRoute = (id: RouteId) => { const c = useStore.getState().criteria; if (id !== c.route) useStore.getState().setCriteria({ route: id, groups: [], amount: convertAmount(c.amount, c.route, id), filters: {} }); };

/** مبلغ پروژه‌های مسیر در استان‌ها و حوزه‌های انتخاب‌شده، برای نمودار و شمار بازه‌های بودجه */
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
function TypePicker({ compact }: { compact?: boolean }) {
  const { criteria, setCriteria, setFilter } = useStore();
  const route = useRoute();
  const subs = routeSubcategories[route.id];
  const sKey = subKey[route.id];
  const subValue = (criteria.filters[sKey] as string[]) ?? [];
  const types = (criteria.filters.subtypes as string[] | undefined) ?? [];
  const provinces = criteria.provinces;
  const counts = useMemo(() => { const c: Record<string, number> = {}; for (const l of forRoute(listings, route.id)) { if (provinces.length && route.id !== "fund" && !provinces.includes(l.province!)) continue; if (l.group) c[l.group] = (c[l.group] ?? 0) + 1; const st = (l.raw as Opportunity).subtype; if (st) c[`s:${st}`] = (c[`s:${st}`] ?? 0) + 1; } return c; }, [route.id, provinces]);
  // مسیرهایی که زیردسته‌ی خودشان را دارند (صندوق، خرید، خیریه) با همان، بقیه با حوزه‌های پروژه
  if (!route.usesProjectGroups && subs) {
    return <div className="flex flex-wrap gap-2">{subs.map((s) => { const on = subValue.includes(s.id); return <Chip key={s.id} active={on} onClick={() => setFilter(sKey, on ? subValue.filter((x) => x !== s.id) : [...subValue, s.id])}>{s.name}</Chip>; })}</div>;
  }
  return <GroupTypePicker groups={criteria.groups} types={types} counts={counts} compact={compact}
    onChange={(groups, subtypes) => { setCriteria({ groups }); setFilter("subtypes", subtypes.length ? subtypes : undefined); }} />;
}

/* ——— گام اول: اطلاعات پایه ——— */
// جریان گام‌به‌گام (حالت «یک جمله» حذف شد): چهار پرسش زیر هم در ستون اصلی، و کنارش خلاصه‌ی زنده
// با شمار پروژه‌ها، سه پیشنهاد اول و دکمه‌ی دیدن نتایج که همیشه در دید است.
function Step({ id, icon, title, hint, children }: { id: string; icon: React.ReactNode; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-border py-8 first:border-t-0 first:pt-1">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink/[0.05] text-ink/70">{icon}</span>
        <div className="min-w-0">
          <h2 className="text-[17px] font-extrabold text-ink">{title}</h2>
          {hint && <p className="text-[13px] leading-6 text-muted-foreground">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/** خلاصه‌ی زنده کنار پرسش‌ها: هر ردیف به پرسش خودش می‌پرد */
function IntakeSummary({ count, onGo, onLater }: { count: number; onGo: () => void; onLater: () => void }) {
  const { criteria } = useStore();
  const route = useRoute();
  const subs = routeSubcategories[route.id];
  const sv = (criteria.filters[subKey[route.id]] as string[] | undefined) ?? [];
  const scored = hasAnyCriteria(criteria);
  const top = useMemo(() => rank(listings, criteria).filter((r) => r.score >= SUITABLE).slice(0, 3), [criteria]);
  const rows: [string, string, string, boolean][] = [
    ["q-route", "مسیر", route.name, true],
    ["q-type", route.usesProjectGroups || !subs ? "حوزه" : "نوع", (route.usesProjectGroups || !subs) ? (criteria.groups.length ? criteria.groups.map((g) => projectGroups.find((x) => x.id === g)?.name).join("، ") : "همه حوزه‌ها") : sv.length ? sv.map((x) => subs.find((y) => y.id === x)?.name).join("، ") : "همه", (route.usesProjectGroups || !subs) ? criteria.groups.length > 0 : sv.length > 0],
    ["q-where", "محدوده", route.id === "fund" ? "همه ایران" : criteria.provinces.length ? criteria.provinces.join("، ") : "همه ایران", route.id !== "fund" && criteria.provinces.length > 0],
    ["q-budget", "بودجه", !route.amount ? "پرسیده نمی‌شود" : criteria.amount ? `${faNumber(criteria.amount[0])} تا ${faNumber(criteria.amount[1])} ${route.amount.unit}` : "هر مبلغی", !!route.amount && criteria.amount != null],
  ];
  return (
    <aside className="sticky top-24 space-y-3">
      <div className="surface rounded-[1.75rem] p-5">
        <p className="text-[12.5px] font-extrabold text-muted-foreground">نتیجه تا این‌جا</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="relative h-[3.2rem] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={count} initial={{ y: 32, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -32, opacity: 0 }} transition={{ duration: 0.3 }} className="block text-[2.9rem] font-black leading-none tabular-nums text-ink">{faNumber(count)}</motion.span>
            </AnimatePresence>
          </span>
          <span className="text-[14px] font-bold text-muted-foreground">پروژه با این شرایط</span>
        </div>
        <dl className="mt-4 divide-y divide-border/70 border-y border-border/70">
          {rows.map(([id, k, v, on]) => (
            <button key={id} type="button" onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })} className="group flex w-full items-center gap-3 py-2.5 text-right">
              <dt className="w-14 shrink-0 text-[12px] font-semibold text-muted-foreground">{k}</dt>
              <dd className={cn("min-w-0 flex-1 truncate text-[13px] font-extrabold", on ? "text-ink" : "text-ink/45")}>{v}</dd>
              <ArrowLeft size={14} className="shrink-0 text-ink/25 transition-colors group-hover:text-ink" />
            </button>
          ))}
        </dl>
        <Button variant="plain" size="auto" onClick={onGo} className="group mt-4 h-13 w-full justify-between gap-3 rounded-full bg-primary pl-2 pr-6 text-[15px] font-extrabold text-white shadow-[0_18px_40px_-20px_var(--primary)] hover:bg-deep">
          دیدن {faNumber(count)} پروژه<span className="grid size-9 place-items-center rounded-full bg-white/15 transition-transform group-hover:-translate-x-1"><ArrowLeft size={17} /></span>
        </Button>
        <Button variant="ghost" onClick={onLater} className="mt-1.5 h-10 w-full rounded-full text-[13px] font-bold text-ink/60">بعداً مشخص می‌کنم</Button>
      </div>
      {top.length > 0 && (
        <div className="surface rounded-[1.75rem] p-3">
          <p className="px-2 pb-2 pt-1 text-[12.5px] font-extrabold text-muted-foreground">{scored ? "بیشترین تطابق تا این‌جا" : "تازه‌ترین پروژه‌ها"}</p>
          <ul className="space-y-1">
            {top.map((r) => (
              <li key={r.listing.id}>
                <Link href={`/opportunities/${r.listing.id}`} target="_blank" className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-ink/[0.03]">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted"><Image src={r.listing.image} alt="" fill sizes="48px" className="object-cover" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-[13px] font-extrabold text-ink">{r.listing.title}</span>
                    <span className="block truncate text-[11.5px] font-semibold text-muted-foreground">{r.listing.province ? `${r.listing.province}، ${r.listing.city}` : r.listing.tags.join(" · ")}</span>
                  </span>
                  {scored && <span className="shrink-0 text-[12px] font-black tabular-nums text-ink/70">{faNumber(r.score)}٪</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

function Intake({ count }: { count: number }) {
  const { criteria, setCriteria, setStarted, profiles, applyProfile } = useStore();
  const stats = useProfileStats();
  const route = useRoute();
  const subs = routeSubcategories[route.id];
  const useGroups = route.usesProjectGroups || !subs;
  const go = () => { setStarted(true); requestAnimationFrame(() => window.scrollTo({ top: 0 })); };
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-[78rem]">
      <div>
        <span className="inline-flex items-center gap-2 text-[13px] font-extrabold text-ink/55"><NodeMark className="text-primary" />شروع جست‌وجو</span>
        <h1 className="mt-2 text-[2.1rem] font-black leading-[1.4] text-ink">چهار پرسش کوتاه، بعد پروژه‌های مناسب شما.</h1>
        <p className="mt-1.5 text-[15px] leading-7 text-muted-foreground">هر پاسخ همان لحظه نتیجه را کنار صفحه به‌روز می‌کند، جزئیات بیشتر را بعداً کنار نتایج تنظیم می‌کنید.</p>
      </div>

      {profiles.length > 0 && (
        <div className="surface mt-6 flex flex-wrap items-center gap-2 rounded-3xl p-4">
          <span className="ml-1 text-[13px] font-bold text-ink">از جست‌وجوهای ذخیره‌شده ادامه دهید:</span>
          {profiles.map((p) => (
            <Button key={p.id} variant="outline" onClick={() => applyProfile(p.id)} className="h-10 gap-2 rounded-full bg-white px-4 text-[13px] font-bold shadow-none hover:border-ink/25 hover:text-ink">
              {p.name}{(stats[p.id]?.fresh ?? 0) > 0 && <Badge className="px-2 text-[11px]">{faNumber(stats[p.id].fresh)} تازه</Badge>}
            </Button>
          ))}
        </div>
      )}

      <ProProfileBar className="mt-5" />

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_21rem] items-start gap-6">
      <Card className="surface block gap-0 rounded-[2rem] px-8 py-7 shadow-none">
        <Step id="q-route" icon={<Routing2 size={19} variant="Bulk" />} title="چطور وارد می‌شوید؟" hint="یک مسیر را انتخاب کنید، پروژه‌ها و فیلترهای هر مسیر فرق دارد.">
          <ToggleGroup type="single" spacing={2} value={criteria.route} onValueChange={(v) => v && changeRoute(v as RouteId)} className="grid w-full grid-cols-4 items-stretch">
            {routes.map((r) => { const I = routeIcons[r.id];
              return (
                <ToggleGroupItem key={r.id} value={r.id} className="group/r h-full min-h-[6.5rem] min-w-0 flex-col items-start justify-between gap-2 whitespace-normal rounded-2xl border border-border bg-white p-3.5 text-right shadow-none hover:border-ink/25 hover:bg-white data-[state=on]:border-cobalt data-[state=on]:bg-cobalt-soft/50">
                  <span className="flex w-full items-center justify-between">
                    <span className="grid size-9 place-items-center rounded-xl bg-muted text-ink/70 group-data-[state=on]/r:bg-cobalt group-data-[state=on]/r:text-white"><I size={18} variant="Bulk" /></span>
                    <span className="text-[11px] font-semibold text-muted-foreground">{faNumber(routeCounts[r.id])} پروژه</span>
                  </span>
                  <span className="text-[13px] font-extrabold leading-5 text-ink">{r.name}</span>
                </ToggleGroupItem>
              ); })}
          </ToggleGroup>
        </Step>

        <Step id="q-type" icon={<Category2 size={19} variant="Bulk" />} title={useGroups ? "در چه حوزه‌ای؟" : "چه نوعی؟"} hint="اختیاری است، بدون انتخاب، همه را می‌بینید.">
          <TypePicker />
        </Step>

        <Step id="q-where" icon={<Location size={19} variant="Bulk" />} title="کجا؟" hint={route.id === "fund" ? undefined : "روی نقشه یک یا چند استان را بزنید، با بردن نشانگر روی هر استان، عکس شاخص آن را می‌بینید."}>
          {route.id === "fund"
            ? <p className="rounded-2xl bg-muted p-4 text-sm font-semibold text-ink/75">صندوق‌ها و طرح‌های جمعی به استان خاصی وابسته نیستند.</p>
            : <ProvincePicker route={route.id} value={criteria.provinces} onChange={(v) => setCriteria({ provinces: v })} />}
        </Step>

        <Step id="q-budget" icon={<WalletMoney size={19} variant="Bulk" />} title="با چه بودجه‌ای؟" hint={route.amount ? `${route.amount.label} را مشخص کنید.` : undefined}>
          {route.amount
            ? <Budget />
            : <p className="rounded-2xl bg-muted p-4 text-sm font-semibold text-ink/75">در این مسیر بودجه پرسیده نمی‌شود.</p>}
        </Step>
      </Card>
      <IntakeSummary count={count} onGo={go} onLater={() => { setCriteria({ provinces: [], amount: null }); go(); }} />
      </div>
    </motion.div>
  );
}

/* ——— فیلترهای اصلی بالای نتایج ——— */
function BarItem({ icon, label, value, active, width = "w-[22rem]", children }: { icon: React.ReactNode; label: string; value: string; active: boolean; width?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="plain" size="auto" className={cn("h-12 min-w-0 flex-1 justify-start gap-2.5 rounded-full px-4 text-right hover:bg-muted", open && "bg-muted")}>
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
  const useGroups = route.usesProjectGroups || !subs;
  const groupText = useGroups
    ? criteria.groups.length ? (() => { const n = criteria.groups.map((g) => projectGroups.find((x) => x.id === g)?.name); return n.length > 2 ? `${n.slice(0, 2).join("، ")} و ${faNumber(n.length - 2)} حوزه دیگر` : n.join("، "); })() + ((criteria.filters.subtypes as string[] | undefined)?.length ? `، ${faNumber((criteria.filters.subtypes as string[]).length)} نوع` : "") : "همه حوزه‌ها"
    : subValue.length ? subValue.map((s) => subs!.find((x) => x.id === s)?.name).join("، ") : "همه";
  // سه فیلد همیشه دیده می‌شوند، جایی که در مسیری کاربرد ندارد، توضیحش در همان فیلد می‌آید
  const note = (t: string) => <p className="rounded-2xl bg-muted p-4 text-sm font-semibold leading-7 text-ink/75">{t}</p>;
  return (
    <div className="surface flex items-center gap-1 rounded-full p-1">
      <BarItem icon={<Location size={20} variant="Bulk" />} label="محدوده" value={route.id === "fund" ? "همه ایران" : criteria.provinces.length ? criteria.provinces.join("، ") + ((criteria.filters.cities as string[] | undefined)?.length ? `، ${faNumber(new Set(criteria.filters.cities as string[]).size)} شهر` : "") : "همه ایران"} active={route.id !== "fund" && criteria.provinces.length > 0} width={route.id === "fund" ? "w-[22rem]" : "w-[28rem]"}>
        {route.id === "fund" ? note("صندوق‌ها و طرح‌های جمعی به استان خاصی وابسته نیستند، از هر جای ایران می‌توانید وارد شوید.") : <LocationFields route={route.id} value={criteria.provinces} onChange={(v) => setCriteria({ provinces: v })} />}
      </BarItem>
      <span className="h-7 w-px shrink-0 bg-border" />
      <BarItem icon={<WalletMoney size={20} variant="Bulk" />} label="بودجه" value={!route.amount ? "پرسیده نمی‌شود" : criteria.amount ? `${faNumber(criteria.amount[0])} تا ${faNumber(criteria.amount[1])} ${route.amount.unit}` : "هر مبلغی"} active={!!route.amount && criteria.amount != null} width={route.amount ? "w-[34rem]" : "w-[22rem]"}>
        {route.amount ? <Budget /> : note("در مسیر بهره‌برداری، شما سرمایه نمی‌آورید و پروژه‌ها با توان اجرایی و تجربه‌تان سنجیده می‌شوند.")}
      </BarItem>
      <span className="h-7 w-px shrink-0 bg-border" />
      <BarItem icon={<Category2 size={20} variant="Bulk" />} label={useGroups ? "حوزه و نوع" : "نوع"} value={groupText} active={useGroups ? criteria.groups.length > 0 : subValue.length > 0} width="w-[46rem]">
        <TypePicker compact />
      </BarItem>
    </div>
  );
}

/* ——— فیلترهای فعال: کنار هر فیلتر نوشته می‌شود برداشتنش چند پروژه اضافه می‌کند ——— */
function ActiveChips({ chips, suitable }: { chips: CriteriaChip[]; suitable: number }) {
  const { criteria, setCriteria, setFilter, resetFilters } = useStore();
  const gain = useMemo(() => Object.fromEntries(chips.map((c) => [c.key, rank(listings, withoutChip(criteria, c)).filter((r) => r.score >= SUITABLE).length - suitable])), [chips, criteria, suitable]);
  if (!chips.length) return <span />;
  const remove = (c: CriteriaChip) =>
    c.kind === "group" ? setCriteria({ groups: criteria.groups.filter((x) => x !== c.value) })
    : c.kind === "province" ? setCriteria({ provinces: criteria.provinces.filter((x) => x !== c.value) })
    : c.kind === "amount" ? setCriteria({ amount: null }) : setFilter(c.value!, undefined);
  const chip = (c: CriteriaChip) => (
    <Badge key={c.key} variant="outline" className="shrink-0 gap-1.5 border-cobalt/25 bg-cobalt-soft/70 py-1 pl-1 pr-3 text-[12px] font-bold text-cobalt-deep">
      {c.label}
      {gain[c.key] > 0 && <span className="rounded-full bg-white px-1.5 text-[10.5px] font-extrabold text-cobalt" title={`با برداشتن این فیلتر ${faNumber(gain[c.key])} پروژه دیگر می‌بینید`}>+{faNumber(gain[c.key])}</span>}
      <Button variant="plain" size="auto" aria-label={`حذف ${c.label}`} onClick={() => remove(c)} className="grid size-5 place-items-center rounded-full text-cobalt-deep/50 hover:bg-destructive/10 hover:text-destructive"><CloseCircle size={15} variant="Bold" /></Button>
    </Badge>
  );
  return <ChipRow chips={chips} chip={chip} onClear={resetFilters} />;
}

/** فیلترهای فعال در یک سطر: هر چه جا نشود پشت «…» می‌رود و «پاک کردن همه» ته سطر ثابت است */
function ChipRow({ chips, chip, onClear }: { chips: CriteriaChip[]; chip: (c: CriteriaChip) => React.ReactNode; onClear: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(chips.length);
  useLayoutEffect(() => {
    const el = box.current, m = measure.current; if (!el || !m) return;
    const calc = () => {
      const widths = [...m.children].map((x) => (x as HTMLElement).offsetWidth);
      const gap = 8, more = 64, room = el.clientWidth;
      let used = 0, n = 0;
      for (let i = 0; i < widths.length; i++) {
        const next = used + (i ? gap : 0) + widths[i];
        const left = i < widths.length - 1 ? gap + more : 0;
        if (next + left > room) break;
        used = next; n = i + 1;
      }
      setFit(n);
    };
    calc();
    const ro = new ResizeObserver(calc); ro.observe(el);
    return () => ro.disconnect();
  }, [chips]);
  const rest = chips.slice(fit);
  return (
    <div className="flex h-8 items-center gap-3">
      <div ref={box} className="relative flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        {/* لایه اندازه‌گیری: همه چیپ‌ها نامرئی، برای محاسبه این‌که چندتا در سطر جا می‌شود */}
        <div ref={measure} aria-hidden className="pointer-events-none invisible absolute right-0 top-0 flex w-max gap-2">{chips.map(chip)}</div>
        {chips.slice(0, fit).map(chip)}
        {rest.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="plain" size="auto" aria-label={`${faNumber(rest.length)} فیلتر دیگر`} className="h-7 shrink-0 gap-1 rounded-full border border-cobalt/25 bg-white px-2.5 text-[12px] font-extrabold text-cobalt-deep hover:bg-cobalt-soft data-[state=open]:bg-cobalt-soft">
                <span className="tracking-widest">…</span>+{faNumber(rest.length)}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-80 rounded-2xl p-3">
              <p className="mb-2.5 px-1 text-[12px] font-bold text-muted-foreground">فیلترهای فعال دیگر</p>
              <div className="flex flex-wrap gap-2">{rest.map(chip)}</div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <Button variant="ghost" size="xs" onClick={onClear} className="shrink-0 font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive">پاک کردن همه</Button>
    </div>
  );
}


/** ترتیب نمایش: هم‌شکل نوار فیلترهای بالا (برچسب کوچک + مقدار) */
function SortField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select dir="rtl" value={value} onValueChange={onChange}>
      <SelectTrigger aria-label="ترتیب نمایش" className="surface group h-14 w-[12.5rem] shrink-0 gap-2.5 rounded-full border-border bg-white px-4 text-right data-[size=default]:h-14 data-[state=open]:bg-muted [&>svg:last-child]:hidden">
        <Sort size={20} variant="Bulk" className={cn("shrink-0", value !== "relevance" ? "text-primary" : "text-ink/45")} />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold text-muted-foreground">ترتیب نمایش</span>
          <span className="block truncate text-sm font-extrabold text-ink"><SelectValue /></span>
        </span>
        <ArrowDown2 size={15} className="shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </SelectTrigger>
      <SelectContent align="end" className="rounded-2xl">
        {sortOptions.map((o) => <SelectItem key={o.value} value={o.value} className="rounded-xl">{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function RouteTabs({ routeCounts, active, onChange }: { routeCounts: Record<string, number>; active: RouteId; onChange: (r: RouteId) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative">
      {/* هشت مسیر در دو ردیف چهارتایی، همه یک‌جا دیده می‌شوند و اسکرول افقی ندارند */}
      <div ref={ref} role="tablist" aria-label="مسیر ورود" className="grid grid-cols-4 gap-2">
        {routes.map((r) => { const I = routeIcons[r.id]; const on = r.id === active;
          return (
            <Button key={r.id} role="tab" aria-selected={on} type="button" variant="plain" size="auto" onClick={() => onChange(r.id)}
              className={cn("h-12 min-w-0 justify-start gap-2.5 whitespace-nowrap rounded-2xl border px-4 text-[13.5px] font-extrabold transition-[background-color,border-color,color,box-shadow]", on ? "border-cobalt bg-cobalt text-white shadow-[0_8px_18px_-10px_var(--cobalt)]" : "border-border bg-white text-ink/70 hover:border-ink/25 hover:text-ink")}>
              <I size={18} variant="Bulk" className="shrink-0" /><span className="min-w-0 truncate">{r.name}</span>
              <span className={cn("mr-auto inline-block shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-bold tabular-nums", on ? "bg-white/20 text-white" : "bg-muted text-ink/60")}>{faNumber(routeCounts[r.id])}</span>
            </Button>
          ); })}
      </div>
    </div>
  );
}

export function Results() {
  const hydrated = useHydrated();
  const { criteria, started, profiles, pinned, setPinned, setCompare } = useStore();
  const router = useRouter();
  const pinnedList = useMemo(() => (pinned ? pinned.ids.map((id) => listingById(id)).filter((x): x is NonNullable<typeof x> => !!x) : []), [pinned]);
  const deferred = useDeferredValue(criteria);
  const [sort, setSort] = useState("relevance");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [saveOpen, setSaveOpen] = useState(false);
  const route = useRoute();
  const hasCriteria = hydrated && hasAnyCriteria(deferred);
  const chips = useMemo(() => (hydrated ? describeCriteria(criteria) : []), [hydrated, criteria]);
  const isSaved = hydrated && profiles.some((p) => JSON.stringify(p.criteria) === JSON.stringify(criteria));

  const all = useMemo(() => (hydrated ? rank(listings, deferred) : []), [hydrated, deferred]);
  const { shown, far } = useMemo(() => {
    let list = all;
    if (q.trim()) list = list.filter((r) => `${r.listing.title} ${r.listing.city ?? ""} ${r.listing.province ?? ""} ${r.listing.tags.join(" ")}`.includes(q.trim()));
    const ok = hasCriteria ? list.filter((r) => r.score >= SUITABLE) : list;
    const by: Record<string, (a: MatchResult, b: MatchResult) => number> = {
      relevance: () => 0,
      capital: (a, b) => (a.listing.amount ?? 1e9) - (b.listing.amount ?? 1e9),
      payback: (a, b) => ((a.listing.raw as Opportunity).paybackYears ?? 99) - ((b.listing.raw as Opportunity).paybackYears ?? 99),
      newest: (a, b) => b.listing.publishedAt.localeCompare(a.listing.publishedAt),
    };
    // پروژه‌های با تطابق کمتر بعد از پروژه‌های مناسب، هنگام اسکرول می‌آیند، درصد روی کارت کافی است و عنوان جدا ندارند
    const rest = hasCriteria ? list.filter((r) => r.score < SUITABLE && r.score > 0) : [];
    return { shown: [...ok].sort(by[sort]), far: [...rest].sort((a, b) => b.score - a.score || by[sort](a, b)) };
  }, [all, q, sort, hasCriteria]);
  const feed = useMemo(() => [...shown, ...far], [shown, far]);
  // شمار پروژه‌های هر مسیر با همین بودجه و استان‌ها، تا کاربر ببیند سرمایه‌اش کجا جواب می‌دهد
  const tabCounts = useMemo(() => {
    if (!hydrated || (!deferred.amount && !deferred.provinces.length)) return routeCounts;
    return Object.fromEntries(routes.map((r) => [r.id, rank(listings, { route: r.id, groups: [], filters: {}, provinces: r.id === "fund" ? [] : deferred.provinces, amount: r.id === deferred.route ? deferred.amount : convertAmount(deferred.amount, deferred.route, r.id) }).filter((x) => x.score >= SUITABLE).length])) as Record<RouteId, number>;
  }, [hydrated, deferred.amount, deferred.provinces, deferred.route]);
  const related = (routeTools[route.id] ?? []).filter((id) => !(route.id === "charity" && id === "charity")).map((id) => toolById(id)!).filter(Boolean);
  const suitable = useMemo(() => (hasCriteria ? all.filter((r) => r.score >= SUITABLE).length : all.length), [all, hasCriteria]);

  useEffect(() => setLimit(PAGE), [deferred, q, sort]);
  // با رسیدن به انتهای فهرست، صفحه بعد خودکار اضافه می‌شود
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current; if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) setLimit((l) => (l < feed.length ? l + PAGE : l)); }, { rootMargin: "600px 0px" });
    io.observe(el); return () => io.disconnect();
  }, [feed.length, limit]);

  return (
    <>
      <Header />
      <main className="focus-blur relative mx-auto min-h-[70dvh] max-w-[90rem] px-6 pt-8">
        {!hydrated ? null : !started ? <Intake count={suitable} /> : (
          <>
            {/* مسیرها: تک‌انتخابی، یک ردیف با اسکرول افقی */}
            <RouteTabs routeCounts={tabCounts} active={criteria.route} onChange={changeRoute} />

            {/* نوار بالا: محدوده، بودجه و حوزه، کنارش ترتیب نمایش و فیلترهای ذخیره‌شده، همه ۵۶ پیکسل */}
            <div className="relative z-30 mt-4 flex items-center gap-3">
              <div className="min-w-0 flex-1"><FilterBar /></div>
              <SortField value={sort} onChange={setSort} />
              <SavedCriteriaMenu onSave={() => setSaveOpen(true)} saved={isSaved} />
            </div>

            <div className="mt-7 grid grid-cols-[21rem_1fr] gap-7">
              <aside>
                <Card className="surface thin-scroll sticky top-24 block max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-[1.75rem] p-5 shadow-none">
                  <AdvancedFilter quick={<QuickFilters />} profileCard={<ProProfileCard />} onSave={hasCriteria ? () => setSaveOpen(true) : undefined} saved={isSaved} />
                </Card>
              </aside>

              <section className="min-w-0">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h1 className="shrink-0 text-xl font-black text-ink">{route.id === "charity" && all.length === 0 ? "همراهی در کار خیر" : <>{faNumber(shown.length)} پروژه <span className="text-sm font-semibold text-muted-foreground">{hasCriteria ? "نزدیک به خواسته شما" : `در ${route.name}`}</span></>}</h1>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 items-center gap-2 rounded-full border border-border bg-white px-3.5"><SearchNormal1 size={16} className="text-muted-foreground" />
                      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جست‌وجو در نتایج" aria-label="جست‌وجو در نتایج" className="h-8 w-36 border-0 !bg-transparent px-0 text-sm font-semibold shadow-none focus-visible:ring-0 placeholder:font-normal" />
                      {q && <Button variant="plain" size="auto" type="button" onClick={() => setQ("")} aria-label="پاک کردن"><CloseCircle size={16} className="text-muted-foreground" /></Button>}</div>
                  </div>
                </div>
                {chips.length > 0 && <div className="mb-5"><ActiveChips chips={chips} suitable={suitable} /></div>}

                {/* پروژه‌هایی که از نمودار «بازگشت در برابر مشابه‌ها» در صفحه جزئیات آمده‌اند، بالای نتایج سنجاق می‌شوند */}
                {pinnedList.length > 0 && (
                  <section className="mb-7 rounded-[1.75rem] border border-cobalt/20 bg-[#eef1f8]/70 p-4">
                    <div className="mb-4 flex items-center gap-3 px-1">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-cobalt shadow-[0_6px_16px_-10px_rgb(20_30_45/0.4)]"><Convertshape2 size={20} variant="Bulk" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-extrabold text-ink">پروژه‌های نمودار بازگشت «{pinned!.from}»</p>
                        <p className="text-[12px] font-semibold text-muted-foreground">همان {faNumber(pinnedList.length)} پروژه‌ای که در صفحه جزئیات کنار هم دیدید</p>
                      </div>
                      <Button type="button" variant="plain" size="auto" onClick={() => { setCompare(pinnedList.map((x) => x.id)); router.push("/compare"); }} className="h-10 shrink-0 gap-1.5 rounded-full bg-cobalt px-4 text-[13px] font-extrabold text-white hover:bg-cobalt-deep"><Convertshape2 size={16} />مقایسه همه</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setPinned(null)} className="h-10 shrink-0 rounded-full px-3 text-[12.5px] font-bold text-muted-foreground">بستن</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 2xl:grid-cols-4">
                      {pinnedList.map((x, i) => <ListingCard key={x.id} listing={x} index={i} comparable />)}
                    </div>
                  </section>
                )}

                {route.id === "charity" && all.length === 0 ? (
                  // مسیر خیریه در نسخه مرجع پروژه نمونه ندارد و جای آن، فرم همراهی و دورنمای اثر است
                  <Card className="surface block rounded-[2rem] p-7 shadow-none"><LegacyTool opener={toolById("charity")!.opener} root={toolById("charity")!.root} /></Card>
                ) : feed.length === 0 ? (
                  <Card className="surface grid place-items-center gap-0 rounded-[2rem] px-6 py-20 text-center shadow-none">
                    <span className="grid size-16 place-items-center rounded-full bg-ink/[0.06] text-primary"><SearchNormal1 size={28} variant="Bulk" /></span>
                    <h2 className="mt-5 text-xl font-extrabold text-ink">{all.length === 0 ? "در این مسیر هنوز پروژه‌ای نیست." : "با این فیلترها پروژه‌ای پیدا نشد."}</h2>
                    <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">{all.length === 0 ? "این جست‌وجو را ذخیره کنید تا پروژه‌های تازه را دفعه بعد همین‌جا ببینید." : "یکی دو فیلتر را بردارید تا نتایج بیشتری ببینید."}</p>
                    {all.length === 0 && <Button onClick={() => setSaveOpen(true)} className="mt-6 h-12 gap-2 rounded-full px-6 font-bold"><Save2 size={18} />ذخیره جست‌وجو</Button>}
                  </Card>
                ) : (
                  <div className={cn("grid grid-cols-2 gap-5 transition-opacity 2xl:grid-cols-3", deferred !== criteria && "opacity-60")}>
                    {feed.slice(0, limit).map((r, i) => (
                      <Fragment key={r.listing.id}>
                        <ListingCard listing={r.listing} score={hasCriteria ? r.score : undefined} reasons={hasCriteria ? r.reasons : undefined} index={i % PAGE} comparable />
                      </Fragment>))}
                  </div>
                )}
                {feed.length > limit && <div ref={sentinel} aria-hidden className="mt-8 flex justify-center"><span className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}
                {related.length > 0 && (
                  <div className="mt-12 flex flex-wrap items-center gap-2.5 border-t border-border pt-6">
                    <span className="ml-1 text-[13px] font-extrabold text-ink">خدمات مرتبط با این مسیر</span>
                    {related.map((t) => <Button key={t.id} asChild variant="outline" className="h-10 rounded-full bg-white px-4 text-[13px] font-bold shadow-none hover:border-ink/25 hover:text-ink"><Link href={`/tools/${t.id}`}>{t.name}</Link></Button>)}
                  </div>
                )}
              </section>
            </div>
            <CompareTray />
          </>
        )}
        <SaveCriteriaDialog open={saveOpen} onOpenChange={setSaveOpen} />
      </main>
      <Footer />
    </>
  );
}
