"use client";
// سه ایده هیرو برای انتخاب. نقشه در هر سه ثابت می‌ماند؛ بخش محتوا هر بار یک ایده است:
// ۱. قطب‌نما: یک جمله کوتاه و یک جای نوشتن، نقشه داخل حلقه قطب‌نما (هم‌ریشه با نام «سرمایه‌نما»)
// ۲. جمله زنده: سه جای خالی بدون تایپ؛ نقشه و شمار پروژه‌ها همان لحظه به‌روز می‌شوند
// ۳. پرونده شفاف: کارت پروژه‌ها با ریسک، وضعیت حقوقی و کارشناس، هم‌گام با نقطه روی نقشه
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown2, ArrowLeft, Call, DocumentDownload, Location, MagicStar, ShieldSearch, ShieldTick, TickCircle, UserSquare, Warning2 } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Header } from "@/components/site/header";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { cityXY } from "@/components/brand/iran-map";
import { groupIcons } from "@/components/icons";
import { MapScene, ease } from "@/components/home/hero";
import { routes } from "@/data/routes";
import { projectGroups } from "@/data/taxonomy";
import { listings } from "@/lib/listings";
import { samplePrompts } from "@/lib/assistant";
import { useStore } from "@/lib/store";
import { cn, faNumber, legalLabel, riskLabel } from "@/lib/utils";
import type { Opportunity } from "@/types";

/* ───────── پوسته مشترک ───────── */
function Shell({ children, map }: { children: React.ReactNode; map: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden pb-6">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(45%_55%_at_88%_0%,rgb(15_118_110/0.07),transparent),linear-gradient(to_bottom,#ffffff,var(--background))]" />
      <AlgoPattern animated className="-top-10 right-0 -z-10 h-[30rem] w-[44rem] text-ink/[0.07]" fade="radial" />
      <Header />
      <div className="mx-auto grid min-h-[calc(100dvh-7rem)] max-w-7xl grid-cols-[1.05fr_1fr] items-center gap-12 px-8 pb-10 pt-10">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>{children}</motion.div>
        {map}
      </div>
    </section>
  );
}

function Eyebrow({ children }: { children?: React.ReactNode }) {
  return <Badge variant="outline" className="gap-2.5 border-border bg-white/80 px-4 py-2 text-[13px] font-bold text-ink backdrop-blur"><NodeMark className="text-primary" />{children ?? "مشاور سرمایه‌گذاری"}</Badge>;
}

const useGo = () => {
  const router = useRouter();
  const setCriteria = useStore((s) => s.setCriteria);
  return {
    ask: (q: string) => router.push(q ? `/assistant?q=${encodeURIComponent(q)}` : "/assistant"),
    browse: (c: Parameters<typeof setCriteria>[0] = {}) => { setCriteria({ route: "investor", groups: [], provinces: [], amount: null, filters: {}, ...c }); useStore.getState().setStarted(true); router.push("/opportunities"); },
  };
};

/* ───────── ایده ۱: قطب‌نما ───────── */

/** نمونه درخواست‌ها جای placeholder کلمه‌به‌کلمه نوشته می‌شوند تا بی‌شلوغی، راه شروع را نشان دهند. */
function TypingHint({ hidden }: { hidden: boolean }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0); const [n, setN] = useState(0);
  const words = samplePrompts[i].split(" ");
  useEffect(() => {
    if (reduce) return;
    const t = n < words.length ? setTimeout(() => setN(n + 1), 170) : setTimeout(() => { setN(0); setI((i + 1) % samplePrompts.length); }, 3200);
    return () => clearTimeout(t);
  }, [n, i, words.length, reduce]);
  if (hidden) return null;
  return <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-[15px] text-muted-foreground">{reduce ? samplePrompts[0] : words.slice(0, n).join(" ")}<span className="ms-0.5 inline-block h-5 w-px animate-pulse bg-primary" /></span>;
}

