"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ArrowLeft, Book1, Call, WalletMoney, Building4, CloseCircle, Courthouse, Hierarchy, InfoCircle, Key, Location, Lovely, MessageQuestion, People, ShieldTick, TickCircle, type Icon } from "@/components/iconsax";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { CountUp, MatchRing, Reveal } from "@/components/brand/reveal";
import { ListingCard } from "@/components/listing/listing-card";
import { CompareTray } from "@/components/compare/tray";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { groupIcons, routeIcons } from "@/components/icons";
import { projectGroups } from "@/data/taxonomy";
import { routes, routeSubcategories } from "@/data/routes";
import { provincePaths, provinceLabel } from "@/data/iran-map";
import { listings } from "@/lib/listings";
import { forRoute, matchListing } from "@/lib/match";
import { libraryTopics } from "@/data/library";
import { tools } from "@/data/tools";
import type { Opportunity, RouteId, SearchCriteria } from "@/types";
import { useStore } from "@/lib/store";
import { cn, faNumber } from "@/lib/utils";

/** قاعده یکسان تیتر همه سکشن‌ها: برچسب کوچک، تیتر، زیرتیتر کوتاه؛ همیشه راست‌چین. «aside» در سمت چپ و هم‌تراز پایین تیتر می‌نشیند. */
export function SectionHead({ kicker, title, text, aside, className, light }: { kicker: string; title: ReactNode; text: string; aside?: ReactNode; className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-end justify-between gap-10", className)}>
      <Reveal className="min-w-0 max-w-[38rem]">
        <span className={cn("inline-flex items-center gap-2 text-[13px] font-extrabold", light ? "text-white" : "text-ink/55")}><NodeMark className={light ? "" : "text-primary"} />{kicker}</span>
        <h2 className={cn("mt-2.5 text-[1.85rem] font-black leading-[1.5] tracking-tight text-balance", light ? "text-white" : "text-ink")}>{title}</h2>
        <p className={cn("mt-1.5 text-[15px] leading-7", light ? "text-white/70" : "text-muted-foreground")}>{text}</p>
      </Reveal>
      {aside && <Reveal delay={0.1} className="shrink-0">{aside}</Reveal>}
    </div>
  );
}

const sectionCls = "mx-auto mt-28 max-w-7xl px-6";

/* ——— راهنمای کوتاه: پرسش در راست، پاسخ روی تصویر در چپ ——— */
const topicIcons: Record<string, Icon> = { models: Hierarchy, partnership: People, rights: Key, heritage: Courthouse, guarantee: ShieldTick, readiness: Building4, charity: Lovely, story: Book1 };
const topicImages: Record<string, string> = { models: "/images/hero/towers.jpg", partnership: "/images/hero/construction.jpg", rights: "/images/hero/villa.jpg", heritage: "/images/hero/heritage.webp", guarantee: "/images/hero/office.jpg", readiness: "/images/types/lhcompletion.webp", charity: "/images/types/education.webp", story: "/images/hero/field.jpg" };
const toolName = (id: string) => tools.find((t) => t.id === id && !t.hidden)?.name;

