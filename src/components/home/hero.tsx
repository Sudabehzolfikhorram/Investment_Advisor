"use client";
// هیرو: فرم پایه به شکل یک جمله. جاهای خالی جمله همان چهار فیلد پایه‌اند
// و نقشه نقطه‌ای ایران کنار آن با انتخاب‌ها زنده تغییر می‌کند.
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowDown2, ArrowLeft, MagicStar, Setting4, TickCircle } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/site/header";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { IranMap } from "@/components/brand/iran-map";
import { MatchRing } from "@/components/brand/reveal";
import { Chip, ComboList, RangeField } from "@/components/search/controls";
import { amountPresets } from "@/components/search/search-bar";
import { groupIcons, routeIcons } from "@/components/icons";
import { routes, routeSubcategories } from "@/data/routes";
import { projectGroups } from "@/data/taxonomy";
import { provinces } from "@/data/provinces";
import { cityCoords } from "@/data/opportunities";
import { project } from "@/data/iran-map";
import { listings } from "@/lib/listings";
import { rank } from "@/lib/match";
import { samplePrompts } from "@/lib/assistant";
import { useHydrated, useStore } from "@/lib/store";
import { cn, faNumber } from "@/lib/utils";

export function cityPoints() {
  const m = new Map<string, { city: string; province: string; count: number }>();
  for (const l of listings) if (l.city && l.province) { const k = l.city; m.set(k, { city: k, province: l.province, count: (m.get(k)?.count ?? 0) + 1 }); }
  return [...m.values()];
}

const ease = [0.22, 1, 0.36, 1] as const;
const subKey: Record<string, string> = { fund: "fundType", buyer: "saleCategory", charity: "charityType" };

