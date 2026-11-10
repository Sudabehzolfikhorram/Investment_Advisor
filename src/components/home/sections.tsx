"use client";
import { Button } from "@/components/ui/button";
import { MotionButton } from "@/components/motion-button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArchiveTick, MagicStar, TickCircle, Location, Notification } from "@/components/iconsax";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { IranMap } from "@/components/brand/iran-map";
import { CountUp, MatchRing, Reveal } from "@/components/brand/reveal";
import { ListingCard } from "@/components/listing/listing-card";
import { groupIcons, routeIcons } from "@/components/icons";
import { cityPoints } from "@/components/home/hero";
import { projectGroups } from "@/data/taxonomy";
import { routes } from "@/data/routes";
import { listings } from "@/lib/listings";
import { forRoute } from "@/lib/match";
import { suggest, samplePrompts } from "@/lib/assistant";
import { emptyCriteria, useStore } from "@/lib/store";
import { cn, faNumber } from "@/lib/utils";

export function SectionHead({ kicker, title, text, className, light }: { kicker: string; title: string; text?: string; className?: string; light?: boolean }) {
  return (
    <Reveal className={cn("max-w-2xl", className)}>
      <span className={cn("inline-flex items-center gap-2 text-[13px] font-extrabold", light ? "text-sand" : "text-primary")}><NodeMark />{kicker}</span>
      <h2 className={cn("mt-3 text-3xl font-black leading-[1.35] tracking-tight text-balance sm:text-[2.6rem]", light ? "text-white" : "text-ink")}>{title}</h2>
      {text && <p className={cn("mt-3 text-base leading-8", light ? "text-white/70" : "text-muted-foreground")}>{text}</p>}
    </Reveal>
  );
}

