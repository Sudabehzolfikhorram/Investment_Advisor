"use client";
// کانسپت ۱ «کاشی و گره»: پالت کاشی ایرانی، لاجوردی (کبالت) میدان‌های بزرگ را می‌گیرد و فیروزه‌ای (سبز اصلی) فقط اقدام است.
// امضا: ستاره هشت‌پر. هر پر یک مسیر است، آورده‌ای که انتخاب می‌کنید پرهای جورشده را روشن می‌کند و مرکز ستاره شمار پروژه‌ها را می‌گوید.
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlgoPattern, Logo } from "@/components/brand/algo-pattern";
import { ArrowLeft, Call, DocumentDownload, Location, Login } from "@/components/iconsax";
import { routeIcons, groupIcons, toolIcons } from "@/components/icons";
import { brandLine, brings, byProvince, directSearch, featured, flowSteps, footer, goals, goalsHead, groups, groupsHead, hero, heroStories, intents, intro, knowledge, method, navLinks, noSignup, proposalCta, quickNav, services, stories, totalCount, type Bring, type Goal } from "@/components/concepts/content";
import { CompareToggle, ConceptSwitch, DirectSearch, MarkTitle, ProvinceMap, SaveButton, WithProject, projectHref, spans12, useGo } from "@/components/concepts/shared";
import { arrange, chartList } from "@/components/concepts/charts";
import { sheetOf } from "@/lib/sheet";
import { listings } from "@/lib/listings";
import { forRoute } from "@/lib/match";
import { useHydrated, useStore } from "@/lib/store";
import type { Listing, Opportunity, RouteId } from "@/types";
import { cn, faNumber, formatMobile } from "@/lib/utils";

const vars = { "--cv-accent": "#1e3a8a", "--cv-soft": "#e8edf7", "--cv-ink": "#2f3533", "--cv-grid": "#dfe6f0", "--cv-surface": "#ffffff", "--cv-warn": "#e0603f" } as CSSProperties;
const ease = [0.16, 1, 0.3, 1] as const;
const W = "mx-auto max-w-[84rem] px-8";

/* ——— هندسه ستاره هشت‌پر ——— */
const R = 228, r = 112;
const pt = (deg: number, rad: number) => [Math.cos((deg * Math.PI) / 180) * rad, Math.sin((deg * Math.PI) / 180) * rad] as const;
const starRoutes: RouteId[] = ["investor", "fund", "contractor", "operator", "buyer", "lessee", "heritage", "charity"];
const rays = starRoutes.map((id, k) => {
  const a = -90 + k * 45;
  const [x1, y1] = pt(a - 22.5, r), [x2, y2] = pt(a, R), [x3, y3] = pt(a + 22.5, r);
  const [ix, iy] = pt(a, (R + r) / 2 + 4), [lx, ly] = pt(a, R + 46);
  return { id, a, d: `M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} L${x3.toFixed(1)},${y3.toFixed(1)} Z`, icon: [ix, iy], label: [lx, ly] };
});
const octagon = Array.from({ length: 8 }, (_, k) => pt(-90 + k * 45 + 22.5, r)).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

function useBringState() {
  const [bring, setBring] = useState<Bring | null>(null);
  const lit = (g: Pick<Goal, "brings">) => bring == null || g.brings.includes(bring);
  return { bring, setBring, lit };
}

/* ——— ناوبری ——— */
function Nav() {
  const hydrated = useHydrated();
  const { user, saved, compare, openLogin } = useStore();
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className={cn(W, "flex h-24 items-center justify-between")}>
        <Link href="/concepts/girih" className="flex items-center gap-4"><Logo light /><span className="hidden border-r border-white/20 pr-4 text-[12.5px] font-bold text-white/70 lg:inline">{brandLine}</span></Link>
        <nav className="flex items-center gap-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="relative rounded-full px-4 py-2 text-[14px] font-bold text-white/80 transition-colors hover:bg-white/10 hover:text-white">
              {l.label}
              {hydrated && l.href === "/saved" && saved.length > 0 && <span className="mr-1.5 rounded-full bg-white px-1.5 text-[11px] font-black text-[#08337d]">{faNumber(saved.length)}</span>}
              {hydrated && l.href === "/compare" && compare.length > 0 && <span className="mr-1.5 rounded-full bg-[#5cc4b8] px-1.5 text-[11px] font-black text-[#042560]">{faNumber(compare.length)}</span>}
            </Link>
          ))}
          {!(hydrated && user) && <button type="button" onClick={() => openLogin()} className="mr-3 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-extrabold text-[#08337d] transition-transform hover:-translate-y-0.5"><Login size={18} />ورود</button>}
        </nav>
      </div>
    </header>
  );
}

