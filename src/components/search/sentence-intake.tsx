"use client";
// ورود «در یک جمله»: همان اطلاعات پایه (مسیر، حوزه، محل، بودجه و افق بازگشت) به‌جای چهار گام، در یک جمله فارسی.
// هر جای خالی یک انتخاب‌گر کوچک است، مستقیم روی شرایط جست‌وجو می‌نشیند و شمار نتیجه‌ها همان لحظه عوض می‌شود.
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TickCircle } from "@/components/iconsax";
import { MatchRing } from "@/components/brand/reveal";
import { provinces } from "@/data/provinces";
import { convertAmount, routes } from "@/data/routes";
import { projectGroups } from "@/data/taxonomy";
import { forRoute, rank } from "@/lib/match";
import { listings } from "@/lib/listings";
import { useStore } from "@/lib/store";
import { hasAnyCriteria } from "@/lib/criteria";
import type { RouteId } from "@/types";
import { cn, faNumber } from "@/lib/utils";

/** فعل هر مسیر، تا جمله طبیعی خوانده شود */
const verbs: Record<RouteId, string> = {
  investor: "در ساخت و توسعه پروژه شریک شوم",
  fund: "در یک صندوق یا طرح جمعی سهم بخرم",
  contractor: "اجرای پروژه را پیمانکاری کنم",
  buyer: "زمین، ملک یا دارایی بخرم",
  lessee: "ملکی برای کارم اجاره کنم",
  heritage: "یک بنای تاریخی را مرمت و احیا کنم",
  charity: "در یک طرح اجتماعی یا خیریه سهیم شوم",
  operator: "بهره‌برداری و نگهداری یک دارایی را به عهده بگیرم",
};
const amountVerb: Partial<Record<RouteId, string>> = { lessee: "با ودیعه‌ای تا", buyer: "با بودجه‌ای تا", contractor: "با نقدینگی تا", charity: "با همراهی تا" };
const NICE = [0.5, 1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 2000, 3000, 5000, 10000, 20000, 50000, 100000];
const horizons: { v: number | null; label: string }[] = [
  { v: 3, label: "۳ سال" }, { v: 5, label: "۵ سال" }, { v: 7, label: "۷ سال" }, { v: 10, label: "۱۰ سال" }, { v: null, label: "هر قدر که لازم باشد" },
];
const list = (xs: string[], rest: string) => (xs.length <= 2 ? xs.join(" یا ") : `${xs.slice(0, 2).join("، ")} و ${faNumber(xs.length - 2)} ${rest} دیگر`);

function Slot({ label, children, className, wide }: { label: React.ReactNode; children: (close: () => void) => React.ReactNode; className?: string; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="plain" size="auto"
          className="ms-1.5 inline h-auto whitespace-normal rounded-xl border-b-[2.5px] border-dashed border-cobalt/45 bg-cobalt-soft/60 px-2.5 pb-0.5 align-baseline text-[0.82em] font-black leading-[1.75] text-cobalt-deep transition-colors hover:border-cobalt hover:bg-cobalt-soft data-[state=open]:border-solid data-[state=open]:border-cobalt data-[state=open]:bg-white">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" sideOffset={10} className={cn("rounded-2xl p-3", wide ? "w-[22rem]" : "w-80", className)}>{children(() => setOpen(false))}</PopoverContent>
    </Popover>
  );
}

function Option({ on, children, onClick, meta }: { on: boolean; children: React.ReactNode; onClick: () => void; meta?: string }) {
  return (
    <Button type="button" variant="plain" size="auto" onClick={onClick}
      className={cn("flex h-auto min-h-11 w-full items-center justify-between gap-3 whitespace-normal rounded-xl px-3 py-2 text-right text-[14px] font-bold", on ? "bg-cobalt text-white" : "text-ink hover:bg-muted")}>
      <span>{children}</span>
      <span className="flex shrink-0 items-center gap-2">{meta && <span className={cn("text-[12px] font-semibold", on ? "text-white/75" : "text-muted-foreground")}>{meta}</span>}{on && <TickCircle size={18} variant="Bold" />}</span>
    </Button>
  );
}

