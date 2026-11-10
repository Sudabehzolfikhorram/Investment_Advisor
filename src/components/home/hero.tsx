"use client";
// هیرو: پیش‌فرض «از دستیار بپرس». حالت دوم یک جمله است که فقط دسته‌بندی اصلی در آن انتخاب می‌شود.
// نقشه نقطه‌ای ایران انتخاب‌گر نیست؛ کارت‌های «تازه اضافه شد» روی آن می‌آیند و می‌روند.
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown2, ArrowLeft, Category2, MagicStar, TickCircle } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/site/header";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { IranMap, cityXY } from "@/components/brand/iran-map";
import { routeIcons } from "@/components/icons";
import { routes } from "@/data/routes";
import { listings } from "@/lib/listings";
import { forRoute } from "@/lib/match";
import { samplePrompts } from "@/lib/assistant";
import { useHydrated, useStore } from "@/lib/store";
import { cn, faNumber } from "@/lib/utils";

export function cityPoints() {
  const m = new Map<string, { city: string; province: string; count: number }>();
  for (const l of listings) if (l.city && l.province) { const k = l.city; m.set(k, { city: k, province: l.province, count: (m.get(k)?.count ?? 0) + 1 }); }
  return [...m.values()];
}

const ease = [0.22, 1, 0.36, 1] as const;

