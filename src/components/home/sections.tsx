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
import { groupIcons, routeIcons } from "@/components/icons";
import { projectGroups } from "@/data/taxonomy";
import { routes, routeSubcategories } from "@/data/routes";
import { provinces as provinceList } from "@/data/provinces";
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
                  {on && <motion.span layoutId="help-bar" className="absolute inset-y-3 right-0 w-[3px] rounded-full bg-ink" />}
                  <span className={cn("w-7 shrink-0 text-[1.35rem] font-black tabular-nums transition-colors", on ? "text-ink" : "text-ink/20")}>{faNumber(i + 1)}</span>
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl transition-colors", on ? "bg-ink text-white" : "bg-muted text-ink/60")}><I size={19} variant="Bulk" /></span>
                  <span className={cn("min-w-0 flex-1 text-[14.5px] leading-7", on ? "font-extrabold text-ink" : "font-bold text-ink/75")}>{x.title}</span>
                  <ArrowLeft size={16} className={cn("shrink-0 text-ink transition-all duration-300", on ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0")} />
                </button>
              </li>
            ); })}
        </ol>
        {/* پاسخ */}
        <div className="relative isolate min-h-[30rem] overflow-hidden rounded-[2rem] bg-[#16181a] text-white">
          <AnimatePresence initial={false}>
            <motion.div key={t.id} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="absolute inset-0 -z-10">
              <Image src={topicImages[t.id] ?? "/images/hero/office.jpg"} alt="" fill sizes="50vw" className="object-cover" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#111315] via-[#111315]/80 to-[#111315]/25" />
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