/** جای خالی جمله: یک Popover که مقدارش داخل متن می‌نشیند */
function Blank({ value, filled, wide, children }: { value: string; filled: boolean; wide?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="plain" size="auto" className={cn(
          "group mx-1.5 inline-flex h-auto max-w-full items-center gap-1.5 whitespace-normal rounded-2xl border-b-2 px-3 py-0.5 align-baseline text-[0.82em] font-black leading-[1.5] transition-all duration-300 hover:-translate-y-0.5",
          filled ? "border-primary bg-white text-primary shadow-[0_18px_40px_-22px_rgb(8_63_59/0.55)]" : "border-dashed border-primary/45 bg-white/40 text-primary/80 hover:bg-white/80", open && "ring-4 ring-primary/15")}>
          <span className="line-clamp-1 text-right">{value}</span>
          <ArrowDown2 size={18} className={cn("shrink-0 transition-transform", open && "rotate-180")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={12} className={cn("rounded-3xl border-white/70 bg-white/95 p-4 shadow-2xl backdrop-blur-2xl", wide ? "w-[min(92vw,30rem)]" : "w-[min(92vw,22rem)]")}>{children}</PopoverContent>
    </Popover>
  );
}

function Sentence() {
  const { criteria, setCriteria, setFilter } = useStore();
  const route = routes.find((r) => r.id === criteria.route)!;
  const subs = routeSubcategories[route.id];
  const sKey = subKey[route.id];
  const subValue = (criteria.filters[sKey] as string[]) ?? [];
  const groupText = route.usesProjectGroups
    ? criteria.groups.length ? criteria.groups.map((g) => projectGroups.find((x) => x.id === g)?.name).join(" و ") : "همه گروه‌ها"
    : subs ? (subValue.length ? subValue.map((s) => subs.find((x) => x.id === s)?.name).join(" و ") : "همه دسته‌ها") : "";
  return (
    <h1 className="text-[1.75rem] font-black leading-[2.1] tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.95] xl:text-[3.1rem]">
      دنبال پروژه‌ای در مسیر
      <Blank value={route.name} filled wide>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {routes.map((r) => { const I = routeIcons[r.id]; const on = r.id === criteria.route;
            return (
              <Button key={r.id} variant="plain" size="auto" onClick={() => setCriteria({ route: r.id, groups: [], amount: null, filters: {} })}
                className={cn("h-auto justify-start gap-3 whitespace-normal rounded-2xl border p-3 text-right", on ? "border-primary bg-primary/[0.07]" : "border-transparent hover:bg-muted")}>
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", on ? "bg-primary text-white" : "bg-primary/10 text-primary")}><I size={18} variant="Bulk" /></span>
                <span className="text-[13px] font-bold leading-5 text-ink">{r.name}</span>
                {on && <TickCircle size={18} variant="Bold" className="mr-auto shrink-0 text-primary" />}
              </Button>
            ); })}
        </div>
      </Blank>
      هستم
      {(route.usesProjectGroups || subs) && <>
        ؛ از
        <Blank value={groupText} filled={route.usesProjectGroups ? criteria.groups.length > 0 : subValue.length > 0} wide>
          <p className="mb-3 text-xs text-muted-foreground">چند مورد را می‌توانید با هم انتخاب کنید.</p>
          <div className="flex flex-wrap gap-2">
            {route.usesProjectGroups
              ? projectGroups.map((g) => { const I = groupIcons[g.id]; const on = criteria.groups.includes(g.id);
                  return <Chip key={g.id} active={on} onClick={() => setCriteria({ groups: on ? criteria.groups.filter((x) => x !== g.id) : [...criteria.groups, g.id] })}><I size={15} variant="Bulk" />{g.name}</Chip>; })
              : subs!.map((s) => { const on = subValue.includes(s.id);
                  return <Chip key={s.id} active={on} onClick={() => setFilter(sKey, on ? subValue.filter((x) => x !== s.id) : [...subValue, s.id])}>{s.name}</Chip>; })}
          </div>
        </Blank>
      </>}
      {route.id !== "fund" && <>
        ، در
        <Blank value={criteria.provinces.length ? criteria.provinces.join(" و ") : "همه ایران"} filled={criteria.provinces.length > 0}>
          <ComboList options={provinces.map((p) => ({ value: p, label: p }))} value={criteria.provinces} onChange={(v) => setCriteria({ provinces: v })} placeholder="جست‌وجوی استان…" empty="استانی پیدا نشد" />
        </Blank>
      </>}
      {route.amount && <>
        ، با
        <Blank value={criteria.amount ? `${faNumber(criteria.amount[0])} تا ${faNumber(criteria.amount[1])} ${route.amount.unit}` : "هر مبلغی"} filled={criteria.amount != null}>
          <p className="mb-3 text-[13px] font-bold text-ink/80">{route.amount.label}</p>
          <RangeField min={route.amount.min} max={route.amount.max} step={route.amount.step} unit={route.amount.unit} value={criteria.amount ?? undefined} onChange={(v) => setCriteria({ amount: v })} presets={amountPresets(route.amount.min, route.amount.max)} />
        </Blank>
      </>}
      .
    </h1>
  );
}

/** کارت شناور پروژه که با خط به نود شهر خودش وصل است */
const floats = [
  { id: "DEMO-10", ax: 52, ay: 52, score: 92, depth: 18 },
  { id: "DEMO-02", ax: 312, ay: 128, score: 85, depth: -14 },
  { id: "DEMO-01", ax: 70, ay: 268, score: 78, depth: 26 },
];
function FloatCard({ f, mx, my, i }: { f: (typeof floats)[number]; mx: MotionValue<number>; my: MotionValue<number>; i: number }) {
  const l = listings.find((x) => x.id === f.id)!;
  const x = useTransform(mx, (v) => v * f.depth);
  const y = useTransform(my, (v) => v * f.depth);
  return (
    <motion.div style={{ left: `${(f.ax / 360) * 100}%`, top: `${(f.ay / 330) * 100}%`, x, y }} className="absolute z-10 hidden -translate-x-1/2 -translate-y-1/2 sm:block"
      initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 + i * 0.25, duration: 0.7, ease }}>
      <Link href={`/opportunities/${l.id}`} className="glass flex w-56 items-center gap-2.5 rounded-[1.4rem] p-2 pl-3 transition-transform duration-300 hover:scale-105" style={{ animation: `floaty ${5 + i}s ease-in-out ${i * 0.8}s infinite` }}>
        <span className="relative size-12 shrink-0 overflow-hidden rounded-2xl"><Image src={l.image} alt="" fill sizes="48px" className="object-cover saturate-[0.8]" /><span className="absolute inset-0 bg-primary/40 mix-blend-soft-light" /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-extrabold text-ink">{l.title}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{l.city} · {l.stats[0].value}</span>
        </span>
        <MatchRing score={f.score} size={40} />
      </Link>
    </motion.div>
  );
}

function MapScene() {
  const { criteria, setCriteria } = useStore();
  const points = useMemo(cityPoints, []);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const mx = useSpring(rx, { stiffness: 60, damping: 14 }), my = useSpring(ry, { stiffness: 60, damping: 14 });
  const mapX = useTransform(mx, (v) => v * -10), mapY = useTransform(my, (v) => v * -10);
  const toggle = (p: string) => setCriteria({ provinces: criteria.provinces.includes(p) ? criteria.provinces.filter((x) => x !== p) : [...criteria.provinces, p] });
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.2, ease }}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); rx.set((e.clientX - r.left) / r.width - 0.5); ry.set((e.clientY - r.top) / r.height - 0.5); }}
      onMouseLeave={() => { rx.set(0); ry.set(0); }} className="relative mx-auto w-full max-w-[640px]">
      <div className="absolute inset-[8%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(15_118_110/0.2),transparent)] blur-2xl" />
      <motion.div style={{ x: mapX, y: mapY }}>
        <IranMap points={points} active={criteria.provinces} onToggle={toggle} labels={false} />
        <svg viewBox="0 0 360 330" aria-hidden className="pointer-events-none absolute inset-0 hidden size-full overflow-visible sm:block" fill="none">
          {floats.map((f, i) => { const l = listings.find((x) => x.id === f.id)!; const c = cityCoords[l.city!]; if (!c) return null; const p = project(c[0], c[1]);
            return <g key={f.id}><motion.path d={`M${p.x} ${p.y}L${f.ax} ${f.ay}`} className="stroke-sand" strokeWidth="1" strokeDasharray="3 4" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.9 + i * 0.25, duration: 0.8 }} /><circle cx={p.x} cy={p.y} r="6" className="stroke-sand" strokeWidth="1" /></g>; })}
        </svg>
      </motion.div>
      {floats.map((f, i) => <FloatCard key={f.id} f={f} mx={mx} my={my} i={i} />)}
      <p className="mt-2 text-center text-xs font-semibold text-muted-foreground">روی نودهای نقشه بزنید تا استان انتخاب شود.</p>
    </motion.div>
  );
}

