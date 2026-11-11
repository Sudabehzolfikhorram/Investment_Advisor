"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft } from "@/components/iconsax";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { HelpSummary } from "@/components/guide/library";
import { CountUp, Reveal } from "@/components/brand/reveal";
import { ListingCard } from "@/components/listing/listing-card";
import { groupIcons, routeIcons } from "@/components/icons";
import { projectGroups } from "@/data/taxonomy";
import { routes, routeSubcategories } from "@/data/routes";
import { listings } from "@/lib/listings";
import { forRoute } from "@/lib/match";
import { useStore } from "@/lib/store";
import { cn, faNumber } from "@/lib/utils";

export function SectionHead({ kicker, title, text, className, light }: { kicker: string; title: string; text?: string; className?: string; light?: boolean }) {
  return (
    <Reveal className={cn("max-w-2xl", className)}>
      <span className={cn("inline-flex items-center gap-2 text-[13px] font-extrabold", light ? "text-white" : "text-primary")}><NodeMark />{kicker}</span>
      <h2 className={cn("mt-3 text-3xl font-black leading-[1.35] tracking-tight text-balance sm:text-[2.6rem]", light ? "text-white" : "text-ink")}>{title}</h2>
      {text && <p className={cn("mt-3 text-base leading-8", light ? "text-white/70" : "text-muted-foreground")}>{text}</p>}
    </Reveal>
  );
}

/* ——— راهنمای کوتاه ——— */
export function HelpCenter() {
  return (
    <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6">
      <SectionHead kicker="راهنما" title="وقتی پیش از تصمیم راهنمایی لازم دارید" />
      <Reveal className="mt-10"><HelpSummary /></Reveal>
    </section>
  );
}

