"use client";
// صفحه پروژه‌ها (دور ۲۶): صفحه پرسش‌ها حذف شد و کاربر مستقیم به نتایج می‌آید.
// بالای صفحه چهار فیلتر اصلی (مسیر، حوزه و نوع، محدوده، بودجه) و دو آیکون ترتیب نمایش و فیلترهای ذخیره‌شده، فیلتر پیشرفته کنار نتایج، نتایج صفحه‌بندی‌شده.
import { Fragment, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown2, ArrowLeft, ArrowRight, ArrowUp2, Category2, CloseCircle, Convertshape2, Location, Save2, SearchNormal1, Sort, WalletMoney } from "@/components/iconsax";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useHoverOpen } from "./hover-open";
import { Header, Footer } from "@/components/site/header";
import { ListingCard } from "@/components/listing/listing-card";
import { CompareTray } from "@/components/compare/tray";
import { QuickFilters } from "./quick-filters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { routeIcons } from "@/components/icons";
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
import { LocationFields } from "./province-picker";
import { ProProfileCard } from "./pro-profile";
import { SaveCriteriaDialog, SavedCriteriaMenu } from "./save-criteria";

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

function BarItem({ icon, label, value, active, width = "w-[22rem]", children }: { icon: React.ReactNode; label: string; value: string; active: boolean; width?: string; children: React.ReactNode | ((close: () => void) => React.ReactNode) }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="plain" size="auto" className={cn("h-12 min-w-0 flex-1 justify-start gap-2.5 rounded-full px-4 text-right hover:bg-muted", open && "bg-muted")}>
          <span className={cn("shrink-0", active ? "text-primary-ink" : "text-ink/45")}>{icon}</span>
          <span className="min-w-0 flex-1"><span className="block text-[11px] font-semibold text-muted-foreground">{label}</span><span className="block truncate text-sm font-extrabold text-ink">{value}</span></span>
          <ArrowDown2 size={15} className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={10} className={cn("rounded-3xl p-5 shadow-2xl", width)}>{typeof children === "function" ? children(() => setOpen(false)) : children}</PopoverContent>
    </Popover>
  );
}