/** تنها جای خالی جمله: دسته‌بندی اصلی (تک‌انتخابی) */
function RouteBlank() {
  const route = useStore((s) => s.criteria.route);
  const begin = useStore((s) => s.begin);
  const [open, setOpen] = useState(false);
  const current = routes.find((r) => r.id === route)!;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="plain" size="auto" className={cn("mx-2 inline-flex h-auto max-w-full items-center gap-2 whitespace-normal rounded-2xl border-b-2 border-primary bg-white px-4 py-0.5 align-baseline text-[0.85em] font-black leading-[1.5] text-primary shadow-[0_18px_40px_-24px_rgb(11_31_29/0.35)] transition-all duration-300 hover:-translate-y-0.5", open && "ring-4 ring-primary/10")}>
          <span className="text-right">{current.name}</span>
          <ArrowDown2 size={20} className={cn("shrink-0 transition-transform", open && "rotate-180")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={12} className="w-[30rem] rounded-3xl p-3 shadow-2xl">
        <p className="px-2 pb-2 text-xs font-semibold text-muted-foreground">چطور می‌خواهید وارد شوید؟</p>
        <div className="grid grid-cols-2 gap-1.5">
          {routes.map((r) => { const I = routeIcons[r.id]; const on = r.id === route;
            return (
              <Button key={r.id} variant="plain" size="auto" onClick={() => { begin({ route: r.id }); setOpen(false); }}
                className={cn("h-auto justify-start gap-3 whitespace-normal rounded-2xl border p-3 text-right", on ? "border-primary bg-primary/[0.06]" : "border-transparent hover:bg-muted")}>
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", on ? "bg-primary text-white" : "bg-muted text-ink/70")}><I size={18} variant="Bulk" /></span>
                <span className="text-[13px] font-bold leading-5 text-ink">{r.name}</span>
                {on && <TickCircle size={18} variant="Bold" className="mr-auto shrink-0 text-primary" />}
              </Button>
            ); })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ——— کارت‌های «تازه اضافه شد» روی نقشه ——— */
const LIFE = 9000; // هر کارت کمتر از ۱۰ ثانیه می‌ماند
const EVERY = 3400;
type FeedItem = { key: number; id: string; born: number };

function useFeed() {
  // صف پروژه‌ها طوری چیده می‌شود که کارت‌های پشت‌سرهم از استان‌های متفاوت باشند
  const pool = useMemo(() => {
    const by = new Map<string, typeof listings>();
    for (const l of listings) if (l.city && l.province && cityXY(l.city)) by.set(l.province, [...(by.get(l.province) ?? []), l]);
    const cols = [...by.values()]; const out: typeof listings = [];
    for (let i = 0; cols.some((c) => c[i]); i++) for (const c of cols) if (c[i]) out.push(c[i]);
    return out;
  }, []);
  const [items, setItems] = useState<FeedItem[]>([]);
  const cursor = useRef(0);
  useEffect(() => {
    const tick = () => setItems((prev) => {
      const now = Date.now();
      const alive = prev.filter((x) => now - x.born < LIFE);
      const taken = alive.map((x) => cityXY(pool.find((l) => l.id === x.id)!.city!)!);
      for (let n = 0; n < pool.length; n++) {
        const l = pool[(cursor.current + n) % pool.length]; const p = cityXY(l.city!)!;
        if (taken.every((t) => Math.hypot(t.x - p.x, t.y - p.y) > 95)) { cursor.current = (cursor.current + n + 1) % pool.length; return [...alive, { key: now, id: l.id, born: now }]; }
      }
      return alive;
    });
    const first = setTimeout(tick, 900);
    const t = setInterval(tick, EVERY);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [pool]);
  return items;
}

function MapScene() {
  const points = useMemo(cityPoints, []);
  const feed = useFeed();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.15, ease }} className="relative mx-auto w-full max-w-[620px]">
      <IranMap points={points} labels={false} links={false}>
        {feed.map((f) => { const l = listings.find((x) => x.id === f.id)!; const p = cityXY(l.city!)!;
          return <g key={f.key}><circle cx={p.x} cy={p.y} r="5" className="fill-primary" /><circle cx={p.x} cy={p.y} r="5" className="fill-none stroke-primary" strokeWidth="1" style={{ transformOrigin: `${p.x}px ${p.y}px`, animation: "pulse-node 1.8s ease-out infinite" }} /></g>; })}
      </IranMap>
      <AnimatePresence>
        {feed.map((f) => {
          const l = listings.find((x) => x.id === f.id)!; const p = cityXY(l.city!)!;
          const left = Math.min(74, Math.max(26, (p.x / 360) * 100)); const below = p.y < 95;
          return (
            <motion.div key={f.key} style={{ left: `${left}%`, top: `${(p.y / 330) * 100}%` }} className="absolute z-10"
              initial={{ opacity: 0, y: below ? -8 : 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.35 } }} transition={{ duration: 0.5, ease }}>
              <Link href={`/opportunities/${l.id}`} className={cn("surface absolute right-1/2 flex w-60 translate-x-1/2 items-center gap-2.5 rounded-[1.25rem] p-2 pl-3 transition-shadow hover:shadow-xl", below ? "top-4" : "bottom-4")}>
                <span className="relative size-12 shrink-0 overflow-hidden rounded-xl"><Image src={l.image} alt="" fill sizes="48px" className="object-cover" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-primary"><span className="size-1.5 rounded-full bg-primary" style={{ animation: "node-blink 1.4s ease-in-out infinite" }} />تازه اضافه شد در {l.city}</span>
                  <span className="mt-0.5 block truncate text-[13px] font-extrabold text-ink">{l.title}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{l.stats[0].label}: {l.stats[0].value}</span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <p className="mt-1 text-center text-xs font-semibold text-muted-foreground">تازه‌ترین پروژه‌ها از سراسر ایران</p>
    </motion.div>
  );
}

export function Hero() {
  const router = useRouter();
  const hydrated = useHydrated();
  const route = useStore((s) => s.criteria.route);
  const begin = useStore((s) => s.begin);
  const [prompt, setPrompt] = useState("");
  const count = useMemo(() => forRoute(listings, route).length, [route]);
  const go = (q: string) => router.push(`/assistant?q=${encodeURIComponent(q)}`);

  return (
    <section className="relative isolate overflow-hidden pb-6">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(45%_55%_at_88%_0%,rgb(15_118_110/0.07),transparent),linear-gradient(to_bottom,#ffffff,var(--background))]" />
      <AlgoPattern animated className="-top-10 right-0 -z-10 h-[30rem] w-[44rem] text-ink/[0.07]" fade="radial" />
      <Header />

      <div className="mx-auto grid max-w-7xl grid-cols-[1.1fr_1fr] items-center gap-10 px-8 pb-10 pt-16">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          <Tabs dir="rtl" defaultValue="assistant" className="gap-7">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="gap-2.5 border-border bg-white px-4 py-2 text-[13px] font-bold text-ink"><span><NodeMark className="text-primary" /></span>مشاور سرمایه‌گذاری</Badge>
              <TabsList className="h-auto rounded-full bg-ink/[0.05] p-1 group-data-[orientation=horizontal]/tabs:h-auto">
                {([["assistant", "از دستیار بپرس", MagicStar], ["form", "خودم انتخاب می‌کنم", Category2]] as const).map(([k, label, I]) => (
                  <TabsTrigger key={k} value={k} className="h-auto gap-1.5 rounded-full border-0 px-4 py-2 text-sm font-bold text-ink/65 data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-none"><I size={16} variant="Bulk" />{label}</TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="assistant" className="space-y-6">
              <h1 className="text-5xl font-black leading-[1.4] tracking-tight text-ink text-balance">بگویید چه می‌خواهید؛ <span className="text-primary">نزدیک‌ترین پروژه‌ها</span> را با درصد تطابق نشانتان می‌دهیم.</h1>
              <form onSubmit={(e) => { e.preventDefault(); if (prompt.trim()) go(prompt); }} className="surface rounded-[2rem] p-2.5">
                <div className="flex items-center gap-2">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><MagicStar size={24} variant="Bulk" /></span>
                  <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="۳۰ میلیارد دارم، پروژه مسکونی در تهران می‌خواهم…" aria-label="توضیح شرایط برای دستیار" className="h-14 min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] font-semibold text-ink shadow-none focus-visible:ring-0 placeholder:font-normal md:text-[15px]" />
                  <Button type="submit" variant="plain" size="auto" className="group h-14 gap-2 rounded-full bg-primary px-6 font-extrabold text-white hover:bg-deep">پیدا کن <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" /></Button>
                </div>
              </form>
              <div className="flex flex-wrap items-center gap-2">
                {samplePrompts.map((p) => <Button key={p} variant="plain" size="auto" onClick={() => go(p)} className="h-auto rounded-full border border-border bg-white px-3.5 py-1.5 text-[13px] font-semibold text-ink/75 hover:border-primary/50 hover:text-primary">{p}</Button>)}
              </div>
            </TabsContent>

            <TabsContent value="form" className="space-y-8">
              <h1 className="text-[3.1rem] font-black leading-[1.9] tracking-tight text-ink">می‌خواهم از مسیر<RouteBlank />وارد شوم.</h1>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="plain" size="auto" onClick={() => { begin({ route }); router.push("/opportunities"); }} className="group h-16 gap-3 rounded-full bg-primary pl-2.5 pr-7 text-lg font-extrabold text-white shadow-[0_22px_44px_-22px_var(--primary)] hover:bg-deep">
                  دیدن {hydrated ? faNumber(count) : "…"} پروژه
                  <span className="grid size-11 place-items-center rounded-full bg-white/15 transition-transform group-hover:-translate-x-1"><ArrowLeft size={20} /></span>
                </Button>
                <p className="max-w-60 text-[13px] leading-6 text-muted-foreground">فقط محدوده و بودجه را می‌پرسیم؛ بعد پروژه‌ها جلوی شماست.</p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        <MapScene />
      </div>
    </section>
  );
}