function CompassRing() {
  const ticks = Array.from({ length: 72 });
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-[47%] -z-10 aspect-square w-[112%] -translate-x-1/2 -translate-y-1/2">
      <motion.svg viewBox="0 0 200 200" className="absolute inset-0 size-full" animate={{ rotate: 360 }} transition={{ duration: 160, repeat: Infinity, ease: "linear" }}>
        {ticks.map((_, i) => <line key={i} x1="100" y1="3" x2="100" y2={i % 6 === 0 ? 8.5 : 6} transform={`rotate(${i * 5} 100 100)`} strokeWidth={i % 18 === 0 ? 0.7 : 0.35} className={i % 18 === 0 ? "stroke-primary/60" : "stroke-primary/25"} />)}
      </motion.svg>
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full">
        <circle cx="100" cy="100" r="96.5" fill="none" strokeWidth="0.35" className="stroke-primary/20" />
        <circle cx="100" cy="100" r="86" fill="none" strokeWidth="0.3" strokeDasharray="0.6 2.4" className="stroke-primary/30" />
      </svg>
      {[["شمال", "top-[1.5%] left-1/2 -translate-x-1/2"], ["جنوب", "bottom-[1.5%] left-1/2 -translate-x-1/2"], ["شرق", "right-[0.5%] top-1/2 -translate-y-1/2"], ["غرب", "left-[0.5%] top-1/2 -translate-y-1/2"]].map(([t, c]) => (
        <span key={t} className={cn("absolute rounded-full bg-background/90 px-1.5 text-[10px] font-extrabold text-primary/70", c)}>{t}</span>
      ))}
    </div>
  );
}

export function HeroCompass() {
  const { ask, browse } = useGo();
  const [prompt, setPrompt] = useState("");
  return (
    <Shell map={<div className="relative mx-auto w-full max-w-[600px] py-10"><CompassRing /><MapScene /></div>}>
      <Eyebrow />
      <h1 className="mt-7 text-[3.6rem] font-black leading-[1.3] tracking-tight text-ink">
        سرمایه‌تان را<br />به{" "}
        <span className="relative inline-block text-primary">
          سمت درست
          <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-4 w-full">
            <motion.path d="M4 14 C 80 4, 200 4, 296 12" fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-primary/30" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, delay: 0.7, ease }} />
          </svg>
        </span>{" "}ببرید.
      </h1>
      <p className="mt-5 max-w-lg text-[17px] leading-9 text-ink/65">بگویید چه می‌خواهید؛ پروژه‌های هم‌خوان را با درصد تطابق نشانتان می‌دهیم.</p>
      <form onSubmit={(e) => { e.preventDefault(); if (prompt.trim()) ask(prompt); }} className="surface mt-8 flex items-center gap-2 rounded-full p-2 pr-7 transition-shadow focus-within:shadow-[0_0_0_4px_rgb(15_118_110/0.12),0_24px_50px_-30px_rgb(8_59_55/0.3)]">
        <span className="relative min-w-0 flex-1">
          <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} aria-label="شرایط شما برای دستیار" className="h-14 rounded-none border-0 !bg-transparent px-0 text-[15px] font-semibold text-ink shadow-none focus-visible:ring-0 md:text-[15px]" />
          <TypingHint hidden={!!prompt} />
        </span>
        <Button type="submit" variant="plain" size="auto" className="group h-14 gap-2 rounded-full bg-primary px-7 font-extrabold text-white shadow-[0_18px_36px_-18px_var(--primary)] hover:bg-deep">پیشنهاد بگیرید<ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" /></Button>
      </form>
      <Button variant="plain" size="auto" onClick={() => browse()} className="group mt-4 gap-1.5 px-3 text-sm font-bold text-ink/60 hover:text-primary">مشاهده همه پروژه‌ها<ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /></Button>
    </Shell>
  );
}

/* ───────── ایده ۲: جمله زنده ───────── */
const investor = routes.find((r) => r.id === "investor")!;