/* ——— آمار ——— */
export function Stats() {
  const provinces = new Set(listings.map((l) => l.province).filter(Boolean)).size;
  const items = [
    { n: listings.length, label: "پروژه و فرصت" },
    { n: projectGroups.length, label: "گروه پروژه" },
    { n: routes.length, label: "مسیر ورود" },
    { n: provinces, label: "استان" },
  ];
  return (
    <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
      <dl className="grid grid-cols-2 gap-y-8 md:grid-cols-4">
        {items.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className={cn("flex flex-col items-center gap-1 text-center", i > 0 && "md:border-r md:border-border")}>
            <dd className="text-4xl font-black tracking-tight text-ink sm:text-5xl"><CountUp value={s.n} /></dd>
            <dt className="text-sm font-semibold text-muted-foreground">{s.label}</dt>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

const groupRoutes = routes.filter((r) => r.usesProjectGroups);

/* ——— گروه‌های پروژه: پنل‌های بازشونده ——— */
// هر پنل با هاور باز می‌شود و زیردسته‌هایش را نشان می‌دهد؛ هاور روی هر زیردسته عکس پنل را عوض می‌کند.
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

  return (
    <section id="categories" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
      <SectionHead kicker="زیردسته‌های هر مسیر" title={`حوزه‌های مسیر «${route.name}»`} text={`${groupRoutes.map((r) => `«${r.name}»`).join("، ")} به ${faNumber(projectGroups.length)} حوزه تقسیم می‌شوند. مسیر را انتخاب کنید و روی هر حوزه بروید تا انواع پروژه‌هایش را ببینید.`} className="max-w-3xl" />
      <div className="mt-7 flex flex-wrap items-center gap-2">
        <span className="ml-1 text-[13px] font-bold text-muted-foreground">مسیر:</span>
        {groupRoutes.map((r) => { const I = routeIcons[r.id]; const on = r.id === routeId;
          return (
            <Button key={r.id} type="button" variant="plain" size="auto" aria-pressed={on} onClick={() => setRouteId(r.id)}
              className={cn("h-11 gap-2 rounded-full border px-4 text-sm font-extrabold transition-all", on ? "border-ink bg-ink text-white shadow-[0_14px_30px_-16px_rgb(11_31_29/0.7)]" : "border-border bg-white text-ink/70 hover:border-primary/50 hover:text-primary")}>
              <I size={18} variant="Bulk" />{r.name}<span className={cn("text-xs font-bold", on ? "text-white/60" : "text-muted-foreground")}>{faNumber(forRoute(listings, r.id).length)}</span>
            </Button>
          ); })}
      </div>
      <div className="mt-5 flex flex-col gap-2.5 lg:h-[34rem] lg:flex-row" onMouseLeave={() => setPreview(null)}>
        {projectGroups.map((g, i) => {
          const I = groupIcons[g.id]; const on = i === active;
          return (
            <motion.div key={g.id} data-panel onMouseEnter={() => { setActive(i); setPreview(null); }} onFocusCapture={() => setActive(i)} onClick={() => setActive(i)}
              animate={{ flexGrow: on ? 9 : 1 }} transition={{ type: "spring", stiffness: 190, damping: 26 }}
              className={cn("group/panel relative isolate min-w-0 shrink-0 cursor-pointer overflow-hidden rounded-[1.75rem] bg-ink text-white transition-[height] duration-500 lg:shrink lg:basis-0", on ? "h-[30rem] lg:h-auto" : "h-[4.5rem] lg:h-auto")}>
              <Image src={g.image ?? "/images/hero/field.jpg"} alt="" fill sizes="(max-width:1024px) 100vw, 60vw" className={cn("object-cover transition-all duration-700", on ? "scale-100" : "scale-110 saturate-[0.3]")} />
              <AnimatePresence>
                {on && preview && (
                  <motion.div key={preview.image} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
                    <Image src={preview.image} alt="" fill sizes="60vw" className="object-cover" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className={cn("absolute inset-0 transition-colors duration-500", on ? "bg-gradient-to-t from-ink/90 via-ink/45 to-ink/5" : "bg-ink/65 group-hover/panel:bg-ink/45")} />
              {on && <AlgoPattern className="-left-6 -top-6 h-2/3 w-2/3 text-white/25" fade="radial" scale={0.6} />}

              {/* حالت بسته: آیکون و نام عمودی */}
              <div className={cn("absolute inset-0 flex items-center gap-3 px-5 transition-opacity duration-300 lg:flex-col lg:justify-between lg:px-0 lg:py-5", on ? "pointer-events-none opacity-0" : "opacity-100")}>
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-white"><I size={20} variant="Bulk" /></span>
                <span className="text-base font-extrabold lg:[writing-mode:vertical-rl] lg:whitespace-nowrap">{g.name}</span>
                <span className="mr-auto text-xs font-bold text-white/60 lg:mr-0">{faNumber(g.subtypes.length)} نوع</span>
              </div>

              {/* حالت باز: زیردسته‌ها */}
              <AnimatePresence>
                {on && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.18 } }} exit={{ opacity: 0, transition: { duration: 0.1 } }} className="absolute inset-0 flex min-w-[20rem] flex-col justify-between p-5 sm:p-7">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-12 place-items-center rounded-2xl bg-white/15 text-white"><I size={24} variant="Bulk" /></span>
                      <AnimatePresence mode="wait">
                        <motion.span key={preview?.name ?? "g"} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-dark rounded-full px-3.5 py-1.5 text-xs font-bold">
                          {preview ? preview.name : `${faNumber(counts.g[g.id] ?? 0)} پروژه`}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div>
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-white/70">{route.name}<ArrowLeft size={13} />حوزه</p>
                      <motion.h3 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.22, duration: 0.5 }} className="text-3xl font-black sm:text-4xl">{g.name}</motion.h3>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {g.subtypes.map((s, k) => (
                          <motion.li key={s.id} initial={{ opacity: 0, y: 14, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.28 + k * 0.045, duration: 0.4 }}>
                            <Button data-sub variant="plain" size="auto" onClick={(e) => { e.stopPropagation(); open(g.id, s.id); }}
                              onMouseEnter={() => setPreview({ image: s.image ?? g.image ?? "", name: s.examples ?? s.name })} onFocus={() => setPreview({ image: s.image ?? g.image ?? "", name: s.examples ?? s.name })}
                              className="group/sub h-auto gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[13px] font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-white hover:text-ink">
                              <span className="size-1.5 rounded-full bg-white transition-all duration-300 group-hover/sub:w-4 group-hover/sub:bg-primary" />
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

/* ——— دسته‌بندی‌های اصلی (هشت مسیر) ——— */
// تک‌انتخابی‌اند چون هر کدام فیلترهای خودش را دارد؛ تعدادها از داده واقعی شمرده می‌شود.
export function MainCategories() {
  const router = useRouter();
  const begin = useStore((s) => s.begin);
  return (
    <section id="routes" className="relative mx-auto mt-20 max-w-7xl px-6">
      <AlgoPattern animated className="-left-24 -top-16 -z-10 h-[26rem] w-[40rem] text-ink/[0.07]" fade="radial" />
      <AlgoPattern animated className="-bottom-24 -right-20 -z-10 h-[22rem] w-[34rem] text-primary/[0.09]" fade="radial" scale={0.8} />
      <SectionHead kicker="هشت مسیر ورود" title="سرمایه، تخصص یا توان اجرایی؛ با کدام وارد می‌شوید؟" text="هر مسیر پروژه‌ها و شرایط خودش را دارد." />
      <div className="mt-10 grid grid-cols-4 gap-4">
        {routes.map((r, i) => {
          const I = routeIcons[r.id]; const n = forRoute(listings, r.id).length;
          const subs = r.usesProjectGroups ? [`${faNumber(projectGroups.length)} گروه پروژه`] : (routeSubcategories[r.id] ?? []).map((x) => x.name);
          return (
            <Reveal key={r.id} delay={(i % 4) * 0.06} className="h-full">
              <Button variant="plain" size="auto" type="button" onClick={() => { begin({ route: r.id }); router.push("/opportunities"); }}
                className="group surface flex h-full w-full flex-col items-stretch justify-start gap-0 whitespace-normal rounded-[1.75rem] p-5 text-right transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_26px_50px_-30px_rgb(11_31_29/0.35)]">
                <span className="flex items-start justify-between gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-muted text-ink/70 transition-colors duration-300 group-hover:bg-primary group-hover:text-white"><I size={24} variant="Bulk" /></span>
                  <span className="text-left leading-none"><span className={cn("block text-3xl font-black", n ? "text-ink" : "text-ink/25")}>{faNumber(n)}</span><span className="mt-1 block text-[11px] font-semibold text-muted-foreground">پروژه</span></span>
                </span>
                <span className="mt-5 block text-[17px] font-extrabold leading-7 text-ink">{r.name}</span>
                <span className="mt-1.5 block text-[13px] font-normal leading-6 text-muted-foreground">{r.description}</span>
                <span className="mt-4 flex flex-wrap gap-1.5">
                  {subs.slice(0, 3).map((x) => <span key={x} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-ink/70">{x}</span>)}
                  {subs.length > 3 && <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-ink/70">+{faNumber(subs.length - 3)}</span>}
                </span>
                <span className="mt-auto flex items-center justify-between pt-5 text-xs font-bold text-primary">
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
    <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHead kicker="پروژه‌ها" title="تازه‌ترین پروژه‌ها" />
        <Reveal><Link href="/opportunities" className="group inline-flex h-12 items-center gap-2 rounded-full border border-ink/15 bg-white/60 px-5 text-sm font-extrabold text-ink transition-colors hover:border-primary hover:text-primary">همه پروژه‌ها <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" /></Link></Reveal>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}</div>
    </section>
  );
}

/* ——— روش کار ——— */
const steps = [
  { t: "تطبیق با نیاز شما", d: "هدف، محل، بودجه و زمان‌بندی شما را با شرایط هر پروژه مقایسه می‌کنیم." },
  { t: "توضیح نتیجه", d: "ناسازگاری‌ها و اطلاعات نامعلوم را جدا نشان می‌دهیم و عددی را که نداریم صفر حساب نمی‌کنیم." },
  { t: "مسیر ورود روشن", d: "مدل قرارداد، منبع پول، نحوه دریافت عایدی و گام‌های بعدی هر پروژه را می‌بینید." },
];
export function HowItWorks() {
  return (
    <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6">
      <SectionHead kicker="روش کار" title="چرا این پروژه‌ها را به شما نشان می‌دهیم؟" className="mx-auto text-center [&>span]:justify-center" />
      <div className="relative mt-12 grid gap-4 md:grid-cols-3">
        <svg aria-hidden className="absolute inset-x-[16%] top-9 hidden h-px w-[68%] overflow-visible text-primary/40 md:block"><motion.line x1="100%" y1="0" x2="0" y2="0" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} /></svg>
        {steps.map((s, i) => (
          <Reveal key={s.t} delay={i * 0.12} className="relative flex flex-col items-center text-center">
            <span className="relative grid size-[4.5rem] place-items-center rounded-full bg-background">
              <span className="absolute inset-0 rounded-full border border-dashed border-primary/40" />
              <span className="grid size-14 place-items-center rounded-full bg-primary text-xl font-black text-white shadow-[0_14px_30px_-12px_var(--primary)]">{faNumber(i + 1)}</span>
            </span>
            <div className="surface mt-5 w-full rounded-[1.75rem] p-6">
              <h3 className="text-lg font-extrabold text-ink">{s.t}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