/* ——— هیرو: ستاره مسیرها ——— */
function Star({ bring, lit }: { bring: Bring | null; lit: (g: Pick<Goal, "brings">) => boolean }) {
  const reduce = useReducedMotion();
  const go = useGo();
  const [hover, setHover] = useState<RouteId | null>(null);
  const routeGoals = goals.filter((g) => g.route);
  const on = routeGoals.filter(lit);
  const count = useMemo(() => new Set(on.flatMap((g) => forRoute(listings, g.route!).map((l) => l.id))).size, [on]);
  const h = routeGoals.find((g) => g.id === hover);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[38rem]">
      <svg viewBox="-300 -300 600 600" className="absolute inset-0 size-full overflow-visible">
        {/* حلقه‌های گره پشت ستاره */}
        <motion.circle r={R + 18} fill="none" stroke="rgb(255 255 255 / 0.14)" strokeWidth="1" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease }} />
        <polygon points={Array.from({ length: 16 }, (_, k) => pt(-90 + k * 22.5, k % 2 ? R + 18 : R - 40)).map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="1"
          className="girih-ray" style={reduce ? undefined : { animation: "girih-ray 1.8s cubic-bezier(.16,1,.3,1) both, girih-spin 90s linear 1.8s infinite" }} />
        {rays.map((ray, k) => {
          const g = routeGoals.find((x) => x.id === ray.id)!;
          const isOn = lit(g); const isHover = hover === ray.id;
          return (
            <path key={ray.id} d={ray.d} strokeWidth="5" strokeLinejoin="round" stroke="#08337d" role="button" tabIndex={0} aria-label={`${g.name}، ${faNumber(g.count)} پروژه`}
              style={reduce ? undefined : { animation: `girih-ray 0.9s cubic-bezier(.16,1,.3,1) ${0.15 + k * 0.07}s both` }}
              className={cn("girih-ray cursor-pointer outline-none transition-[fill] duration-500 focus-visible:fill-[#0f766e]", isHover ? "fill-[#0f766e]" : isOn ? "fill-white" : "fill-[#172a63]")}
              onPointerEnter={() => setHover(ray.id)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(ray.id)} onBlur={() => setHover(null)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go.route(ray.id); } }} onClick={() => go.route(ray.id)} />
          );
        })}
        <polygon points={octagon} fill="#042560" stroke="#08337d" strokeWidth="5" strokeLinejoin="round" className="girih-ray" style={reduce ? undefined : { animation: "girih-ray 0.8s cubic-bezier(.16,1,.3,1) 0.05s both" }} />
      </svg>
      {/* آیکون و نام هر پر (HTML برای خوانایی فارسی) */}
      {rays.map((ray) => {
        const g = routeGoals.find((x) => x.id === ray.id)!; const I = routeIcons[ray.id]; const isOn = lit(g) || hover === ray.id;
        return (
          <div key={ray.id} className="pointer-events-none contents">
            <span className={cn("absolute -translate-x-1/2 -translate-y-1/2 transition-colors duration-500", hover === ray.id ? "text-white" : isOn ? "text-[#08337d]" : "text-white/35")} style={{ left: `${50 + (ray.icon[0] / 600) * 100}%`, top: `${50 + (ray.icon[1] / 600) * 100}%` }}><I size={24} variant="Bulk" /></span>
            <span className={cn("absolute w-36 -translate-x-1/2 -translate-y-1/2 text-center text-[13px] font-extrabold leading-5 transition-opacity duration-500", isOn ? "text-white" : "text-white/40")} style={{ left: `${50 + (ray.label[0] / 600) * 100}%`, top: `${50 + (ray.label[1] / 600) * 100}%` }}>{g.name}</span>
          </div>
        );
      })}
      {/* مرکز: شمار پروژه‌های مسیرهای روشن یا شرح پری که نشانگر روی آن است */}
      <div className="pointer-events-none absolute inset-[31%] grid place-items-center text-center">
        <AnimatePresence mode="wait">
          {h ? (
            <motion.div key={h.id} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="px-2">
              <p className="text-[13px] font-extrabold text-white">{h.fullName}</p>
              <p className="mt-1 text-[11.5px] font-semibold leading-5 text-white/70">{h.text}</p>
              <p className="mt-1.5 text-[12px] font-black text-[#5cc4b8]">{h.count ? `${faNumber(h.count)} پروژه` : "به‌زودی"}</p>
            </motion.div>
          ) : (
            <motion.div key={`c${bring}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <p className="text-[3.4rem] font-black leading-none text-white tabular-nums">{faNumber(count)}</p>
              <p className="mt-2 text-[12.5px] font-bold leading-5 text-white/70">پروژه در {faNumber(on.length)} مسیر<br />{bring ? "با آورده شما جور است" : "روی هر پر بروید"}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Hero({ state }: { state: ReturnType<typeof useBringState> }) {
  const go = useGo();
  const services4 = [services.find((s) => s.id === "land-preparation"), services.find((s) => s.id === "foreign-investment"), services.find((s) => s.id === "proposal"), services.find((s) => s.id === "ideas")].filter(Boolean) as typeof services;
  return (
    <section className="relative isolate overflow-hidden bg-[#08337d] pb-16 pt-32 text-white">
      <AlgoPattern className="inset-0 -z-10 size-full text-white/[0.07]" fade="none" scale={0.9} animated />
      <div aria-hidden className="absolute left-[8%] top-[18%] -z-10 size-[44rem] rounded-full bg-[#1e3a8a] opacity-60 blur-[120px]" />
      <div className={cn(W, "grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-12")}>
        <div>
          <MarkTitle as="h1" markClass="text-[#5cc4b8] !w-20 !h-6" className="text-[4.6rem] font-black leading-[1.25] tracking-tight">{hero.title[0]}<br />{hero.title[1]}</MarkTitle>
          <p className="mt-6 text-[1.2rem] font-extrabold text-[#9dbff9]">{hero.kicker}</p>
          <p className="mt-2 max-w-[32rem] text-[16px] leading-8 text-white/75">{hero.sub}</p>
          {/* کار اصلی صفحه: آورده را بگویید تا مسیرها روشن شوند */}
          <fieldset className="mt-9">
            <legend className="mb-3 text-[14px] font-extrabold text-white">آورده شما چیست؟</legend>
            <div className="flex flex-wrap gap-2">
              {brings.map((b) => (
                <button key={b.id} type="button" aria-pressed={state.bring === b.id} onClick={() => state.setBring(state.bring === b.id ? null : b.id)}
                  className={cn("h-11 rounded-full border px-4 text-[13.5px] font-bold transition-all duration-300", state.bring === b.id ? "border-white bg-white text-[#08337d] shadow-[0_10px_30px_-10px_rgb(255_255_255/0.6)]" : "border-white/25 text-white/85 hover:border-white/60 hover:bg-white/10")}>{b.label}</button>
              ))}
            </div>
          </fieldset>
          <div className="mt-9 flex items-center gap-3">
            <button type="button" onClick={() => go.href(hero.primary.href)} className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#0f766e] pl-3 pr-7 text-[15.5px] font-extrabold text-white shadow-[0_18px_40px_-16px_rgb(15_118_110/0.9)] transition-transform hover:-translate-y-0.5">
              {hero.primary.label}<span className="grid size-9 place-items-center rounded-full bg-white/15 transition-transform group-hover:-translate-x-1"><ArrowLeft size={18} /></span></button>
            <Link href={hero.secondary.href} className="inline-flex h-14 items-center rounded-full px-6 text-[15px] font-bold text-white/85 underline decoration-white/30 underline-offset-8 hover:text-white hover:decoration-white">{hero.secondary.label}</Link>
          </div>
        </div>
        <div>
          <Star bring={state.bring} lit={state.lit} />
          {/* چهار چلیپا: مسیرهای مستقل کنار ستاره */}
          <div className="mx-auto mt-2 grid max-w-[34rem] grid-cols-2 gap-2">
            {services4.map((s) => { const I = toolIcons[s.id]; const on = state.bring == null || (state.bring === "plan" ? ["proposal", "ideas"].includes(s.id) : goals.find((g) => g.id === s.id)?.brings.includes(state.bring));
              return (
                <Link key={s.id} href={`/tools/${s.id}`} className={cn("group flex items-center gap-2.5 rounded-2xl border px-3 py-3 transition-all duration-500", on ? "border-white/25 bg-white/[0.08] hover:bg-white/15" : "border-white/10 opacity-40")}>
                  <span className="grid size-9 shrink-0 place-items-center text-[#5cc4b8] [clip-path:none]"><Cross /><I size={17} variant="Bulk" className="absolute" /></span>
                  <span className="text-[12px] font-bold leading-5 text-white/85">{s.name}</span>
                </Link>
              ); })}
          </div>
        </div>
      </div>
    </section>
  );
}

/** چلیپا (گره چهارپر) پشت آیکون خدمات مستقل */
function Cross() {
  return <svg viewBox="-10 -10 20 20" className="absolute size-9" aria-hidden><path d="M-3,-10 H3 V-3 H10 V3 H3 V10 H-3 V3 H-10 V-3 H-3 Z" fill="currentColor" opacity="0.18" /></svg>;
}

/* ——— سه زاویه: عکس از پنجره ستاره‌ای دیده می‌شود و با نشانگر کامل باز می‌شود ——— */
function Stories() {
  const go = useGo();
  return (
    <section className={cn(W, "mt-24")}>
      <MarkTitle className="text-[2.1rem] font-black text-[#2f3533]" markClass="text-[#1e3a8a]">{heroStories.title}</MarkTitle>
      <div className="mt-8 grid grid-cols-3 gap-5">
        {heroStories.items.map((s, i) => (
          <motion.button key={s.n} type="button" onClick={() => go.route(s.routes[0])} initial="rest" whileHover="open" animate="rest" className="group relative isolate h-[26rem] overflow-hidden rounded-[2rem] bg-[#08337d] text-right">
            <motion.div variants={{ rest: { clipPath: "circle(30% at 50% 42%)" }, open: { clipPath: "circle(80% at 50% 42%)" } }} transition={{ duration: 0.8, ease }} className="absolute inset-0 -z-10">
              <Image src={s.image} alt="" fill sizes="33vw" className="object-cover grayscale-[35%] transition-[filter] duration-700 group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </motion.div>
            <AlgoPattern className="inset-0 -z-20 size-full text-white/10" fade="radial" scale={0.5} />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white">
              <span className="text-[3rem] font-black leading-none text-white/25">{faNumber(s.n)}</span>
              <p className="mt-1 text-[1.45rem] font-black">{s.name}</p>
              <p className="mt-2 text-[13px] font-semibold text-white/70">{s.routes.map((id) => goals.find((g) => g.id === id)?.name).join("، ")}</p>
            </div>
            <span className="absolute left-6 top-6 grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-transform duration-500 group-hover:-translate-x-1"><ArrowLeft size={18} /></span>
          </motion.button>
        ))}
      </div>
      <p className="mt-3 text-[12px] font-semibold text-[#2f3533]/55">{hero.imageNote}</p>
    </section>
  );
}

/* ——— یک نقطه شروع: سه نیت ورود + میان‌برها ——— */
function Intro() {
  const fills = ["bg-white text-[#2f3533] ring-1 ring-[#dfe6f0]", "bg-[#0f766e] text-white", "bg-[#042560] text-white"];
  return (
    <section className={cn(W, "mt-28")}>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-end gap-16">
        <MarkTitle className="text-[2.6rem] font-black leading-[1.45] text-[#2f3533]" markClass="text-[#1e3a8a]">{intro.title[0]}<br />{intro.title[1]}</MarkTitle>
        <div>
          <p className="text-[1.15rem] font-extrabold text-[#1e3a8a]">{intro.kicker}</p>
          <p className="mt-2 max-w-[38rem] text-[15.5px] leading-8 text-[#2f3533]/75">{intro.text}</p>
        </div>
      </div>
      <div className="mt-10 grid grid-cols-3 overflow-hidden rounded-[2rem]">
        {intents.map((it, i) => (
          <Link key={it.id} href={it.href} className={cn("group relative isolate flex min-h-[17rem] flex-col p-8 transition-[filter] hover:brightness-[1.06]", fills[i], i === 0 && "rounded-r-[2rem]")}>
            {i > 0 && <AlgoPattern className="inset-0 -z-10 size-full text-white/[0.08]" fade="left" scale={0.55} />}
            <span className={cn("text-[11px] font-black tracking-[0.2em]", i ? "text-white/50" : "text-[#1e3a8a]")} dir="ltr">{it.en}</span>
            <p className="mt-4 text-[1.4rem] font-black leading-9">{it.title}</p>
            <p className={cn("mt-2 text-[14px] leading-7", i ? "text-white/75" : "text-[#2f3533]/70")}>{it.text}</p>
            <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[14px] font-extrabold">{it.cta}<ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" /></span>
          </Link>
        ))}
      </div>
      <QuickNav />
    </section>
  );
}

function QuickNav() {
  const hydrated = useHydrated(); const saved = useStore((s) => s.saved);
  return (
    <ul className="mt-5 flex flex-wrap gap-2">
      {quickNav.map((q) => (
        <li key={q.href + q.label}><Link href={q.href} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dfe6f0] bg-white px-4 text-[13px] font-bold text-[#2f3533]/80 transition-all hover:-translate-y-0.5 hover:border-[#1e3a8a]/40 hover:text-[#1e3a8a]">
          <span className="size-1.5 rotate-45 bg-[#1e3a8a]" />{q.label}{q.saved && <span className="rounded-md bg-[#e8edf7] px-1.5 text-[11px] font-black text-[#1e3a8a]">{faNumber(hydrated ? saved.length : 0)}</span>}</Link></li>
      ))}
    </ul>
  );
}

/* ——— هدف ورود: دیوار کاشی ده هدف ——— */
function Goals({ state }: { state: ReturnType<typeof useBringState> }) {
  const go = useGo();
  return (
    <section id="goals" className="relative isolate mt-28 scroll-mt-10 overflow-hidden bg-[#eef3fb] py-20">
      <AlgoPattern className="-left-20 top-0 -z-10 h-full w-1/2 text-[#1e3a8a]/[0.09]" fade="left" />
      <div className={W}>
        <div className="flex items-end justify-between gap-10">
          <div>
            <MarkTitle className="text-[2.3rem] font-black text-[#2f3533]" markClass="text-[#1e3a8a]">{goalsHead.title}</MarkTitle>
            <p className="mt-2 text-[15.5px] text-[#2f3533]/70">{goalsHead.text}</p>
          </div>
          {/* چهار گام فلوی جست‌وجو */}
          <ol className="flex items-center gap-1.5">
            {flowSteps.map((s, i) => (
              <li key={s} className="flex items-center gap-1.5">
                <span className={cn("inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[12.5px] font-bold", i === 0 ? "bg-[#1e3a8a] text-white" : "bg-white text-[#2f3533]/60")}><span className="tabular-nums">{faNumber(i + 1)}</span>{s}</span>
                {i < flowSteps.length - 1 && <span className="h-px w-4 bg-[#2f3533]/20" />}
              </li>
            ))}
          </ol>
        </div>
        {state.bring && <p className="mt-6 text-[13.5px] font-bold text-[#1e3a8a]">آورده «{brings.find((b) => b.id === state.bring)?.short}» انتخاب شده، هدف‌های جورشده پررنگ‌اند. <button type="button" className="underline underline-offset-4" onClick={() => state.setBring(null)}>همه را نشان بده</button></p>}
        <p className="mt-8 text-[14px] font-extrabold text-[#2f3533]">{goalsHead.label}</p>
        <div className="mt-3 grid grid-cols-5 gap-3">
          {goals.map((g, i) => {
            const I = g.route ? routeIcons[g.route] : toolIcons[g.id]; const on = state.lit(g);
            return (
              <motion.button key={g.id} type="button" onClick={() => (g.route ? go.route(g.route) : go.href(g.href!))} layout
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 5) * 0.06, duration: 0.7, ease }}
                className={cn("group relative isolate flex min-h-[17.5rem] flex-col overflow-hidden rounded-[1.6rem] bg-white p-6 text-right ring-1 ring-[#dfe6f0] transition-[opacity,box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-34px_rgb(8_51_125/0.55)]", !on && "opacity-35 saturate-0 hover:opacity-100 hover:saturate-100", !g.route && "bg-[#f7f9fd]")}>
                {/* کاشی لاجوردی از گوشه بالا می‌آید */}
                <span aria-hidden className="absolute -left-10 -top-10 -z-10 size-28 rotate-45 rounded-[1.2rem] bg-[#e8edf7] transition-all duration-700 group-hover:-left-6 group-hover:-top-6 group-hover:size-[200%] group-hover:rotate-0 group-hover:rounded-none group-hover:bg-[#08337d]" />
                <span className={cn("relative grid size-12 place-items-center text-[#1e3a8a] transition-[color,opacity] duration-500 group-hover:text-white", g.steps.length > 0 && "group-hover:opacity-0")}><StarBadge /><I size={21} variant="Bulk" className="relative" /></span>
                <span className={cn("mt-5 text-[16px] font-black leading-7 text-[#2f3533] transition-[color,opacity] duration-500 group-hover:text-white", g.steps.length > 0 && "group-hover:opacity-0")}>{g.fullName}</span>
                <span className={cn("mt-2 text-[12.5px] leading-6 text-[#2f3533]/65 transition-[color,opacity] duration-500 group-hover:text-white/75", g.steps.length > 0 && "group-hover:opacity-0")}>{g.text}</span>
                {/* گام‌های ورود همین مسیر، روی کاشی لاجوردی */}
                {g.steps.length > 0 && (
                  <span className="pointer-events-none absolute inset-x-6 top-6 bottom-14 flex flex-col text-white opacity-0 transition-opacity delay-150 duration-500 group-hover:opacity-100">
                    <span className="text-[14px] font-black leading-6">{g.fullName}</span>
                    <ol className="mt-2.5 space-y-1.5">{g.steps.map((st, k) => <li key={k} className="flex gap-1.5 text-[11.5px] font-semibold leading-5 text-white/80"><span className="shrink-0 font-black tabular-nums text-[#9dbff9]">{faNumber(k + 1)}</span>{st}</li>)}</ol>
                  </span>
                )}
                <span className="mt-auto flex items-center justify-between pt-5 text-[12.5px] font-bold text-[#2f3533]/60 transition-colors duration-500 group-hover:text-white/80">
                  {g.route ? (g.count ? <span><b className="text-[15px] font-black text-[#2f3533] group-hover:text-white">{faNumber(g.count)}</b> پروژه</span> : <span>به‌زودی</span>) : <span>{g.cta}</span>}
                  <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
                </span>
              </motion.button>
            );
          })}
        </div>
        <div className="mt-6 flex items-center justify-between rounded-[1.6rem] bg-[#042560] px-8 py-6 text-white">
          <p className="text-[15.5px] font-bold">{proposalCta.text}</p>
          <div className="flex items-center gap-5"><span className="text-[12.5px] font-bold text-white/60">{noSignup}</span>
            <Link href={proposalCta.href} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0f766e] px-6 text-[14px] font-extrabold transition-transform hover:-translate-y-0.5">{proposalCta.cta}<ArrowLeft size={17} /></Link></div>
        </div>
      </div>
    </section>
  );
}

function StarBadge({ className }: { className?: string }) {
  return <svg viewBox="-12 -12 24 24" className={cn("absolute inset-0 size-full", className)} aria-hidden><path d={Array.from({ length: 16 }, (_, k) => pt(-90 + k * 22.5, k % 2 ? 7.4 : 12)).map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ") + "Z"} fill="currentColor" opacity="0.14" /></svg>;
}

/* ——— گروه‌ها: موزاییک با اندازه‌های متفاوت + نقشه استان‌ها ——— */
function Groups() {
  const go = useGo();
  const [open, setOpen] = useState<string | null>(null);
  const [prov, setProv] = useState<string | null>(null);
  const big = new Set(["energy", "transport", "heritage"]);
  return (
    <section className={cn(W, "mt-28")}>
      <MarkTitle className="text-[2.3rem] font-black text-[#2f3533]" markClass="text-[#1e3a8a]">{groupsHead.title}</MarkTitle>
      <p className="mt-2 max-w-[44rem] text-[15.5px] text-[#2f3533]/70">{groupsHead.text}</p>
      <div className="mt-9 grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-6">
        <div className="grid auto-rows-[9.5rem] grid-cols-4 gap-3">
          {groups.map((g) => { const I = groupIcons[g.id]; const isOpen = open === g.id;
            return (
              <div key={g.id} onPointerEnter={() => setOpen(g.id)} onPointerLeave={() => setOpen(null)} className={cn("group relative isolate overflow-hidden rounded-[1.4rem] bg-[#08337d] text-white", big.has(g.id) && "col-span-2 row-span-2")}>
                <button type="button" onClick={() => go.group(g.id)} onFocus={() => setOpen(g.id)} className="absolute inset-0 z-10" aria-label={`${g.name}، ${faNumber(g.count)} پروژه`} />
                {g.image && <Image src={g.image} alt="" fill sizes="25vw" className="-z-10 object-cover opacity-55 grayscale-[40%] transition-all duration-700 group-hover:scale-105 group-hover:opacity-35" />}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#021844]/90 via-[#021844]/30 to-transparent" />
                <div className="flex h-full flex-col p-4">
                  <span className="flex items-center justify-between"><I size={20} variant="Bulk" className="text-[#9dbff9]" /><span className="text-[12px] font-black tabular-nums text-white/80">{faNumber(g.count)}</span></span>
                  <p className={cn("mt-auto font-black leading-6", big.has(g.id) ? "text-[1.3rem]" : "text-[14px]")}>{g.name}</p>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }} className="relative z-20 mt-2 flex flex-wrap gap-1 overflow-hidden">
                        {g.subtypes.slice(0, big.has(g.id) ? 10 : 3).map((s) => <li key={s.id}><button type="button" onClick={() => go.group(g.id, s.id)} className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold hover:bg-white hover:text-[#08337d]">{s.name}</button></li>)}
                        {g.subtypes.length > (big.has(g.id) ? 10 : 3) && <li className="px-1 text-[11px] font-bold text-white/60">+{faNumber(g.subtypes.length - (big.has(g.id) ? 10 : 3))}</li>}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ); })}
        </div>
        <div className="relative rounded-[1.6rem] bg-white p-6 ring-1 ring-[#dfe6f0]" style={vars}>
          <p className="text-[14px] font-extrabold text-[#2f3533]">در کدام منطقه؟</p>
          <p className="mt-1 text-[12.5px] text-[#2f3533]/60">پررنگی هر استان، شمار پروژه‌های آن است. روی استان بزنید تا نتایج همان‌جا را ببینید.</p>
          <div className="relative mt-3" onPointerLeave={() => setProv(null)} onPointerOver={(e) => { const t = (e.target as SVGElement).closest("path")?.querySelector("title")?.textContent; if (t) setProv(t); }}
            onClick={(e) => { const t = (e.target as SVGElement).closest("path")?.querySelector("title")?.textContent; if (t) { useStore.getState().begin({ route: "investor", provinces: [t] }); window.location.assign(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/opportunities`); } }}>
            <ProvinceMap hot={prov} weights={byProvince} base="fill-[#1e3a8a] cursor-pointer" fill="fill-[#0f766e] cursor-pointer" />
          </div>
          <p className="mt-2 h-6 text-[13px] font-extrabold text-[#2f3533]">{prov ? `${prov}: ${faNumber(byProvince[prov] ?? 0)} پروژه` : `${faNumber(Object.keys(byProvince).length)} استان، ${faNumber(totalCount)} فرصت`}</p>
          <ul className="mt-5 space-y-2.5 border-t border-[#dfe6f0] pt-5">
            {Object.entries(byProvince).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([name, n], i, arr) => (
              <li key={name} onPointerEnter={() => setProv(name)} className="grid grid-cols-[6.5rem_minmax(0,1fr)_2rem] items-center gap-3 text-[12.5px] font-bold text-[#2f3533]/75">
                <span className="truncate">{name}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-[#eef3fb]"><motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.8, ease }} className={cn("block h-full rounded-full", prov === name ? "bg-[#0f766e]" : "bg-[#1e3a8a]")} style={{ width: `${(n / arr[0][1]) * 100}%`, transformOrigin: "right" }} /></span>
                <span className="text-left tabular-nums text-[#2f3533]">{faNumber(n)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ——— جست‌وجوی مستقیم ——— */
function Search() {
  const go = useGo();
  return (
    <section className={cn(W, "mt-24")}>
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#042560] p-9 text-white">
        <AlgoPattern className="inset-0 -z-10 size-full text-white/[0.06]" fade="right" scale={0.7} />
        <MarkTitle className="text-[1.8rem] font-black" markClass="text-[#5cc4b8]">{directSearch.title}</MarkTitle>
        <p className="mt-1 text-[14px] text-white/70"><b className="font-extrabold text-[#9dbff9]">{directSearch.label}.</b> {directSearch.text}</p>
        <DirectSearch dark className="mt-7" />
        <div className="mt-5 flex gap-6 text-[13px] font-bold text-white/75">
          <span>{directSearch.fund.text} <button type="button" onClick={() => go.route("fund")} className="text-white underline underline-offset-4">{directSearch.fund.cta}</button></span>
          <button type="button" onClick={() => go.route("charity")} className="text-white underline underline-offset-4">{directSearch.charity.cta}</button>
        </div>
      </div>
    </section>
  );
}

/* ——— پروژه‌های منتخب ——— */
function Featured() {
  return (
    <section className={cn(W, "mt-28")}>
      <div className="flex items-end justify-between">
        <MarkTitle className="text-[2.3rem] font-black text-[#2f3533]" markClass="text-[#1e3a8a]">پروژه‌هایی برای شروع</MarkTitle>
        <Link href="/opportunities" className="inline-flex items-center gap-2 text-[14px] font-extrabold text-[#1e3a8a]">همه {faNumber(totalCount)} فرصت<ArrowLeft size={17} /></Link>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-5">
        {featured.map((l, i) => <GirihCard key={l.id} l={l} i={i} />)}
      </div>
    </section>
  );
}

function GirihCard({ l, i }: { l: Listing; i: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08, duration: 0.7, ease }}>
      <Link href={projectHref("girih", l.id)} className="group block overflow-hidden rounded-[1.8rem] bg-white ring-1 ring-[#dfe6f0] transition-shadow hover:shadow-[0_34px_60px_-38px_rgb(8_51_125/0.6)]">
        <div className="relative h-52 overflow-hidden bg-[#08337d]">
          <Image src={l.image} alt="" fill sizes="33vw" className="object-cover opacity-80 grayscale-[30%] transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute bottom-4 right-5 flex items-center gap-1.5 text-[12.5px] font-bold text-white"><Location size={15} />{l.province ? `${l.province}، ${l.city}` : l.tags[0]}</span>
        </div>
        <div className="p-6">
          <p className="text-[12px] font-bold text-[#1e3a8a]">{l.tags.join(" · ")}</p>
          <p className="mt-1.5 text-[17px] font-black leading-7 text-[#2f3533]">{l.title}</p>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#dfe6f0] pt-4">
            {l.stats.slice(0, 4).map((s) => <div key={s.label}><dt className="text-[11.5px] font-bold text-[#2f3533]/55">{s.label}</dt><dd className="mt-0.5 text-[13.5px] font-extrabold text-[#2f3533]">{s.value}</dd></div>)}
          </dl>
        </div>
      </Link>
    </motion.div>
  );
}

/* ——— دو روایت: پنجره طاق‌دار ——— */
const arch = "M0,1 L0,0.42 C0,0.18 0.22,0 0.5,0 C0.78,0 1,0.18 1,0.42 L1,1 Z";
function Narratives() {
  const go = useGo();
  return (
    <section className={cn(W, "mt-28 space-y-6")}>
      {stories.map((s, i) => (
        <div key={s.id} className={cn("grid items-center gap-14 overflow-hidden rounded-[2rem] p-10", i ? "grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] bg-[#08337d] text-white" : "grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] bg-white ring-1 ring-[#dfe6f0]")}>
          <div className={cn("relative h-[24rem]", i && "order-2")}>
            <svg className="absolute size-0"><defs><clipPath id={`arch-${s.id}`} clipPathUnits="objectBoundingBox"><path d={arch} /></clipPath></defs></svg>
            <motion.div initial={{ opacity: 0, scale: 1.08 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease }} className="absolute inset-y-0 left-1/2 w-[19rem] -translate-x-1/2" style={{ clipPath: `url(#arch-${s.id})` }}>
              <Image src={s.image} alt="" fill sizes="30vw" className="object-cover" />
            </motion.div>
          </div>
          <div>
            <MarkTitle className={cn("text-[2.2rem] font-black leading-[1.5]", i ? "text-white" : "text-[#2f3533]")} markClass={i ? "text-[#5cc4b8]" : "text-[#1e3a8a]"}>{s.title[0]}<br />{s.title[1]}</MarkTitle>
            <p className={cn("mt-4 text-[15px] font-extrabold", i ? "text-[#9dbff9]" : "text-[#1e3a8a]")}>{s.kicker}</p>
            <p className={cn("mt-1 max-w-[34rem] text-[15px] leading-8", i ? "text-white/75" : "text-[#2f3533]/70")}>{s.text}</p>
            <button type="button" onClick={() => (s.route ? go.route(s.route) : go.href(s.href!))} className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-[#0f766e] px-6 text-[14px] font-extrabold text-white transition-transform hover:-translate-y-0.5">{s.cta}<ArrowLeft size={17} /></button>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ——— روش کار: سه کاشی متحرک ——— */
function Method() {
  const reduce = useReducedMotion();
  return (
    <section className={cn(W, "mt-28")}>
      <MarkTitle className="text-[2.3rem] font-black text-[#2f3533]" markClass="text-[#1e3a8a]">سه کار که برایتان انجام می‌شود</MarkTitle>
      <div className="mt-8 grid grid-cols-3 gap-5">
        {method.map((m, i) => (
          <div key={m.en} className="rounded-[1.8rem] bg-white p-8 ring-1 ring-[#dfe6f0]">
            <div className="relative h-28">
              {i === 0 && (<>
                <motion.span initial={reduce ? false : { x: 40, rotate: -20 }} whileInView={{ x: 0, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease }} className="absolute right-12 top-6 size-16 rotate-45 rounded-md bg-[#1e3a8a]" />
                <motion.span initial={reduce ? false : { x: -40, rotate: 20 }} whileInView={{ x: 0, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease }} className="absolute right-[5.4rem] top-6 size-16 rotate-45 rounded-md bg-[#0f766e]/85" />
              </>)}
              {i === 1 && (<div className="absolute right-6 top-4 grid grid-cols-3 gap-1.5">{Array.from({ length: 9 }, (_, k) => <motion.span key={k} initial={reduce ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: k * 0.08 }} className={cn("size-7 rounded-md", k === 4 || k === 7 ? "border-2 border-dashed border-[#1e3a8a]/50" : "bg-[#1e3a8a]")} />)}</div>)}
              {i === 2 && (<div className="absolute right-6 top-10 flex items-center gap-1.5">{Array.from({ length: 5 }, (_, k) => <motion.span key={k} initial={reduce ? false : { scale: 0.4, opacity: 0.2 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + k * 0.15 }} className={cn("size-8 rotate-45 rounded-[4px]", k === 4 ? "bg-[#0f766e]" : "bg-[#1e3a8a]/25")} />)}</div>)}
            </div>
            <span className="text-[11px] font-black tracking-[0.2em] text-[#1e3a8a]" dir="ltr">{m.en}</span>
            <p className="mt-2 text-[1.3rem] font-black text-[#2f3533]">{m.title}</p>
            <p className="mt-2 text-[14px] leading-7 text-[#2f3533]/70">{m.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ——— راهنما: پرسش درست ——— */
function Knowledge() {
  const [open, setOpen] = useState(knowledge.topics[0].id);
  const hydrated = useHydrated(); const saved = useStore((s) => s.saved);
  return (
    <section className={cn(W, "mt-28 grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-14")}>
      <div>
        <MarkTitle className="text-[2.2rem] font-black leading-[1.5] text-[#2f3533]" markClass="text-[#1e3a8a]">{knowledge.title}</MarkTitle>
        <p className="mt-3 text-[15px] leading-8 text-[#2f3533]/70">{knowledge.text}</p>
        <Link href={knowledge.href} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#0f766e] px-6 text-[14px] font-extrabold text-white">{knowledge.cta}<ArrowLeft size={17} /></Link>
        <div className="mt-10 rounded-[1.6rem] bg-[#eef3fb] p-6">
          <p className="text-[15px] font-black text-[#2f3533]">{knowledge.next.title}</p>
          <p className="mt-1 text-[13.5px] leading-7 text-[#2f3533]/70">{knowledge.next.text}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={knowledge.href} className="rounded-full bg-white px-4 py-2 text-[13px] font-bold text-[#1e3a8a] ring-1 ring-[#dfe6f0]">{knowledge.cta}</Link>
            <Link href="/saved" className="rounded-full bg-white px-4 py-2 text-[13px] font-bold text-[#1e3a8a] ring-1 ring-[#dfe6f0]">{knowledge.next.saved}{hydrated && saved.length ? ` (${faNumber(saved.length)})` : ""}</Link>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-2">
            {services.map((s) => { const I = toolIcons[s.id]; return <li key={s.id}><Link href={`/tools/${s.id}`} className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-[12.5px] font-bold text-[#2f3533]/75 hover:bg-white hover:text-[#1e3a8a]">{I && <I size={16} variant="Bulk" className="text-[#1e3a8a]" />}{s.name}</Link></li>; })}
          </ul>
        </div>
      </div>
      <ul className="divide-y divide-[#dfe6f0] border-y border-[#dfe6f0]">
        {knowledge.topics.map((t) => { const on = open === t.id;
          return (
            <li key={t.id}>
              <button type="button" aria-expanded={on} onClick={() => setOpen(on ? "" : t.id)} className="flex w-full items-center gap-4 py-5 text-right">
                <span className={cn("grid size-8 shrink-0 rotate-45 place-items-center rounded-lg transition-colors", on ? "bg-[#1e3a8a]" : "bg-[#e8edf7]")}><span className={cn("size-2 -rotate-45 rounded-full", on ? "bg-white" : "bg-[#1e3a8a]")} /></span>
                <span className={cn("flex-1 text-[15px] leading-7", on ? "font-black text-[#2f3533]" : "font-bold text-[#2f3533]/75")}>{t.title}</span>
              </button>
              <AnimatePresence initial={false}>
                {on && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease }} className="overflow-hidden">
                  <div className="space-y-2 pb-6 pr-12 text-[14px] leading-8 text-[#2f3533]/75">{t.body.map((b, k) => <p key={k}>{b.lead && <b className="font-extrabold text-[#2f3533]">{b.lead} </b>}{b.text}</p>)}</div>
                </motion.div>}
              </AnimatePresence>
            </li>
          ); })}
      </ul>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative isolate mt-32 overflow-hidden bg-[#021844] py-14 text-white">
      <AlgoPattern className="inset-0 -z-10 size-full text-white/[0.05]" fade="none" scale={0.8} />
      <div className={cn(W, "flex items-start justify-between gap-10")}>
        <div><Logo light /><p className="mt-3 text-[13.5px] font-bold text-white/70">{brandLine}</p><p className="mt-6 text-[12.5px] text-white/55">{footer.line}<br />{footer.note}</p></div>
        <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-[13px] font-bold text-white/75">{quickNav.map((q) => <li key={q.label}><Link href={q.href} className="hover:text-white">{q.label}</Link></li>)}</ul>
      </div>
      <p className={cn(W, "mt-10 text-[11.5px] text-white/40")} dir="ltr">{footer.photo}</p>
    </footer>
  );
}

export function GirihLanding() {
  const state = useBringState();
  return (
    <main className="min-h-screen bg-[#f3f6fa] pb-0 text-[#2f3533] selection:bg-[#1e3a8a] selection:text-white" style={vars}>
      <Nav />
      <Hero state={state} />
      <Stories />
      <Intro />
      <Goals state={state} />
      <Groups />
      <Search />
      <Featured />
      <Narratives />
      <Method />
      <Knowledge />
      <Footer />
      <ConceptSwitch current="girih" />
    </main>
  );
}

/* ═════════ صفحه جزئیات «کاشی و گره» ═════════ */
function Tile({ title, children, className, note }: { title: string; children: ReactNode; className?: string; note?: string }) {
  return (
    <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.7, ease }} className={cn("rounded-[1.8rem] bg-white p-7 ring-1 ring-[#dfe6f0]", className)}>
      <MarkTitle as="h3" className="text-[17px] font-black text-[#2f3533]" markClass="text-[#1e3a8a] !h-[14px] !w-11">{title}</MarkTitle>
      {note && <p className="mt-1 text-[12.5px] text-[#2f3533]/55">{note}</p>}
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

const half: Record<number, string> = { 4: "col-span-2", 6: "col-span-3", 12: "col-span-6" };

function Detail({ l }: { l: Listing }) {
  const s = sheetOf(l);
  const o = l.raw as Opportunity & { exit?: string };
  const expert = (o as Opportunity).expert;
  const map = l.province ? [{ id: "map", size: "small" as const, title: "محل پروژه", node: <><ProvinceMap hot={l.province} base="fill-[#2f3533]/[0.08]" fill="fill-[#1e3a8a]" /><p className="mt-2 text-[13.5px] font-extrabold">{l.province}، {l.city}</p></> }] : [];
  const { first, rest } = arrange(chartList(s, { time: "زمان‌بندی پول", timeNote: "هر نوار از امروز شروع می‌شود، نشانگر را روی نمودار ببرید.", ladder: "وضعیت پروژه" }, map));
  const second = first?.size === "wide" ? rest.find((c) => c.id === "ladder") ?? rest.find((c) => c.size === "small") : undefined;
  const others = rest.filter((c) => c !== second);
  return (
    <main className="min-h-screen bg-[#f3f6fa] text-[#2f3533] selection:bg-[#1e3a8a] selection:text-white" style={vars}>
      <Nav />
      <section className="relative isolate overflow-hidden bg-[#08337d] pb-14 pt-32 text-white">
        <AlgoPattern className="inset-0 -z-10 size-full text-white/[0.07]" fade="none" scale={0.9} animated />
        <div className={cn(W, "grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-center gap-12")}>
          <div>
            <Link href="/concepts/girih" className="text-[13px] font-bold text-white/60 hover:text-white">صفحه نخست / {l.tags[0]}</Link>
            <MarkTitle as="h1" className="mt-4 text-[3.1rem] font-black leading-[1.35]" markClass="text-[#5cc4b8] !w-16 !h-5">{l.title}</MarkTitle>
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[14px] font-bold text-white/75">{l.province && <span className="inline-flex items-center gap-1.5"><Location size={16} />{l.province}، {l.city}</span>}<span>{l.tags.join(" · ")}</span><span>{o.stage}</span></p>
            {/* نوار کاشی سه عدد کلیدی */}
            <div className="mt-8 grid max-w-[40rem] grid-cols-3 overflow-hidden rounded-[1.4rem] ring-1 ring-white/15">
              {l.stats.slice(0, 3).map((x, i) => <div key={x.label} className={cn("p-5", i === 1 ? "bg-white/[0.08]" : "")}><p className="text-[12px] font-bold text-white/60">{x.label}</p><p className="mt-1 text-[1.25rem] font-black">{x.value}</p></div>)}
            </div>
            {!s.lanes.length && <p className="mt-3 text-[12.5px] font-semibold text-white/60">هیچ‌کدام از زمان‌های این مورد اعلام نشده است، برای همین نمودار زمانی ندارد.</p>}
            <div className="mt-8 flex items-center gap-3">
              <SaveButton id={l.id} label className="h-12 rounded-full bg-white px-6 font-extrabold text-[#08337d] hover:bg-white/90" />
              <CompareToggle id={l.id} className="bg-white/10 text-white hover:bg-white/20" onClass="bg-[#5cc4b8] text-[#042560]" />
              <Link href={`/opportunities/${encodeURIComponent(l.id)}`} className="px-3 text-[13.5px] font-bold text-white/70 underline underline-offset-4 hover:text-white">صفحه جزئیات فعلی</Link>
            </div>
          </div>
          {/* عکس پروژه از پنجره ستاره هشت‌پر */}
          <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
            <svg className="absolute size-0"><defs><clipPath id="star-window" clipPathUnits="objectBoundingBox"><path d={Array.from({ length: 16 }, (_, k) => pt(-90 + k * 22.5, k % 2 ? 0.37 : 0.5)).map(([x, y], k) => `${k ? "L" : "M"}${(x + 0.5).toFixed(3)},${(y + 0.5).toFixed(3)}`).join(" ") + "Z"} /></clipPath></defs></svg>
            <motion.div initial={{ rotate: -22.5, scale: 0.8, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ duration: 1.2, ease }} className="absolute inset-0" style={{ clipPath: "url(#star-window)" }}>
              <Image src={l.image} alt="" fill sizes="30vw" className="object-cover" priority />
            </motion.div>
          </div>
        </div>
      </section>

      <div className={cn(W, "relative z-10 -mt-8 grid grid-cols-6 gap-5")}>
        {first && <Tile title={first.title} note={first.note} className={second ? "col-span-4" : "col-span-6"}>{first.node}</Tile>}
        {second && <Tile title={second.title} className="col-span-2">{second.node}</Tile>}
        {others.map((c, i, arr) => <Tile key={c.id} title={c.title} note={c.note} className={half[spans12(arr.length)[i]]}>{c.node}</Tile>)}

        <Tile title="قرارداد و پول" className={s.steps.length || s.checks.length ? "col-span-3" : "col-span-6"}>
          <dl className="space-y-4 text-[14px] leading-7">
            {[["مدل قرارداد", o.model], ["تامین مالی", o.finance], ["شیوه بازپرداخت", o.repay], ["مالکیت و سهم", o.ownership], ["شرایط خروج", o.exit]].filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="text-[12px] font-bold text-[#2f3533]/55">{k}</dt><dd className="font-semibold text-[#2f3533]">{v}</dd></div>)}
          </dl>
          {o.caution && <p className="mt-5 rounded-2xl bg-[#fcebe5] px-4 py-3 text-[13.5px] font-semibold leading-7 text-[#b8461f]">پیش از تصمیم: {o.caution}</p>}
        </Tile>
        {(s.steps.length > 0 || s.checks.length > 0) && (
        <Tile title="مسیر ورود" className="col-span-3">
            <ol className="relative space-y-4 pr-2">
              {(s.steps.length ? s.steps : s.checks).map((st, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6, ease }} className="flex gap-4">
                  <span className="relative grid size-9 shrink-0 place-items-center text-[12.5px] font-black text-[#1e3a8a]"><StarBadge /><span className="relative tabular-nums">{faNumber(i + 1)}</span></span>
                  <span className="pt-1.5 text-[14px] font-semibold leading-7">{st}</span>
                </motion.li>
              ))}
            </ol>
            {s.steps.length > 0 && s.checks.length > 0 && <><p className="mt-6 text-[12.5px] font-extrabold text-[#2f3533]/60">موارد بررسی</p><ul className="mt-2 space-y-1.5 text-[13px] leading-7 text-[#2f3533]/75">{s.checks.map((c) => <li key={c} className="flex gap-2"><span className="mt-3 size-1.5 shrink-0 rotate-45 bg-[#1e3a8a]" />{c}</li>)}</ul></>}
          </Tile>
        )}

        <div className="col-span-6 flex items-center justify-between rounded-[1.8rem] bg-[#042560] p-8 text-white">
          {expert ? (
            <div className="flex items-center gap-5"><span className="grid size-14 place-items-center rounded-2xl bg-white/10"><Call size={24} variant="Bulk" /></span><div><p className="text-[13px] font-bold text-white/60">کارشناس این پروژه</p><p className="text-[1.2rem] font-black">{expert.name}</p></div>
              <a href={`tel:${expert.mobile}`} dir="ltr" className="mr-6 rounded-full bg-white/10 px-5 py-2.5 text-[1.05rem] font-black tracking-wide hover:bg-white/20">{formatMobile(expert.mobile)}</a></div>
          ) : (
            <a href={(o as Opportunity).guideFileUrl ?? `/guide/${encodeURIComponent(l.id)}`} className="inline-flex items-center gap-3 text-[15px] font-extrabold"><DocumentDownload size={22} />دریافت فایل راهنمای این پروژه</a>
          )}
          <Link href="/opportunities" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0f766e] px-6 text-[14px] font-extrabold">پروژه‌های مشابه<ArrowLeft size={17} /></Link>
        </div>
      </div>
      <Footer />
      <ConceptSwitch current="girih" />
    </main>
  );
}

export function GirihDetail() {
  return <WithProject>{(l) => (l ? <Detail l={l} /> : null)}</WithProject>;
}
