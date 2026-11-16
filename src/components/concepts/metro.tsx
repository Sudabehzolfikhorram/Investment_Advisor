"use client";
// کانسپت ۲ «نقشه مسیر»: زبان نقشه خطوط شهری. «یک نقطه شروع. چند مسیر برای خلق ارزش.» عیناً نقشه است:
// ایستگاه «شما اینجا هستید»، هشت خط تا هشت مسیر همکاری، و ایستگاه‌های هر خط همان گام‌های ورود آن مسیر.
// زمینه کاغذی روشن، خط‌ها خاکستری، خطِ شما کبالت، دکمه اقدام سبز. نشان الگونت (نقطه، موج، خط، حلقه) خودش یک خط است.
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlgoPattern, Logo } from "@/components/brand/algo-pattern";
import { ArrowLeft, Call, DocumentDownload, Location, Login } from "@/components/iconsax";
import { routeIcons, toolIcons } from "@/components/icons";
import { brandLine, brings, byProvince, directSearch, featured, flowSteps, footer, goals, goalsHead, groups, groupsHead, hero, heroStories, intents, intro, knowledge, method, navLinks, noSignup, proposalCta, quickNav, services, stories, totalCount, type Bring, type Goal } from "@/components/concepts/content";
import { CompareToggle, ConceptSwitch, DirectSearch, MarkTitle, ProvinceMap, SaveButton, WithProject, projectHref, spanClass, spans12, useGo } from "@/components/concepts/shared";
import { arrange, chartList } from "@/components/concepts/charts";
import { sheetOf } from "@/lib/sheet";
import { listings } from "@/lib/listings";
import { forRoute } from "@/lib/match";
import { useHydrated, useStore } from "@/lib/store";
import type { Listing, Opportunity, RouteId } from "@/types";
import { cn, faNumber, formatMobile } from "@/lib/utils";

const vars = { "--cv-accent": "#1e3a8a", "--cv-soft": "#e8edf7", "--cv-ink": "#2f3533", "--cv-grid": "#e1e6ee", "--cv-surface": "#ffffff", "--cv-warn": "#e0603f" } as CSSProperties;
const ease = [0.16, 1, 0.3, 1] as const;
const W = "mx-auto max-w-[84rem] px-8";
const IDLE = "#c5cfdc", INK = "#2f3533", CO = "#1e3a8a";

/** نشان خط: شماره خط در مربع گرد */
function LineBadge({ n, on = true, className }: { n: number; on?: boolean; className?: string }) {
  return <span className={cn("inline-grid size-7 shrink-0 place-items-center rounded-[8px] text-[12.5px] font-black tabular-nums transition-colors", on ? "bg-[#1e3a8a] text-white" : "bg-[#e7ecf3] text-[#2f3533]/50", className)}>{faNumber(n)}</span>;
}

function Nav() {
  const hydrated = useHydrated();
  const { user, saved, compare, openLogin } = useStore();
  return (
    <header className="sticky top-0 z-40 border-b border-[#e1e6ee] bg-[#f6f8fb]/90 backdrop-blur-md">
      <div className={cn(W, "flex h-20 items-center justify-between")}>
        <Link href="/concepts/metro" className="flex items-center gap-4"><Logo /><span className="hidden border-r border-[#2f3533]/15 pr-4 text-[12.5px] font-bold text-[#2f3533]/60 lg:inline">{brandLine}</span></Link>
        <nav className="flex items-center">
          {navLinks.map((l, i) => (
            <Link key={l.href} href={l.href} className="group relative flex items-center gap-2 px-4 py-2 text-[14px] font-bold text-[#2f3533]/75 hover:text-[#2f3533]">
              <span className="size-2.5 rounded-full border-2 border-[#2f3533]/40 bg-white transition-colors group-hover:border-[#1e3a8a] group-hover:bg-[#1e3a8a]" />{l.label}
              {hydrated && l.href === "/saved" && saved.length > 0 && <span className="rounded-md bg-[#0f766e] px-1.5 text-[11px] font-black text-white">{faNumber(saved.length)}</span>}
              {hydrated && l.href === "/compare" && compare.length > 0 && <span className="rounded-md bg-[#1e3a8a] px-1.5 text-[11px] font-black text-white">{faNumber(compare.length)}</span>}
              {i < navLinks.length - 1 && <span className="absolute -left-1 top-1/2 h-[2px] w-2 bg-[#2f3533]/15" />}
            </Link>
          ))}
          {!(hydrated && user) && <button type="button" onClick={() => openLogin()} className="mr-4 inline-flex h-11 items-center gap-2 rounded-full bg-[#2f3533] px-5 text-[14px] font-extrabold text-white"><Login size={18} />ورود</button>}
        </nav>
      </div>
    </header>
  );
}

/* ——— هیرو: نقشه خطوط ——— */
const MW = 820, MH = 600, SX = 792, SY = 300;
const lineGoals = goals.filter((g) => g.route);
const lines = lineGoals.map((g, i) => {
  const y = 34 + i * ((MH - 68) / (lineGoals.length - 1));
  const dx = Math.abs(y - SY);
  const bendEnd = SX - 40 - dx;
  const d = `M${SX},${SY} H${SX - 40} L${bendEnd},${y} H56`;
  const stations = [0, 1, 2, 3].map((k) => 56 + ((bendEnd - 40 - 56) * (k + 1)) / 5);
  return { g, i, y, d, stations };
});