/* ——— آمار ——— */
export function Stats() {
  const provinces = new Set(listings.map((l) => l.province).filter(Boolean)).size;
  const items = [
    { n: listings.length, label: "پروژه و فرصت نمونه" },
    { n: projectGroups.length, label: "گروه پروژه" },
    { n: routes.length, label: "مسیر همکاری" },
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

/* ——— گروه‌های پروژه: پنل‌های بازشونده ——— */
// هر پنل با هاور باز می‌شود و زیردسته‌هایش را نشان می‌دهد؛ هاور روی هر زیردسته عکس پنل را عوض می‌کند.
export function Categories() {
  const router = useRouter();
  const setCriteria = useStore((s) => s.setCriteria);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<{ image: string; name: string } | null>(null);
  const counts = useMemo(() => {
    const g: Record<string, number> = {}, t: Record<string, number> = {};
    for (const l of listings) if (l.group) { g[l.group] = (g[l.group] ?? 0) + 1; t[`${l.group}/${l.subtype}`] = (t[`${l.group}/${l.subtype}`] ?? 0) + 1; }
    return { g, t };
  }, []);
  const open = (group: string, subtype?: string) => { setCriteria({ ...emptyCriteria, groups: [group], filters: subtype ? { subtypes: [subtype] } : {} }); router.push("/opportunities"); };

  return (
    <section id="categories" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
      <SectionHead kicker="گروه‌های پروژه" title="از کدام حوزه شروع می‌کنید؟" text="روی هر گروه بروید تا نوع‌های پروژه آن باز شود. روی هر نوع بزنید تا پروژه‌هایش را ببینید." />
      <div className="mt-10 flex flex-col gap-2.5 lg:h-[34rem] lg:flex-row" onMouseLeave={() => setPreview(null)}>
        {projectGroups.map((g, i) => {
          const I = groupIcons[g.id]; const on = i === active;
          return (
            <motion.div key={g.id} data-panel onMouseEnter={() => { setActive(i); setPreview(null); }} onFocusCapture={() => setActive(i)} onClick={() => setActive(i)}
              animate={{ flexGrow: on ? 9 : 1 }} transition={{ type: "spring", stiffness: 190, damping: 26 }}
              className={cn("group/panel relative isolate min-w-0 shrink-0 cursor-pointer overflow-hidden rounded-[1.75rem] bg-deep text-white transition-[height] duration-500 lg:shrink lg:basis-0", on ? "h-[30rem] lg:h-auto" : "h-[4.5rem] lg:h-auto")}>
              <Image src={g.image ?? "/images/hero/field.jpg"} alt="" fill sizes="(max-width:1024px) 100vw, 60vw" className={cn("object-cover transition-all duration-700", on ? "scale-100 saturate-[0.85]" : "scale-110 saturate-[0.4]")} />
              <AnimatePresence>
                {on && preview && (
                  <motion.div key={preview.image} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
                    <Image src={preview.image} alt="" fill sizes="60vw" className="object-cover saturate-[0.85]" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-primary mix-blend-soft-light opacity-70" />
              <div className={cn("absolute inset-0 transition-colors duration-500", on ? "bg-gradient-to-t from-deep via-deep/55 to-deep/10" : "bg-deep/70 group-hover/panel:bg-deep/50")} />
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
                      <span className="grid size-12 place-items-center rounded-2xl bg-white/15 text-sand backdrop-blur"><I size={24} variant="Bulk" /></span>
                      <AnimatePresence mode="wait">
                        <motion.span key={preview?.name ?? "g"} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-dark rounded-full px-3.5 py-1.5 text-xs font-bold">
                          {preview ? preview.name : `${faNumber(counts.g[g.id] ?? 0)} پروژه`}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div>
                      <motion.h3 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.22, duration: 0.5 }} className="text-3xl font-black sm:text-4xl">{g.name}</motion.h3>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {g.subtypes.map((s, k) => (
                          <motion.li key={s.id} initial={{ opacity: 0, y: 14, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.28 + k * 0.045, duration: 0.4 }}>
                            <Button data-sub variant="plain" size="auto" onClick={(e) => { e.stopPropagation(); open(g.id, s.id); }}
                              onMouseEnter={() => setPreview({ image: s.image ?? g.image ?? "", name: s.includes[0] ?? s.name })} onFocus={() => setPreview({ image: s.image ?? g.image ?? "", name: s.includes[0] ?? s.name })}
                              className="group/sub h-auto gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[13px] font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-sand hover:bg-sand hover:text-ink">
                              <span className="size-1.5 rounded-full bg-sand transition-all duration-300 group-hover/sub:w-4 group-hover/sub:bg-ink" />
                              {s.name}
                              <span className="text-[11px] font-semibold opacity-60">{faNumber(counts.t[`${g.id}/${s.id}`] ?? 0)}</span>
                            </Button>
                          </motion.li>
                        ))}
                      </ul>
                      <Button variant="plain" size="auto" onClick={(e) => { e.stopPropagation(); open(g.id); }} className="group/all mt-5 h-12 gap-3 rounded-full bg-white pl-1.5 pr-5 text-sm font-extrabold text-ink hover:bg-sand">
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

/* ——— مسیرهای همکاری ——— */
export function Routes() {
  const router = useRouter();
  const setCriteria = useStore((s) => s.setCriteria);
  return (
    <section id="routes" className="relative mx-auto mt-28 max-w-7xl px-4 sm:px-6">
      <AlgoPattern className="-top-10 left-0 h-72 w-96 text-primary/[0.09]" fade="radial" scale={0.8} />
      <SectionHead kicker="مسیرهای همکاری" title="فقط سرمایه‌گذاری نیست؛ هشت مسیر برای ورود دارید." />
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {routes.map((r, i) => {
          const I = routeIcons[r.id]; const n = forRoute(listings, r.id).length;
          return (
            <MotionButton variant="plain" size="auto" key={r.id} type="button" onClick={() => { setCriteria({ ...emptyCriteria, route: r.id }); router.push("/opportunities"); }}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.55, delay: (i % 4) * 0.06 }}
              className={cn("group glass relative flex flex-col gap-4 overflow-hidden rounded-[1.75rem] p-5 text-right transition-all duration-300 hover:-translate-y-1", i === 0 && "!bg-none !bg-deep text-white")}>
              <span className="flex items-center justify-between">
                <span className={cn("grid size-12 place-items-center rounded-2xl transition-colors", i === 0 ? "bg-white/15 text-sand" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white")}><I size={24} variant="Bulk" /></span>
                <span className={cn("text-xs font-bold", i === 0 ? "text-white/60" : "text-muted-foreground")}>{faNumber(i + 1).padStart(2, "۰")}</span>
              </span>
              <span>
                <span className={cn("block text-[17px] font-extrabold", i === 0 ? "text-white" : "text-ink")}>{r.name}</span>
                <span className={cn("mt-1.5 block text-[13px] leading-6", i === 0 ? "text-white/70" : "text-muted-foreground")}>{r.description}</span>
              </span>
              <span className={cn("mt-auto flex items-center justify-between border-t border-dashed pt-3 text-xs font-bold", i === 0 ? "border-white/20 text-sand" : "border-border text-primary")}>
                {n ? `${faNumber(n)} مورد` : "به‌زودی"}<ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              </span>
            </MotionButton>
          );
        })}
      </div>
    </section>
  );
}

/* ——— نقشه ایران ——— */
export function MapSection() {
  const router = useRouter();
  const setCriteria = useStore((s) => s.setCriteria);
  const points = useMemo(cityPoints, []);
  const [active, setActive] = useState<string[]>([]);
  const toggle = (p: string) => setActive((a) => (a.includes(p) ? a.filter((x) => x !== p) : [...a, p]));
  const byProvince = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of points) m.set(p.province, (m.get(p.province) ?? 0) + p.count);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [points]);
  const total = active.length ? byProvince.filter(([p]) => active.includes(p)).reduce((s, [, n]) => s + n, 0) : listings.filter((l) => l.province).length;
  return (
    <section id="map" className="mt-28 px-2 sm:px-3">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-deep sm:rounded-[2.75rem]">
        <AlgoPattern className="-bottom-10 right-0 h-[60%] w-[45%] text-white/[0.07]" fade="radial" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:py-20">
          <div>
            <SectionHead light kicker="محدوده" title="روی نقشه انتخاب کنید کجا سرمایه‌گذاری می‌کنید." text="هر نود یک شهر دارای پروژه است. روی نود یا نام استان بزنید؛ چند استان را می‌توانید با هم انتخاب کنید." />
            <Reveal delay={0.1} className="mt-7 flex flex-wrap gap-2">
              {byProvince.map(([p, n]) => (
                <Button variant="plain" size="auto" key={p} type="button" aria-pressed={active.includes(p)} onClick={() => toggle(p)}
                  className={cn("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-bold transition-all", active.includes(p) ? "border-sand bg-sand text-ink" : "border-white/15 bg-white/[0.06] text-white/85 hover:border-white/40")}>
                  {p}<span className={cn("text-[11px]", active.includes(p) ? "text-ink/70" : "text-white/50")}>{faNumber(n)}</span>
                </Button>
              ))}
            </Reveal>
            <Reveal delay={0.15} className="mt-8">
              <Button variant="plain" size="auto" type="button" onClick={() => { setCriteria({ ...emptyCriteria, provinces: active }); router.push("/opportunities"); }}
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-white pl-2 pr-6 font-extrabold text-ink transition-colors hover:bg-sand">
                نمایش {faNumber(total)} پروژه {active.length ? "در استان‌های انتخابی" : "در همه ایران"}
                <span className="grid size-10 place-items-center rounded-full bg-ink text-white transition-transform group-hover:-translate-x-1"><ArrowLeft size={18} /></span>
              </Button>
            </Reveal>
          </div>
          <Reveal y={0} className="relative">
            <IranMap points={points} tone="dark" active={active} onToggle={toggle} className="mx-auto max-w-[640px]" />
          </Reveal>
        </div>
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

/* ——— دستیار (نمایشی) ——— */
export function AssistantTeaser() {
  const demo = useMemo(() => suggest(samplePrompts[0]), []);
  const top = demo.results.slice(0, 3);
  return (
    <section className="relative mx-auto mt-28 max-w-7xl px-4 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHead kicker="دستیار" title="بنویسید چه می‌خواهید؛ دستیار تا ۱۰ پروژه با درصد تطابق پیشنهاد می‌دهد." text="نیازی به پر کردن فرم نیست. شرایطتان را با زبان خودتان بنویسید و دلیل هر پیشنهاد را کنار آن ببینید." />
          <Reveal delay={0.1} className="mt-8">
            <Link href={`/assistant?q=${encodeURIComponent(samplePrompts[0])}`} className="group inline-flex h-14 items-center gap-3 rounded-full bg-primary pl-2 pr-6 font-extrabold text-white shadow-[0_18px_40px_-16px_var(--primary)] transition-colors hover:bg-deep">
              <MagicStar size={20} variant="Bulk" /> امتحان دستیار
              <span className="grid size-10 place-items-center rounded-full bg-white/15 transition-transform group-hover:-translate-x-1"><ArrowLeft size={18} /></span>
            </Link>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_30%_20%,rgb(15_118_110/0.22),transparent),radial-gradient(50%_50%_at_80%_90%,rgb(201_168_106/0.25),transparent)] blur-2xl" />
          <div className="glass space-y-4 rounded-[2rem] p-4 sm:p-6">
            <div className="mr-auto w-fit max-w-[88%] rounded-3xl rounded-bl-md bg-ink px-5 py-3.5 text-sm font-semibold leading-7 text-white">{samplePrompts[0]}</div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary"><MagicStar size={16} variant="Bold" />برداشت دستیار</span>
              {demo.understood.map((u, i) => (
                <motion.span key={u.label} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.12 }} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{u.label}: {u.value}</motion.span>
              ))}
            </div>
            <ul className="space-y-2">
              {top.map((r, i) => (
                <motion.li key={r.listing.id} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.7 + i * 0.15, duration: 0.5 }}>
                  <Link href={`/opportunities/${r.listing.id}`} className="flex items-center gap-3 rounded-3xl bg-white p-2 pl-4 ring-1 ring-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl"><Image src={r.listing.image} alt="" fill sizes="64px" className="object-cover" /><span className="absolute inset-0 bg-primary/40 mix-blend-soft-light" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-extrabold text-ink">{r.listing.title}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Location size={13} variant="Bold" />{r.listing.province} · {r.listing.stats[0].value}</span>
                    </span>
                    <MatchRing score={r.score} size={48} />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ——— روش کار ——— */
const steps = [
  { t: "تطبیق با نیاز شما", d: "هدف، محل، سرمایه و نیاز زمانی با شرایط فرصت مقایسه می‌شود." },
  { t: "توضیح نتیجه", d: "ناسازگاری‌ها و اطلاعات نامعلوم جدا دیده می‌شوند؛ عدد مجهول به صفر تبدیل نمی‌شود." },
  { t: "مسیر ورود روشن", d: "مدل قرارداد، منبع پول و نحوه دریافت عایدی، همراه مراحل بعدی نمایش داده می‌شود." },
];
export function HowItWorks() {
  return (
    <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6">
      <SectionHead kicker="روش کار" title="هر پیشنهاد دلیل دارد." className="mx-auto text-center [&>span]:justify-center" />
      <div className="relative mt-12 grid gap-4 md:grid-cols-3">
        <svg aria-hidden className="absolute inset-x-[16%] top-9 hidden h-px w-[68%] overflow-visible text-primary/40 md:block"><motion.line x1="100%" y1="0" x2="0" y2="0" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} /></svg>
        {steps.map((s, i) => (
          <Reveal key={s.t} delay={i * 0.12} className="relative flex flex-col items-center text-center">
            <span className="relative grid size-[4.5rem] place-items-center rounded-full bg-background">
              <span className="absolute inset-0 rounded-full border border-dashed border-primary/40" />
              <span className="grid size-14 place-items-center rounded-full bg-primary text-xl font-black text-white shadow-[0_14px_30px_-12px_var(--primary)]">{faNumber(i + 1)}</span>
            </span>
            <div className="glass mt-5 w-full rounded-[1.75rem] p-6">
              <h3 className="text-lg font-extrabold text-ink">{s.t}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ——— ذخیره شرایط ——— */
export function SaveCta() {
  const openLogin = useStore((s) => s.openLogin);
  const user = useStore((s) => s.user);
  const points = [
    { I: ArchiveTick, t: "پروژه‌ها را ذخیره کنید" },
    { I: TickCircle, t: "شرایطتان یک‌بار ثبت می‌شود" },
    { I: Notification, t: "پروژه‌های تازه را دفعه بعد ببینید" },
  ];
  return (
    <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6">
      <Reveal className="relative isolate overflow-hidden rounded-[2rem] bg-white p-8 ring-1 ring-black/[0.04] sm:rounded-[2.5rem] sm:p-12">
        <AlgoPattern className="-left-10 -top-10 h-[130%] w-[55%] text-primary/[0.1]" fade="right" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-black leading-[1.4] text-ink text-balance sm:text-4xl">سایت باز است. فقط وقتی چیزی را ذخیره می‌کنید وارد می‌شوید.</h2>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              {points.map(({ I, t }) => <li key={t} className="flex items-center gap-2 text-sm font-bold text-ink/80"><span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary"><I size={17} variant="Bulk" /></span>{t}</li>)}
            </ul>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/opportunities" className="inline-flex h-14 items-center gap-2 rounded-full bg-primary px-7 font-extrabold text-white transition-colors hover:bg-deep">دیدن پروژه‌ها <ArrowLeft size={18} /></Link>
            {!user && <Button variant="plain" size="auto" type="button" onClick={() => openLogin()} className="inline-flex h-14 items-center rounded-full border border-ink/15 px-7 font-extrabold text-ink transition-colors hover:border-primary hover:text-primary">ورود با موبایل</Button>}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
