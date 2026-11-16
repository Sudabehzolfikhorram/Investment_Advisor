"use client";
// کانسپت ۳ «شناسنامه»: جهان سند رسمی. کاغذ امنیتی با نقش گیوشه (همان خط و گره الگونت، این بار حکاکی‌شده)،
// فیلدهای شماره‌دار با خط‌های مویی، مهر گرد کبالت با نشان الگونت، و دکمه تایید سبز.
// هر بخش لندینگ یک «پیوست» پرونده است و صفحه جزئیات، شناسنامه کامل یک پروژه با بندهای نموداری.
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Logo, NodeMark } from "@/components/brand/algo-pattern";
import { ArrowLeft, Call, DocumentDownload, Location, Login, TickCircle } from "@/components/iconsax";
import { toolIcons } from "@/components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { brandLine, directSearch, featured, flowSteps, footer, goals, goalsHead, groups, groupsHead, hero, heroStories, intents, intro, knowledge, method, navLinks, noSignup, proposalCta, quickNav, services, stories, totalCount } from "@/components/concepts/content";
import { CompareToggle, ConceptSwitch, DirectSearch, MarkTitle, ProvinceMap, SaveButton, WithProject, projectHref, spanClass, spans12, useGo } from "@/components/concepts/shared";
import { arrange, chartList } from "@/components/concepts/charts";
import { routes } from "@/data/routes";
import { provinces } from "@/data/provinces";
import { projectGroups } from "@/data/taxonomy";
import { sheetOf } from "@/lib/sheet";
import { listings } from "@/lib/listings";
import { forRoute } from "@/lib/match";
import { useHydrated, useStore } from "@/lib/store";
import type { Listing, Opportunity, RouteId } from "@/types";
import { cn, faNumber, formatMobile } from "@/lib/utils";

const vars = { "--cv-accent": "#1e3a8a", "--cv-soft": "#e8edf7", "--cv-ink": "#2f3533", "--cv-grid": "#dfe5ee", "--cv-surface": "#ffffff", "--cv-warn": "#e0603f" } as CSSProperties;
const ease = [0.16, 1, 0.3, 1] as const;
const W = "mx-auto max-w-[82rem] px-8";
const RULE = "#d7dee9";

/* ═════════ عناصر جهان سند ═════════ */

/** گیوشه: گل‌نقش حکاکی اسکناس و سند، ساخته از منحنی‌های سینوسی هم‌مرکز */
function Guilloche({ className, rings = 16, k = 9, draw = true }: { className?: string; rings?: number; k?: number; draw?: boolean }) {
  const reduce = useReducedMotion();
  const S = 600;
  const paths = useMemo(() => Array.from({ length: rings }, (_, j) => {
    const R = S * 0.17 + j * S * 0.017, A = S * 0.034, ph = (j / rings) * ((Math.PI * 2) / k);
    let d = "";
    for (let t = 0; t <= 360; t += 2) {
      const th = (t * Math.PI) / 180;
      const r = R + A * Math.sin(k * th + ph) + A * 0.45 * Math.sin((k * 2 + 1) * th - ph * 2);
      d += `${t ? "L" : "M"}${(S / 2 + r * Math.cos(th)).toFixed(1)},${(S / 2 + r * Math.sin(th)).toFixed(1)}`;
    }
    return `${d}Z`;
  }), [rings, k]);
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="0.9">
      {paths.map((d, j) => <motion.path key={j} d={d} initial={reduce || !draw ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2.6, delay: j * 0.05, ease }} />)}
    </svg>
  );
}

/** نوار گیوشه: موج‌های درهم برای لبه سند */
function GuillocheBand({ className, lines = 9 }: { className?: string; lines?: number }) {
  const paths = useMemo(() => Array.from({ length: lines }, (_, j) => {
    let d = "";
    for (let x = 0; x <= 1200; x += 6) {
      const y = 30 + 16 * Math.sin(x / 38 + j * 0.7) + 7 * Math.sin(x / 13 - j * 1.3);
      d += `${x ? "L" : "M"}${x},${y.toFixed(1)}`;
    }
    return d;
  }), [lines]);
  return <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className={className} aria-hidden fill="none" stroke="currentColor">{paths.map((d, j) => <path key={j} d={d} strokeWidth="1" vectorEffect="non-scaling-stroke" />)}</svg>;
}

