"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Book1, Building4, Buildings, Category2, CloseCircle, Courthouse, FilterSearch, Hierarchy, InfoCircle, Key, Location, Lovely, Map1, MessageQuestion, People, Routing2, ShieldTick, TickCircle, type Icon } from "@/components/iconsax";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { CountUp, MatchRing, Reveal } from "@/components/brand/reveal";
import { ListingCard } from "@/components/listing/listing-card";
import { groupIcons, routeIcons } from "@/components/icons";
import { projectGroups } from "@/data/taxonomy";
import { routes, routeSubcategories } from "@/data/routes";
import { listings } from "@/lib/listings";
import { forRoute, matchListing } from "@/lib/match";
import { libraryTopics } from "@/data/library";
import { tools } from "@/data/tools";
import type { Opportunity, SearchCriteria } from "@/types";
import { useStore } from "@/lib/store";
import { cn, faNumber } from "@/lib/utils";

/** قاعده یکسان تیتر همه سکشن‌ها: برچسب کوچک، تیتر، زیرتیتر کوتاه؛ همیشه راست‌چین. «aside» در سمت چپ و هم‌تراز پایین تیتر می‌نشیند. */
export function SectionHead({ kicker, title, text, aside, className, light }: { kicker: string; title: ReactNode; text: string; aside?: ReactNode; className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-end justify-between gap-10", className)}>
      <Reveal className="min-w-0 max-w-[38rem]">
        <span className={cn("inline-flex items-center gap-2 text-[13px] font-extrabold", light ? "text-white" : "text-primary")}><NodeMark />{kicker}</span>
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
  const t = topics[active];
  return (
    <section className={sectionCls}>
      <SectionHead kicker="راهنما" title="پیش از تصمیم، این پرسش‌ها را روشن کنید" text="پاسخ کوتاه پرسش‌های رایج درباره قرارداد، تضمین و حقوق ملک."
        aside={<Link href="/tools/library" className="group inline-flex h-12 items-center gap-2 rounded-full border border-pine/15 bg-white/60 px-5 text-sm font-extrabold text-ink transition-colors hover:border-primary hover:text-primary">همه راهنماها و منابع<ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" /></Link>} />
      <Reveal className="mt-10 grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-6">
        {/* پرسش‌ها */}
        <ol className="space-y-1.5">
          {topics.map((x, i) => { const I = topicIcons[x.id] ?? MessageQuestion; const on = i === active;
            return (
              <li key={x.id}>
                <button type="button" onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} aria-pressed={on}
                  className={cn("relative flex w-full items-center gap-4 rounded-[1.4rem] px-4 py-3.5 text-right transition-colors duration-300", on ? "bg-white shadow-[0_18px_40px_-28px_rgb(8_59_55/0.45)] ring-1 ring-border" : "hover:bg-white/60")}>
                  {on && <motion.span layoutId="help-bar" className="absolute inset-y-3 right-0 w-[3px] rounded-full bg-primary" />}
                  <span className={cn("w-7 shrink-0 text-[1.35rem] font-black tabular-nums transition-colors", on ? "text-primary" : "text-ink/20")}>{faNumber(i + 1)}</span>
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl transition-colors", on ? "bg-primary text-white" : "bg-primary/[0.08] text-primary")}><I size={19} variant="Bulk" /></span>
                  <span className={cn("min-w-0 flex-1 text-[14.5px] leading-7", on ? "font-extrabold text-ink" : "font-bold text-ink/75")}>{x.title}</span>
                  <ArrowLeft size={16} className={cn("shrink-0 text-primary transition-all duration-300", on ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0")} />
                </button>
              </li>
            ); })}
        </ol>
        {/* پاسخ */}
        <div className="relative isolate min-h-[30rem] overflow-hidden rounded-[2rem] bg-pine text-white">
          <AnimatePresence initial={false}>
            <motion.div key={t.id} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="absolute inset-0 -z-10">
              <Image src={topicImages[t.id] ?? "/images/hero/office.jpg"} alt="" fill sizes="50vw" className="object-cover" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-pine via-pine/85 to-pine/30" />
          <AlgoPattern className="-left-10 -top-10 -z-10 h-2/3 w-2/3 text-white/15" fade="radial" scale={0.6} />
          <span aria-hidden className="pointer-events-none absolute -top-10 left-6 -z-10 select-none text-[13rem] font-black leading-none text-white/[0.07]">؟</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={t.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="flex h-full flex-col justify-end p-8">
              <span className="glass-dark w-fit rounded-full px-3.5 py-1.5 text-xs font-bold">پرسش {faNumber(active + 1)} از {faNumber(topics.length)}</span>
              <h3 className="mt-4 text-[1.45rem] font-black leading-[1.6]">{t.title}</h3>
              <div className="mt-3 space-y-2 text-[14px] leading-8 text-white/80">
                {t.body.map((b, i) => <p key={i}>{b.lead && <b className="font-extrabold text-white">{b.lead} </b>}{b.text}</p>)}
              </div>
              {!!t.tools?.length && (
                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/15 pt-5">
                  <span className="ml-1 text-xs font-bold text-white/60">خدمات مرتبط:</span>
                  {t.tools.map((id) => toolName(id) && <Link key={id} href={`/tools/${id}`} className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[12px] font-bold transition-colors hover:bg-white hover:text-ink">{toolName(id)}</Link>)}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}

/** آمار کلی سایت، برای کنار تیتر مسیرها */
function useLandingStats() {
  const provinces = new Set(listings.map((l) => l.province).filter(Boolean)).size;
  return [
    { n: listings.length, label: "پروژه و فرصت", icon: Buildings },
    { n: projectGroups.length, label: "گروه پروژه", icon: Category2 },
    { n: routes.length, label: "مسیر ورود", icon: Routing2 },
    { n: provinces, label: "استان", icon: Map1 },
  ];
}

const groupRoutes = routes.filter((r) => r.usesProjectGroups);
/** دو ردیف شش‌تایی: یازده حوزه و یک کارت «همه حوزه‌ها» */
const groupRows = [projectGroups.slice(0, 6), projectGroups.slice(6)];

/* ——— گروه‌های پروژه: کارت‌های ایستاده و بازشونده ——— */
// هر کارت با هاور در عرض باز می‌شود (همان انیمیشن فنری)؛ در هر لحظه فقط یک کارت باز است و همه کارت‌ها یک ارتفاع دارند.
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
  const total = forRoute(listings, routeId).length;
  const open = (group?: string, subtype?: string) => { begin({ route: routeId, groups: group ? [group] : [], filters: subtype ? { subtypes: [subtype] } : {} }); router.push("/opportunities"); };

  const routeSwitch = (
    <div role="group" aria-label="مسیر" className="flex items-center gap-1 rounded-full border border-border bg-white/80 p-1 shadow-[0_10px_30px_-24px_rgb(8_59_55/0.4)] backdrop-blur">
      {groupRoutes.map((r) => { const I = routeIcons[r.id]; const on = r.id === routeId;
        return (
          <Button key={r.id} type="button" variant="plain" size="auto" aria-pressed={on} onClick={() => setRouteId(r.id)}
            className={cn("relative h-10 gap-2 rounded-full px-4 text-[13px] font-extrabold transition-colors", on ? "text-white" : "text-ink/70 hover:text-primary")}>
            {on && <motion.span layoutId="cat-route" className="absolute inset-0 -z-0 rounded-full bg-pine shadow-[0_10px_22px_-12px_rgb(8_59_55/0.75)]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
            <span className="relative flex items-center gap-2"><I size={17} variant="Bulk" />{r.name}<span className={cn("text-[11px] font-bold", on ? "text-white/60" : "text-muted-foreground")}>{faNumber(forRoute(listings, r.id).length)}</span></span>
          </Button>
        ); })}
    </div>
  );

  return (
    <section id="categories" className={sectionCls}>
      <SectionHead kicker="زیردسته‌های هر مسیر" title={<>حوزه‌های مسیر «{route.name}»</>} text={`${faNumber(projectGroups.length)} حوزه، هر کدام با انواع پروژه‌اش؛ روی هر حوزه بروید تا انواعش را ببینید.`} aside={routeSwitch} />
      <div className="mt-8 space-y-2.5" onMouseLeave={() => setPreview(null)}>
        {groupRows.map((row, ri) => (
          <div key={ri} className="flex h-[17rem] gap-2.5">
            {row.map((g) => {
              const i = projectGroups.indexOf(g); const I = groupIcons[g.id]; const on = i === active;
              return (
                <motion.div key={g.id} data-panel onMouseEnter={() => { setActive(i); setPreview(null); }} onFocusCapture={() => setActive(i)} onClick={() => setActive(i)}
                  animate={{ flexGrow: on ? 5 : 1 }} transition={{ type: "spring", stiffness: 190, damping: 26 }}
                  className="group/panel relative isolate min-w-0 basis-0 cursor-pointer overflow-hidden rounded-[1.6rem] bg-[#1b1d1d] text-white">
                  <Image src={g.image ?? "/images/hero/field.jpg"} alt="" fill sizes="(max-width:1024px) 100vw, 50vw" className={cn("object-cover transition-all duration-700", on ? "scale-100" : "scale-110 saturate-[0.3]")} />
                  <AnimatePresence>
                    {on && preview && (
                      <motion.div key={preview.image} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
                        <Image src={preview.image} alt="" fill sizes="50vw" className="object-cover" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className={cn("absolute inset-0 transition-colors duration-500", on ? "bg-[linear-gradient(to_top,rgb(0_0_0/0.85),rgb(0_0_0/0.4)_45%,rgb(0_0_0/0.25)_70%,rgb(0_0_0/0.6))]" : "bg-gradient-to-t from-[#1b1d1d]/90 via-[#1b1d1d]/55 to-[#1b1d1d]/35 group-hover/panel:via-[#1b1d1d]/40")} />
                  {on && <AlgoPattern className="-left-6 -top-6 h-2/3 w-2/3 text-white/15 blur-[1px]" fade="radial" scale={0.6} />}

                  {/* حالت بسته: آیکون بالا، نام افقی پایین */}
                  <div className={cn("absolute inset-0 flex flex-col justify-between p-4 transition-opacity duration-300", on ? "pointer-events-none opacity-0" : "opacity-100")}>
                    <span className="grid size-10 place-items-center rounded-2xl bg-white/12 text-white backdrop-blur-sm"><I size={20} variant="Bulk" /></span>
                    <span>
                      <span className="block text-[14px] font-extrabold leading-6">{g.name}</span>
                      <span className="mt-1 block text-[11px] font-bold text-white/60">{faNumber(g.subtypes.length)} نوع{counts.g[g.id] ? ` · ${faNumber(counts.g[g.id])} پروژه` : ""}</span>
                    </span>
                  </div>

                  {/* حالت باز: زیردسته‌ها */}
                  <AnimatePresence>
                    {on && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.18 } }} exit={{ opacity: 0, transition: { duration: 0.1 } }} className="absolute inset-0 flex min-w-[30rem] flex-col justify-between p-5">
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex items-center gap-3">
                            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-white"><I size={22} variant="Bulk" /></span>
                            <span>
                              <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/65">{route.name}<ArrowLeft size={12} />حوزه</span>
                              <motion.h3 initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.22, duration: 0.45 }} className="text-[1.6rem] font-black leading-tight">{g.name}</motion.h3>
                            </span>
                          </span>
                          <AnimatePresence mode="wait">
                            <motion.span key={preview?.name ?? "g"} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-dark max-w-[15rem] truncate rounded-full px-3.5 py-1.5 text-xs font-bold">
                              {preview ? preview.name : `${faNumber(counts.g[g.id] ?? 0)} پروژه`}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                        <ul className="flex flex-wrap gap-1.5">
                          {g.subtypes.map((s, k) => (
                            <motion.li key={s.id} initial={{ opacity: 0, y: 14, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.28 + k * 0.045, duration: 0.4 }}>
                              <Button data-sub variant="plain" size="auto" onClick={(e) => { e.stopPropagation(); open(g.id, s.id); }}
                                onMouseEnter={() => setPreview({ image: s.image ?? g.image ?? "", name: s.examples || s.name })} onFocus={() => setPreview({ image: s.image ?? g.image ?? "", name: s.examples || s.name })}
                                className="group/sub h-auto gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[12px] font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-ink">
                                <span className="size-1.5 rounded-full bg-white transition-all duration-300 group-hover/sub:w-3.5 group-hover/sub:bg-primary" />
                                {s.name}
                                <span className="text-[10.5px] font-semibold opacity-60">{faNumber(counts.t[`${g.id}/${s.id}`] ?? 0)}</span>
                              </Button>
                            </motion.li>
                          ))}
                          <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + g.subtypes.length * 0.045 }}>
                            <Button variant="plain" size="auto" onClick={(e) => { e.stopPropagation(); open(g.id); }} className="group/all h-auto gap-2 rounded-full bg-white py-1 pl-1 pr-3.5 text-[12px] font-extrabold text-ink hover:bg-white/90">
                              همه پروژه‌های {g.name}<span className="grid size-6 place-items-center rounded-full bg-pine text-white transition-transform group-hover/all:-translate-x-0.5"><ArrowLeft size={13} /></span>
                            </Button>
                          </motion.li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
            {/* کارت پایانی ردیف دوم: همه حوزه‌های مسیر */}
            {ri === groupRows.length - 1 && (
              <motion.button type="button" onClick={() => open()} animate={{ flexGrow: 1 }} className="group/allg relative isolate flex min-w-0 basis-0 flex-col justify-between overflow-hidden rounded-[1.6rem] border border-primary/25 bg-primary/[0.06] p-4 text-right transition-colors hover:border-primary hover:bg-primary hover:text-white">
                <AlgoPattern className="inset-0 -z-10 h-full w-full text-primary/25 group-hover/allg:text-white/25" fade="radial" scale={0.5} />
                <span className="grid size-10 place-items-center rounded-2xl bg-primary text-white transition-colors group-hover/allg:bg-white group-hover/allg:text-primary"><Category2 size={20} variant="Bulk" /></span>
                <span>
                  <span className="block text-[1.6rem] font-black leading-none text-primary group-hover/allg:text-white">{faNumber(total)}</span>
                  <span className="mt-2 block text-[14px] font-extrabold leading-6 text-ink group-hover/allg:text-white">همه حوزه‌ها</span>
                  <span className="mt-1 flex items-center gap-1 text-[11px] font-bold text-primary group-hover/allg:text-white/80">دیدن پروژه‌ها<ArrowLeft size={13} className="transition-transform group-hover/allg:-translate-x-1" /></span>
                </span>
              </motion.button>
            )}
          </div>
        ))}
      </div>
    </section>
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
  const badge = "shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-ink/70 transition-colors group-hover:bg-primary/[0.08]";
  return (
    <div ref={ref} className="relative overflow-hidden">
      <div data-measure aria-hidden className="invisible absolute flex w-max gap-1.5">{items.map((x) => <span key={x} className={badge}>{x}</span>)}</div>
      <span data-plus aria-hidden className={cn(badge, "invisible absolute")}>+{faNumber(items.length)}</span>
      <div className="flex gap-1.5 overflow-hidden" title={items.join("، ")}>
        {items.slice(0, n).map((x) => <span key={x} className={cn(badge, "min-w-0 truncate")}>{x}</span>)}
        {n < items.length && <span className={cn(badge, "font-extrabold text-primary")}>+{faNumber(items.length - n)}</span>}
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
export function MainCategories() {
  const router = useRouter();
  const begin = useStore((s) => s.begin);
  const stats = useLandingStats();
  const statsStrip = (
    <dl className="surface flex items-stretch gap-1 rounded-[1.6rem] p-1.5">
      {stats.map((s, i) => { const I = s.icon;
        return (
          <div key={s.label} className={cn("relative isolate flex w-[8.25rem] flex-col justify-between gap-3 overflow-hidden rounded-[1.2rem] px-4 py-3.5", i === 0 ? "bg-pine text-white" : "bg-muted/45")}>
            {i === 0 && <AlgoPattern className="-left-6 -top-6 -z-10 h-[150%] w-[150%] text-white/15" fade="radial" scale={0.45} />}
            <I size={18} variant="Bulk" className={i === 0 ? "text-white/80" : "text-primary"} />
            <span>
              <dd className={cn("text-[1.7rem] font-black leading-none tracking-tight", i === 0 ? "text-white" : "text-ink")}><CountUp value={s.n} /></dd>
              <dt className={cn("mt-1.5 text-[12px] font-bold", i === 0 ? "text-white/70" : "text-muted-foreground")}>{s.label}</dt>
            </span>
          </div>
        ); })}
    </dl>
  );
  return (
    <section id="routes" className="relative mx-auto mt-20 max-w-7xl px-6">
      <AlgoPattern animated className="-left-24 -top-16 -z-10 h-[26rem] w-[40rem] text-ink/[0.07]" fade="radial" />
      <AlgoPattern animated className="-bottom-24 -right-20 -z-10 h-[22rem] w-[34rem] text-primary/[0.09]" fade="radial" scale={0.8} />
      <SectionHead kicker="هشت مسیر ورود" title={<>سرمایه، تخصص یا توان اجرایی؛<br />با کدام وارد می‌شوید؟</>} text="هر مسیر پروژه‌ها و شرایط خودش را دارد؛ مسیرتان را انتخاب کنید." aside={statsStrip} />
      <div className="mt-10 grid grid-cols-4 gap-4">
        {routes.map((r, i) => {
          const I = routeIcons[r.id]; const n = forRoute(listings, r.id).length;
          const subs = r.usesProjectGroups ? projectGroups.map((g) => g.name) : (routeSubcategories[r.id] ?? []).map((x) => x.name);
          return (
            <Reveal key={r.id} delay={(i % 4) * 0.06} className="h-full">
              <Button variant="plain" size="auto" type="button" onClick={() => { begin({ route: r.id }); router.push("/opportunities"); }}
                className="group surface relative isolate flex h-full w-full flex-col items-stretch justify-start gap-0 overflow-hidden whitespace-normal rounded-[1.6rem] p-5 text-right transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_26px_50px_-30px_rgb(8_59_55/0.35)]">
                <span aria-hidden className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-primary/[0.07] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="flex items-center justify-between gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/[0.08] text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white"><I size={22} variant="Bulk" /></span>
                  {n > 0 && <span className="rounded-full bg-pine-soft px-2.5 py-1 text-[11px] font-extrabold tabular-nums text-pine">{faNumber(n)} پروژه</span>}
                </span>
                <span className="mt-4 block text-[16px] font-extrabold leading-7 text-ink">{r.name}</span>
                <span className="mt-0.5 block truncate text-[12.5px] font-normal leading-6 text-muted-foreground">{routeShort[r.id] ?? r.description}</span>
                <span className="mt-3.5 block"><OneRowBadges items={subs} /></span>
                <span className="mt-auto flex items-center justify-between border-t border-dashed border-border pt-3.5 text-xs font-bold text-primary" style={{ marginTop: 16 }}>
                  <NodeMark className="text-ink/20 transition-colors duration-300 group-hover:text-primary" />
                  <span className="flex items-center gap-1">{n ? "دیدن پروژه‌ها" : "به‌زودی"}<ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /></span>
                </span>
              </Button>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ——— پروژه‌های منتخب ——— */
export function Featured() {
  const items = listings.filter((l) => l.id.startsWith("DEMO")).slice(0, 6);
  return (
    <section className={sectionCls}>
      <SectionHead kicker="پروژه‌ها" title="تازه‌ترین پروژه‌ها" text="فرصت‌هایی که به‌تازگی اضافه شده‌اند، با شرایط ورود و جزئیات کامل."
        aside={<Link href="/opportunities" className="group inline-flex h-12 items-center gap-2 rounded-full border border-pine/15 bg-white/60 px-5 text-sm font-extrabold text-ink transition-colors hover:border-primary hover:text-primary">همه پروژه‌ها <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" /></Link>} />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}</div>
    </section>
  );
}

/* ——— روش کار: سه مرحله در راست، یک نمونه واقعی از نتیجه در چپ ——— */
const steps = [
  { t: "شرایط شما با هر پروژه سنجیده می‌شود", d: "مسیر، حوزه، محل و بودجه‌ای که وارد می‌کنید با شرایط ورود هر پروژه مقایسه می‌شود.", icon: FilterSearch, tags: ["مسیر", "حوزه", "استان و شهر", "بودجه"] },
  { t: "دلیل هر پیشنهاد کنارش نوشته شده", d: "می‌بینید کدام شرط می‌خواند، کدام نمی‌خواند و کدام هنوز نامعلوم است؛ عددی را که نداریم صفر حساب نمی‌کنیم.", icon: TickCircle, tags: ["می‌خواند", "نمی‌خواند", "نامعلوم"] },
  { t: "قدم بعدی از همان ابتدا روشن است", d: "مدل قرارداد، منبع پول، نحوه دریافت عایدی و گام‌های بعدی هر پروژه را یک‌جا می‌بینید.", icon: Routing2, tags: ["مدل قرارداد", "منبع پول", "دریافت عایدی", "گام بعدی"] },
];
const demoCriteria: SearchCriteria = { route: "investor", groups: ["energy"], provinces: ["یزد"], amount: [100, 150], filters: { horizon: 8 } };
const reasonIcon = { met: TickCircle, unmet: CloseCircle, unknown: InfoCircle } as const;

export function HowItWorks() {
  const [step, setStep] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => { if (hold) return; const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 3800); return () => clearInterval(id); }, [hold]);
  const demo = useMemo(() => { const l = listings.find((x) => x.id === "PL-RENEWABLE-01") ?? listings[0]; return { l, m: matchListing(l, demoCriteria), o: l.raw as Opportunity }; }, []);
  const groupName = projectGroups.find((g) => g.id === demo.l.group)?.name ?? "";
  const dim = (i: number) => cn("transition-all duration-500", step === i ? "opacity-100" : "opacity-35");

  return (
    <section className={sectionCls}>
      <SectionHead kicker="روش کار" title="چرا این پروژه‌ها را به شما نشان می‌دهیم؟" text="هر پیشنهاد از سه مرحله می‌گذرد و دلیلش را کنار همان پروژه می‌بینید." />
      <div className="mt-10 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6" onMouseLeave={() => setHold(false)}>
        {/* مرحله‌ها */}
        <ol className="flex flex-col gap-3">
          {steps.map((s, i) => { const I = s.icon; const on = step === i;
            return (
              <Reveal key={s.t} delay={i * 0.1} className="flex-1">
                <button type="button" onMouseEnter={() => { setStep(i); setHold(true); }} onFocus={() => { setStep(i); setHold(true); }} onClick={() => setStep(i)} aria-pressed={on}
                  className={cn("relative isolate flex h-full w-full items-center gap-5 overflow-hidden rounded-[1.6rem] border p-5 text-right transition-all duration-500", on ? "border-primary/30 bg-white shadow-[0_24px_50px_-34px_rgb(8_59_55/0.5)]" : "border-transparent bg-white/45 hover:bg-white/70")}>
                  <span className={cn("w-8 shrink-0 text-center text-[2.6rem] font-black leading-none tabular-nums transition-colors duration-500", on ? "text-primary" : "text-ink/15")}>{faNumber(i + 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <I size={18} variant="Bulk" className={on ? "text-primary" : "text-ink/40"} />
                      <span className="text-[16px] font-extrabold leading-7 text-ink">{s.t}</span>
                    </span>
                    <span className="mt-1.5 block text-[13px] leading-7 text-muted-foreground">{s.d}</span>
                    <span className="mt-3 flex flex-wrap gap-1.5">{s.tags.map((x) => <span key={x} className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors duration-500", on ? "bg-primary/[0.08] text-primary" : "bg-muted text-ink/55")}>{x}</span>)}</span>
                  </span>
                  {on && !hold && <motion.span key={`p${i}`} className="absolute bottom-0 right-0 h-[3px] bg-primary" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3.8, ease: "linear" }} />}
                </button>
              </Reveal>
            ); })}
        </ol>

        {/* نمونه نتیجه */}
        <Reveal delay={0.15} className="h-full">
          <div className="relative isolate flex h-full flex-col gap-4 overflow-hidden rounded-[2rem] bg-pine p-6 text-white">
            <AlgoPattern animated className="-left-16 -top-16 -z-10 h-[80%] w-[90%] text-white/[0.12]" fade="radial" scale={0.7} />
            <span className="glass-dark w-fit rounded-full px-3 py-1 text-[11px] font-bold">یک نمونه از نتیجه</span>
            {/* ۱: شرایط شما */}
            <div className={dim(0)}>
              <p className="mb-2 text-[11px] font-bold text-white/60">شرایطی که وارد کرده‌اید</p>
              <div className="flex flex-wrap gap-1.5 text-[12px] font-bold">
                {[routes.find((r) => r.id === demoCriteria.route)?.name, `حوزه ${groupName}`, `استان ${demoCriteria.provinces[0]}`, `بودجه ${faNumber(demoCriteria.amount![0])} تا ${faNumber(demoCriteria.amount![1])} میلیارد تومان`, `بازگشت تا ${faNumber(8)} سال`].map((x) => <span key={x} className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">{x}</span>)}
              </div>
            </div>
            {/* کارت پروژه */}
            <div className="glass-strong flex items-center gap-3.5 rounded-[1.4rem] p-3 text-ink">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl"><Image src={demo.l.image} alt="" fill sizes="64px" className="object-cover" /><span className="absolute inset-0 bg-pine/25" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-extrabold">{demo.l.title}</span>
                <span className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold text-muted-foreground"><Location size={13} />{demo.l.city}، {demo.l.province}</span>
              </span>
              <MatchRing score={demo.m.score} size={56} />
            </div>
            {/* ۲: دلیل‌ها */}
            <div className={dim(1)}>
              <p className="mb-2 text-[11px] font-bold text-white/60">چرا این پروژه؟</p>
              <ul className="grid grid-cols-2 gap-1.5">
                {demo.m.reasons.map((r) => { const R = reasonIcon[r.status];
                  return <li key={r.label} className="flex items-center gap-2 rounded-xl bg-white/[0.07] px-3 py-2 text-[12px] font-bold"><R size={16} variant="Bulk" className={r.status === "met" ? "text-[#7dd3c8]" : r.status === "unmet" ? "text-[#f2a07b]" : "text-white/55"} />{r.label}<span className="mr-auto text-[11px] font-semibold text-white/55">{r.status === "met" ? "می‌خواند" : r.status === "unmet" ? "نمی‌خواند" : "نامعلوم"}</span></li>; })}
              </ul>
            </div>
            {/* ۳: قدم بعدی */}
            <div className={cn(dim(2), "mt-auto")}>
              <p className="mb-2 text-[11px] font-bold text-white/60">قدم بعدی</p>
              <dl className="divide-y divide-white/10 rounded-2xl bg-white/[0.07] px-4 text-[12px]">
                <div className="flex items-center justify-between gap-4 py-2.5"><dt className="text-white/60">مدل قرارداد</dt><dd className="font-bold">{demo.o.model}</dd></div>
                <div className="flex items-center justify-between gap-4 py-2.5"><dt className="shrink-0 text-white/60">منبع پول</dt><dd className="truncate font-bold">{demo.o.finance.split("؛")[0]}</dd></div>
                {demo.o.expert && <div className="flex items-center justify-between gap-4 py-2.5"><dt className="text-white/60">کارشناس پروژه</dt><dd className="font-bold">{demo.o.expert.name}</dd></div>}
              </dl>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