function Blank({ label, open, onOpenChange, children, wide }: { label: string; open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="plain" size="auto" className={cn("mx-1.5 inline-flex h-auto items-center gap-1.5 whitespace-nowrap rounded-2xl border-b-[3px] border-primary bg-white px-3.5 py-0 align-baseline text-[0.92em] font-black leading-[1.55] text-primary shadow-[0_18px_40px_-26px_rgb(8_59_55/0.45)] transition-all duration-300 hover:-translate-y-0.5", open && "ring-4 ring-primary/10")}>
          <motion.span key={label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{label}</motion.span>
          <ArrowDown2 size={18} className={cn("shrink-0 transition-transform", open && "rotate-180")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={10} className={cn("rounded-3xl p-3 shadow-2xl", wide ? "w-[30rem]" : "w-80")}>{children}</PopoverContent>
    </Popover>
  );
}

function Opt({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <Button variant="plain" size="auto" onClick={onClick} className={cn("h-auto justify-between gap-2 rounded-xl border px-3 py-2 text-right text-[13px] font-bold", on ? "border-primary bg-primary/[0.06] text-primary" : "border-transparent text-ink/80 hover:bg-muted")}>{children}</Button>;
}

export function HeroSentence() {
  const { ask, browse } = useGo();
  const [amount, setAmount] = useState<number | null>(30);
  const [province, setProvince] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [open, setOpen] = useState<"" | "a" | "p" | "g">("");
  const pool = useMemo(() => listings.filter((l) => l.routes.includes("investor")), []);
  const provinces = useMemo(() => { const m = new Map<string, number>(); for (const l of pool) if (l.province) m.set(l.province, (m.get(l.province) ?? 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); }, [pool]);
  const matches = pool.filter((l) => (!province || l.province === province) && (!group || l.group === group) && (!amount || l.amount == null || l.amount <= amount));
  const pics = matches.filter((l) => l.image).slice(0, 3);
  const a = investor.amount!;
  const unit = a.unit.replace("تومان", "").trim();
  return (
    <Shell map={<MapScene active={province ? [province] : []} focus={province ? matches.find((l) => l.city && cityXY(l.city))?.id : undefined} caption={province ? `پروژه‌های ${province} پررنگ شده‌اند` : "تازه‌ترین پروژه‌ها از سراسر ایران"} />}>
      <Eyebrow>سه انتخاب، بدون نوشتن</Eyebrow>
      <h1 className="mt-8 text-[2.65rem] font-black leading-[2.05] tracking-tight text-ink">
        من
        <Blank label={amount ? `${faNumber(amount)} ${unit}` : "هر مبلغی"} open={open === "a"} onOpenChange={(v) => setOpen(v ? "a" : "")}>
          <p className="px-1 text-xs font-semibold text-muted-foreground">{a.label}</p>
          <p className="mt-2 px-1 text-2xl font-black text-ink">{amount ? `${faNumber(amount)} ${a.unit}` : "بدون سقف"}</p>
          <Slider dir="rtl" className="mt-4" min={a.min} max={200} step={a.step} value={[amount ?? 200]} onValueChange={([v]) => setAmount(v)} />
          <div className="mt-4 flex flex-wrap gap-1.5">{[5, 20, 50, 100].map((v) => <Opt key={v} on={amount === v} onClick={() => setAmount(v)}>{faNumber(v)} {unit}</Opt>)}<Opt on={!amount} onClick={() => setAmount(null)}>هر مبلغی</Opt></div>
        </Blank>
        دارم و می‌خواهم در
        <Blank label={province ?? "هر جای ایران"} open={open === "p"} onOpenChange={(v) => setOpen(v ? "p" : "")} wide>
          <div className="grid max-h-72 grid-cols-3 gap-1 overflow-y-auto thin-scroll">
            <Opt on={!province} onClick={() => { setProvince(null); setOpen(""); }}>هر جای ایران</Opt>
            {provinces.map(([p, c]) => <Opt key={p} on={province === p} onClick={() => { setProvince(p); setOpen(""); }}><span>{p}</span><span className="text-[11px] font-semibold text-muted-foreground">{faNumber(c)}</span></Opt>)}
          </div>
        </Blank>
        روی
        <Blank label={group ? projectGroups.find((g) => g.id === group)!.name : "هر حوزه‌ای"} open={open === "g"} onOpenChange={(v) => setOpen(v ? "g" : "")} wide>
          <div className="grid grid-cols-2 gap-1">
            <Opt on={!group} onClick={() => { setGroup(null); setOpen(""); }}>هر حوزه‌ای</Opt>
            {projectGroups.map((g) => { const I = groupIcons[g.id]; return <Opt key={g.id} on={group === g.id} onClick={() => { setGroup(g.id); setOpen(""); }}><span className="flex items-center gap-2">{I && <I size={16} variant="Bulk" className="text-primary" />}{g.name}</span></Opt>; })}
          </div>
        </Blank>
        سرمایه‌گذاری کنم.
      </h1>

      <div className="surface mt-9 flex items-center gap-4 rounded-[1.75rem] p-3 pr-5">
        <span className="flex -space-x-3 space-x-reverse">{pics.map((l) => <span key={l.id} className="relative size-11 overflow-hidden rounded-full ring-[3px] ring-white"><Image src={l.image} alt="" fill sizes="44px" className="object-cover" /></span>)}</span>
        <span className="min-w-0 flex-1">
          <AnimatePresence mode="popLayout"><motion.span key={matches.length} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="block text-2xl font-black text-ink">{faNumber(matches.length)} پروژه</motion.span></AnimatePresence>
          <span className="block text-[13px] font-semibold text-muted-foreground">با همین شرایط پیدا شد</span>
        </span>
        <Button variant="plain" size="auto" disabled={!matches.length} onClick={() => browse({ provinces: province ? [province] : [], groups: group ? [group] : [], amount: amount ? [a.min, amount] : null })}
          className="group h-14 gap-2 rounded-full bg-primary px-6 font-extrabold text-white shadow-[0_18px_36px_-18px_var(--primary)] hover:bg-deep disabled:bg-pine/15">دیدن پروژه‌ها<ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" /></Button>
      </div>
      <Button variant="plain" size="auto" onClick={() => ask("")} className="group mt-4 gap-1.5 px-3 text-sm font-bold text-ink/60 hover:text-primary"><MagicStar size={16} variant="Bulk" className="text-primary" />ترجیح می‌دهم با دستیار بنویسم<ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /></Button>
    </Shell>
  );
}

/* ───────── ایده ۳: پرونده شفاف ───────── */
const STAY = 5600;

function RiskBars({ risk }: { risk: string }) {
  const lv = { low: 1, medium: 2, high: 3 }[risk] ?? 0;
  const tone = lv === 1 ? "bg-primary" : lv === 2 ? "bg-coral" : "bg-destructive";
  return <span className="mt-1.5 flex gap-1">{[1, 2, 3].map((i) => <span key={i} className={cn("h-1.5 w-5 rounded-full", i === lv ? tone : "bg-muted")} />)}</span>;
}

export function HeroDossier() {
  const { ask, browse } = useGo();
  const pool = useMemo(() => {
    const ok = listings.filter((l) => l.kind === "project" && l.city && cityXY(l.city) && l.image);
    const by = new Map<string, typeof ok>(); for (const l of ok) by.set(l.province!, [...(by.get(l.province!) ?? []), l]);
    const cols = [...by.values()]; const out: typeof ok = [];
    for (let i = 0; cols.some((c) => c[i]); i++) for (const c of cols) if (c[i]) out.push(c[i]);
    return out.slice(0, 24);
  }, []);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => { if (paused) return; const t = setTimeout(() => setI((x) => (x + 1) % pool.length), STAY); return () => clearTimeout(t); }, [i, paused, pool.length]);
  const l = pool[i]; const o = l.raw as Opportunity;
  return (
    <Shell map={<MapScene focus={l.id} caption={`${l.province}، ${l.city}`} />}>
      <Eyebrow />
      <h1 className="mt-7 text-[3.2rem] font-black leading-[1.4] tracking-tight text-ink text-balance">پیش از سرمایه‌گذاری، همه‌چیز را <span className="text-primary">روشن</span> ببینید.</h1>
      <p className="mt-4 max-w-lg text-[17px] leading-9 text-ink/65">برای هر پروژه، مبلغ، ریسک، وضعیت حقوقی و راه گفت‌وگو با کارشناس یک‌جا جلوی شماست.</p>

      <div className="relative mt-8 max-w-xl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <span aria-hidden className="absolute inset-x-6 -bottom-3 top-3 rounded-[1.75rem] bg-white/60 ring-1 ring-border" />
        <span aria-hidden className="absolute inset-x-12 -bottom-6 top-6 rounded-[1.75rem] bg-white/40 ring-1 ring-border/70" />
        <AnimatePresence mode="wait">
          <motion.article key={l.id} initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }} transition={{ duration: 0.45, ease }}
            className="relative overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-[0_30px_60px_-36px_rgb(8_59_55/0.45)] ring-1 ring-border">
            <Link href={`/opportunities/${l.id}`} className="absolute inset-0 z-10" aria-label={l.title} />
            <div className="flex gap-4">
              <span className="relative size-24 shrink-0 overflow-hidden rounded-2xl"><Image src={l.image} alt="" fill sizes="96px" className="object-cover" /></span>
              <span className="min-w-0 flex-1 py-0.5">
                <span className="flex items-center gap-1 text-xs font-extrabold text-primary"><Location size={14} variant="Bold" />{l.province}، {l.city}</span>
                <span className="mt-1 line-clamp-2 block text-[17px] font-black leading-7 text-ink">{l.title}</span>
                <span className="mt-1 block truncate text-xs font-semibold text-muted-foreground">{l.stats[0]?.label}: <b className="text-ink/80">{l.stats[0]?.value}</b></span>
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-muted/60 px-3 py-2.5"><dt className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground"><Warning2 size={13} variant="Bulk" />ریسک</dt><dd className="mt-0.5 text-sm font-extrabold text-ink">{riskLabel[l.risk] ?? l.risk}<RiskBars risk={l.risk} /></dd></div>
              <div className="rounded-2xl bg-muted/60 px-3 py-2.5"><dt className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground"><ShieldSearch size={13} variant="Bulk" />وضعیت حقوقی</dt><dd className="mt-0.5 text-[13px] font-extrabold leading-6 text-ink">{legalLabel[o.legalStatus] ?? o.legalStatus ?? "ثبت نشده"}</dd></div>
              <div className="rounded-2xl bg-muted/60 px-3 py-2.5"><dt className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">{o.expert ? <Call size={13} variant="Bulk" /> : <DocumentDownload size={13} variant="Bulk" />}{o.expert ? "کارشناس" : "راهنما"}</dt><dd className="mt-0.5 truncate text-[13px] font-extrabold leading-6 text-ink">{o.expert ? o.expert.name : "فایل راهنمای پروژه"}</dd></div>
            </dl>
            <span className="absolute inset-x-0 bottom-0 h-[3px] bg-muted"><motion.span key={`${l.id}-${paused}`} className="block h-full bg-primary/70" initial={{ width: "0%" }} animate={{ width: paused ? "0%" : "100%" }} transition={{ duration: paused ? 0 : STAY / 1000, ease: "linear" }} /></span>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex items-center gap-3">
        <Button variant="plain" size="auto" onClick={() => ask("")} className="group h-14 gap-2 rounded-full bg-primary px-7 font-extrabold text-white shadow-[0_18px_36px_-18px_var(--primary)] hover:bg-deep"><MagicStar size={20} variant="Bulk" />شرایطم را به دستیار می‌گویم</Button>
        <Button variant="plain" size="auto" onClick={() => browse()} className="group h-14 gap-2 rounded-full border border-border bg-white px-6 font-extrabold text-ink hover:border-primary hover:text-primary">همه پروژه‌ها<ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /></Button>
        <span className="mr-2 flex items-center gap-1.5 text-xs font-bold text-ink/55"><ShieldTick size={16} variant="Bulk" className="text-primary" />بدون ثبت‌نام</span>
      </div>
    </Shell>
  );
}