/** مهر گرد کبالت با نشان الگونت، با هر تغییر «کوبیده» می‌شود */
function Stamp({ value, label, ring, size = 128, className, slam = "0", tilt = -12 }: { value: ReactNode; label: string; ring: string; size?: number; className?: string; slam?: string; tilt?: number }) {
  const pid = "st" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const reduce = useReducedMotion();
  return (
    <motion.div key={slam} initial={reduce ? false : { scale: 1.7, rotate: tilt - 14, opacity: 0 }} animate={{ scale: 1, rotate: tilt, opacity: 1 }} transition={{ type: "spring", stiffness: 380, damping: 17 }}
      className={cn("relative grid shrink-0 place-items-center text-[#1e3a8a]", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 size-full" aria-hidden>
        <defs><path id={pid} d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" /></defs>
        <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="2.6" />
        <circle cx="60" cy="60" r="52.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="60" cy="60" r="36" fill="white" fillOpacity="0.55" stroke="currentColor" strokeWidth="1.2" />
        <text fontSize="9" fontWeight="800" fill="currentColor" direction="ltr"><textPath href={`#${pid}`} startOffset="0">{ring}</textPath></text>
      </svg>
      <div className="relative flex flex-col items-center text-center leading-none">
        <NodeMark className="!h-[8px] !w-7 opacity-80" />
        <span className="mt-1 text-[19px] font-black tabular-nums">{value}</span>
        <span className="mt-1 max-w-[4.5rem] text-[9px] font-extrabold leading-tight">{label}</span>
      </div>
    </motion.div>
  );
}

/** سرتیتر بخش: تیتر با نشان، و شماره پیوست در انتهای همان سطر */
function Head({ n, title, text, className, children }: { n: number; title: ReactNode; text?: string; className?: string; children?: ReactNode }) {
  return (
    <div className={cn("border-b border-[#2f3533] pb-5", className)}>
      <div className="flex items-end justify-between gap-8">
        <div>
          <MarkTitle className="text-[2.15rem] font-black leading-[1.45] text-[#2f3533]" markClass="text-[#1e3a8a]">{title}</MarkTitle>
          {text && <p className="mt-2 max-w-[46rem] text-[15px] leading-8 text-[#2f3533]/70">{text}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-5">{children}<span className="rounded-md border border-[#2f3533]/25 px-2.5 py-1 text-[12px] font-extrabold text-[#2f3533]/65">پیوست {faNumber(n)}</span></div>
      </div>
    </div>
  );
}

function Nav() {
  const hydrated = useHydrated();
  const { user, saved, compare, openLogin } = useStore();
  return (
    <header className="sticky top-0 z-40 border-b border-[#d7dee9] bg-[#f5f7fb]/92 backdrop-blur-md">
      <div className={cn(W, "flex h-[4.5rem] items-end justify-between")}>
        <Link href="/concepts/dossier" className="mb-4 flex items-center gap-4"><Logo /><span className="border-r border-[#2f3533]/15 pr-4 text-[12.5px] font-bold text-[#2f3533]/60">{brandLine}</span></Link>
        <nav className="flex items-end gap-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="relative flex items-center gap-2 rounded-t-xl border border-b-0 border-transparent px-4 pb-3 pt-2.5 text-[14px] font-bold text-[#2f3533]/70 transition-colors hover:border-[#d7dee9] hover:bg-white hover:text-[#2f3533]">
              {l.label}
              {hydrated && l.href === "/saved" && saved.length > 0 && <span className="rounded bg-[#0f766e] px-1.5 text-[11px] font-black text-white">{faNumber(saved.length)}</span>}
              {hydrated && l.href === "/compare" && compare.length > 0 && <span className="rounded bg-[#1e3a8a] px-1.5 text-[11px] font-black text-white">{faNumber(compare.length)}</span>}
            </Link>
          ))}
          {!(hydrated && user) && <button type="button" onClick={() => openLogin()} className="mb-3 mr-3 inline-flex h-10 items-center gap-2 rounded-lg border-2 border-[#2f3533] px-4 text-[13.5px] font-extrabold text-[#2f3533] hover:bg-[#2f3533] hover:text-white"><Login size={17} />ورود</button>}
        </nav>
      </div>
    </header>
  );
}

/* ═════════ هیرو: شناسنامه‌ای که با پاسخ‌های شما نوشته می‌شود ═════════ */
const fieldCls = "h-11 w-full rounded-none border-0 border-b-2 border-[#2f3533]/20 bg-transparent px-0 text-[15px] font-extrabold text-[#2f3533] shadow-none focus-visible:border-[#1e3a8a] focus-visible:ring-0 data-[placeholder]:text-[#2f3533]/45";

function Field({ n, label, children }: { n: number; label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-3 border-b border-[#d7dee9] py-4 last:border-0">
      <span className="mt-1 grid size-8 place-items-center rounded-md bg-[#e8edf7] text-[13px] font-black text-[#1e3a8a]">{faNumber(n)}</span>
      <label className="block"><span className="block text-[12.5px] font-bold text-[#2f3533]/60">{label}</span>{children}</label>
    </div>
  );
}

function DossierForm() {
  const router = useRouter();
  const begin = useStore((s) => s.begin);
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const [route, setRoute] = useState<RouteId>("investor");
  const r = routes.find((x) => x.id === route)!;
  const [province, setProvince] = useState("all");
  const [group, setGroup] = useState("all");
  const [amount, setAmount] = useState<[number, number] | null>(null);
  const range = amount ?? (r.amount ? [r.amount.min, r.amount.max] : null);
  const pool = useMemo(() => forRoute(listings, route).filter((l) => (province === "all" || l.province === province) && (!r.usesProjectGroups || group === "all" || l.group === group)), [route, province, group, r.usesProjectGroups]);
  const date = hydrated ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date()) : "";
  return (
    <form onSubmit={(e) => { e.preventDefault(); begin({ route, provinces: province === "all" ? [] : [province], groups: r.usesProjectGroups && group !== "all" ? [group] : [], amount }); router.push("/opportunities"); }}
      className="relative">
      {/* برگه زیرین برای حس پرونده */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-[1.4deg] rounded-[14px] bg-white ring-1 ring-[#d7dee9]" />
      <motion.div initial={reduce ? false : { opacity: 0, y: 24, rotate: -1.2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, ease }}
        className="relative overflow-hidden rounded-[14px] bg-white shadow-[0_40px_80px_-50px_rgb(14_40_90/0.55)] ring-1 ring-[#d7dee9]">
        <div className="relative h-16 overflow-hidden bg-[#f0f4fb] text-[#1e3a8a]/35"><GuillocheBand className="absolute inset-0 size-full" /></div>
        {/* سوراخ‌های لبه سند */}
        <div className="absolute inset-y-16 right-0 w-3 bg-[radial-gradient(circle_at_100%_50%,#f5f7fb_3.5px,transparent_4px)] bg-[length:12px_18px]" aria-hidden />
        <div className="px-8 pb-7 pt-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <motion.p initial={reduce ? false : { clipPath: "inset(0 0 0 100%)" }} animate={{ clipPath: "inset(0 0 0 0%)" }} transition={{ duration: 1.2, delay: 0.4, ease }} className="text-[1.45rem] font-black text-[#2f3533]">شناسنامه سرمایه‌گذاری شما</motion.p>
              <p className="mt-1 text-[12.5px] font-bold text-[#2f3533]/55">{date ? `تنظیم: ${date}` : " "} · پرونده {faNumber(totalCount)} فرصت</p>
            </div>
            <Stamp slam={`${route}-${province}-${group}`} value={faNumber(pool.length)} label="فرصت جور" ring="سرمایه‌گزین • شناسنامه سرمایه‌گذاری • سرمایه‌گزین •" size={118} className="-mt-12" />
          </div>
          <div className="mt-2">
            <Field n={1} label={directSearch.fields.route}>
              <Select value={route} onValueChange={(v) => { setRoute(v as RouteId); setAmount(null); setGroup("all"); }} dir="rtl"><SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                <SelectContent>{routes.map((x) => <SelectItem key={x.id} value={x.id}>{x.fullName}</SelectItem>)}</SelectContent></Select>
            </Field>
            <Field n={2} label={directSearch.fields.province}>
              <Select value={province} onValueChange={setProvince} dir="rtl"><SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">همه استان‌ها</SelectItem>{provinces.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
            </Field>
            {r.amount && range && (
              <Field n={3} label={`${r.amount.label} (${r.amount.unit})`}>
                <div className="pt-3">
                  <Slider dir="rtl" min={r.amount.min} max={r.amount.max} step={r.amount.step} value={range} onValueChange={(v) => setAmount([v[0], v[1]])} className="[&_[data-slot=slider-range]]:bg-[#1e3a8a] [&_[data-slot=slider-thumb]]:border-[#1e3a8a]" />
                  <p className="mt-2.5 text-[14px] font-extrabold tabular-nums text-[#2f3533]">از {faNumber(range[0])} تا {faNumber(range[1])} {r.amount.unit}{!amount && <span className="mr-2 text-[12px] font-bold text-[#2f3533]/45">(همه مبالغ)</span>}</p>
                </div>
              </Field>
            )}
            <Field n={r.amount ? 4 : 3} label={directSearch.fields.group}>
              <Select value={group} onValueChange={setGroup} dir="rtl" disabled={!r.usesProjectGroups}><SelectTrigger className={fieldCls}><SelectValue placeholder="برای این مسیر لازم نیست" /></SelectTrigger>
                <SelectContent><SelectItem value="all">همه گروه‌های پروژه</SelectItem>{projectGroups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent></Select>
            </Field>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 border-t-2 border-[#2f3533] pt-5">
            <p className="text-[12.5px] font-bold text-[#2f3533]/55">{noSignup}</p>
            <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#0f766e] px-6 text-[14.5px] font-extrabold text-white transition-[transform,background-color] hover:bg-[#0d5f59] active:scale-[0.98]"><TickCircle size={19} variant="Bold" />{directSearch.submit}</button>
          </div>
        </div>
      </motion.div>
    </form>
  );
}

function Hero() {
  const go = useGo();
  return (
    <section className="relative isolate overflow-hidden pb-24 pt-14">
      <div className="slow-spin pointer-events-none absolute -right-48 -top-56 -z-10 size-[44rem] text-[#1e3a8a]/[0.13]"><Guilloche className="size-full" /></div>
      <div className="slow-spin pointer-events-none absolute -bottom-72 left-[30%] -z-10 size-[36rem] text-[#0f766e]/[0.08] [animation-direction:reverse]"><Guilloche className="size-full" rings={10} k={7} /></div>
      <div className={cn(W, "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-16")}>
        <div>
          <MarkTitle as="h1" className="text-[3.6rem] font-black leading-[1.35] tracking-tight text-[#2f3533]" markClass="text-[#0f766e]">{hero.title[0]}<br />{hero.title[1]}</MarkTitle>
          <p className="mt-6 text-[1.2rem] font-extrabold text-[#1e3a8a]">{hero.kicker}</p>
          <p className="mt-2 max-w-[30rem] text-[16px] leading-8 text-[#2f3533]/70">{hero.sub}</p>
          <div className="mt-9 flex items-center gap-3">
            <button type="button" onClick={() => go.href(hero.primary.href)} className="group inline-flex h-14 items-center gap-3 rounded-lg bg-[#2f3533] pl-4 pr-6 text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5">{hero.primary.label}<ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /></button>
            <Link href={hero.secondary.href} className="inline-flex h-14 items-center rounded-lg border-2 border-[#2f3533]/15 px-6 text-[14.5px] font-extrabold text-[#2f3533] hover:border-[#2f3533]/45">{hero.secondary.label}</Link>
          </div>
          <dl className="mt-12 grid max-w-[30rem] grid-cols-3 border-y border-[#d7dee9]">
            {[["فرصت ثبت‌شده", faNumber(totalCount)], ["مسیر همکاری", faNumber(routes.length)], ["گروه پروژه", faNumber(groups.length)]].map(([k, v], i) => (
              <div key={k} className={cn("py-4", i > 0 && "border-r border-[#d7dee9] pr-5")}><dd className="text-[1.6rem] font-black tabular-nums text-[#2f3533]">{v}</dd><dt className="text-[12.5px] font-bold text-[#2f3533]/55">{k}</dt></div>
            ))}
          </dl>
        </div>
        <DossierForm />
      </div>
    </section>
  );
}

/* ═════════ سه زاویه: سه کارت شناسایی ═════════ */
function Stories() {
  const go = useGo();
  const reduce = useReducedMotion();
  return (
    <section className={cn(W, "mt-6")}>
      <Head n={1} title={heroStories.title} />
      <div className="mt-8 grid grid-cols-3 gap-6" style={{ perspective: 1400 }}>
        {heroStories.items.map((s, i) => (
          <motion.button key={s.n} type="button" onClick={() => go.route(s.routes[0])} initial={reduce ? false : { rotateY: -60, opacity: 0 }} whileInView={{ rotateY: 0, opacity: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.9, delay: i * 0.12, ease }} style={{ transformOrigin: "right center" }}
            className="group relative flex flex-col overflow-hidden rounded-[14px] bg-white p-3 text-right ring-1 ring-[#d7dee9] transition-shadow hover:shadow-[0_30px_60px_-36px_rgb(14_40_90/0.5)]">
            <div className="relative h-56 overflow-hidden rounded-[9px]"><Image src={s.image} alt="" fill sizes="30vw" className="object-cover grayscale transition-[filter,transform] duration-700 group-hover:scale-105 group-hover:grayscale-0" /></div>
            <div className="relative px-3 pb-2 pt-4">
              <div className="absolute -top-9 left-4"><Stamp value={faNumber(s.n)} label="زاویه" ring="سرمایه‌گزین • سرمایه‌گزین • سرمایه‌گزین •" size={64} tilt={-8} className="bg-white/0 [&_span]:text-[13px]" /></div>
              <p className="text-[1.3rem] font-black text-[#2f3533]">{s.name}</p>
              <dl className="mt-3 divide-y divide-[#d7dee9] border-y border-[#d7dee9]">
                {s.routes.map((id) => <div key={id} className="flex items-center justify-between py-2 text-[13px]"><dt className="font-bold text-[#2f3533]/80">{goals.find((g) => g.id === id)?.name}</dt><dd className="font-black tabular-nums text-[#2f3533]/55">{goals.find((g) => g.id === id)?.count ? faNumber(goals.find((g) => g.id === id)!.count) : "به‌زودی"}</dd></div>)}
              </dl>
              <span className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-extrabold text-[#0f766e]">دیدن فرصت‌ها<ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /></span>
            </div>
          </motion.button>
        ))}
      </div>
      <p className="mt-3 text-[12px] font-semibold text-[#2f3533]/55">{hero.imageNote}</p>
    </section>
  );
}

/* ═════════ یک نقطه شروع: فرم سه گزینه‌ای و فهرست پیوست‌ها ═════════ */
function Intro() {
  const hydrated = useHydrated(); const saved = useStore((s) => s.saved);
  return (
    <section className={cn(W, "mt-28 grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-16")}>
      <div>
        <MarkTitle className="text-[2.4rem] font-black leading-[1.45] text-[#2f3533]" markClass="text-[#1e3a8a]">{intro.title[0]}<br />{intro.title[1]}</MarkTitle>
        <p className="mt-4 text-[1.05rem] font-extrabold text-[#1e3a8a]">{intro.kicker}</p>
        <p className="mt-2 text-[15px] leading-8 text-[#2f3533]/70">{intro.text}</p>
        <div className="mt-8 rounded-[14px] bg-white p-6 ring-1 ring-[#d7dee9]">
          <p className="text-[14px] font-black text-[#2f3533]">فهرست پیوست‌ها</p>
          <ol className="mt-3">
            {quickNav.map((q, i) => (
              <li key={q.label}><Link href={q.href} className="group flex items-baseline gap-3 py-1.5 text-[13.5px] font-bold text-[#2f3533]/80 hover:text-[#1e3a8a]">
                <span className="w-5 text-[12px] font-black tabular-nums text-[#2f3533]/40">{faNumber(i + 1)}</span>{q.label}{q.saved && hydrated && saved.length > 0 && <span className="text-[11.5px] font-black text-[#1e3a8a]">({faNumber(saved.length)})</span>}
                <span className="h-px flex-1 translate-y-[-4px] bg-[#d7dee9] transition-colors group-hover:bg-[#1e3a8a]/40" /><ArrowLeft size={14} className="opacity-50 transition-transform group-hover:-translate-x-1 group-hover:opacity-100" />
              </Link></li>
            ))}
          </ol>
        </div>
      </div>
      <div className="self-center">
        <p className="mb-3 text-[13px] font-extrabold text-[#2f3533]/60">نوع درخواست را علامت بزنید</p>
        <ul className="divide-y divide-[#d7dee9] rounded-[14px] bg-white ring-1 ring-[#d7dee9]">
          {intents.map((it, i) => (
            <li key={it.id}>
              <Link href={it.href} className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-4 px-6 py-6 transition-colors hover:bg-[#f7f9fd]">
                <span className="relative mt-1 grid size-7 place-items-center rounded-md border-2 border-[#2f3533]/30 transition-colors group-hover:border-[#1e3a8a]">
                  <svg viewBox="0 0 24 24" className="size-5 text-[#1e3a8a]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7" className="[stroke-dasharray:24] [stroke-dashoffset:24] transition-[stroke-dashoffset] duration-500 group-hover:[stroke-dashoffset:0]" /></svg>
                </span>
                <span>
                  <span className="block text-[1.12rem] font-black text-[#2f3533]">{it.title}</span>
                  <span className="mt-1 block text-[13.5px] leading-7 text-[#2f3533]/65">{it.text}</span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-extrabold text-[#0f766e]">{it.cta}<ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /></span>
                </span>
                <span className="rounded border border-[#1e3a8a]/30 px-2 py-0.5 text-[10.5px] font-black text-[#1e3a8a]" dir="ltr">{faNumber(i + 1)} · {it.en}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ═════════ پیوست ۲: فرم‌های هدف ورود ═════════ */
function Goals() {
  const go = useGo();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  return (
    <section id="goals" className={cn(W, "mt-28 scroll-mt-24")}>
      <Head n={2} title={goalsHead.title} text={goalsHead.text}>
        <ol className="flex items-center gap-1.5">
          {flowSteps.map((s, i) => <li key={s} className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-extrabold", i === 0 ? "bg-[#2f3533] text-white" : "bg-white text-[#2f3533]/55 ring-1 ring-[#d7dee9]")}><span className="tabular-nums">{faNumber(i + 1)}</span>{s}</li>)}
        </ol>
      </Head>
      <p className="mt-6 text-[14px] font-extrabold text-[#2f3533]">{goalsHead.label}</p>
      <div className="mt-3 grid grid-cols-2 gap-5">
        {goals.map((g, i) => {
          const I = !g.route ? toolIcons[g.id] : null;
          return (
            <motion.button key={g.id} type="button" onPointerEnter={() => setHover(g.id)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(g.id)} onBlur={() => setHover(null)} onClick={() => (g.route ? go.route(g.route) : go.href(g.href!))}
              initial={reduce ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, delay: (i % 2) * 0.08, ease }}
              className="group relative flex flex-col overflow-hidden rounded-[14px] bg-white p-6 text-right ring-1 ring-[#d7dee9] transition-[box-shadow,transform] hover:-translate-y-1 hover:shadow-[0_34px_60px_-40px_rgb(14_40_90/0.55)]">
              <span className="absolute left-5 top-5 text-[11.5px] font-black tabular-nums text-[#2f3533]/35" dir="ltr">{g.route ? `F-${String(i + 1).padStart(2, "0")}` : "F-S"}</span>
              <div className="flex items-start gap-3 pl-14">
                {I && <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-[#e8edf7] text-[#1e3a8a]"><I size={18} variant="Bulk" /></span>}
                <div><p className="text-[1.15rem] font-black text-[#2f3533]">{g.fullName}</p><p className="mt-1 text-[13.5px] leading-7 text-[#2f3533]/65">{g.text}</p></div>
              </div>
              {g.steps.length > 0 ? (
                <ol className="mt-4 grid grid-cols-2 gap-x-5 border-t border-[#d7dee9]">
                  {g.steps.map((s, k) => <li key={k} className="flex gap-2 border-b border-[#d7dee9] py-2.5 text-[12.5px] font-semibold leading-6 text-[#2f3533]/75"><span className="shrink-0 font-black tabular-nums text-[#1e3a8a]">{faNumber(k + 1)}.</span>{s}</li>)}
                </ol>
              ) : <p className="mt-4 border-t border-[#d7dee9] pt-3 text-[12.5px] font-bold text-[#2f3533]/55">مسیر مستقل با فرم سه‌مرحله‌ای خودش</p>}
              {g.subs.length > 0 && <p className="mt-3 line-clamp-1 text-[12px] font-bold text-[#2f3533]/50" title={g.subs.join("، ")}>زیرشاخه‌ها: {g.subs.join("، ")}</p>}
              <div className="mt-auto flex items-center justify-between pt-5">
                <span className="inline-flex items-center gap-2 text-[14px] font-extrabold text-[#2f3533]">{g.route ? (g.count ? `${faNumber(g.count)} فرصت` : "به‌زودی") : g.cta}<ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" /></span>
              </div>
              <AnimatePresence>{hover === g.id && g.route && g.count > 0 && <div className="absolute bottom-3 left-5"><Stamp slam={g.id} value={faNumber(g.count)} label="فرصت" ring="سرمایه‌گزین • بررسی شد • سرمایه‌گزین •" size={84} /></div>}</AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-between gap-6 rounded-[14px] bg-[#f0f7f6] px-7 py-5 ring-1 ring-[#0f766e]/20">
        <p className="text-[15px] font-bold text-[#2f3533]"><b className="font-black">تبصره: </b>{proposalCta.text}</p>
        <div className="flex shrink-0 items-center gap-5"><span className="text-[12.5px] font-bold text-[#2f3533]/55">{noSignup}</span>
          <Link href={proposalCta.href} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0f766e] px-5 text-[14px] font-extrabold text-white">{proposalCta.cta}<ArrowLeft size={17} /></Link></div>
      </div>
    </section>
  );
}

/* ═════════ پیوست ۳: فهرست گروه‌ها با نقشه ═════════ */
function Groups() {
  const go = useGo();
  const [g, setG] = useState(groups[0].id);
  const cur = groups.find((x) => x.id === g)!;
  const provs = useMemo(() => listings.filter((l) => l.group === g && l.province).reduce<Record<string, number>>((m, l) => { m[l.province!] = (m[l.province!] ?? 0) + 1; return m; }, {}), [g]);
  return (
    <section className={cn(W, "mt-28")}>
      <Head n={3} title={groupsHead.title} text={groupsHead.text} />
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-12">
        <ol>
          {groups.map((x, i) => { const on = x.id === g;
            return (
              <li key={x.id} className="border-b border-[#d7dee9]">
                <button type="button" onPointerEnter={() => setG(x.id)} onFocus={() => setG(x.id)} onClick={() => go.group(x.id)} className="group flex w-full items-baseline gap-3 py-3 text-right">
                  <span className="w-6 text-[12.5px] font-black tabular-nums text-[#2f3533]/40">{faNumber(i + 1)}</span>
                  <span className={cn("text-[15.5px] font-extrabold transition-colors", on ? "text-[#1e3a8a]" : "text-[#2f3533]")}>{x.name}</span>
                  <span className={cn("h-px flex-1 translate-y-[-5px] transition-colors", on ? "bg-[#1e3a8a]/50" : "bg-[#d7dee9]")} />
                  <span className="text-[13.5px] font-black tabular-nums text-[#2f3533]/70">{faNumber(x.count)}</span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden">
                      <div className="flex flex-wrap gap-1.5 pb-4 pr-9">{x.subtypes.map((s) => <li key={s.id}><button type="button" onClick={() => go.group(x.id, s.id)} className="rounded-md bg-white px-2.5 py-1 text-[12.5px] font-bold text-[#2f3533]/75 ring-1 ring-[#d7dee9] hover:text-[#1e3a8a] hover:ring-[#1e3a8a]/40">{s.name}</button></li>)}</div>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            ); })}
        </ol>
        <div className="sticky top-28 rounded-[14px] bg-white p-7 ring-1 ring-[#d7dee9]" style={vars}>
          <div className="flex items-baseline justify-between"><p className="text-[1.15rem] font-black text-[#2f3533]">{cur.name}</p><p className="text-[13px] font-bold text-[#2f3533]/55">{faNumber(cur.count)} پروژه در {faNumber(Object.keys(provs).length)} استان</p></div>
          <div className="mt-4"><ProvinceMap weights={Object.keys(provs).length ? provs : undefined} base={Object.keys(provs).length ? "fill-[#1e3a8a]" : "fill-[#2f3533]/[0.08]"} hot={null} /></div>
          <div className="mt-4 flex items-center justify-between border-t border-[#d7dee9] pt-4">
            <span className="flex items-center gap-2 text-[12px] font-bold text-[#2f3533]/55"><span className="h-2.5 w-12 rounded-sm bg-gradient-to-l from-[#1e3a8a] to-[#1e3a8a]/30" />پررنگ‌تر یعنی پروژه بیشتر</span>
            <button type="button" onClick={() => go.group(cur.id)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0f766e] px-4 text-[13.5px] font-extrabold text-white">پروژه‌های {cur.name}<ArrowLeft size={16} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═════════ فرم درخواست مستقیم ═════════ */
function Search() {
  const go = useGo();
  return (
    <section className={cn(W, "mt-24")} style={vars}>
      <div className="relative overflow-hidden rounded-[14px] bg-white ring-1 ring-[#d7dee9]">
        <div className="h-3 text-[#1e3a8a]/40"><GuillocheBand className="size-full" lines={5} /></div>
        <div className="p-8">
          <div className="flex items-end justify-between">
            <div><MarkTitle className="text-[1.75rem] font-black text-[#2f3533]" markClass="text-[#1e3a8a]">{directSearch.title}</MarkTitle><p className="mt-1 text-[14px] text-[#2f3533]/65"><b className="font-extrabold text-[#2f3533]">{directSearch.label}.</b> {directSearch.text}</p></div>
            <div className="flex gap-5 text-[13px] font-bold"><button type="button" onClick={() => go.route("fund")} className="text-[#1e3a8a] underline underline-offset-4">{directSearch.fund.cta}</button><button type="button" onClick={() => go.route("charity")} className="text-[#1e3a8a] underline underline-offset-4">{directSearch.charity.cta}</button></div>
          </div>
          <DirectSearch className="mt-6" field="rounded-lg" button="rounded-lg" />
          <p className="mt-3 text-[12.5px] font-semibold text-[#2f3533]/55">{directSearch.fund.text}</p>
        </div>
      </div>
    </section>
  );
}

/* ═════════ پیوست ۴: پرونده‌های نمونه ═════════ */
function Folders() {
  const reduce = useReducedMotion();
  return (
    <section className={cn(W, "mt-28")}>
      <Head n={4} title="پرونده‌هایی برای شروع"><Link href="/opportunities" className="inline-flex items-center gap-2 text-[14px] font-extrabold text-[#1e3a8a]">همه {faNumber(totalCount)} فرصت<ArrowLeft size={17} /></Link></Head>
      <div className="mt-10 grid grid-cols-3 gap-x-6 gap-y-10" style={{ perspective: 1600 }}>
        {featured.map((l, i) => (
          <motion.div key={l.id} initial={reduce ? false : { rotateX: 35, y: 30, opacity: 0 }} whileInView={{ rotateX: 0, y: 0, opacity: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay: (i % 3) * 0.1, ease }} style={{ transformOrigin: "bottom" }}>
            <Link href={projectHref("dossier", l.id)} className="group relative block">
              {/* زبانه پوشه */}
              <span className="relative z-10 mr-5 inline-flex h-8 items-center rounded-t-lg bg-white px-3 text-[12px] font-black text-[#2f3533]/60 ring-1 ring-[#d7dee9] [clip-path:inset(-2px_-2px_0_-2px)]">{l.tags[0]}</span>
              <div className="relative overflow-hidden rounded-[14px] rounded-tr-none bg-white p-3 ring-1 ring-[#d7dee9] transition-shadow group-hover:shadow-[0_34px_60px_-40px_rgb(14_40_90/0.55)]">
                <div className="relative h-44 overflow-hidden rounded-[9px]"><Image src={l.image} alt="" fill sizes="30vw" className="object-cover grayscale-[60%] transition-[filter,transform] duration-700 group-hover:scale-105 group-hover:grayscale-0" /><div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" /></div>
                <div className="px-2 pb-2 pt-4">
                  <p className="text-[1.08rem] font-black text-[#2f3533]">{l.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[12.5px] font-bold text-[#2f3533]/55">{l.province && <><Location size={14} />{l.province}، {l.city}</>}</p>
                  <dl className="mt-3 grid grid-cols-3 border-t border-[#d7dee9]">
                    {l.stats.slice(0, 3).map((x, k) => <div key={x.label} className={cn("pt-2.5", k > 0 && "border-r border-[#d7dee9] pr-3")}><dt className="text-[11px] font-bold text-[#2f3533]/50">{x.label}</dt><dd className="mt-0.5 text-[13px] font-black tabular-nums text-[#2f3533]">{x.value}</dd></div>)}
                  </dl>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═════════ دو گواهی: روایت‌ها ═════════ */
function Narratives() {
  const go = useGo();
  return (
    <section className={cn(W, "mt-28 grid grid-cols-2 gap-6")}>
      {stories.map((s) => (
        <article key={s.id} className="group overflow-hidden rounded-[14px] bg-white ring-1 ring-[#d7dee9]">
          <div className="relative m-3 h-72 overflow-hidden rounded-[9px]"><Image src={s.image} alt="" fill sizes="45vw" className="object-cover transition-transform duration-[1.4s] group-hover:scale-105" /></div>
          <div className="mx-3 h-5 text-[#1e3a8a]/35"><GuillocheBand className="size-full" lines={6} /></div>
          <div className="px-8 pb-8 pt-5">
            <MarkTitle className="text-[1.7rem] font-black leading-[1.5] text-[#2f3533]" markClass="text-[#1e3a8a]">{s.title[0]}<br />{s.title[1]}</MarkTitle>
            <p className="mt-3 text-[14px] font-extrabold text-[#1e3a8a]">{s.kicker}</p>
            <p className="mt-1 text-[14px] leading-7 text-[#2f3533]/70">{s.text}</p>
            <button type="button" onClick={() => (s.route ? go.route(s.route) : go.href(s.href!))} className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-[#0f766e] px-5 text-[13.5px] font-extrabold text-white">{s.cta}<ArrowLeft size={16} /></button>
          </div>
        </article>
      ))}
    </section>
  );
}

/* ═════════ پیوست ۵: سه بند مهرشده ═════════ */
function Method() {
  const reduce = useReducedMotion();
  return (
    <section className={cn(W, "mt-28")}>
      <Head n={5} title="روش کار سرمایه‌گزین" />
      <div className="mt-10 grid grid-cols-3 gap-6">
        {method.map((m, i) => (
          <div key={m.en} className="relative rounded-[14px] bg-white p-7 ring-1 ring-[#d7dee9]">
            <p className="text-[12.5px] font-black text-[#2f3533]/45">بند {faNumber(i + 1)}</p>
            <p className="mt-1 text-[1.3rem] font-black text-[#2f3533]">{m.title}</p>
            <p className="mt-2 text-[14px] leading-7 text-[#2f3533]/70">{m.text}</p>
            <motion.div initial={reduce ? false : { scale: 1.8, opacity: 0, rotate: -30 }} whileInView={{ scale: 1, opacity: 1, rotate: -10 }} viewport={{ once: true, margin: "-80px" }} transition={{ type: "spring", stiffness: 360, damping: 16, delay: 0.25 + i * 0.35 }} className="absolute -top-8 left-6">
              <div className="grid size-[84px] place-items-center rounded-full border-[2.5px] border-[#1e3a8a] bg-[#f5f7fb] text-[#1e3a8a]"><div className="grid size-[70px] place-items-center rounded-full border border-[#1e3a8a]"><span className="text-[10.5px] font-black" dir="ltr">{m.en}</span></div></div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═════════ پیوست ۶: مواد راهنما ═════════ */
function Knowledge() {
  const [open, setOpen] = useState(knowledge.topics[0].id);
  const hydrated = useHydrated(); const saved = useStore((s) => s.saved);
  return (
    <section className={cn(W, "mt-28")}>
      <Head n={6} title={knowledge.title} text={knowledge.text}><Link href={knowledge.href} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0f766e] px-5 text-[14px] font-extrabold text-white">{knowledge.cta}<ArrowLeft size={17} /></Link></Head>
      <div className="mt-8 grid grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] gap-12">
        <ol className="divide-y divide-[#d7dee9] border-b border-[#d7dee9]">
          {knowledge.topics.map((t, i) => { const on = open === t.id;
            return (
              <li key={t.id}>
                <button type="button" aria-expanded={on} onClick={() => setOpen(on ? "" : t.id)} className="flex w-full items-baseline gap-4 py-4 text-right">
                  <span className={cn("shrink-0 text-[12.5px] font-black", on ? "text-[#1e3a8a]" : "text-[#2f3533]/40")}>ماده {faNumber(i + 1)}</span>
                  <span className={cn("flex-1 text-[15px] leading-7", on ? "font-black text-[#2f3533]" : "font-bold text-[#2f3533]/75")}>{t.title}</span>
                  <span className={cn("text-[18px] font-black transition-transform", on ? "rotate-45 text-[#1e3a8a]" : "text-[#2f3533]/40")}>+</span>
                </button>
                <AnimatePresence initial={false}>
                  {on && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden"><div className="space-y-2 pb-5 pr-[4.25rem] text-[14px] leading-8 text-[#2f3533]/75">{t.body.map((b, k) => <p key={k}>{b.lead && <b className="font-extrabold text-[#2f3533]">{b.lead} </b>}{b.text}</p>)}</div></motion.div>}
                </AnimatePresence>
              </li>
            ); })}
        </ol>
        <aside className="space-y-6">
          <div className="rounded-[14px] bg-white p-6 ring-1 ring-[#d7dee9]">
            <p className="text-[15px] font-black text-[#2f3533]">{knowledge.next.title}</p>
            <p className="mt-1 text-[13.5px] leading-7 text-[#2f3533]/70">{knowledge.next.text}</p>
            <div className="mt-4 flex flex-wrap gap-2"><Link href={knowledge.href} className="rounded-lg bg-[#f5f7fb] px-3.5 py-2 text-[13px] font-bold text-[#1e3a8a] ring-1 ring-[#d7dee9]">{knowledge.cta}</Link><Link href="/saved" className="rounded-lg bg-[#f5f7fb] px-3.5 py-2 text-[13px] font-bold text-[#1e3a8a] ring-1 ring-[#d7dee9]">{knowledge.next.saved}{hydrated && saved.length ? ` (${faNumber(saved.length)})` : ""}</Link></div>
          </div>
          <div className="rounded-[14px] bg-white p-6 ring-1 ring-[#d7dee9]">
            <p className="text-[14px] font-black text-[#2f3533]">خدمات تکمیلی</p>
            <ul className="mt-2">{services.map((s) => { const I = toolIcons[s.id]; return <li key={s.id}><Link href={`/tools/${s.id}`} className="group flex items-center gap-2.5 border-b border-[#d7dee9] py-2 text-[13px] font-bold text-[#2f3533]/80 last:border-0 hover:text-[#1e3a8a]">{I && <I size={17} variant="Bulk" className="text-[#1e3a8a]/70" />}{s.name}<ArrowLeft size={14} className="mr-auto opacity-40 transition-transform group-hover:-translate-x-1 group-hover:opacity-100" /></Link></li>; })}</ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t-2 border-[#2f3533] bg-white pb-12 pt-12">
      <div className="slow-spin pointer-events-none absolute -bottom-64 -left-40 size-[34rem] text-[#1e3a8a]/[0.09]"><Guilloche className="size-full" draw={false} rings={12} /></div>
      <div className={cn(W, "relative")}>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-12">
          <div><Logo /><p className="mt-3 text-[13.5px] font-bold text-[#2f3533]/70">{brandLine}</p><p className="mt-3 text-[12.5px] leading-6 text-[#2f3533]/55">{footer.line}<br />{footer.note}</p></div>
          <ul className="grid grid-cols-2 gap-x-8">{quickNav.map((q) => <li key={q.label}><Link href={q.href} className="flex items-center gap-2 border-b border-[#d7dee9] py-2 text-[13px] font-bold text-[#2f3533]/75 hover:text-[#1e3a8a]"><span className="size-1.5 rounded-full bg-[#1e3a8a]" />{q.label}</Link></li>)}</ul>
        </div>
        <div className="mt-10 flex items-center justify-between border-t border-[#d7dee9] pt-5 text-[11.5px] text-[#2f3533]/45"><span>پایان پرونده</span><span dir="ltr">{footer.photo}</span></div>
      </div>
    </footer>
  );
}

export function DossierLanding() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5f7fb] text-[#2f3533] selection:bg-[#1e3a8a] selection:text-white" style={vars}>
      <Nav />
      <Hero />
      <Stories />
      <Intro />
      <Goals />
      <Groups />
      <Search />
      <Folders />
      <Narratives />
      <Method />
      <Knowledge />
      <Footer />
      <ConceptSwitch current="dossier" />
    </main>
  );
}

/* ═════════ صفحه جزئیات «شناسنامه» ═════════ */
function Clause({ n, title, note, children, className }: { n: number; title: string; note?: string; children: ReactNode; className?: string }) {
  return (
    <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, ease }} className={cn("rounded-[14px] bg-white p-7 ring-1 ring-[#d7dee9]", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-[#d7dee9] pb-4">
        <div><MarkTitle as="h3" className="text-[17px] font-black text-[#2f3533]" markClass="text-[#1e3a8a] !h-[14px] !w-11">{title}</MarkTitle>{note && <p className="mt-1 text-[12.5px] text-[#2f3533]/55">{note}</p>}</div>
        <span className="shrink-0 rounded border border-[#2f3533]/20 px-2 py-0.5 text-[11.5px] font-extrabold text-[#2f3533]/55">بند {faNumber(n)}</span>
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

function Detail({ l }: { l: Listing }) {
  const s = sheetOf(l);
  const o = l.raw as Opportunity & { exit?: string };
  const expert = o.expert;
  const reduce = useReducedMotion();
  const known = s.known.filter((k) => k.ok).length;
  const steps = s.steps.length ? s.steps : s.checks;
  const { first, rest } = arrange(chartList(s, { time: "زمان‌بندی پول", timeNote: "هر نوار از امروز شروع می‌شود، نشانگر را روی نمودار ببرید.", ladder: "وضعیت پرونده" }));
  const spans = spans12(rest.length);
  const terms = [["مدل قرارداد", o.model], ["تامین مالی", o.finance], ["شیوه بازپرداخت", o.repay], ["مالکیت و سهم", o.ownership], ["شرایط خروج", o.exit]].filter(([, v]) => v) as [string, string][];
  let n = 1;
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5f7fb] text-[#2f3533] selection:bg-[#1e3a8a] selection:text-white" style={vars}>
      <Nav />
      {/* سر سند */}
      <section className={cn(W, "relative pt-10")}>
        <div className="slow-spin pointer-events-none absolute -left-40 -top-40 -z-10 size-[38rem] text-[#1e3a8a]/[0.1]"><Guilloche className="size-full" /></div>
        <motion.div initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="relative overflow-hidden rounded-[14px] bg-white shadow-[0_40px_80px_-56px_rgb(14_40_90/0.55)] ring-1 ring-[#d7dee9]">
          <div className="h-14 bg-[#f0f4fb] text-[#1e3a8a]/35"><GuillocheBand className="size-full" /></div>
          <div className="grid grid-cols-[minmax(0,1fr)_20rem] gap-12 px-10 pb-10 pt-6">
            <div>
              <div className="flex items-center justify-between text-[12.5px] font-bold text-[#2f3533]/55">
                <span><Link href="/concepts/dossier" className="hover:text-[#1e3a8a]">صفحه نخست</Link> / {l.tags.join(" · ")}</span>
              </div>
              <motion.div initial={reduce ? false : { clipPath: "inset(0 0 0 100%)" }} animate={{ clipPath: "inset(0 0 0 0%)" }} transition={{ duration: 1.1, delay: 0.3, ease }}>
                <MarkTitle as="h1" className="mt-4 text-[2.7rem] font-black leading-[1.35] text-[#2f3533]" markClass="text-[#1e3a8a] !w-16 !h-5">{l.title}</MarkTitle>
              </motion.div>
              <p className="mt-2 flex flex-wrap gap-x-5 text-[14px] font-bold text-[#2f3533]/65">{l.province && <span className="inline-flex items-center gap-1.5"><Location size={16} />{l.province}، {l.city}</span>}<span>{l.routes.map((r) => goals.find((g) => g.id === r)?.name).join("، ")}</span>{o.stage && <span>{o.stage}</span>}</p>
              <dl className="mt-7 grid grid-cols-2 border-t-2 border-[#2f3533]">
                {l.stats.map((x, i) => (
                  <div key={x.label} className={cn("grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-2 border-b border-[#d7dee9] py-3.5", i % 2 === 1 && "border-r border-[#d7dee9] pr-5")}>
                    <span className="text-[12px] font-black tabular-nums text-[#1e3a8a]">{faNumber(i + 1)}.</span>
                    <div className="flex items-baseline justify-between gap-3"><dt className="text-[13px] font-bold text-[#2f3533]/60">{x.label}</dt><dd className="text-[16px] font-black tabular-nums">{x.value}</dd></div>
                  </div>
                ))}
              </dl>
              {!s.lanes.length && <p className="mt-3 text-[12.5px] font-semibold text-[#2f3533]/55">هیچ‌کدام از زمان‌های این مورد اعلام نشده است، برای همین نمودار زمانی ندارد.</p>}
              <div className="mt-7 flex items-center gap-3">
                <SaveButton id={l.id} label className="h-12 rounded-lg bg-[#0f766e] px-6 font-extrabold text-white hover:bg-[#0d5f59]" />
                <CompareToggle id={l.id} className="rounded-lg border-2 border-[#2f3533]/15 text-[#2f3533]" onClass="border-[#1e3a8a] bg-[#1e3a8a] text-white" />
                <Link href={`/opportunities/${encodeURIComponent(l.id)}`} className="px-3 text-[13px] font-bold text-[#2f3533]/55 underline underline-offset-4 hover:text-[#2f3533]">صفحه جزئیات فعلی</Link>
              </div>
            </div>
            {/* عکس الصاقی و مهر کامل بودن داده */}
            <div className="relative pt-2">
              <motion.div initial={reduce ? false : { rotate: 8, opacity: 0, y: -20 }} animate={{ rotate: 2.5, opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease }} className="relative rounded-[10px] bg-white p-2.5 shadow-[0_24px_50px_-28px_rgb(14_40_90/0.6)] ring-1 ring-[#d7dee9]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[6px]"><Image src={l.image} alt="" fill sizes="20rem" className="object-cover" priority /></div>
                <span className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rounded-sm bg-[#1e3a8a]/80" aria-hidden />
              </motion.div>
              <div className="absolute -bottom-6 -right-8"><Stamp value={`${faNumber(known)}/${faNumber(s.known.length)}`} label="داده اعلام‌شده" ring="سرمایه‌گزین • شناسنامه پروژه • سرمایه‌گزین •" size={124} /></div>
            </div>
          </div>
        </motion.div>
      </section>

      <div className={cn(W, "mt-8 grid grid-cols-12 gap-5")}>
        {first && <Clause n={n++} title={first.title} note={first.note} className={steps.length ? "col-span-8" : "col-span-12"}>{first.node}</Clause>}
        {steps.length > 0 && (
          <Clause n={n++} title={s.steps.length ? "مراحل ورود" : "موارد بررسی پیش از ورود"} className={first ? "col-span-4" : "col-span-12"}>
            <ol className="space-y-3">
              {steps.map((st, i) => (
                <motion.li key={i} initial={reduce ? false : { opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5, ease }} className="flex gap-3 text-[13.5px] font-semibold leading-7">
                  <span className="mt-1 grid size-5 shrink-0 place-items-center rounded border-2 border-[#1e3a8a] text-[10px] font-black tabular-nums text-[#1e3a8a]">{faNumber(i + 1)}</span>{st}
                </motion.li>
              ))}
            </ol>
            {s.steps.length > 0 && s.checks.length > 0 && <div className="mt-5 border-t border-[#d7dee9] pt-4"><p className="text-[12.5px] font-extrabold text-[#2f3533]/60">موارد بررسی</p><ul className="mt-2 space-y-1.5 text-[13px] leading-7 text-[#2f3533]/75">{s.checks.map((c) => <li key={c} className="flex gap-2"><span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-[#1e3a8a]" />{c}</li>)}</ul></div>}
          </Clause>
        )}
        {rest.map((c, i) => <Clause key={c.id} n={n++} title={c.title} note={c.note} className={spanClass[spans[i]]}>{c.node}</Clause>)}

        <Clause n={n++} title="قرارداد و پول" className={l.province ? "col-span-8" : "col-span-12"}>
          <ol className="space-y-0">
            {terms.map(([k, v], i) => <li key={k} className="grid grid-cols-[2.25rem_9rem_minmax(0,1fr)] items-baseline gap-3 border-b border-[#d7dee9] py-3.5 text-[14px] leading-7 last:border-0"><span className="text-[12px] font-black tabular-nums text-[#1e3a8a]">{faNumber(i + 1)}.</span><span className="text-[12.5px] font-bold text-[#2f3533]/55">{k}</span><span className="font-semibold">{v}</span></li>)}
          </ol>
          {o.caution && <p className="mt-5 rounded-lg bg-[#fcebe5] px-4 py-3 text-[13.5px] font-semibold leading-7 text-[#b8461f]"><b className="font-black">تبصره: </b>{o.caution}</p>}
        </Clause>
        {l.province && <Clause n={n++} title="محل" className="col-span-4"><ProvinceMap hot={l.province} base="fill-[#2f3533]/[0.08]" fill="fill-[#1e3a8a]" /><p className="mt-2 text-[13.5px] font-extrabold">{l.province}، {l.city}</p></Clause>}

        {/* امضای کارشناس */}
        <div className="col-span-12 flex items-end justify-between rounded-[14px] bg-white px-10 py-8 ring-1 ring-[#d7dee9]">
          {expert ? (
            <div className="flex items-end gap-10">
              <div><p className="text-[12.5px] font-bold text-[#2f3533]/55">کارشناس این پروژه</p><p className="mt-1 text-[1.3rem] font-black">{expert.name}</p><span className="mt-3 block h-px w-56 bg-[#2f3533]/30" /></div>
              <a href={`tel:${expert.mobile}`} dir="ltr" className="inline-flex items-center gap-2 rounded-lg bg-[#f5f7fb] px-5 py-3 text-[1.1rem] font-black tracking-wide ring-1 ring-[#d7dee9] hover:ring-[#1e3a8a]/40"><Call size={19} variant="Bulk" className="text-[#1e3a8a]" />{formatMobile(expert.mobile)}</a>
            </div>
          ) : (
            <a href={o.guideFileUrl ?? `/guide/${encodeURIComponent(l.id)}`} className="inline-flex items-center gap-3 text-[15px] font-extrabold text-[#1e3a8a]"><DocumentDownload size={22} />دریافت فایل راهنمای این پروژه</a>
          )}
          <Link href="/opportunities" className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#2f3533] px-6 text-[14px] font-extrabold text-white">پروژه‌های مشابه<ArrowLeft size={17} /></Link>
        </div>
      </div>
      <Footer />
      <ConceptSwitch current="dossier" />
    </main>
  );
}

export function DossierDetail() {
  return <WithProject>{(l) => (l ? <Detail l={l} /> : null)}</WithProject>;
}