export function SentenceIntake({ count, onGo }: { count: number; onGo: () => void }) {
  const { criteria, setCriteria, setFilter } = useStore();
  const route = routes.find((r) => r.id === criteria.route)!;
  const a = route.amount;
  const stops = useMemo(() => (a ? NICE.filter((x) => x >= Math.max(a.min, a.step) && x <= a.max) : []), [a]);
  const value = criteria.amount?.[1] ?? null;
  const horizon = typeof criteria.filters.horizon === "number" ? (criteria.filters.horizon as number) : null;
  const wait = route.id === "investor" || route.id === "heritage";
  const groupCounts = useMemo(() => { const c: Record<string, number> = {}; for (const l of forRoute(listings, route.id)) if (l.group) c[l.group] = (c[l.group] ?? 0) + 1; return c; }, [route.id]);
  const top = useMemo(() => rank(listings, criteria).filter((r) => r.score >= 50).slice(0, 3), [criteria]);
  const scored = hasAnyCriteria(criteria);

  const setRoute = (id: RouteId) => { if (id !== criteria.route) setCriteria({ route: id, groups: [], amount: convertAmount(criteria.amount, criteria.route, id), filters: {} }); };
  const setAmount = (v: number | null) => setCriteria({ amount: v == null || !a ? null : [a.min, v] });
  const groupsLabel = criteria.groups.length ? list(criteria.groups.map((g) => projectGroups.find((x) => x.id === g)?.name ?? g), "حوزه") : "هر حوزه‌ای";
  const where = criteria.provinces.length ? list(criteria.provinces, "استان") : "هر جای ایران";

  return (
    <div className="rounded-[2rem] border border-border bg-[linear-gradient(180deg,#fff,#f7f9fc)] p-10 shadow-[0_24px_60px_-44px_rgb(22_32_48/0.35)]">
      <p className="text-[1.9rem] font-bold leading-[2.4] text-ink/80 text-balance">
        می‌خواهم
        <Slot label={verbs[route.id]} wide>
          {(close) => <div className="space-y-1">{routes.map((r) => <Option key={r.id} on={r.id === route.id} meta={`${faNumber(forRoute(listings, r.id).length)} مورد`} onClick={() => { setRoute(r.id); close(); }}>{verbs[r.id]}</Option>)}</div>}
        </Slot>
        {route.usesProjectGroups && <>، در
          <Slot label={groupsLabel} wide>
            {() => (
              <div className="thin-scroll max-h-80 space-y-1 overflow-y-auto">
                <Option on={criteria.groups.length === 0} onClick={() => { setCriteria({ groups: [] }); setFilter("subtypes", undefined); }}>هر حوزه‌ای</Option>
                {projectGroups.filter((g) => groupCounts[g.id]).map((g) => { const on = criteria.groups.includes(g.id); return (
                  <Option key={g.id} on={on} meta={`${faNumber(groupCounts[g.id])} پروژه`} onClick={() => { setCriteria({ groups: on ? criteria.groups.filter((x) => x !== g.id) : [...criteria.groups, g.id] }); setFilter("subtypes", undefined); }}>{g.name}</Option>); })}
              </div>
            )}
          </Slot>
        </>}
        {route.id !== "fund" && <>، در
          <span className="whitespace-nowrap"><Slot label={where} className="w-72 p-0">
            {() => (
              <Command dir="rtl" className="rounded-2xl">
                <CommandInput placeholder="جست‌وجوی استان" />
                <CommandList className="max-h-72">
                  <CommandEmpty>استانی پیدا نشد.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem onSelect={() => setCriteria({ provinces: [] })} className="justify-between rounded-xl font-bold">هر جای ایران{criteria.provinces.length === 0 && <TickCircle size={17} variant="Bold" className="text-cobalt" />}</CommandItem>
                    {provinces.map((p) => { const on = criteria.provinces.includes(p); return (
                      <CommandItem key={p} value={p} onSelect={() => setCriteria({ provinces: on ? criteria.provinces.filter((x) => x !== p) : [...criteria.provinces, p] })} className="justify-between rounded-xl font-semibold">
                        {p}{on && <TickCircle size={17} variant="Bold" className="text-cobalt" />}
                      </CommandItem>); })}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </Slot></span>
        </>}
        {a && <>، {amountVerb[route.id] ?? "با سرمایه‌ای تا"}
          <Slot label={value == null ? "هر مبلغی" : `${faNumber(value)} ${a.unit}`}>
            {() => {
              const i = value == null ? stops.length - 1 : Math.max(0, stops.findIndex((x) => x >= value));
              return (
                <div className="space-y-4 p-1">
                  <p className="text-[13px] font-bold text-muted-foreground">{a.label}</p>
                  <p className="text-2xl font-black text-ink">{value == null ? "هر مبلغی" : faNumber(value)} {value != null && <span className="text-sm font-bold text-muted-foreground">{a.unit}</span>}</p>
                  <Slider dir="rtl" min={0} max={stops.length - 1} step={1} value={[i]} onValueChange={([k]) => setAmount(stops[k])} aria-label={a.label} />
                  <div className="flex flex-wrap gap-1.5">
                    <Button type="button" variant="plain" size="auto" onClick={() => setAmount(null)} className={cn("h-8 rounded-full border px-3 text-[12.5px] font-bold", value == null ? "border-cobalt bg-cobalt text-white" : "border-border text-ink hover:border-ink/30")}>هر مبلغی</Button>
                    {stops.filter((_, k) => k % Math.ceil(stops.length / 5) === 2).map((x) => (
                      <Button key={x} type="button" variant="plain" size="auto" onClick={() => setAmount(x)} className={cn("h-8 rounded-full border px-3 text-[12.5px] font-bold", value === x ? "border-cobalt bg-cobalt text-white" : "border-border text-ink hover:border-ink/30")}>{faNumber(x)}</Button>
                    ))}
                  </div>
                </div>
              );
            }}
          </Slot>
        </>}
        {wait ? <>، و برای برگشت پولم تا
          <Slot label={horizons.find((h) => h.v === horizon)?.label ?? `${faNumber(horizon!)} سال`}>
            {(close) => <div className="space-y-1">{horizons.map((h) => <Option key={String(h.v)} on={h.v === horizon} onClick={() => { setFilter("horizon", h.v ?? undefined); close(); }}>{h.label}</Option>)}</div>}
          </Slot>
          {" "}صبر می‌کنم.</> : "."}
      </p>

      <div className="mt-8 grid grid-cols-[16rem_1fr] items-start gap-8 border-t border-dashed border-border pt-8">
        <div>
          <div className="relative h-[4.5rem] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p key={count} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-[3.6rem] font-black leading-none text-ink tabular-nums">{faNumber(count)}</motion.p>
            </AnimatePresence>
          </div>
          <p className="mt-1 text-[14px] font-bold leading-7 text-muted-foreground">مورد با این جمله جور است</p>
          <Button type="button" onClick={onGo} className="group mt-5 h-13 gap-2 rounded-full px-7 text-base font-extrabold shadow-[0_18px_40px_-20px_var(--primary)]">دیدن همه<ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /></Button>
          <p className="mt-3 text-[12px] font-semibold leading-6 text-muted-foreground">جزئیات بیشتر مثل نوع دقیق پروژه، کنار نتیجه‌ها تنظیم می‌شود.</p>
        </div>
        <div className="space-y-2.5">
          {top.map((r) => (
            <Link key={r.listing.id} href={`/opportunities/${r.listing.id}`} target="_blank"
              className="group flex items-center gap-3.5 rounded-2xl border border-border bg-white p-2.5 pl-3.5 transition-[border-color,box-shadow] hover:border-ink/20 hover:shadow-[0_14px_30px_-24px_rgb(22_32_48/0.5)]">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted"><Image src={r.listing.image} alt="" fill sizes="64px" className="object-cover transition-transform duration-500 group-hover:scale-105" /></span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 text-[14.5px] font-extrabold text-ink">{r.listing.title}</span>
                <span className="mt-1 block truncate text-[12.5px] font-semibold text-muted-foreground">{r.listing.province ? `${r.listing.province}، ${r.listing.city}` : r.listing.tags.join(" · ")}{r.listing.amount != null && ` · ${faNumber(r.listing.amount)} ${r.listing.amountUnit}`}</span>
              </span>
              {scored && <MatchRing score={r.score} size={46} />}
            </Link>
          ))}
          {top.length === 0 && <p className="rounded-2xl border border-dashed border-border p-6 text-[14px] font-semibold leading-7 text-muted-foreground">با این جمله موردی پیدا نشد. مبلغ را بیشتر کنید یا «هر جای ایران» را انتخاب کنید.</p>}
        </div>
      </div>
    </div>
  );
}