function FilterBar({ counts }: { counts: Record<RouteId, number> }) {
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
      {/* چهار فیلتر اصلی: مسیر، حوزه و نوع، محدوده و بودجه (ردیف مسیرها در همین نوار ادغام شد) */}
      <BarItem icon={(() => { const I = routeIcons[route.id]; return <I size={20} variant="Bulk" />; })()} label="مسیر" value={route.name} active width="w-[40rem]">
        {(close) => (
          <div className="grid grid-cols-2 gap-2">
            {routes.map((r) => { const I = routeIcons[r.id]; const on = r.id === route.id;
              return (
                <Button key={r.id} type="button" variant="plain" size="auto" aria-pressed={on} onClick={() => { changeRoute(r.id); close(); }}
                  className={cn("h-12 min-w-0 justify-start gap-2.5 rounded-2xl border px-3.5 text-[13.5px] font-extrabold transition-colors", on ? "border-cobalt bg-cobalt text-white" : "border-border bg-white text-ink/75 hover:border-cobalt/40 hover:text-ink")}>
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", on ? "bg-white/15" : "bg-cobalt-soft text-cobalt")}><I size={17} variant="Bulk" /></span>
                  <span className="min-w-0 truncate">{r.name}</span>
                  <span className={cn("mr-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums", on ? "bg-white/20 text-white" : "bg-muted text-ink/60")}>{faNumber(counts[r.id])}</span>
                </Button>
              ); })}
          </div>
        )}
      </BarItem>
      <span className="h-7 w-px shrink-0 bg-border" />
      <BarItem icon={<Category2 size={20} variant="Bulk" />} label={useGroups ? "حوزه و نوع" : "نوع"} value={groupText} active={useGroups ? criteria.groups.length > 0 : subValue.length > 0} width="w-[46rem]">
        <TypePicker compact />
      </BarItem>
      <span className="h-7 w-px shrink-0 bg-border" />
      <BarItem icon={<Location size={20} variant="Bulk" />} label="محدوده" value={route.id === "fund" ? "همه ایران" : criteria.provinces.length ? criteria.provinces.join("، ") + ((criteria.filters.cities as string[] | undefined)?.length ? `، ${faNumber(new Set(criteria.filters.cities as string[]).size)} شهر` : "") : "همه ایران"} active={route.id !== "fund" && criteria.provinces.length > 0} width={route.id === "fund" ? "w-[22rem]" : "w-[28rem]"}>
        {route.id === "fund" ? note("صندوق‌ها و طرح‌های جمعی به استان خاصی وابسته نیستند، از هر جای ایران می‌توانید وارد شوید.") : <LocationFields route={route.id} value={criteria.provinces} onChange={(v) => setCriteria({ provinces: v })} />}
      </BarItem>
      <span className="h-7 w-px shrink-0 bg-border" />
      <BarItem icon={<WalletMoney size={20} variant="Bulk" />} label="بودجه" value={!route.amount ? "پرسیده نمی‌شود" : criteria.amount ? `${faNumber(criteria.amount[0])} تا ${faNumber(criteria.amount[1])} ${route.amount.unit}` : "هر مبلغی"} active={!!route.amount && criteria.amount != null} width={route.amount ? "w-[34rem]" : "w-[22rem]"}>
        {route.amount ? <Budget /> : note("در مسیر بهره‌برداری، شما سرمایه نمی‌آورید و پروژه‌ها با توان اجرایی و تجربه‌تان سنجیده می‌شوند.")}
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
/** ترتیب نمایش: فقط آیکون، با کلیک یا هاور باز می‌شود، ترتیب انتخاب‌شده تیک می‌خورد */
function SortMenu({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const h = useHoverOpen();
  const label = sortOptions.find((o) => o.value === value)?.label;
  return (
    <DropdownMenu dir="rtl" modal={false} open={h.open} onOpenChange={h.onOpenChange}>
      <DropdownMenuTrigger asChild {...h.hover}>
        <Button variant="plain" size="auto" aria-label={`ترتیب نمایش: ${label}`} title={`ترتیب نمایش: ${label}`} className="surface relative grid size-14 shrink-0 place-items-center rounded-full data-[state=open]:bg-muted">
          <Sort size={22} variant="Bulk" className={value !== "relevance" ? "text-cobalt" : "text-ink/45"} />
          {value !== "relevance" && <span className="absolute left-1 top-1 size-2.5 rounded-full bg-cobalt ring-2 ring-white" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60 rounded-2xl p-1.5" {...h.hover}>
        <p className="px-2 pb-1 pt-1.5 text-[13px] font-extrabold text-ink">ترتیب نمایش</p>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {sortOptions.map((o) => <DropdownMenuRadioItem key={o.value} value={o.value} className="rounded-xl py-2.5 text-[13.5px] font-bold data-[state=checked]:bg-cobalt-soft data-[state=checked]:text-cobalt-deep">{o.label}</DropdownMenuRadioItem>)}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** صفحه‌بندی نتایج: قبلی، شماره صفحه‌ها (با … برای صفحه‌های دور) و بعدی */
function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums: (number | "…")[] = pages <= 7 ? Array.from({ length: pages }, (_, i) => i + 1)
    : [1, ...(page > 3 ? ["…" as const] : []), ...[page - 1, page, page + 1].filter((n) => n > 1 && n < pages), ...(page < pages - 2 ? ["…" as const] : []), pages];
  const btn = "h-11 min-w-11 rounded-full px-3 text-[14px] font-extrabold tabular-nums";
  return (
    <nav aria-label="صفحه‌های نتایج" className="mt-10 flex items-center justify-center gap-1.5">
      <Button type="button" variant="plain" size="auto" disabled={page === 1} onClick={() => onPage(page - 1)} className={cn(btn, "gap-1.5 border border-border bg-white px-4 text-ink hover:border-ink/25 disabled:opacity-40")}><ArrowRight size={16} />قبلی</Button>
      {nums.map((n, i) => n === "…" ? <span key={`e${i}`} className="px-1 text-ink/40">…</span> : (
        <Button key={n} type="button" variant="plain" size="auto" aria-current={n === page ? "page" : undefined} onClick={() => onPage(n)}
          className={cn(btn, n === page ? "bg-cobalt text-white shadow-[0_8px_18px_-10px_var(--cobalt)]" : "border border-border bg-white text-ink/75 hover:border-cobalt/40 hover:text-ink")}>{faNumber(n)}</Button>
      ))}
      <Button type="button" variant="plain" size="auto" disabled={page === pages} onClick={() => onPage(page + 1)} className={cn(btn, "gap-1.5 border border-border bg-white px-4 text-ink hover:border-ink/25 disabled:opacity-40")}>بعدی<ArrowLeft size={16} /></Button>
    </nav>
  );
}

/** دکمه برگشت به بالا، وقتی کاربر زیاد پایین رفته */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => { const on = () => setShow(window.scrollY > 900); on(); window.addEventListener("scroll", on, { passive: true }); return () => window.removeEventListener("scroll", on); }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button type="button" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="برگشت به بالا" title="برگشت به بالا" className="fixed bottom-6 left-6 z-40 grid size-12 place-items-center rounded-full bg-cobalt text-white shadow-[0_14px_30px_-12px_var(--cobalt)] transition-colors hover:bg-cobalt-deep">
          <ArrowUp2 size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function Results() {
  const hydrated = useHydrated();
  const { criteria, profiles, pinned, setPinned, setCompare, started, setStarted } = useStore();
  const router = useRouter();
  // صفحه پرسش‌های اولیه حذف شده، رسیدن به همین صفحه یعنی جست‌وجو شروع شده (برای مقایسه و علاقه‌مندی‌ها)
  useEffect(() => { if (hydrated && !started) setStarted(true); }, [hydrated, started, setStarted]);
  const pinnedList = useMemo(() => (pinned ? pinned.ids.map((id) => listingById(id)).filter((x): x is NonNullable<typeof x> => !!x) : []), [pinned]);
  const deferred = useDeferredValue(criteria);
  const [sort, setSort] = useState("relevance");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const listTop = useRef<HTMLDivElement>(null);
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

  // صفحه‌بندی به‌جای بارگذاری خودکار: با تغییر فیلترها به صفحه اول برمی‌گردد
  useEffect(() => setPage(1), [deferred, q, sort]);
  const pages = Math.max(1, Math.ceil(feed.length / PAGE));
  const cur = Math.min(page, pages);
  const goPage = (p: number) => { setPage(p); listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <>
      <Header />
      <main className="focus-blur relative mx-auto min-h-[70dvh] max-w-[90rem] px-6 pt-8">
        {!hydrated ? null : (
          <>
            {/* نوار بالا: چهار فیلتر اصلی و دو آیکون ترتیب نمایش و فیلترهای ذخیره‌شده، همه ۵۶ پیکسل */}
            <div className="relative z-30 flex items-center gap-3">
              <div className="min-w-0 flex-1"><FilterBar counts={tabCounts} /></div>
              <SortMenu value={sort} onChange={setSort} />
              <SavedCriteriaMenu onSave={() => setSaveOpen(true)} saved={isSaved} />
            </div>

            <div className="mt-7 grid grid-cols-[21rem_1fr] gap-7">
              <aside>
                {/* نوار اسکرول سمت راست ستون (جهت چپ‌به‌راست فقط برای جای اسکرول‌بار، محتوا راست‌به‌چپ) */}
                <Card className="surface thin-scroll sticky top-24 block max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-[1.75rem] p-5 shadow-none [direction:ltr]">
                  <div dir="rtl" className="[direction:rtl]">
                    <AdvancedFilter quick={<QuickFilters />} profileCard={<ProProfileCard />} onSave={hasCriteria ? () => setSaveOpen(true) : undefined} saved={isSaved} />
                  </div>
                </Card>
              </aside>

              <section ref={listTop} className="min-w-0 scroll-mt-28">
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
                    <div className="grid grid-cols-3 gap-4 2xl:grid-cols-4">
                      {pinnedList.map((x, i) => <ListingCard key={x.id} listing={x} index={i} comparable />)}
                    </div>
                  </section>
                )}

                {route.id === "charity" && all.length === 0 ? (
                  // مسیر خیریه در نسخه مرجع پروژه نمونه ندارد و جای آن، فرم همراهی و دورنمای اثر است
                  <Card className="surface block rounded-[2rem] p-7 shadow-none"><LegacyTool opener={toolById("charity")!.opener} root={toolById("charity")!.root} /></Card>
                ) : feed.length === 0 ? (
                  <Card className="surface grid place-items-center gap-0 rounded-[2rem] px-6 py-20 text-center shadow-none">
                    <span className="grid size-16 place-items-center rounded-full bg-ink/[0.06] text-primary-ink"><SearchNormal1 size={28} variant="Bulk" /></span>
                    <h2 className="mt-5 text-xl font-extrabold text-ink">{all.length === 0 ? "در این مسیر هنوز پروژه‌ای نیست." : "با این فیلترها پروژه‌ای پیدا نشد."}</h2>
                    <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">{all.length === 0 ? "این جست‌وجو را ذخیره کنید تا پروژه‌های تازه را دفعه بعد همین‌جا ببینید." : "یکی دو فیلتر را بردارید تا نتایج بیشتری ببینید."}</p>
                    {all.length === 0 && <Button onClick={() => setSaveOpen(true)} className="mt-6 h-12 gap-2 rounded-full px-6 font-bold"><Save2 size={18} />ذخیره جست‌وجو</Button>}
                  </Card>
                ) : (
                  <div className={cn("grid grid-cols-3 gap-5 transition-opacity", deferred !== criteria && "opacity-60")}>
                    {feed.slice((cur - 1) * PAGE, cur * PAGE).map((r, i) => (
                      <Fragment key={r.listing.id}>
                        <ListingCard listing={r.listing} score={hasCriteria ? r.score : undefined} index={i} comparable />
                      </Fragment>))}
                  </div>
                )}
                <Pager page={cur} pages={pages} onPage={goPage} />
                {pages > 1 && <p className="mt-3 text-center text-[12.5px] font-semibold text-muted-foreground">صفحه {faNumber(cur)} از {faNumber(pages)}، {faNumber(feed.length)} پروژه</p>}
                {related.length > 0 && (
                  <div className="mt-12 flex flex-wrap items-center gap-2.5 border-t border-border pt-6">
                    <span className="ml-1 text-[13px] font-extrabold text-ink">خدمات مرتبط با این مسیر</span>
                    {related.map((t) => <Button key={t.id} asChild variant="outline" className="h-10 rounded-full bg-white px-4 text-[13px] font-bold shadow-none hover:border-ink/25 hover:text-ink"><Link href={`/tools/${t.id}`}>{t.name}</Link></Button>)}
                  </div>
                )}
              </section>
            </div>
            <CompareTray />
            <BackToTop />
          </>
        )}
        <SaveCriteriaDialog open={saveOpen} onOpenChange={setSaveOpen} />
      </main>
      <Footer />
    </>
  );
}