/* ——— آمار کلی: کارت داده با نمودار کوچک ——— */
// عدد اصلی با نمودار پراکندگی پروژه‌ها در گروه‌ها (راست به چپ)، و سه عدد دیگر هر کدام با نمایش تصویری خودش
const ease = [0.22, 1, 0.36, 1] as const;
function StatsCard() {
  const [hover, setHover] = useState<number | null>(null);
  const byGroup = projectGroups.map((g) => ({ name: g.name, n: listings.filter((l) => l.group === g.id).length }));
  const max = Math.max(...byGroup.map((x) => x.n), 1);
  const has = new Set(listings.map((l) => l.province).filter(Boolean));
  const active = provinceList.filter((p) => has.has(p)).length;
  return (
    <div className="surface w-[34rem] rounded-[1.6rem] p-5">
      <div className="flex items-end gap-6">
        <div className="shrink-0">
          <p className="text-[12px] font-bold text-muted-foreground">پروژه و فرصت</p>
          <p className="mt-1 text-[2.8rem] font-black leading-none tracking-tight text-ink"><CountUp value={listings.length} /></p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex h-16 items-end gap-1.5" onMouseLeave={() => setHover(null)}>
            {byGroup.map((g, i) => (
              <motion.span key={g.name} onMouseEnter={() => setHover(i)} title={`${g.name}: ${faNumber(g.n)}`}
                initial={{ height: 0 }} whileInView={{ height: `${Math.max(6, (g.n / max) * 100)}%` }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.05, duration: 0.8, ease }}
                className={cn("flex-1 cursor-default rounded-t-[5px] transition-colors duration-200", hover === i || (hover == null && g.n === max) ? "bg-primary" : hover == null ? "bg-ink/[0.1]" : "bg-ink/[0.06]")} />
            ))}
          </div>
          <p className="mt-2 h-4 truncate text-[11px] font-bold text-muted-foreground">
            {(() => { const k = hover ?? byGroup.findIndex((x) => x.n === max); return <>{hover == null && "بیشترین: "}<span className="text-ink">{byGroup[k].name}</span> · {faNumber(byGroup[k].n)} پروژه</>; })()}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 border-t border-border pt-4">
        <div className="pl-4">
          <p className="flex items-baseline gap-1.5"><span className="text-[1.45rem] font-black leading-none text-ink"><CountUp value={active} /></span><span className="text-[11px] font-bold text-muted-foreground">استان از {faNumber(provinceList.length)}</span></p>
          <div className="mt-2.5 grid w-fit grid-cols-[repeat(11,auto)] gap-[3px]">
            {provinceList.map((p, i) => (
              <motion.span key={p} title={p} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.02, type: "spring", stiffness: 400, damping: 18 }}
                className={cn("size-[7px] rounded-full", has.has(p) ? "bg-primary" : "bg-ink/10")} />
            ))}
          </div>
        </div>
        <div className="border-r border-border px-4">
          <p className="flex items-baseline gap-1.5"><span className="text-[1.45rem] font-black leading-none text-ink"><CountUp value={projectGroups.length} /></span><span className="text-[11px] font-bold text-muted-foreground">گروه پروژه</span></p>
          <div className="mt-2.5 grid w-fit grid-cols-6 gap-x-1.5 gap-y-1">
            {projectGroups.map((g, i) => { const I = groupIcons[g.id];
              return <motion.span key={g.id} title={g.name} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 + i * 0.04 }} className="grid size-[13px] place-items-center text-ink/45"><I size={13} variant="Bulk" /></motion.span>; })}
          </div>
        </div>
        <div className="border-r border-border pr-4">
          <p className="flex items-baseline gap-1.5"><span className="text-[1.45rem] font-black leading-none text-ink"><CountUp value={routes.length} /></span><span className="text-[11px] font-bold text-muted-foreground">مسیر ورود</span></p>
          <div className="mt-2.5 flex items-center">
            {routes.map((r, i) => (
              <motion.span key={r.id} title={r.name} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.06, duration: 0.35 }} style={{ originX: 1 }} className="flex items-center">
                <span className="size-[7px] rounded-full border-[1.5px] border-primary bg-white" />{i < routes.length - 1 && <span className="h-px w-[9px] bg-primary/40" />}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const groupRoutes = routes.filter((r) => r.usesProjectGroups);

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

  const routeSwitch = (
    <div role="group" aria-label="مسیر" className="flex items-center gap-1 rounded-full border border-border bg-white p-1">
      {groupRoutes.map((r) => { const I = routeIcons[r.id]; const on = r.id === routeId;
        return (
          <Button key={r.id} type="button" variant="plain" size="auto" aria-pressed={on} onClick={() => setRouteId(r.id)}
            className={cn("relative h-10 gap-2 rounded-full px-4 text-[13px] font-extrabold transition-colors", on ? "text-white" : "text-ink/65 hover:text-ink")}>
            {on && <motion.span layoutId="cat-route" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
            <span className="relative flex items-center gap-2"><I size={17} variant="Bulk" />{r.name}<span className={cn("text-[11px] font-bold", on ? "text-white/60" : "text-muted-foreground")}>{faNumber(forRoute(listings, r.id).length)}</span></span>
          </Button>
        ); })}
    </div>
  );

  return (
    <section id="categories" className={sectionCls}>
      <SectionHead kicker="زیردسته‌های هر مسیر" title={<>حوزه‌های مسیر «{route.name}»</>} text={route.description} aside={routeSwitch} />
      <div className="mt-8 flex h-[52rem] flex-col gap-2" onMouseLeave={() => setPreview(null)}>
        {projectGroups.map((g, i) => {
          const I = groupIcons[g.id]; const on = i === active;
          return (
            <motion.div key={g.id} data-panel onPointerMove={(e) => { if (i !== active && (e.movementX || e.movementY)) { setActive(i); setPreview(null); } }} onFocusCapture={() => setActive(i)} onClick={() => setActive(i)}
              animate={{ flexGrow: on ? 6.5 : 1 }} transition={{ type: "spring", stiffness: 190, damping: 26 }}
              className="group/panel relative isolate min-h-0 basis-0 cursor-pointer overflow-hidden rounded-[1.4rem] bg-[#1b1d1f] text-white">
              <Image src={g.image ?? "/images/hero/field.jpg"} alt="" fill sizes="90vw" className={cn("object-cover transition-all duration-700", on ? "scale-100" : "scale-110 grayscale")} />
              <AnimatePresence>
                {on && preview && (
                  <motion.div key={preview.image} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
                    <Image src={preview.image} alt="" fill sizes="90vw" className="object-cover" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className={cn("absolute inset-0 transition-colors duration-500", on ? "bg-[linear-gradient(to_left,rgb(10_11_12/0.88),rgb(10_11_12/0.55)_45%,rgb(10_11_12/0.15))]" : "bg-[#141618]/75 group-hover/panel:bg-[#141618]/60")} />

              {/* حالت بسته: آیکون و نام افقی */}
              <div className={cn("absolute inset-0 flex items-center gap-3 px-5 transition-opacity duration-300", on ? "pointer-events-none opacity-0" : "opacity-100")}>
                <I size={19} variant="Bulk" className="shrink-0 text-white/80" />
                <span className="text-[14px] font-extrabold">{g.name}</span>
                <span className="text-[11px] font-bold text-white/50">{faNumber(g.subtypes.length)} نوع</span>
                <span className="mr-auto text-[12px] font-bold text-white/70">{faNumber(counts.g[g.id] ?? 0)} پروژه</span>
              </div>

              {/* حالت باز: زیردسته‌ها */}
              <AnimatePresence>
                {on && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.18 } }} exit={{ opacity: 0, transition: { duration: 0.1 } }} className="absolute inset-0 flex min-h-[18rem] flex-col justify-between p-7">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-12 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur-sm"><I size={24} variant="Bulk" /></span>
                      <AnimatePresence mode="wait">
                        <motion.span key={preview?.name ?? "g"} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-dark max-w-[24rem] truncate rounded-full px-3.5 py-1.5 text-xs font-bold">
                          {preview ? preview.name : `${faNumber(counts.g[g.id] ?? 0)} پروژه`}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="max-w-3xl">
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-white/70">{route.name}<ArrowLeft size={13} />حوزه</p>
                      <motion.h3 initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.22, duration: 0.5 }} className="text-3xl font-black">{g.name}</motion.h3>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {g.subtypes.map((s, k) => (
                          <motion.li key={s.id} initial={{ opacity: 0, y: 14, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.28 + k * 0.045, duration: 0.4 }}>
                            <Button data-sub variant="plain" size="auto" onClick={(e) => { e.stopPropagation(); open(g.id, s.id); }}
                              onMouseEnter={() => setPreview({ image: s.image ?? g.image ?? "", name: s.examples || s.name })} onFocus={() => setPreview({ image: s.image ?? g.image ?? "", name: s.examples || s.name })}
                              className="group/sub h-auto gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[13px] font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-white hover:text-ink">
                              <span className="size-1.5 rounded-full bg-white transition-all duration-300 group-hover/sub:w-4 group-hover/sub:bg-ink" />
                              {s.name}
                              <span className="text-[11px] font-semibold opacity-60">{faNumber(counts.t[`${g.id}/${s.id}`] ?? 0)}</span>
                            </Button>
                          </motion.li>
                        ))}
                      </ul>
                      <Button variant="plain" size="auto" onClick={(e) => { e.stopPropagation(); open(g.id); }} className="group/all mt-5 h-12 gap-3 rounded-full bg-white pl-1.5 pr-5 text-sm font-extrabold text-ink hover:bg-white/90">
                        همه پروژه‌های {g.name}<span className="grid size-9 place-items-center rounded-full bg-ink text-white transition-transform group-hover/all:-translate-x-1"><ArrowLeft size={16} /></span>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
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
  const badge = "shrink-0 rounded-md border border-border px-2 py-[3px] text-[11px] font-semibold text-ink/65";
  return (
    <div ref={ref} className="relative overflow-hidden">
      <div data-measure aria-hidden className="invisible absolute flex w-max gap-1.5">{items.map((x) => <span key={x} className={badge}>{x}</span>)}</div>
      <span data-plus aria-hidden className={cn(badge, "invisible absolute")}>+{faNumber(items.length)}</span>
      <div className="flex gap-1.5 overflow-hidden" title={items.join("، ")}>
        {items.slice(0, n).map((x) => <span key={x} className={cn(badge, "min-w-0 truncate")}>{x}</span>)}
        {n < items.length && <span className={cn(badge, "font-extrabold text-ink")}>+{faNumber(items.length - n)}</span>}
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
  return (
    <section id="routes" className="relative mx-auto mt-20 max-w-7xl px-6">
      <SectionHead kicker="هشت مسیر ورود" title={<>سرمایه، تخصص یا توان اجرایی؛<br />با کدام وارد می‌شوید؟</>} text="هر مسیر پروژه‌ها و شرایط خودش را دارد؛ مسیرتان را انتخاب کنید." aside={<StatsCard />} />
      <div className="mt-10 grid grid-cols-4 gap-4">
        {routes.map((r, i) => {
          const I = routeIcons[r.id]; const n = forRoute(listings, r.id).length;
          const subs = r.usesProjectGroups ? projectGroups.map((g) => g.name) : (routeSubcategories[r.id] ?? []).map((x) => x.name);
          return (
            <Reveal key={r.id} delay={(i % 4) * 0.06} className="h-full">
              <Button variant="plain" size="auto" type="button" onClick={() => { begin({ route: r.id }); router.push("/opportunities"); }}
                className="group flex h-full w-full flex-col items-stretch justify-start gap-0 whitespace-normal rounded-[1.4rem] border border-border bg-white p-5 text-right transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_22px_44px_-30px_rgb(20_30_45/0.3)]">
                <span className="grid size-10 place-items-center rounded-xl bg-muted text-ink/70 transition-colors duration-300 group-hover:bg-ink group-hover:text-white"><I size={20} variant="Bulk" /></span>
                <span className="mt-4 block text-[15.5px] font-extrabold leading-7 text-ink">{r.name}</span>
                <span className="block truncate text-[12.5px] leading-6 text-muted-foreground">{routeShort[r.id] ?? r.description}</span>
                {subs.length > 0 && <span className="mt-3 block"><OneRowBadges items={subs} /></span>}
                <span className="mt-auto flex items-center justify-between border-t border-border pt-3.5 text-[12px] font-bold">
                  <span className={n ? "text-ink" : "text-muted-foreground"}>{n ? `${faNumber(n)} پروژه` : "به‌زودی"}</span>
                  <span className="grid size-8 place-items-center rounded-full text-ink/50 transition-all duration-300 group-hover:bg-primary group-hover:text-white"><ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /></span>
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

/* ——— روش کار: سه مرحله روی یک خط زمانی در راست، صحنه‌ی متحرک همان مرحله در چپ ——— */
const steps = [
  { t: "شرایط شما با هر پروژه سنجیده می‌شود", d: "مسیر، حوزه، محل و بودجه‌ای که وارد می‌کنید با شرایط ورود هر پروژه مقایسه می‌شود." },
  { t: "دلیل هر پیشنهاد کنارش نوشته شده", d: "می‌بینید کدام شرط می‌خواند، کدام نمی‌خواند و کدام هنوز نامعلوم است؛ عددی را که نداریم صفر حساب نمی‌کنیم." },
  { t: "قدم بعدی از همان ابتدا روشن است", d: "مدل قرارداد، منبع پول، نحوه دریافت عایدی و گام‌های بعدی هر پروژه را یک‌جا می‌بینید." },
];
const STEP_MS = 4200;
const demoCriteria: SearchCriteria = { route: "investor", groups: ["energy"], provinces: ["یزد"], amount: [100, 150], filters: { horizon: 8 } };
const reasonIcon = { met: TickCircle, unmet: CloseCircle, unknown: InfoCircle } as const;
const statusText = { met: "می‌خواند", unmet: "نمی‌خواند", unknown: "نامعلوم" } as const;
const statusCls = { met: "text-primary", unmet: "text-coral-deep", unknown: "text-ink/40" } as const;

export function HowItWorks() {
  const [step, setStep] = useState(0);
  const [hold, setHold] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-120px" });
  useEffect(() => { if (hold || !inView) return; const id = setTimeout(() => setStep((s) => (s + 1) % steps.length), STEP_MS); return () => clearTimeout(id); }, [hold, inView, step]);
  const demo = useMemo(() => {
    const l = listings.find((x) => x.id === "PL-RENEWABLE-01") ?? listings[0];
    const pool = listings.filter((x) => x.group === l.group && x.id !== l.id).slice(0, 3);
    return { l, m: matchListing(l, demoCriteria), o: l.raw as Opportunity, pool: [pool[0], l, pool[1], pool[2]].filter(Boolean) };
  }, []);
  const groupName = projectGroups.find((g) => g.id === demo.l.group)?.name ?? "";
  const criteria = [
    ["مسیر", routes.find((r) => r.id === demoCriteria.route)?.name ?? ""],
    ["حوزه", groupName],
    ["استان", demoCriteria.provinces[0]],
    ["بودجه", `${faNumber(demoCriteria.amount![0])} تا ${faNumber(demoCriteria.amount![1])} میلیارد تومان`],
  ];
  const card = (compact?: boolean) => (
    <motion.div layoutId="how-card" transition={{ type: "spring", stiffness: 260, damping: 30 }} className="flex items-center gap-3.5 rounded-2xl border border-border bg-white p-3 shadow-[0_18px_40px_-30px_rgb(20_30_45/0.35)]">
      <motion.span layout className={cn("relative shrink-0 overflow-hidden rounded-xl", compact ? "size-12" : "size-16")}><Image src={demo.l.image} alt="" fill sizes="64px" className="object-cover" /></motion.span>
      <motion.span layout className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-extrabold text-ink">{demo.l.title}</span>
        <span className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold text-muted-foreground"><Location size={13} />{demo.l.city}، {demo.l.province}</span>
      </motion.span>
      <motion.span layout><MatchRing score={demo.m.score} size={compact ? 46 : 54} /></motion.span>
    </motion.div>
  );

  return (
    <section className={sectionCls}>
      <SectionHead kicker="روش کار" title="چرا این پروژه‌ها را به شما نشان می‌دهیم؟" text="هر پیشنهاد از سه مرحله می‌گذرد و دلیلش را کنار همان پروژه می‌بینید." />
      <div ref={ref} className="mt-10 grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-stretch gap-10">
        {/* خط زمانی مرحله‌ها */}
        <ol className="relative flex flex-col justify-center" onMouseLeave={() => setHold(false)}>
          {steps.map((s, i) => { const on = step === i; const done = i < step;
            return (
              <li key={s.t} className="relative flex gap-5 pb-9 last:pb-0">
                {i < steps.length - 1 && (
                  <span className="absolute right-[1.2rem] top-11 bottom-1 w-px bg-border">
                    <motion.span className="absolute inset-x-0 top-0 origin-top bg-ink" initial={false} animate={{ height: done ? "100%" : on && !hold ? "100%" : "0%" }} transition={{ duration: on && !hold ? STEP_MS / 1000 : 0.4, ease: "linear" }} />
                  </span>
                )}
                <button type="button" onMouseEnter={() => { setStep(i); setHold(true); }} onFocus={() => { setStep(i); setHold(true); }} onClick={() => setStep(i)} aria-pressed={on} className="flex gap-5 text-right">
                  <span className={cn("relative grid size-10 shrink-0 place-items-center rounded-full border text-[15px] font-black transition-all duration-500", on ? "border-ink bg-ink text-white" : done ? "border-ink/30 bg-white text-ink" : "border-border bg-white text-ink/35")}>
                    {on && <motion.span layoutId="how-ring" className="absolute -inset-1.5 rounded-full border border-ink/15" />}
                    {faNumber(i + 1)}
                  </span>
                  <span className="pt-1.5">
                    <span className={cn("block text-[17px] font-extrabold leading-7 transition-colors duration-500", on ? "text-ink" : "text-ink/45")}>{s.t}</span>
                    <motion.span initial={false} animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }} transition={{ duration: 0.45, ease }} className="block overflow-hidden">
                      <span className="block pt-1.5 text-[13.5px] leading-7 text-muted-foreground">{s.d}</span>
                    </motion.span>
                  </span>
                </button>
              </li>
            ); })}
        </ol>

        {/* صحنه */}
        <Reveal delay={0.1}>
          <div className="relative isolate h-[24.5rem] overflow-hidden rounded-[1.75rem] border border-border bg-[radial-gradient(rgb(20_30_45/0.09)_1px,transparent_1px)] bg-white p-7 [background-size:18px_18px]">
            <span className="absolute left-6 top-6 text-[11px] font-bold text-muted-foreground">نمونه با داده‌ی یک پروژه</span>
            <AnimatePresence mode="popLayout" initial={false}>
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-7 top-14 grid grid-cols-[1fr_1fr] gap-6">
                  <div className="space-y-2">
                    <p className="mb-3 text-[12px] font-extrabold text-ink">شرایط شما</p>
                    {criteria.map(([k, v], i) => (
                      <motion.div key={k} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.18, duration: 0.45, ease }} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-3.5 py-2.5 text-[12.5px]">
                        <span className="text-muted-foreground">{k}</span><span className="truncate font-bold text-ink">{v}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="relative space-y-2">
                    <p className="mb-3 text-[12px] font-extrabold text-ink">{faNumber(listings.length)} پروژه</p>
                    {demo.pool.map((l, i) => { const hit = l.id === demo.l.id;
                      return (
                        <motion.div key={l.id} initial={{ opacity: 0 }} animate={{ opacity: hit ? 1 : [1, 1, 0.35] }} transition={{ delay: 0.2 + i * 0.1, duration: 2.2, times: [0, 0.6, 1] }}
                          className={cn("flex items-center gap-2.5 rounded-xl border bg-white p-2 transition-colors", hit ? "border-ink/25" : "border-border")}>
                          <span className="relative size-9 shrink-0 overflow-hidden rounded-lg"><Image src={l.image} alt="" fill sizes="36px" className="object-cover grayscale" /></span>
                          <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-ink/80">{l.title}</span>
                          {hit && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6, type: "spring", stiffness: 400, damping: 15 }}><TickCircle size={17} variant="Bold" className="text-primary" /></motion.span>}
                        </motion.div>
                      ); })}
                    <motion.span aria-hidden className="pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-primary/15 to-transparent" initial={{ top: "1.5rem", opacity: 0 }} animate={{ top: ["1.5rem", "100%"], opacity: [0, 1, 0] }} transition={{ delay: 0.3, duration: 1.6, ease: "easeInOut" }} />
                  </div>
                </motion.div>
              )}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-7 top-14 flex flex-col gap-4">
                  {card()}
                  <div>
                    <p className="mb-2.5 text-[12px] font-extrabold text-ink">چرا این پروژه؟</p>
                    <ul className="divide-y divide-border rounded-2xl border border-border bg-white">
                      {demo.m.reasons.map((r, i) => { const R = reasonIcon[r.status];
                        return (
                          <motion.li key={r.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.16, duration: 0.4, ease }} className="flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-bold text-ink">
                            <R size={17} variant="Bulk" className={statusCls[r.status]} />{r.label}<span className={cn("mr-auto text-[11.5px] font-semibold", statusCls[r.status])}>{statusText[r.status]}</span>
                          </motion.li>
                        ); })}
                    </ul>
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-7 top-14 flex flex-col gap-4">
                  {card(true)}
                  <div>
                    <p className="mb-2.5 text-[12px] font-extrabold text-ink">قدم بعدی</p>
                    <div className="space-y-2">
                      {[["مدل قرارداد", demo.o.model, Hierarchy], ["منبع پول", demo.o.finance.split("؛")[0], WalletMoney], ...(demo.o.expert ? [["کارشناس پروژه", demo.o.expert.name, Call] as const] : [])].map(([k, v, I], i) => (
                        <motion.div key={k as string} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.15, duration: 0.5, ease }} className="flex items-center gap-3 rounded-xl border border-border bg-white px-3.5 py-3 text-[12.5px]">
                          {(() => { const C = I as Icon; return <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-ink/70"><C size={16} variant="Bulk" /></span>; })()}
                          <span className="text-muted-foreground">{k as string}</span><span className="mr-auto truncate font-bold text-ink">{v as string}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