function NetworkMap({ bring, lit }: { bring: Bring | null; lit: (g: Pick<Goal, "brings">) => boolean }) {
  const reduce = useReducedMotion();
  const go = useGo();
  const [hover, setHover] = useState<string | null>(null);
  const on = lineGoals.filter(lit);
  const count = useMemo(() => new Set(on.flatMap((g) => forRoute(listings, g.route!).map((l) => l.id))).size, [on]);
  const h = lines.find((l) => l.g.id === hover);
  return (
    <div className="relative" onPointerLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${MW} ${MH}`} className="h-auto w-full overflow-visible">
        {lines.map((ln) => {
          const active = hover ? hover === ln.g.id : bring ? lit(ln.g) : false;
          const dim = hover ? hover !== ln.g.id : bring ? !lit(ln.g) : false;
          return (
            <g key={ln.g.id} onPointerEnter={() => setHover(ln.g.id)} onClick={() => go.route(ln.g.route!)} className="cursor-pointer" style={{ opacity: dim ? 0.35 : 1, transition: "opacity .4s" }}>
              <path d={ln.d} fill="none" stroke="transparent" strokeWidth="26" />
              <motion.path d={ln.d} fill="none" stroke={active ? CO : IDLE} strokeWidth={active ? 9 : 7} strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke .4s, stroke-width .3s" }}
                initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 0.1 + ln.i * 0.08, ease }} />
              {ln.stations.map((x, k) => <motion.circle key={k} cx={x} cy={ln.y} r={active ? 6.5 : 5.5} fill="white" stroke={active ? CO : "#8d99aa"} strokeWidth="3" initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 + ln.i * 0.08 + k * 0.05 }} />)}
              <motion.rect x={36} y={ln.y - 13} width={40} height={26} rx={13} fill="white" stroke={active ? CO : INK} strokeWidth="3.5" initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 + ln.i * 0.08 }} />
              {(active || (!bring && !hover)) && !reduce && <circle r={active ? 7 : 5} fill="#0f766e" stroke="white" strokeWidth="2.5" opacity={active ? 1 : 0.85}><animateMotion dur={`${active ? 3.2 + ln.i * 0.2 : 7 + ((ln.i * 3) % 5)}s`} begin={`${active ? 0 : ln.i * 0.7}s`} repeatCount="indefinite" path={ln.d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" /></circle>}
            </g>
          );
        })}
        {/* ایستگاه شروع */}
        <circle cx={SX} cy={SY} r="22" fill="#0f766e" opacity="0.15"><animate attributeName="r" values="18;30;18" dur="2.6s" repeatCount="indefinite" /></circle>
        <circle cx={SX} cy={SY} r="13" fill="white" stroke="#0f766e" strokeWidth="5" />
      </svg>
      {/* نام خطوط در انتهای هر خط (HTML) */}
      {lines.map((ln) => {
        const active = hover ? hover === ln.g.id : !bring || lit(ln.g);
        return (
          <button key={ln.g.id} type="button" onPointerEnter={() => setHover(ln.g.id)} onFocus={() => setHover(ln.g.id)} onClick={() => go.route(ln.g.route!)}
            className={cn("absolute flex -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-[#f6f8fb]/90 py-0.5 pl-2 text-[12.5px] font-extrabold transition-opacity", active ? "opacity-100" : "opacity-40")}
            style={{ left: `${(84 / MW) * 100}%`, top: `${((ln.y - 22) / MH) * 100}%` }}>
            <LineBadge n={ln.i + 1} on={hover === ln.g.id || (!!bring && lit(ln.g))} className="size-6 text-[11px]" />
            <span className="text-[#2f3533]">{ln.g.name}</span>
            <span className="font-bold text-[#2f3533]/50">{ln.g.count ? `${faNumber(ln.g.count)} پروژه` : "به‌زودی"}</span>
          </button>
        );
      })}
      <span className="absolute -translate-y-1/2 whitespace-nowrap text-[12px] font-extrabold text-[#0f766e]" style={{ right: `${((MW - SX) / MW) * 100 - 1}%`, top: `${((SY + 40) / MH) * 100}%` }}>شما اینجا هستید</span>
      {/* گام‌های خطی که نشانگر روی آن است */}
      <AnimatePresence>
        {h && (
          <motion.div key={h.g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="pointer-events-none absolute bottom-0 left-[9%] w-[23rem] rounded-2xl border border-[#e1e6ee] bg-white p-4 shadow-[0_24px_50px_-28px_rgb(16_24_40/0.45)]">
            <p className="flex items-center gap-2 text-[14px] font-black text-[#2f3533]"><LineBadge n={h.i + 1} />{h.g.fullName}</p>
            <ol className="mt-3 space-y-2 border-r-[3px] border-[#1e3a8a] pr-3">
              {h.g.steps.map((s, k) => <li key={k} className="relative text-[12.5px] font-semibold leading-6 text-[#2f3533]/80"><span className="absolute -right-[19px] top-2 size-2.5 rounded-full border-2 border-[#1e3a8a] bg-white" />{s}</li>)}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="sr-only">{faNumber(count)} پروژه در خطوط روشن</p>
    </div>
  );
}

function Hero({ bring, setBring, lit }: { bring: Bring | null; setBring: (b: Bring | null) => void; lit: (g: Pick<Goal, "brings">) => boolean }) {
  const go = useGo();
  const on = lineGoals.filter(lit);
  const count = useMemo(() => new Set(on.flatMap((g) => forRoute(listings, g.route!).map((l) => l.id))).size, [on]);
  return (
    <section className="relative isolate overflow-hidden pb-10 pt-10">
      <AlgoPattern className="inset-0 -z-10 size-full text-[#2f3533]/[0.05]" fade="none" scale={0.9} />
      <div className={cn(W, "grid grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] items-center gap-6")}>
        <div className="relative z-10">
          <MarkTitle as="h1" className="text-[3.3rem] font-black leading-[1.35] tracking-tight text-[#2f3533]" markClass="text-[#0f766e]">{hero.title[0]}<br />{hero.title[1]}</MarkTitle>
          <p className="mt-5 text-[1.15rem] font-extrabold text-[#1e3a8a]">{hero.kicker}</p>
          <p className="mt-2 text-[15.5px] leading-8 text-[#2f3533]/70">{hero.sub}</p>
          <div className="mt-8 rounded-[1.6rem] border border-[#e1e6ee] bg-white p-5">
            <p className="text-[14px] font-extrabold text-[#2f3533]">آورده شما چیست؟ <span className="font-bold text-[#2f3533]/55">خط‌های جور روشن می‌شوند</span></p>
            <div className="mt-3 flex flex-wrap gap-2">
              {brings.map((b) => (
                <button key={b.id} type="button" aria-pressed={bring === b.id} onClick={() => setBring(bring === b.id ? null : b.id)}
                  className={cn("inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[13px] font-bold transition-all", bring === b.id ? "border-[#1e3a8a] bg-[#1e3a8a] text-white" : "border-[#e1e6ee] text-[#2f3533]/80 hover:border-[#1e3a8a]/50")}>
                  <span className={cn("size-2.5 rounded-full border-2", bring === b.id ? "border-white" : "border-[#2f3533]/40")} />{b.label}</button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={bring ?? "all"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 text-[13.5px] font-bold text-[#2f3533]/70">
                {bring ? <><b className="text-[#2f3533]">{faNumber(on.length)} خط</b> و <b className="text-[#2f3533]">{faNumber(count)} پروژه</b> با آورده شما جور است.</> : <>هشت خط، {faNumber(totalCount)} فرصت. آورده‌تان را بگویید تا مسیرتان روشن شود.</>}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mt-7 flex items-center gap-3">
            <button type="button" onClick={() => go.href(hero.primary.href)} className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#0f766e] pl-3 pr-7 text-[15.5px] font-extrabold text-white shadow-[0_18px_40px_-18px_rgb(15_118_110/0.8)] transition-transform hover:-translate-y-0.5">
              {hero.primary.label}<span className="grid size-9 place-items-center rounded-full bg-white/15 transition-transform group-hover:-translate-x-1"><ArrowLeft size={18} /></span></button>
            <Link href={hero.secondary.href} className="inline-flex h-14 items-center rounded-full border-2 border-[#2f3533]/15 px-6 text-[14.5px] font-extrabold text-[#2f3533] hover:border-[#2f3533]/40">{hero.secondary.label}</Link>
          </div>
        </div>
        <NetworkMap bring={bring} lit={lit} />
      </div>
    </section>
  );
}

/* ——— سه زاویه: تابلوی ایستگاه روی عکس ——— */
function Stories() {
  const go = useGo();
  return (
    <section className={cn(W, "mt-16")}>
      <MarkTitle className="text-[2.1rem] font-black text-[#2f3533]" markClass="text-[#1e3a8a]">{heroStories.title}</MarkTitle>
      <div className="mt-8 grid grid-cols-[1.3fr_1fr_1fr] gap-4">
        {heroStories.items.map((s) => (
          <button key={s.n} type="button" onClick={() => go.route(s.routes[0])} className="group relative h-[25rem] overflow-hidden rounded-[1.6rem] text-right">
            <Image src={s.image} alt="" fill sizes="40vw" className="object-cover grayscale-[25%] transition-transform duration-[1.2s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            {/* تابلوی ایستگاه */}
            <div className="absolute inset-x-5 bottom-5 flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.5)] transition-transform duration-500 group-hover:-translate-y-1">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border-[5px] border-[#1e3a8a] text-[13px] font-black text-[#2f3533]">{faNumber(s.n)}</span>
              <div className="min-w-0 flex-1"><p className="text-[1.15rem] font-black text-[#2f3533]">{s.name}</p><p className="truncate text-[12px] font-bold text-[#2f3533]/55">{s.routes.map((id) => goals.find((g) => g.id === id)?.name).join("، ")}</p></div>
              <ArrowLeft size={18} className="text-[#2f3533] transition-transform group-hover:-translate-x-1" />
            </div>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[12px] font-semibold text-[#2f3533]/55">{hero.imageNote}</p>
    </section>
  );
}

/* ——— یک نقطه شروع: انشعاب سه نیت ——— */
function Intro() {
  const reduce = useReducedMotion();
  const hydrated = useHydrated(); const saved = useStore((s) => s.saved);
  return (
    <section className={cn(W, "mt-28")}>
      <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-16">
        <div>
          <MarkTitle className="text-[2.5rem] font-black leading-[1.45] text-[#2f3533]" markClass="text-[#1e3a8a]">{intro.title[0]}<br />{intro.title[1]}</MarkTitle>
          <p className="mt-4 text-[1.05rem] font-extrabold text-[#1e3a8a]">{intro.kicker}</p>
          <p className="mt-2 text-[15px] leading-8 text-[#2f3533]/70">{intro.text}</p>
          {/* فهرست ایستگاه‌ها: میان‌برها */}
          <ul className="mt-8 columns-2 gap-6">
            {quickNav.map((q) => <li key={q.label} className="mb-1 break-inside-avoid"><Link href={q.href} className="group flex items-center gap-2.5 rounded-lg py-1.5 text-[13.5px] font-bold text-[#2f3533]/80 hover:text-[#1e3a8a]"><span className="size-3 rounded-full border-[3px] border-[#2f3533]/30 transition-colors group-hover:border-[#1e3a8a]" />{q.label}{q.saved && hydrated && saved.length > 0 && <span className="text-[11px] font-black text-[#1e3a8a]">({faNumber(saved.length)})</span>}</Link></li>)}
          </ul>
        </div>
        {/* شاخه‌ها: از ایستگاه شروع تا سه نیت؛ هر شاخه به ایستگاهی کنار کارت می‌رسد */}
        <div className="relative">
          <svg viewBox="0 0 600 420" className="absolute inset-0 size-full" preserveAspectRatio="none" aria-hidden>
            {[70, 210, 350].map((y, i) => (
              <motion.path key={y} d={`M600,210 H${y === 210 ? 330 : 560} ${y === 210 ? "" : `L${560 - 140},${y} H330`}`} fill="none" stroke={i === 1 ? "#0f766e" : "#1e3a8a"} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: i * 0.15, ease }} />
            ))}
          </svg>
          <span className="absolute right-0 top-1/2 size-6 -translate-y-1/2 translate-x-1/2 rounded-full border-[6px] border-[#0f766e] bg-white" />
          <div className="relative grid h-[26.25rem] grid-rows-3">
            {intents.map((it, i) => (
              <Link key={it.id} href={it.href} className="group relative flex items-center pr-[calc(45%+1.75rem)]">
                <span className={cn("absolute right-[45%] top-1/2 size-[22px] -translate-y-1/2 translate-x-1/2 rounded-full border-[5px] bg-white transition-transform group-hover:scale-125", i === 1 ? "border-[#0f766e]" : "border-[#1e3a8a]")} />
                <div className="w-full rounded-2xl px-1 py-2">
                  <p className="text-[1.1rem] font-black text-[#2f3533]">{it.title} <span className="mr-1 text-[10.5px] font-black tracking-[0.18em] text-[#1e3a8a]/70" dir="ltr">{it.en}</span></p>
                  <p className="mt-1 text-[13px] leading-6 text-[#2f3533]/65">{it.text}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[13.5px] font-extrabold text-[#0f766e]">{it.cta}<ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /></p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ——— فهرست خطوط: هر هدف یک خط با ایستگاه‌های گام‌به‌گام ——— */
function Goals({ bring, setBring, lit }: { bring: Bring | null; setBring: (b: Bring | null) => void; lit: (g: Pick<Goal, "brings">) => boolean }) {
  const go = useGo();
  const reduce = useReducedMotion();
  return (
    <section id="goals" className="mt-28 scroll-mt-24 border-y border-[#e1e6ee] bg-white py-20">
      <div className={W}>
        <div className="flex items-end justify-between gap-10">
          <div>
            <MarkTitle className="text-[2.3rem] font-black text-[#2f3533]" markClass="text-[#1e3a8a]">{goalsHead.title}</MarkTitle>
            <p className="mt-2 text-[15.5px] text-[#2f3533]/70">{goalsHead.text}</p>
          </div>
          {/* چهار گام فلو به شکل یک خط */}
          <div className="flex items-center">
            {flowSteps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5"><span className={cn("size-4 rounded-full border-[4px]", i === 0 ? "border-[#0f766e] bg-white" : "border-[#c5cfdc] bg-white")} /><span className={cn("text-[12px] font-bold", i === 0 ? "text-[#2f3533]" : "text-[#2f3533]/50")}>{s}</span></div>
                {i < flowSteps.length - 1 && <span className="mb-6 h-[4px] w-14 bg-[#c5cfdc]" />}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between">
          <p className="text-[14px] font-extrabold text-[#2f3533]">{goalsHead.label}</p>
          {bring && <button type="button" onClick={() => setBring(null)} className="text-[13px] font-bold text-[#1e3a8a] underline underline-offset-4">نمایش همه خطوط</button>}
        </div>
        <ul className="mt-3 divide-y divide-[#e1e6ee] border-y border-[#e1e6ee]">
          {goals.map((g, i) => {
            const on = lit(g); const I = g.route ? routeIcons[g.route] : toolIcons[g.id];
            return (
              <li key={g.id} className={cn("transition-opacity duration-500", !on && "opacity-35 hover:opacity-100")}>
                <button type="button" onClick={() => (g.route ? go.route(g.route) : go.href(g.href!))} className="group grid w-full grid-cols-[2.5rem_17rem_minmax(0,1fr)_7rem] items-center gap-5 py-5 text-right">
                  {g.route ? <LineBadge n={lineGoals.indexOf(g) + 1} on={!!bring && on} className="size-9 text-[14px]" /> : <span className="grid size-9 place-items-center rounded-[10px] border-2 border-[#2f3533]/20 text-[#2f3533]/60">{I && <I size={17} variant="Bulk" />}</span>}
                  <span><span className="block text-[15.5px] font-black text-[#2f3533]">{g.fullName}</span><span className="mt-0.5 block text-[12.5px] leading-6 text-[#2f3533]/60">{g.text}</span></span>
                  {/* نقشه نواری گام‌ها */}
                  {g.steps.length ? (
                    <span className="relative flex items-start justify-between">
                      <motion.span initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: (i % 4) * 0.05, ease }} style={{ transformOrigin: "right" }}
                        className={cn("absolute inset-x-[6%] top-[7px] h-[5px] rounded-full transition-colors duration-300", "bg-[#c5cfdc] group-hover:bg-[#1e3a8a]")} />
                      {g.steps.map((s, k) => (
                        <span key={k} className="relative flex w-[24%] flex-col items-center gap-2 text-center">
                          <span className="size-[19px] rounded-full border-[4px] border-[#8d99aa] bg-white transition-colors group-hover:border-[#1e3a8a]" />
                          <span className="line-clamp-2 text-[11.5px] font-semibold leading-5 text-[#2f3533]/65">{s}</span>
                        </span>
                      ))}
                    </span>
                  ) : <span className="text-[13px] font-bold text-[#2f3533]/55">مسیر مستقل با فرم سه‌مرحله‌ای خودش</span>}
                  <span className="flex items-center justify-end gap-2 text-[13px] font-extrabold text-[#2f3533]">{g.route ? (g.count ? `${faNumber(g.count)} پروژه` : "به‌زودی") : g.cta}<ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" /></span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 flex items-center justify-between rounded-[1.4rem] border border-[#0f766e]/25 bg-[#f0f7f6] px-7 py-5">
          <p className="text-[15px] font-bold text-[#2f3533]">{proposalCta.text}</p>
          <div className="flex items-center gap-5"><span className="text-[12.5px] font-bold text-[#2f3533]/55">{noSignup}</span>
            <Link href={proposalCta.href} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0f766e] px-6 text-[14px] font-extrabold text-white">{proposalCta.cta}<ArrowLeft size={17} /></Link></div>
        </div>
      </div>
    </section>
  );
}

/* ——— خط حلقوی گروه‌ها دور نقشه ایران ——— */
function Groups() {
  const go = useGo();
  const [g, setG] = useState(groups[0].id);
  const cur = groups.find((x) => x.id === g)!;
  const provs = useMemo(() => listings.filter((l) => l.group === g && l.province).reduce<Record<string, number>>((m, l) => { m[l.province!] = (m[l.province!] ?? 0) + 1; return m; }, {}), [g]);
  const RX = 300, RY = 250;
  return (
    <section className={cn(W, "mt-28")}>
      <MarkTitle className="text-[2.3rem] font-black text-[#2f3533]" markClass="text-[#1e3a8a]">{groupsHead.title}</MarkTitle>
      <p className="mt-2 max-w-[44rem] text-[15.5px] text-[#2f3533]/70">{groupsHead.text}</p>
      <div className="mt-8 grid grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] items-center gap-10" style={vars}>
        <div className="relative aspect-[1.2] w-full">
          <svg viewBox="-360 -300 720 600" className="absolute inset-0 size-full" aria-hidden>
            <ellipse rx={RX} ry={RY} fill="none" stroke="#c5cfdc" strokeWidth="9" />
            <motion.ellipse rx={RX} ry={RY} fill="none" stroke="#1e3a8a" strokeWidth="9" strokeDasharray="60 1800" animate={{ strokeDashoffset: [0, -1900] }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }} />
          </svg>
          <div className="absolute inset-[22%]"><ProvinceMap weights={Object.keys(provs).length ? provs : undefined} base={Object.keys(provs).length ? "fill-[#1e3a8a]" : "fill-[#2f3533]/[0.08]"} hot={null} /></div>
          {groups.map((x, i) => {
            const a = (-90 + (i * 360) / groups.length) * (Math.PI / 180);
            const left = 50 + ((Math.cos(a) * RX) / 720) * 100, top = 50 + ((Math.sin(a) * RY) / 600) * 100; const on = x.id === g;
            return (
              <button key={x.id} type="button" onPointerEnter={() => setG(x.id)} onFocus={() => setG(x.id)} onClick={() => go.group(x.id)} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${left}%`, top: `${top}%` }}>
                <span className={cn("block rounded-full border-[5px] bg-white transition-all", on ? "size-7 border-[#1e3a8a]" : "size-5 border-[#2f3533]")} />
                <span className={cn("absolute w-max rounded-md bg-[#f6f8fb] px-1.5 text-[12.5px] font-extrabold", Math.abs(Math.cos(a)) < 0.35 ? (Math.sin(a) > 0 ? "left-1/2 top-full mt-1.5 -translate-x-1/2" : "left-1/2 bottom-full mb-1.5 -translate-x-1/2") : cn("top-1/2 -translate-y-1/2", left > 50 ? "right-full mr-2" : "left-full ml-2"), on ? "text-[#1e3a8a]" : "text-[#2f3533]/75")}>{x.name} <span className="font-bold text-[#2f3533]/45">{faNumber(x.count)}</span></span>
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={cur.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }} className="rounded-[1.6rem] border border-[#e1e6ee] bg-white p-6">
            <p className="flex items-center gap-2 text-[1.2rem] font-black text-[#2f3533]"><span className="size-5 rounded-full border-[5px] border-[#1e3a8a]" />{cur.name}</p>
            <p className="mt-1 text-[13px] font-bold text-[#2f3533]/55">{faNumber(cur.count)} پروژه در {faNumber(Object.keys(provs).length)} استان</p>
            <ul className="mt-4 space-y-1">
              {cur.subtypes.map((s) => <li key={s.id}><button type="button" onClick={() => go.group(cur.id, s.id)} className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-right text-[13.5px] font-bold text-[#2f3533]/80 hover:bg-[#f6f8fb] hover:text-[#1e3a8a]"><span className="h-[3px] w-3 rounded-full bg-[#c5cfdc] group-hover:bg-[#1e3a8a]" />{s.name}</button></li>)}
            </ul>
            <button type="button" onClick={() => go.group(cur.id)} className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#0f766e] px-5 text-[13.5px] font-extrabold text-white">پروژه‌های {cur.name}<ArrowLeft size={16} /></button>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ——— برنامه‌ریز سفر: جست‌وجوی مستقیم ——— */
function Search() {
  const go = useGo();
  return (
    <section className={cn(W, "mt-24")} style={vars}>
      <div className="rounded-[1.8rem] border-2 border-[#2f3533] bg-white p-8">
        <div className="flex items-end justify-between">
          <div><MarkTitle className="text-[1.8rem] font-black text-[#2f3533]" markClass="text-[#1e3a8a]">{directSearch.title}</MarkTitle><p className="mt-1 text-[14px] text-[#2f3533]/65"><b className="font-extrabold text-[#2f3533]">{directSearch.label}.</b> {directSearch.text}</p></div>
          <div className="flex gap-5 text-[13px] font-bold"><button type="button" onClick={() => go.route("fund")} className="text-[#1e3a8a] underline underline-offset-4">{directSearch.fund.cta}</button><button type="button" onClick={() => go.route("charity")} className="text-[#1e3a8a] underline underline-offset-4">{directSearch.charity.cta}</button></div>
        </div>
        <DirectSearch className="mt-6" />
        <p className="mt-3 text-[12.5px] font-semibold text-[#2f3533]/55">{directSearch.fund.text}</p>
      </div>
    </section>
  );
}

/* ——— تابلوی حرکت: پروژه‌های منتخب ——— */
function Board() {
  return (
    <section className={cn(W, "mt-28")}>
      <div className="flex items-end justify-between">
        <MarkTitle className="text-[2.3rem] font-black text-[#2f3533]" markClass="text-[#1e3a8a]">پروژه‌هایی برای شروع</MarkTitle>
        <Link href="/opportunities" className="inline-flex items-center gap-2 text-[14px] font-extrabold text-[#1e3a8a]">همه {faNumber(totalCount)} فرصت<ArrowLeft size={17} /></Link>
      </div>
      <div className="mt-7 overflow-hidden rounded-[1.6rem] bg-[#1d2430] text-white">
        <div className="grid grid-cols-[5rem_minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_3rem] gap-4 border-b border-white/10 px-6 py-3 text-[12px] font-bold text-white/50">
          <span /><span>پروژه</span><span>محل</span><span>حداقل ورود یا نیاز مالی</span><span>دوره بازگشت</span><span>ریسک</span><span />
        </div>
        {featured.map((l, i) => {
          const o = l.raw as Opportunity; const n = lineGoals.findIndex((g) => l.routes.includes(g.id)) + 1;
          return (
            <motion.div key={l.id} initial={{ opacity: 0, rotateX: -80 }} whileInView={{ opacity: 1, rotateX: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.09, duration: 0.6, ease }} style={{ transformOrigin: "top", perspective: 600 }}>
              <Link href={projectHref("metro", l.id)} className="group grid grid-cols-[5rem_minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_3rem] items-center gap-4 border-b border-white/[0.07] px-6 py-4 transition-colors hover:bg-white/[0.06]">
                <span className="relative h-11 w-16 overflow-hidden rounded-lg"><Image src={l.image} alt="" fill sizes="64px" className="object-cover" /></span>
                <span className="flex items-center gap-3"><LineBadge n={n || 1} /><span className="truncate text-[15px] font-extrabold">{l.title}</span></span>
                <span className="text-[13.5px] font-bold text-white/75">{l.province}، {l.city}</span>
                <span className="text-[14px] font-black tabular-nums text-[#9dbff9]">{l.stats[0].value}</span>
                <span className="text-[14px] font-bold tabular-nums">{o.paybackYears != null ? `${faNumber(o.paybackYears)} سال` : "نامعلوم"}</span>
                <span className="text-[13.5px] font-bold">{l.stats[2].value}</span>
                <ArrowLeft size={18} className="text-white/60 transition-transform group-hover:-translate-x-1 group-hover:text-white" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function Narratives() {
  const go = useGo();
  return (
    <section className={cn(W, "mt-28 grid grid-cols-2 gap-5")}>
      {stories.map((s) => (
        <div key={s.id} className="group relative isolate flex min-h-[34rem] flex-col justify-end overflow-hidden rounded-[1.8rem] p-6">
          <Image src={s.image} alt="" fill sizes="50vw" className="-z-10 object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="rounded-[1.4rem] bg-white p-7">
            <MarkTitle className="text-[1.75rem] font-black leading-[1.5] text-[#2f3533]" markClass="text-[#1e3a8a]">{s.title[0]}<br />{s.title[1]}</MarkTitle>
            <p className="mt-3 text-[14px] font-extrabold text-[#1e3a8a]">{s.kicker}</p>
            <p className="mt-1 text-[14px] leading-7 text-[#2f3533]/70">{s.text}</p>
            <button type="button" onClick={() => (s.route ? go.route(s.route) : go.href(s.href!))} className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#0f766e] px-5 text-[13.5px] font-extrabold text-white">{s.cta}<ArrowLeft size={16} /></button>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ——— روش کار: یک خط سه‌ایستگاهی با قطار ——— */
function Method() {
  const reduce = useReducedMotion();
  return (
    <section className={cn(W, "mt-28")}>
      <MarkTitle className="text-[2.3rem] font-black text-[#2f3533]" markClass="text-[#1e3a8a]">سه ایستگاه تا تصمیم</MarkTitle>
      <div className="relative mt-12">
        <div className="absolute inset-x-[8%] top-[18px] h-[8px] rounded-full bg-[#c5cfdc]" />
        <motion.div initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 2.2, ease }} style={{ transformOrigin: "right" }} className="absolute inset-x-[8%] top-[18px] h-[8px] rounded-full bg-[#1e3a8a]" />
        <div className="relative grid grid-cols-3 gap-8">
          {method.map((m, i) => (
            <motion.div key={m.en} initial={reduce ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.6, duration: 0.6 }} className="flex flex-col items-center text-center">
              <span className="size-11 rounded-full border-[7px] border-[#1e3a8a] bg-white" />
              <p className="mt-4 text-[1.3rem] font-black text-[#2f3533]">{m.title}</p>
              <p className="mt-2 max-w-[22rem] text-[14px] leading-7 text-[#2f3533]/70">{m.text}</p>
              <span className="mt-3 text-[11px] font-black tracking-[0.2em] text-[#1e3a8a]/70" dir="ltr">{m.en}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ——— پرسش‌ها: هر پرسش یک ایستگاه روی خط عمودی ——— */
function Knowledge() {
  const [open, setOpen] = useState(knowledge.topics[0].id);
  const hydrated = useHydrated(); const saved = useStore((s) => s.saved);
  return (
    <section className={cn(W, "mt-28 grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-16")}>
      <div>
        <MarkTitle className="text-[2.2rem] font-black leading-[1.5] text-[#2f3533]" markClass="text-[#1e3a8a]">{knowledge.title}</MarkTitle>
        <p className="mt-3 text-[15px] leading-8 text-[#2f3533]/70">{knowledge.text}</p>
        <Link href={knowledge.href} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#0f766e] px-6 text-[14px] font-extrabold text-white">{knowledge.cta}<ArrowLeft size={17} /></Link>
        <div className="mt-10 border-t-2 border-[#2f3533] pt-6">
          <p className="text-[15px] font-black text-[#2f3533]">{knowledge.next.title}</p>
          <p className="mt-1 text-[13.5px] leading-7 text-[#2f3533]/70">{knowledge.next.text}</p>
          <div className="mt-4 flex flex-wrap gap-2"><Link href={knowledge.href} className="rounded-full border border-[#e1e6ee] bg-white px-4 py-2 text-[13px] font-bold text-[#1e3a8a]">{knowledge.cta}</Link><Link href="/saved" className="rounded-full border border-[#e1e6ee] bg-white px-4 py-2 text-[13px] font-bold text-[#1e3a8a]">{knowledge.next.saved}{hydrated && saved.length ? ` (${faNumber(saved.length)})` : ""}</Link></div>
          <p className="mt-6 text-[12.5px] font-extrabold text-[#2f3533]/55">ایستگاه‌های تبادل: خدمات</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">{services.map((s) => <li key={s.id}><Link href={`/tools/${s.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-bold text-[#2f3533]/75 ring-1 ring-[#e1e6ee] hover:text-[#1e3a8a]"><span className="size-2 rounded-full border-2 border-[#1e3a8a]" />{s.name}</Link></li>)}</ul>
        </div>
      </div>
      <ol className="relative pr-8">
        <span className="absolute right-[11px] top-3 bottom-3 w-[6px] rounded-full bg-[#c5cfdc]" />
        {knowledge.topics.map((t) => { const on = open === t.id;
          return (
            <li key={t.id} className="relative pb-2">
              <span className={cn("absolute -right-[29px] top-4 size-[22px] rounded-full border-[5px] bg-white transition-colors", on ? "border-[#1e3a8a]" : "border-[#8d99aa]")} />
              <button type="button" aria-expanded={on} onClick={() => setOpen(on ? "" : t.id)} className={cn("w-full py-3 text-right text-[15px] leading-7", on ? "font-black text-[#2f3533]" : "font-bold text-[#2f3533]/70 hover:text-[#2f3533]")}>{t.title}</button>
              <AnimatePresence initial={false}>
                {on && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden"><div className="space-y-2 rounded-2xl bg-white p-5 text-[14px] leading-8 text-[#2f3533]/75 ring-1 ring-[#e1e6ee]">{t.body.map((b, k) => <p key={k}>{b.lead && <b className="font-extrabold text-[#2f3533]">{b.lead} </b>}{b.text}</p>)}</div></motion.div>}
              </AnimatePresence>
            </li>
          ); })}
      </ol>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-32 border-t border-[#e1e6ee] bg-white pb-12 pt-14">
      <div className={W}>
        {/* میان‌برها روی یک خط */}
        <div className="relative">
          <span className="absolute inset-x-0 top-[9px] h-[6px] rounded-full bg-[#2f3533]" />
          <ul className="relative flex justify-between">
            {quickNav.map((q) => <li key={q.label} className="flex w-[11%] flex-col items-center text-center"><Link href={q.href} className="group flex flex-col items-center gap-2"><span className="size-6 rounded-full border-[5px] border-[#2f3533] bg-white transition-colors group-hover:border-[#1e3a8a]" /><span className="text-[12px] font-bold leading-5 text-[#2f3533]/75 group-hover:text-[#1e3a8a]">{q.label}</span></Link></li>)}
          </ul>
        </div>
        <div className="mt-12 flex items-end justify-between">
          <div><Logo /><p className="mt-3 text-[13.5px] font-bold text-[#2f3533]/70">{brandLine}</p><p className="mt-3 text-[12.5px] text-[#2f3533]/55">{footer.line} · {footer.note}</p></div>
          <p className="text-[11.5px] text-[#2f3533]/45" dir="ltr">{footer.photo}</p>
        </div>
      </div>
    </footer>
  );
}

export function MetroLanding() {
  const [bring, setBring] = useState<Bring | null>(null);
  const lit = (g: Pick<Goal, "brings">) => bring == null || g.brings.includes(bring);
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#2f3533] selection:bg-[#1e3a8a] selection:text-white" style={vars}>
      <Nav />
      <Hero bring={bring} setBring={setBring} lit={lit} />
      <Stories />
      <Intro />
      <Goals bring={bring} setBring={setBring} lit={lit} />
      <Groups />
      <Search />
      <Board />
      <Narratives />
      <Method />
      <Knowledge />
      <Footer />
      <ConceptSwitch current="metro" />
    </main>
  );
}

/* ═════════ صفحه جزئیات «نقشه مسیر» ═════════ */
function Panel({ title, children, className, note }: { title: string; children: ReactNode; className?: string; note?: string }) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, ease }} className={cn("border-t-[5px] border-[#2f3533] bg-white p-7", className)}>
      <MarkTitle as="h3" className="text-[17px] font-black text-[#2f3533]" markClass="text-[#1e3a8a] !h-[14px] !w-11">{title}</MarkTitle>
      {note && <p className="mt-1 text-[12.5px] text-[#2f3533]/55">{note}</p>}
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

function Detail({ l }: { l: Listing }) {
  const s = sheetOf(l);
  const o = l.raw as Opportunity & { exit?: string };
  const expert = o.expert;
  const reduce = useReducedMotion();
  const steps = s.steps.length ? s.steps : s.checks;
  const lineNos = lineGoals.map((g, i) => (l.routes.includes(g.id) ? i + 1 : 0)).filter(Boolean);
  const { first, rest } = arrange(chartList(s, { time: "زمان‌بندی سفر سرمایه", timeNote: "از امروز تا بازگشت سرمایه؛ نشانگر را روی نمودار ببرید.", ladder: "وضعیت خط" }));
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#2f3533] selection:bg-[#1e3a8a] selection:text-white" style={vars}>
      <Nav />
      <section className={cn(W, "pt-8")}>
        <div className="relative h-[27rem] overflow-hidden rounded-[2rem]">
          <Image src={l.image} alt="" fill sizes="90vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-l from-black/45 via-black/10 to-transparent" />
          {/* تابلوی ایستگاه: نام پروژه */}
          <motion.div initial={reduce ? false : { y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease }} className="absolute bottom-7 right-7 max-w-[46rem] rounded-[1.4rem] bg-white p-7 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]">
            <p className="flex items-center gap-2 text-[13px] font-bold text-[#2f3533]/60"><Link href="/concepts/metro" className="hover:text-[#1e3a8a]">صفحه نخست</Link><span>/</span><span>{l.tags.join(" · ")}</span></p>
            <MarkTitle as="h1" className="mt-2 text-[2.4rem] font-black leading-[1.35] text-[#2f3533]" markClass="text-[#1e3a8a] !w-16 !h-5">{l.title}</MarkTitle>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] font-bold text-[#2f3533]/70">
              <span className="flex items-center gap-1.5">{lineNos.map((n) => <LineBadge key={n} n={n} />)}<span className="mr-1">{l.routes.map((r) => goals.find((g) => g.id === r)?.name).join("، ")}</span></span>
              {l.province && <span className="inline-flex items-center gap-1.5"><Location size={16} />{l.province}، {l.city}</span>}
              <span>{o.stage}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* مسیر ورود به شکل نقشه نواری */}
      {steps.length > 0 && (
        <section className={cn(W, "mt-10")}>
          <div className="rounded-[1.6rem] bg-white p-8 ring-1 ring-[#e1e6ee]">
            <MarkTitle as="h2" className="text-[1.35rem] font-black" markClass="text-[#1e3a8a]">{s.steps.length ? "ایستگاه‌های ورود به این پروژه" : "موارد بررسی پیش از ورود"}</MarkTitle>
            <div className="relative mt-8">
              <span className="absolute inset-x-[5%] top-[12px] h-[8px] rounded-full bg-[#c5cfdc]" />
              <motion.span initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease }} style={{ transformOrigin: "right" }} className="absolute inset-x-[5%] top-[12px] h-[8px] rounded-full bg-[#1e3a8a]" />
              <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))` }}>
                {steps.map((st, i) => (
                  <motion.li key={i} initial={reduce ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.3 }} className="flex flex-col items-center px-3 text-center">
                    <span className="grid size-8 place-items-center rounded-full border-[6px] border-[#1e3a8a] bg-white" />
                    <span className="mt-3 text-[11.5px] font-black text-[#1e3a8a]">ایستگاه {faNumber(i + 1)}</span>
                    <span className="mt-1 text-[13.5px] font-bold leading-7 text-[#2f3533]">{st}</span>
                  </motion.li>
                ))}
              </ol>
            </div>
            {s.steps.length > 0 && s.checks.length > 0 && <p className="mt-6 border-t border-[#e1e6ee] pt-4 text-[13px] leading-7 text-[#2f3533]/70"><b className="font-extrabold text-[#2f3533]">موارد بررسی: </b>{s.checks.join("؛ ")}</p>}
          </div>
        </section>
      )}

      <div className={cn(W, "mt-6 grid grid-cols-12 gap-5")}>
        {first && <Panel title={first.title} note={first.note} className="col-span-8">{first.node}</Panel>}
        <div className={cn("space-y-5", first ? "col-span-4" : "col-span-12")}>
          <div className="flex flex-col gap-3 rounded-[1.4rem] bg-[#1d2430] p-6 text-white">
            {l.stats.map((x) => <div key={x.label} className="flex items-baseline justify-between border-b border-white/10 pb-2.5 last:border-0 last:pb-0"><span className="text-[12.5px] font-bold text-white/55">{x.label}</span><span className="text-[15px] font-black tabular-nums">{x.value}</span></div>)}
          </div>
          {!s.lanes.length && <p className="rounded-xl bg-white px-4 py-3 text-[12.5px] leading-6 text-[#2f3533]/65 ring-1 ring-[#e1e6ee]">هیچ‌کدام از زمان‌های این مورد اعلام نشده است؛ برای همین نمودار زمانی ندارد.</p>}
          <div className="flex gap-2"><SaveButton id={l.id} label className="h-12 flex-1 rounded-full bg-[#0f766e] px-5 font-extrabold text-white hover:bg-[#0d5f59]" /><CompareToggle id={l.id} className="border-2 border-[#2f3533]/15 text-[#2f3533]" /></div>
          <Link href={`/opportunities/${encodeURIComponent(l.id)}`} className="block text-center text-[13px] font-bold text-[#2f3533]/60 underline underline-offset-4">صفحه جزئیات فعلی</Link>
        </div>
        {rest.map((c, i, arr) => <Panel key={c.id} title={c.title} note={c.note} className={spanClass[spans12(arr.length)[i]]}>{c.node}</Panel>)}

        <Panel title="قرارداد و پول" className={l.province ? "col-span-8" : "col-span-12"}>
          <dl className="grid grid-cols-2 gap-x-10 gap-y-5 text-[14px] leading-7">
            {[["مدل قرارداد", o.model], ["تأمین مالی", o.finance], ["شیوه بازپرداخت", o.repay], ["مالکیت و سهم", o.ownership], ["شرایط خروج", o.exit]].filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="text-[12px] font-bold text-[#2f3533]/55">{k}</dt><dd className="font-semibold text-[#2f3533]">{v}</dd></div>)}
          </dl>
          {o.caution && <p className="mt-6 rounded-xl bg-[#fcebe5] px-4 py-3 text-[13.5px] font-semibold leading-7 text-[#b8461f]">پیش از تصمیم: {o.caution}</p>}
        </Panel>
        {l.province && <Panel title="محل" className="col-span-4"><ProvinceMap hot={l.province} base="fill-[#2f3533]/[0.08]" fill="fill-[#1e3a8a]" /><p className="mt-2 text-[13.5px] font-extrabold">{l.province}، {l.city}</p></Panel>}

        <div className="col-span-12 flex items-center justify-between rounded-[1.6rem] border-2 border-[#2f3533] bg-white p-7">
          {expert ? (
            <div className="flex items-center gap-5"><span className="grid size-14 place-items-center rounded-full border-[6px] border-[#1e3a8a]"><Call size={20} variant="Bulk" className="text-[#1e3a8a]" /></span><div><p className="text-[13px] font-bold text-[#2f3533]/55">کارشناس این پروژه</p><p className="text-[1.2rem] font-black">{expert.name}</p></div>
              <a href={`tel:${expert.mobile}`} dir="ltr" className="mr-6 rounded-full bg-[#f6f8fb] px-5 py-2.5 text-[1.05rem] font-black tracking-wide ring-1 ring-[#e1e6ee]">{formatMobile(expert.mobile)}</a></div>
          ) : (
            <a href={o.guideFileUrl ?? `/guide/${encodeURIComponent(l.id)}`} className="inline-flex items-center gap-3 text-[15px] font-extrabold text-[#1e3a8a]"><DocumentDownload size={22} />دریافت فایل راهنمای این پروژه</a>
          )}
          <Link href="/opportunities" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0f766e] px-6 text-[14px] font-extrabold text-white">پروژه‌های مشابه<ArrowLeft size={17} /></Link>
        </div>
      </div>
      <Footer />
      <ConceptSwitch current="metro" />
    </main>
  );
}

export function MetroDetail() {
  return <WithProject>{(l) => (l ? <Detail l={l} /> : null)}</WithProject>;
}