export function HelpCenter() {
  const topics = libraryTopics.filter((t) => t.id !== "services").slice(0, 6);
  const [active, setActive] = useState(0);
  return (
    <section className={sectionCls}>
      <SectionHead kicker="راهنما" title="پیش از تصمیم، این پرسش‌ها را روشن کنید" text="پاسخ کوتاه پرسش‌های رایج درباره قرارداد، تضمین و حقوق ملک."
        aside={<Link href="/tools/library" className="group inline-flex h-12 items-center gap-2 rounded-full border border-pine/15 bg-white/60 px-5 text-sm font-extrabold text-ink transition-colors hover:border-ink/25 hover:text-ink">همه راهنماها و منابع<ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" /></Link>} />
      <HelpAccordion topics={topics} active={active} setActive={setActive} />
    </section>
  );
}

type Topic = (typeof libraryTopics)[number];
/** راهنما: پرسش و پاسخ بازشونده، متفاوت با چیدمان حوزه‌ها. هر ردیف یک پرسش است و پاسخ در همان ردیف باز می‌شود */
function HelpAccordion({ topics, active, setActive }: { topics: Topic[]; active: number; setActive: (i: number) => void }) {
  return (
    <Reveal className="mt-8 overflow-hidden rounded-[1.75rem] border border-border bg-white/80 backdrop-blur-xl">
      {topics.map((x, i) => { const I = topicIcons[x.id] ?? MessageQuestion; const on = i === active;
        return (
          <div key={x.id} className={cn("relative border-b border-border transition-colors duration-300 last:border-b-0", on ? "bg-white" : "hover:bg-white/70")}>
            {on && <motion.span layoutId="help-bar" className="absolute inset-y-0 right-0 w-[3px] bg-cobalt" />}
            <button type="button" onClick={() => setActive(on ? -1 : i)} aria-expanded={on} className="flex w-full items-center gap-4 px-7 py-5 text-right">
              <span className={cn("w-7 shrink-0 text-[15px] font-black tabular-nums transition-colors", on ? "text-cobalt-deep" : "text-ink/30")}>{faNumber(i + 1).padStart(2, "۰")}</span>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl transition-colors", on ? "bg-cobalt text-white" : "bg-muted text-ink/60")}><I size={19} variant="Bulk" /></span>
              <span className={cn("min-w-0 flex-1 text-[16px] leading-7 transition-colors", on ? "font-extrabold text-ink" : "font-bold text-ink/75")}>{x.title}</span>
              <span className={cn("relative grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-300", on ? "border-ink bg-ink text-white" : "border-border text-ink")}>
                <span className="absolute h-[2px] w-3.5 rounded-full bg-current" />
                <span className={cn("absolute h-3.5 w-[2px] rounded-full bg-current transition-transform duration-300", on && "scale-y-0")} />
              </span>
            </button>
            <motion.div initial={false} animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }} transition={{ duration: 0.45, ease }} className="overflow-hidden">
              <div className="grid grid-cols-[minmax(0,1fr)_18rem] gap-10 pb-7 pl-7 pr-[6.75rem]">
                <div className="min-w-0">
                  <div className="space-y-2.5 text-[14.5px] leading-8 text-ink/75">
                    {x.body.map((b, k) => <p key={k}>{b.lead && <b className="font-extrabold text-ink">{b.lead} </b>}{b.text}</p>)}
                  </div>
                  {!!x.tools?.length && (
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <span className="ml-1 text-xs font-bold text-muted-foreground">خدمات مرتبط:</span>
                      {x.tools.map((id) => toolName(id) && <Link key={id} href={`/tools/${id}`} className="inline-flex h-8 items-center rounded-full border border-border bg-[#f7f9fc] px-3 text-[12px] font-bold text-ink/80 transition-colors hover:border-cobalt hover:bg-cobalt hover:text-white">{toolName(id)}</Link>)}
                    </div>
                  )}
                </div>
                <div className="relative isolate h-40 overflow-hidden rounded-[1.25rem] bg-[#16181a]">
                  <Image src={topicImages[x.id] ?? "/images/hero/office.jpg"} alt="" fill sizes="18rem" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-3 right-4 text-[12px] font-bold text-white">پرسش {faNumber(i + 1)} از {faNumber(topics.length)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        ); })}
    </Reveal>
  );
}

/* ——— آمار زنده: نقشه‌ای که حوزه‌به‌حوزه روشن می‌شود ——— */
// به جای چند عدد کنار هم، یک «داستان» داده: هر چند ثانیه یک حوزه انتخاب می‌شود؛
// عددش ورق می‌خورد، سهمش در نوار روشن می‌شود و استان‌هایی که پروژه‌اش را دارند روی نقشه پر می‌شوند.
const ease = [0.22, 1, 0.36, 1] as const;
const STAT_MS = 2800;
function StatsCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const data = useMemo(() => {
    const byGroup = projectGroups.map((g) => {
      const ls = listings.filter((l) => l.group === g.id);
      return { id: g.id, name: g.name, n: ls.length, provinces: new Set(ls.map((l) => l.province).filter(Boolean) as string[]) };
    }).filter((g) => g.n > 0).sort((x, y) => y.n - x.n);
    const all = new Set(listings.map((l) => l.province).filter(Boolean) as string[]);
    return { byGroup, all, total: byGroup.reduce((t, g) => t + g.n, 0) };
  }, []);
  const [k, setK] = useState(0);
  const [pin, setPin] = useState<number | null>(null);
  useEffect(() => { if (!inView || pin != null) return; const t = setTimeout(() => setK((x) => (x + 1) % data.byGroup.length), STAT_MS); return () => clearTimeout(t); }, [k, inView, pin, data.byGroup.length]);
  const cur = data.byGroup[pin ?? k];
  const I = groupIcons[cur.id];
  return (
    <div ref={ref} className="surface relative mt-5 w-full overflow-hidden rounded-[1.6rem] px-7 py-4" onMouseLeave={() => setPin(null)}>
      {/* نوار کم‌ارتفاع زیر کارت‌های مسیر: عدد کل، حوزه‌ی در حال نمایش، سهم حوزه‌ها و نقشه‌ی کوچک در یک ردیف */}
      <div className="grid grid-cols-[auto_17rem_minmax(0,1fr)_7rem] items-center gap-8">
        <div className="contents">
          <p className="flex items-baseline gap-2 border-l border-border pl-8">
            <span className="text-[2.6rem] font-black leading-none tracking-tight text-ink"><CountUp value={listings.length} /></span>
            <span className="text-[13px] font-bold text-muted-foreground">پروژه در <b className="font-extrabold text-ink">{faNumber(data.all.size)}</b> استان</span>
          </p>
          {/* حوزه‌ی در حال نمایش: ورق می‌خورد */}
          <div className="relative h-[3.25rem] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={cur.id} initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={{ duration: 0.55, ease }} className="absolute inset-0 flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink text-white"><I size={21} variant="Bulk" /></span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-extrabold text-ink">{cur.name}</span>
                  <span className="block text-[12.5px] font-semibold text-muted-foreground"><b className="font-extrabold text-cobalt-deep">{faNumber(cur.n)}</b> پروژه · {faNumber(cur.provinces.size)} استان</span>
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
          {/* سهم هر حوزه؛ با هاور حوزه ثابت می‌ماند */}
          <div className="min-w-0">
            <div className="flex h-2.5 gap-[3px]">
              {data.byGroup.map((g, i) => { const on = (pin ?? k) === i;
                return (
                  <motion.button key={g.id} type="button" aria-label={`${g.name}: ${faNumber(g.n)} پروژه`} onMouseEnter={() => setPin(i)} onFocus={() => setPin(i)}
                    initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease }}
                    style={{ flexGrow: g.n, originX: 1 }} className={cn("min-w-[6px] basis-0 rounded-full transition-colors duration-300", on ? "bg-cobalt" : "bg-ink/[0.12] hover:bg-ink/25")} />
                ); })}
            </div>
            <p className="mt-2.5 flex items-center justify-between text-[11.5px] font-bold text-muted-foreground">
              <span>{faNumber(projectGroups.length)} حوزه · {faNumber(routes.length)} مسیر ورود</span>
              <span className="tabular-nums">{faNumber(Math.round((cur.n / data.total) * 100))}٪ پروژه‌ها</span>
            </p>
          </div>
        </div>
        {/* نقشه: استان‌های دارای پروژه کم‌رنگ، استان‌های حوزه‌ی جاری پررنگ */}
        <svg viewBox="8 8 344 316" className="h-auto w-full" aria-hidden>
          {Object.entries(provincePaths).map(([name, d]) => {
            const hot = cur.provinces.has(name), has = data.all.has(name);
            return <path key={name} d={d} strokeWidth="0.7" strokeLinejoin="round" className={cn("stroke-white transition-[fill] duration-500", hot ? "fill-ink/80" : has ? "fill-ink/[0.14]" : "fill-ink/[0.05]")} />;
          })}
          {[...cur.provinces].map((name, i) => { const xy = provinceLabel[name]; if (!xy) return null;
            return <motion.circle key={cur.id + name} cx={xy[0]} cy={xy[1]} r="3.4" className="fill-cobalt stroke-white" strokeWidth="1.2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 + i * 0.05, type: "spring", stiffness: 420, damping: 16 }} style={{ transformOrigin: `${xy[0]}px ${xy[1]}px` }} />; })}
        </svg>
      </div>
    </div>
  );
}

const groupRoutes = routes.filter((r) => r.usesProjectGroups);
/** فرق سه مسیرِ حوزه‌دار: آورده‌ی شما و آنچه در عوض می‌گیرید */
const routeRole: Record<string, { bring: string; get: string }> = {
  investor: { bring: "سرمایه", get: "به نسبت سهمتان از سود و دارایی پروژه شریک می‌شوید" },
  contractor: { bring: "توان ساخت و اجرا", get: "مبلغ پیمان را بابت کاری که انجام می‌دهید می‌گیرید" },
  operator: { bring: "توان اداره و نگهداری", get: "پروژه‌ی ساخته‌شده را می‌گردانید و از درآمدش سهم می‌برید" },
};

/* ——— گروه‌های پروژه: نوارهای بازشونده از بالا به پایین ——— */
// همان پنل‌های قبلی، چرخیده: هر نوار با هاور در ارتفاع باز می‌شود (همان انیمیشن فنری) و فقط یکی باز است.
export function Categories() {
  const router = useRouter();
  const begin = useStore((s) => s.begin);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<{ image: string; name: string } | null>(null);
  const [routeId, setRouteId] = useState(groupRoutes[0].id);
  const route = groupRoutes.find((r) => r.id === routeId)!;
  const counts = useMemo(() => {
    const g: Record<string, number> = {}, t: Record<string, number> = {};
    for (const l of forRoute(listings, routeId)) if (l.group) { g[l.group] = (g[l.group] ?? 0) + 1; t[`${l.group}/${l.subtype}`] = (t[`${l.group}/${l.subtype}`] ?? 0) + 1; }
    return { g, t };
  }, [routeId]);
  const open = (group: string, subtype?: string) => { begin({ route: routeId, groups: [group], filters: subtype ? { subtypes: [subtype] } : {} }); router.push("/opportunities"); };

  // تفاوت سه مسیر در یک نگاه: شما چه می‌آورید و چه می‌گیرید
  const routeSwitch = (
    <div role="group" aria-label="مسیر" className="flex items-center gap-2">
      {groupRoutes.map((r) => { const I = routeIcons[r.id]; const on = r.id === routeId;
        return (
          <Button key={r.id} type="button" variant="plain" size="auto" aria-pressed={on} onClick={() => setRouteId(r.id)} title={`آورده: ${routeRole[r.id].bring}`}
            className={cn("relative h-9 gap-1.5 rounded-full border px-3.5 text-[13px] font-bold transition-colors", on ? "border-cobalt text-white" : "border-border bg-white text-ink/75 hover:border-ink/25 hover:text-ink")}>
            {on && <motion.span layoutId="cat-route" className="absolute inset-0 rounded-full bg-cobalt" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
            <I size={15} variant="Bulk" className="relative" /><span className="relative">{r.name}</span>
            <span className={cn("relative text-[11px] font-bold tabular-nums", on ? "text-white/70" : "text-muted-foreground")}>{faNumber(forRoute(listings, r.id).length)}</span>
          </Button>
        ); })}
    </div>
  );

  return (
    <section id="categories" className={sectionCls}>
      <SectionHead kicker="زیردسته‌های هر مسیر" title={<>حوزه‌های مسیر «{route.name}»</>} text={`${routeRole[routeId].bring} می‌آورید و ${routeRole[routeId].get}.`} aside={routeSwitch} />
      {/* چیدمان راهنما: فهرست حوزه‌ها در راست، عکس و نوع‌های حوزه‌ی فعال در چپ */}
      <Reveal className="mt-8 grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6">
        <ol className="space-y-1">
          {projectGroups.map((g, i) => { const I = groupIcons[g.id]; const on = i === active; const n = counts.g[g.id] ?? 0;
            return (
              <li key={g.id}>
                <button type="button" onMouseEnter={() => { setActive(i); setPreview(null); }} onFocus={() => { setActive(i); setPreview(null); }} onClick={() => open(g.id)} aria-pressed={on}
                  className={cn("relative flex w-full items-center gap-4 rounded-[1.25rem] px-4 py-2.5 text-right transition-colors duration-300", on ? "bg-white shadow-[0_18px_40px_-28px_rgb(22_32_48/0.45)] ring-1 ring-border" : "hover:bg-white/60")}>
                  {on && <motion.span layoutId="cat-bar" className="absolute inset-y-2.5 right-0 w-[3px] rounded-full bg-cobalt" />}
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl transition-colors", on ? "bg-cobalt text-white" : "bg-muted text-ink/60")}><I size={18} variant="Bulk" /></span>
                  <span className={cn("min-w-0 flex-1 truncate text-[15px] leading-7", on ? "font-extrabold text-ink" : "font-bold text-ink/75")}>{g.name}</span>
                  <span className={cn("shrink-0 text-[12.5px] font-bold tabular-nums", on ? "text-cobalt-deep" : "text-muted-foreground")}>{n ? `${faNumber(n)} پروژه` : "به‌زودی"}</span>
                  <ArrowLeft size={16} className={cn("shrink-0 text-ink transition-all duration-300", on ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0")} />
                </button>
              </li>
            ); })}
        </ol>
        <GroupPanel g={projectGroups[active]} routeName={route.name} counts={counts} preview={preview} setPreview={setPreview} open={open} />
      </Reveal>
    </section>
  );
}

type Group = (typeof projectGroups)[number];
/** پنل حوزه‌ی فعال: عکس با لایه‌ی مشکی، نام حوزه و نوع‌ها به‌صورت بج؛ هاور روی هر نوع عکس همان نوع را نشان می‌دهد */
function GroupPanel({ g, routeName, counts, preview, setPreview, open }: { g: Group; routeName: string; counts: { g: Record<string, number>; t: Record<string, number> }; preview: { image: string; name: string } | null; setPreview: (p: { image: string; name: string } | null) => void; open: (group: string, subtype?: string) => void }) {
  const I = groupIcons[g.id];
  const img = preview?.image || g.image || "/images/hero/field.jpg";
  return (
    <div className="relative isolate min-h-[34rem] overflow-hidden rounded-[2rem] bg-[#16181a] text-white [clip-path:inset(0_round_2rem)] [transform:translateZ(0)]" onMouseLeave={() => setPreview(null)}>
      <AnimatePresence initial={false}>
        <motion.div key={img} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="absolute inset-0 -z-10">
          <Image src={img} alt="" fill sizes="50vw" className="object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(17_19_21/0.9)_0%,rgb(17_19_21/0.66)_26%,rgb(17_19_21/0.12)_55%,transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-black/30 to-transparent" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={g.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="absolute inset-0 flex flex-col justify-between p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="glass-dark inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-bold"><I size={17} variant="Bulk" />{routeName}<ArrowLeft size={13} />حوزه</span>
            <Button variant="plain" size="auto" onClick={() => open(g.id)} className="group/all h-11 gap-2.5 rounded-full bg-white pl-1.5 pr-4 text-[13.5px] font-extrabold text-ink hover:bg-white/90">
              همه پروژه‌ها<span className="grid size-8 place-items-center rounded-full bg-cobalt text-white transition-transform group-hover/all:-translate-x-1"><ArrowLeft size={16} /></span>
            </Button>
          </div>
          <div className="min-w-0">
            {/* زیرعنوان (شمار پروژه‌ها) روبه‌روی عنوان، در همان سطر */}
            <div className="flex min-w-0 items-baseline gap-3">
              <h3 className="shrink-0 text-[1.9rem] font-black leading-[1.4]">{g.name}</h3>
              <AnimatePresence mode="wait">
                <motion.p key={preview?.name ?? "g"} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="min-w-0 truncate text-[14px] font-semibold text-white/75">
                  {preview ? preview.name : `${faNumber(counts.g[g.id] ?? 0)} پروژه در ${faNumber(g.subtypes.length)} نوع`}
                </motion.p>
              </AnimatePresence>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2 border-t border-white/15 pt-5">
              {g.subtypes.map((s, k) => (
                <motion.li key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + k * 0.035, duration: 0.35 }}>
                  <Button variant="plain" size="auto" onClick={() => open(g.id, s.id)}
                    onMouseEnter={() => setPreview({ image: s.image ?? g.image ?? "", name: s.examples || s.name })} onFocus={() => setPreview({ image: s.image ?? g.image ?? "", name: s.examples || s.name })}
                    className="h-8 rounded-full border border-white/25 bg-white/10 px-3.5 text-[11px] font-normal text-white backdrop-blur-sm transition-colors duration-200 hover:border-white hover:bg-white hover:text-ink">
                    {s.name}
                  </Button>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** برچسب‌ها فقط در یک ردیف؛ آنچه جا نشود به «+n» تبدیل می‌شود */
function OneRowBadges({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(items.length);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const fit = () => {
      const m = el.querySelector<HTMLElement>("[data-measure]"); const plus = el.querySelector<HTMLElement>("[data-plus]");
      if (!m || !plus) return;
      const ws = [...m.children].map((c) => (c as HTMLElement).offsetWidth); const W = el.clientWidth, gap = 6, pw = plus.offsetWidth;
      let used = 0, k = 0;
      for (; k < ws.length; k++) {
        const next = used + (k ? gap : 0) + ws[k];
        if (next + (k < ws.length - 1 ? gap + pw : 0) > W) break;
        used = next;
      }
      setN(Math.max(1, k));
    };
    fit(); const ro = new ResizeObserver(fit); ro.observe(el); return () => ro.disconnect();
  }, [items]);
  const badge = "inline-flex h-8 shrink-0 items-center rounded-full border border-ink/10 bg-white/80 px-3.5 text-[12.5px] font-bold text-ink/75";
  return (
    <div ref={ref} className="relative overflow-hidden">
      <div data-measure aria-hidden className="invisible absolute flex w-max gap-1.5">{items.map((x) => <span key={x} className={badge}>{x}</span>)}</div>
      <span data-plus aria-hidden className={cn(badge, "invisible absolute")}>+{faNumber(items.length)}</span>
      <div className="flex gap-1.5 overflow-hidden" title={items.join("، ")}>
        {items.slice(0, n).map((x) => <span key={x} className={cn(badge, "min-w-0 truncate")}>{x}</span>)}
        {n < items.length && <span className={cn(badge, "border-cobalt-soft bg-cobalt-soft font-extrabold text-cobalt-deep")}>+{faNumber(items.length - n)}</span>}
      </div>
    </div>
  );
}

/** توضیح یک‌خطی هر مسیر روی کارت لندینگ */
const routeShort: Record<string, string> = {
  investor: "شراکت با سرمایه و توان خود",
  fund: "سهم در صندوق با مبالغ کوچک‌تر",
  contractor: "به‌کارگیری توان اجرایی در پیمان",
  buyer: "زمین، ملک و کالای اسقاطی",
  lessee: "ملک مناسب فعالیت خود",
  heritage: "سرمایه‌گذاری در بناهای تاریخی",
  charity: "آموزش، درمان و خدمات محله",
  operator: "بهره‌برداری و نگهداری پروژه‌ها",
};

/* ——— دسته‌بندی‌های اصلی (هشت مسیر) ——— */
// تک‌انتخابی‌اند چون هر کدام فیلترهای خودش را دارد؛ تعدادها از داده واقعی شمرده می‌شود.
/** «آورده شما چیست؟»: به‌جای خواندن هشت کارت، اول بگویید چه دارید تا مسیرهای مرتبط پررنگ شوند (بقیه کم‌رنگ می‌مانند و حذف نمی‌شوند) */
const assets: { id: string; label: string; routes: RouteId[] | null }[] = [
  { id: "all", label: "همه مسیرها", routes: null },
  { id: "cash", label: "پول نقد دارم", routes: ["investor", "fund", "buyer", "heritage", "charity"] },
  { id: "skill", label: "توان اجرایی یا تخصص دارم", routes: ["contractor", "operator", "heritage"] },
  { id: "space", label: "دنبال ملک یا فضا هستم", routes: ["buyer", "lessee"] },
];

export function MainCategories() {
  const router = useRouter();
  const begin = useStore((s) => s.begin);
  const [asset, setAsset] = useState("all");
  const fit = assets.find((a) => a.id === asset)!.routes;
  return (
    <section id="routes" className="relative mx-auto mt-20 max-w-7xl px-6">
      <SectionHead kicker="هشت مسیر ورود" title={<>سرمایه، تخصص یا توان اجرایی؛<br />با کدام وارد می‌شوید؟</>} text="هر مسیر پروژه‌ها و شرایط خودش را دارد؛ اول بگویید چه دارید تا مسیرهای مناسب را نشانتان دهیم." />
      <div className="mt-8 flex items-center gap-4">
        <span className="shrink-0 text-[14px] font-extrabold text-ink">آورده شما چیست؟</span>
        <ToggleGroup type="single" spacing={2} value={asset} onValueChange={(v) => v && setAsset(v)} className="flex flex-wrap">
          {assets.map((a) => (
            <ToggleGroupItem key={a.id} value={a.id} className="h-10 rounded-full border border-border bg-white px-4 text-[13px] font-bold text-ink/70 shadow-none hover:border-ink/25 hover:bg-white hover:text-ink data-[state=on]:border-cobalt data-[state=on]:bg-cobalt data-[state=on]:text-white">{a.label}</ToggleGroupItem>
          ))}
        </ToggleGroup>
        <AnimatePresence mode="wait">
          {fit && <motion.span key={asset} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mr-auto text-[13px] font-bold text-muted-foreground">{faNumber(fit.length)} مسیر با آورده شما جور است</motion.span>}
        </AnimatePresence>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-4">
        {routes.map((r, i) => {
          const I = routeIcons[r.id]; const n = forRoute(listings, r.id).length;
          const subs = r.usesProjectGroups ? projectGroups.map((g) => g.name) : (routeSubcategories[r.id] ?? []).map((x) => x.name);
          const on = !fit || fit.includes(r.id);
          return (
            <Reveal key={r.id} delay={(i % 4) * 0.06} className="h-full">
              <Button variant="plain" size="auto" type="button" onClick={() => { begin({ route: r.id }); router.push("/opportunities"); }}
                className={cn("group surface relative isolate flex h-full min-h-[15.5rem] !bg-[radial-gradient(90%_70%_at_100%_0%,rgb(15_118_110/0.10),transparent_60%),linear-gradient(#fff,#fff)] w-full flex-col items-stretch justify-start gap-0 overflow-hidden whitespace-normal rounded-[1.6rem] p-6 text-right transition-all duration-300 hover:-translate-y-1 hover:!border-primary/40 hover:!bg-[radial-gradient(90%_70%_at_100%_0%,rgb(15_118_110/0.16),transparent_60%),linear-gradient(#fff,#fff)] hover:shadow-[0_26px_50px_-30px_rgb(15_118_110/0.45)]",
                  fit && on && "border-cobalt/45 shadow-[0_0_0_3px_rgb(14_83_200/0.08),0_26px_50px_-34px_rgb(14_83_200/0.45)]", !on && "opacity-40 saturate-0 hover:opacity-100 hover:saturate-100")}>
                {/* سرِ کارت فقط آیکون؛ شمار پروژه به پاورقی رفت تا بالای کارت خلوت بماند */}
                <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl bg-muted text-ink transition-colors duration-300 group-hover:bg-primary group-hover:text-white", fit && on && "bg-cobalt-soft text-cobalt-deep")}><I size={23} variant="Bulk" /></span>
                <span title={r.name} className="mt-6 block truncate whitespace-nowrap text-[17px] font-extrabold leading-7 text-ink">{r.name}</span>
                <span className="mt-1.5 block truncate text-[13.5px] leading-6 text-muted-foreground">{routeShort[r.id] ?? r.description}</span>
                {subs.length > 0 && <span className="mt-5 block"><OneRowBadges items={subs} /></span>}
                {/* پاورقی همیشه پایین کارت؛ چه کارت بج داشته باشد چه نه */}
                <span className="mt-auto flex items-center justify-between pt-6">
                  <span className="text-[13px] font-bold text-muted-foreground">{n ? <><b className="font-black text-ink tabular-nums">{faNumber(n)}</b> پروژه</> : "به‌زودی"}</span>
                  <span className="grid size-9 place-items-center rounded-full border border-border text-ink transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white"><ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /></span>
                </span>
              </Button>
            </Reveal>
          );
        })}
      </div>
      <StatsCard />
    </section>
  );
}

/* ——— پروژه‌های منتخب ——— */
export function Featured() {
  const items = listings.filter((l) => l.id.startsWith("DEMO")).slice(0, 6);
  return (
    <section className={sectionCls}>
      <SectionHead kicker="پروژه‌ها" title="تازه‌ترین پروژه‌ها" text="فرصت‌هایی که به‌تازگی اضافه شده‌اند، با شرایط ورود و جزئیات کامل."
        aside={<Link href="/opportunities" className="group inline-flex h-12 items-center gap-2 rounded-full border border-pine/15 bg-white/60 px-5 text-sm font-extrabold text-ink transition-colors hover:border-ink/25 hover:text-ink">همه پروژه‌ها <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" /></Link>} />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((l, i) => <ListingCard key={l.id} listing={l} index={i} comparable />)}</div>
      <CompareTray />
    </section>
  );
}

/* ——— روش کار: سه مرحله در راست، صحنه‌ی کوچک و آرام در چپ ——— */
// مرحله ۱: هر پروژه یک نقطه است؛ با هر شرط، نقطه‌های ناهم‌خوان خاموش می‌شوند و عدد پایین می‌آید.
// مرحله ۲: حلقه‌ی تطابق پر می‌شود و دلیل‌ها یکی‌یکی تیک می‌خورند.
// مرحله ۳: قدم‌های بعدی روی یک خط به هم وصل می‌شوند.
const steps = [
  { t: "شرایط شما با همه پروژه‌ها سنجیده می‌شود", d: "مسیر، حوزه، استان و بودجه، یکی‌یکی روی همه پروژه‌ها اعمال می‌شود تا فقط هم‌خوان‌ها بمانند." },
  { t: "دلیل هر پیشنهاد کنارش نوشته شده", d: "می‌بینید کدام شرط می‌خواند، کدام نمی‌خواند و کدام هنوز نامعلوم است؛ عددی را که نداریم صفر حساب نمی‌کنیم." },
  { t: "قدم بعدی از همان ابتدا روشن است", d: "مدل قرارداد، منبع پول و کارشناس پروژه را یک‌جا می‌بینید." },
];
const STEP_MS = 5200;
const demoCriteria: SearchCriteria = { route: "investor", groups: ["energy"], provinces: ["یزد"], amount: [100, 150], filters: { horizon: 8 } };
const reasonIcon = { met: TickCircle, unmet: CloseCircle, unknown: InfoCircle } as const;
const statusCls = { met: "text-primary", unmet: "text-warn-deep", unknown: "text-ink/35" } as const;

/** هر پروژه یک نقطه؛ نقطه‌هایی که از فیلتر رد نشده‌اند پررنگ می‌مانند */
function DotField({ ids, alive, hit }: { ids: string[]; alive: Set<string>; hit: string }) {
  return (
    <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-x-[7px] gap-y-[6px]" aria-hidden>
      {ids.map((id, i) => { const on = alive.has(id); const h = id === hit;
        return <motion.span key={id} initial={false} animate={{ opacity: on ? 1 : 0.18, scale: h && alive.size <= 3 ? 2.2 : on ? 1 : 0.7 }} transition={{ duration: 0.5, delay: on ? 0 : (i % 30) * 0.006 }}
          className={cn("aspect-square rounded-full", h && alive.size <= 3 ? "bg-cobalt" : on ? "bg-ink/75" : "bg-ink/30")} />; })}
    </div>
  );
}

export function HowItWorks() {
  const [step, setStep] = useState(0);
  const [hold, setHold] = useState(false);
  const [phase, setPhase] = useState(0); // چند شرط از مرحله ۱ اعمال شده
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-120px" });
  useEffect(() => { if (hold || !inView) return; const id = setTimeout(() => setStep((s) => (s + 1) % steps.length), STEP_MS); return () => clearTimeout(id); }, [hold, inView, step]);
  useEffect(() => {
    if (step !== 0 || !inView) return; setPhase(0);
    const ts = [1, 2, 3, 4].map((n) => setTimeout(() => setPhase(n), 450 + n * 750));
    return () => ts.forEach(clearTimeout);
  }, [step, inView]);
  const demo = useMemo(() => {
    const l = listings.find((x) => x.id === "PL-RENEWABLE-01") ?? listings[0];
    const ids = listings.map((x) => x.id);
    const r1 = forRoute(listings, demoCriteria.route);
    const r2 = r1.filter((x) => demoCriteria.groups.includes(x.group ?? ""));
    const r3 = r2.filter((x) => demoCriteria.provinces.includes(x.province ?? "") || x.id === l.id);
    const [lo, hi] = demoCriteria.amount!;
    const r4 = r3.filter((x) => x.id === l.id || x.amount == null || (x.amount >= lo && x.amount <= hi));
    const sets = [listings, r1, r2, r3, r4].map((xs) => new Set(xs.map((x) => x.id)));
    return { l, ids, sets, m: matchListing(l, demoCriteria), o: l.raw as Opportunity };
  }, []);
  const groupName = projectGroups.find((g) => g.id === demo.l.group)?.name ?? "";
  const tokens: [Icon, string][] = [
    [routeIcons[demoCriteria.route], routes.find((r) => r.id === demoCriteria.route)?.name ?? ""],
    [groupIcons[demo.l.group ?? ""] ?? Building4, groupName],
    [Location, demoCriteria.provinces[0]],
    [WalletMoney, `${faNumber(demoCriteria.amount![0])}–${faNumber(demoCriteria.amount![1])} میلیارد`],
  ];
  const alive = demo.sets[step === 0 ? phase : 4];
  const metN = demo.m.reasons.filter((r) => r.status === "met").length;
  const card = (
    <motion.div layoutId="how-card" transition={{ type: "spring", stiffness: 260, damping: 30 }} className="flex items-center gap-3.5 rounded-2xl bg-white p-3 shadow-[0_18px_40px_-28px_rgb(20_30_45/0.35)]">
      <span className="relative size-14 shrink-0 overflow-hidden rounded-xl"><Image src={demo.l.image} alt="" fill sizes="56px" className="object-cover" /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-extrabold text-ink">{demo.l.title}</span>
        <span className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold text-muted-foreground"><Location size={13} />{demo.l.city}، {demo.l.province}</span>
      </span>
      <MatchRing score={demo.m.score} size={50} />
    </motion.div>
  );

  return (
    <section className={sectionCls}>
      <SectionHead kicker="روش کار" title="چرا این پروژه‌ها را به شما نشان می‌دهیم؟" text="هر پیشنهاد از سه مرحله می‌گذرد و دلیلش را کنار همان پروژه می‌بینید." />
      <div ref={ref} className="mt-8 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-14">
        {/* مرحله‌ها */}
        <ol className="relative flex flex-col" onMouseLeave={() => setHold(false)}>
          {steps.map((s, i) => { const on = step === i;
            return (
              <li key={s.t} className="relative">
                <button type="button" onMouseEnter={() => { setStep(i); setHold(true); }} onFocus={() => { setStep(i); setHold(true); }} onClick={() => setStep(i)} aria-pressed={on}
                  className={cn("relative block w-full overflow-hidden rounded-[1.4rem] px-6 py-5 text-right transition-colors duration-500", on ? "bg-white shadow-[0_18px_44px_-30px_rgb(20_30_45/0.4)]" : "hover:bg-white/50")}>
                  <span className="flex items-baseline gap-4">
                    <span className={cn("w-6 shrink-0 text-[15px] font-black tabular-nums transition-colors duration-500", on ? "text-cobalt-deep" : "text-ink/25")}>{faNumber(i + 1)}</span>
                    <span className="min-w-0">
                      <span className={cn("block text-[17px] font-extrabold leading-7 transition-colors duration-500", on ? "text-ink" : "text-ink/45")}>{s.t}</span>
                      <motion.span initial={false} animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }} transition={{ duration: 0.45, ease }} className="block overflow-hidden">
                        <span className="block pt-1.5 text-[13.5px] leading-7 text-muted-foreground">{s.d}</span>
                      </motion.span>
                    </span>
                  </span>
                  {/* نوار زمان مرحله */}
                  {on && <motion.span key={`${i}-${hold}`} className="absolute inset-x-6 bottom-0 h-[2px] origin-right rounded-full bg-ink/80" initial={{ scaleX: hold ? 1 : 0 }} animate={{ scaleX: 1 }} transition={{ duration: hold ? 0 : STEP_MS / 1000, ease: "linear" }} />}
                </button>
              </li>
            ); })}
        </ol>

        {/* صحنه: کوچک، خاکستری‌آبی و آرام؛ تمرکز روی متن مرحله‌ها می‌ماند */}
        <Reveal delay={0.1}>
          {/* صحنه: کارت سفید شیشه‌ای با سربرگ مرحله؛ محتوای هر مرحله روی زمینه‌ی خاکستری‌آبی ملایم داخل آن */}
          <div className="surface overflow-hidden rounded-[1.75rem] p-2">
          <div className="flex items-center gap-3 px-4 pb-3 pt-2.5">
            <span className="flex gap-1.5" aria-hidden><span className="size-2.5 rounded-full bg-ink/15" /><span className="size-2.5 rounded-full bg-ink/15" /><span className="size-2.5 rounded-full bg-ink/15" /></span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="text-[12.5px] font-extrabold text-ink">مرحله {faNumber(step + 1)}: <span className="font-bold text-muted-foreground">{["سنجش شرایط", "دلیل پیشنهاد", "قدم بعدی"][step]}</span></motion.span>
            </AnimatePresence>
            <span className="mr-auto flex gap-1">{steps.map((_, i) => <span key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i === step ? "w-6 bg-cobalt" : i < step ? "w-3 bg-ink/40" : "w-3 bg-ink/12")} />)}</span>
          </div>
          <div className="relative isolate h-[22rem] overflow-hidden rounded-[1.35rem] bg-[linear-gradient(160deg,#eef2f8,#e6ecf6)] p-6">
            <AlgoPattern className="inset-0 -z-10 h-full w-full text-ink/[0.06]" fade="radial" scale={0.8} />
            <AnimatePresence mode="popLayout" initial={false}>
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-6 flex flex-col">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tokens.map(([T, v], i) => (
                      <motion.span key={v} initial={{ opacity: 0.25 }} animate={{ opacity: phase > i ? 1 : 0.3 }} transition={{ duration: 0.35 }}
                        className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-bold transition-colors duration-300", phase > i ? "bg-cobalt text-white" : "bg-white text-ink/60")}>
                        <T size={14} variant="Bulk" />{v}
                      </motion.span>
                    ))}
                  </div>
                  <div className="mt-6"><DotField ids={demo.ids} alive={alive} hit={demo.l.id} /></div>
                  <p className="mt-auto flex items-baseline gap-2 text-[13px] font-bold text-muted-foreground">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span key={alive.size} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.35 }} className="text-[2rem] font-black leading-none tabular-nums text-ink">{faNumber(alive.size)}</motion.span>
                    </AnimatePresence>
                    {phase === 0 ? "پروژه، پیش از هر شرط" : phase < 4 ? "پروژه هنوز می‌مانند" : "پروژه‌ی هم‌خوان با شرایط شما"}
                  </p>
                </motion.div>
              )}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-6 flex flex-col gap-3">
                  {card}
                  <ul className="grid grid-cols-2 gap-2">
                    {demo.m.reasons.slice(0, 6).map((r, i) => { const R = reasonIcon[r.status];
                      return (
                        <motion.li key={r.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.14, duration: 0.4, ease }}
                          className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-[12.5px] font-bold text-ink">
                          <motion.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.45 + i * 0.14, type: "spring", stiffness: 380, damping: 14 }}><R size={17} variant="Bold" className={statusCls[r.status]} /></motion.span>
                          <span className="truncate">{r.label}</span>
                        </motion.li>
                      ); })}
                  </ul>
                  <p className="mt-auto flex items-center gap-4 text-[11.5px] font-bold text-muted-foreground">
                    <span>{faNumber(metN)} از {faNumber(demo.m.reasons.length)} شرط می‌خواند</span>
                    <span className="mr-auto flex items-center gap-1"><TickCircle size={13} variant="Bold" className="text-primary" />می‌خواند</span>
                    <span className="flex items-center gap-1"><CloseCircle size={13} variant="Bold" className="text-warn-deep" />نمی‌خواند</span>
                    <span className="flex items-center gap-1"><InfoCircle size={13} variant="Bold" className="text-ink/35" />نامعلوم</span>
                  </p>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-6 flex flex-col gap-4">
                  {card}
                  <ol className="relative mr-5 space-y-3 pr-7">
                    <motion.span aria-hidden className="absolute right-0 top-2 bottom-2 w-[2px] origin-top rounded-full bg-ink/15" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.9, ease }} />
                    {[["مدل قرارداد", demo.o.model, Hierarchy], ["منبع پول", demo.o.finance.split("؛")[0], WalletMoney], ...(demo.o.expert ? [["کارشناس پروژه", demo.o.expert.name, Call] as const] : [])].map(([k, v, I], i) => { const C = I as Icon;
                      return (
                        <motion.li key={k as string} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.22, duration: 0.5, ease }} className="relative flex items-center gap-3">
                          <motion.span className="absolute -right-[2.05rem] grid size-[18px] place-items-center rounded-full border-2 border-[#e9eef5] bg-ink" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.22, type: "spring", stiffness: 400, damping: 15 }} />
                          <span className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-white px-3.5 py-3 text-[12.5px]">
                            <C size={17} variant="Bulk" className="shrink-0 text-ink/60" />
                            <span className="text-muted-foreground">{k as string}</span><span className="mr-auto truncate font-bold text-ink">{v as string}</span>
                          </span>
                        </motion.li>
                      ); })}
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