export function Hero() {
  const router = useRouter();
  const hydrated = useHydrated();
  const criteria = useStore((s) => s.criteria);
  const [prompt, setPrompt] = useState("");
  const count = useMemo(() => {
    const has = criteria.groups.length > 0 || criteria.provinces.length > 0 || criteria.amount != null || Object.keys(criteria.filters).length > 0;
    return rank(listings, criteria).filter((r) => !has || r.score >= 50).length;
  }, [criteria]);
  const go = (q: string) => router.push(`/assistant?q=${encodeURIComponent(q)}`);

  return (
    <section className="relative isolate overflow-hidden pb-6">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_85%_10%,rgb(15_118_110/0.16),transparent),radial-gradient(40%_50%_at_10%_80%,rgb(201_168_106/0.2),transparent),linear-gradient(to_bottom,#e9f2f0,var(--background))]" />
      <AlgoPattern className="-top-16 right-0 -z-10 h-[26rem] w-[38rem] text-primary/[0.1]" fade="radial" />
      <AlgoPattern className="bottom-0 left-[30%] -z-10 h-64 w-96 text-sand/30" fade="radial" scale={0.6} />
      <Header />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-10 pt-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          <Tabs dir="rtl" defaultValue="form" className="gap-7">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="glass gap-2.5 px-4 py-2 text-[13px] font-bold text-ink"><span><NodeMark className="text-primary" /></span>مشاور هوشمند فرصت‌های سرمایه‌گذاری</Badge>
              <TabsList className="h-auto rounded-full bg-ink/[0.06] p-1 group-data-[orientation=horizontal]/tabs:h-auto">
                {([["form", "شرایط من", Setting4], ["assistant", "از دستیار بپرس", MagicStar]] as const).map(([k, label, I]) => (
                  <TabsTrigger key={k} value={k} className="h-auto gap-1.5 rounded-full border-0 px-4 py-2 text-sm font-bold text-ink/65 data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-none"><I size={16} variant="Bulk" />{label}</TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="form" className="space-y-8">
              <Sentence />
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild variant="plain" size="auto" className="group h-16 gap-3 rounded-full bg-primary pl-2.5 pr-7 text-lg font-extrabold text-white shadow-[0_22px_44px_-18px_var(--primary)] hover:bg-deep">
                  <Link href="/opportunities">نمایش {hydrated ? faNumber(count) : "…"} پروژه
                    <span className="grid size-11 place-items-center rounded-full bg-white/15 transition-transform group-hover:-translate-x-1"><ArrowLeft size={20} /></span></Link>
                </Button>
                <p className="max-w-56 text-[13px] leading-6 text-muted-foreground">بقیه شرایط را کنار نتایج، در فیلتر پیشرفته دقیق‌تر می‌کنید.</p>
              </div>
            </TabsContent>

            <TabsContent value="assistant" className="space-y-6">
              <h1 className="text-[2rem] font-black leading-[1.5] tracking-tight text-ink text-balance sm:text-5xl sm:leading-[1.4]">شرایطتان را بنویسید؛ دستیار <span className="text-primary">تا ۱۰ پروژه</span> با درصد تطابق پیشنهاد می‌دهد.</h1>
              <form onSubmit={(e) => { e.preventDefault(); if (prompt.trim()) go(prompt); }} className="glass-strong rounded-[2rem] p-2.5">
                <div className="flex items-center gap-2">
                  <span className="hidden size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary sm:grid"><MagicStar size={24} variant="Bulk" /></span>
                  <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="مثلاً: ۳۰ میلیارد دارم، پروژه مسکونی در تهران…" aria-label="توضیح شرایط برای دستیار" className="h-14 min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] font-semibold text-ink shadow-none focus-visible:ring-0 placeholder:font-normal md:text-[15px]" />
                  <Button type="submit" variant="plain" size="auto" className="group h-14 gap-2 rounded-full bg-primary px-6 font-extrabold text-white hover:bg-deep">پیشنهاد بده <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" /></Button>
                </div>
              </form>
              <div className="flex flex-col items-start gap-2">
                {samplePrompts.map((p) => <Button key={p} variant="plain" size="auto" onClick={() => go(p)} className="h-auto max-w-full justify-start whitespace-normal rounded-2xl border border-border bg-white/60 px-4 py-2 text-right text-xs font-semibold leading-6 text-ink/70 hover:border-primary/40 hover:text-primary">{p}</Button>)}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        <MapScene />
      </div>
    </section>
  );
}
