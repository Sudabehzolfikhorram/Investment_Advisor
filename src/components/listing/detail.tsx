"use client";
// صفحه جزئیات: روایت پروژه به‌جای متن پشت‌سرهم. همه فیلدهای داده نمایش داده می‌شوند؛
// هر جا داده‌ای نیست «ثبت نشده» می‌آید تا ساختار صفحه برای همه پروژه‌ها یکسان بماند.
import Link from "next/link";
import { Fragment, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Call, Copy, CopySuccess, DocumentDownload, Location, Warning2, ShieldSearch, WalletMoney, MoneyRecive, Key,
  Timer1, Lock1, Chart, Calendar, Building, TickCircle, InfoCircle, Danger, type Icon,
} from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Header, Footer } from "@/components/site/header";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { LocationMap } from "@/components/brand/iran-map";
import { Reveal } from "@/components/brand/reveal";
import { SignaturePhoto } from "./signature-photo";
import { HeroGallery } from "./gallery";
import { ListingCard, SaveButton } from "./listing-card";
import { galleryOf, listingById, listings, payoutLabel } from "@/lib/listings";
import { dossier, factGroups, splitPending, type DossierSection, type FactGroup } from "@/lib/facts";
import { projectGroups } from "@/data/taxonomy";
import { advisories } from "@/data/advisories";
import { useStore } from "@/lib/store";
import type { Advisory, Fund, Listing, Opportunity, RouteId, SaleItem } from "@/types";
import { routeSteps } from "@/data/routes";
import { cn, faNumber, formatMobile, incomeLabel, legalLabel, riskLabel } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const NA = "ثبت نشده";

function Chapter({ n, title, note, children }: { n: number; title: string; note?: string; children: React.ReactNode }) {
  return (
    <Reveal className="relative">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-pine text-sm font-black text-white">{faNumber(n)}</span>
        <h2 className="text-xl font-black text-ink">{title}</h2>
        <span className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
        {note && <span className="text-xs font-semibold text-muted-foreground">{note}</span>}
      </div>
      {children}
    </Reveal>
  );
}

function Tile({ I, label, value, sub }: { I: Icon; label: string; value: string; sub?: string }) {
  return (
    <Card className="surface gap-3 rounded-[1.5rem] p-5 shadow-none">
      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><I size={20} variant="Bulk" /></span>
      <span>
        <span className="block text-xs font-semibold text-muted-foreground">{label}</span>
        <span className="mt-1 block text-xl font-black leading-8 text-ink">{value}</span>
        {sub && <span className="block text-[11px] font-semibold text-muted-foreground">{sub}</span>}
      </span>
    </Card>
  );
}

/** شناسنامه: سه کارت موضوعی با آیکون؛ فقط داده‌های ثبت‌شده. متن بلند زیر برچسبش می‌شکند. */
const groupIcon: Record<string, Icon> = { project: Building, money: WalletMoney, status: ShieldSearch };
function Facts({ groups }: { groups: FactGroup[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {groups.map((g) => { const I = groupIcon[g.id];
        return (
          <div key={g.id} className="surface rounded-[1.75rem] p-5">
            <h3 className="flex items-center gap-2.5 text-[15px] font-extrabold text-ink"><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><I size={18} variant="Bulk" /></span>{g.title}</h3>
            <dl className="mt-3 divide-y divide-border/70">
              {splitPending(g.items).known.map(([k, v]) => (
                // همه ردیف‌ها یک شکل: عنوان راست، مقدار چپ؛ مقدار بلند در همان ستون چپ می‌شکند
                <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-xs font-semibold text-muted-foreground">{k}</dt>
                  <dd className={cn("min-w-0 max-w-[72%] text-left text-sm font-extrabold leading-6", v === NA ? "font-semibold text-ink/35" : "text-ink")}>{v}</dd>
                </div>
              ))}
            </dl>
            {splitPending(g.items).pending.length > 0 && <p className="mt-2 border-t border-dashed border-border pt-2.5 text-xs leading-6 text-muted-foreground"><b className="font-extrabold text-ink/70">ثبت نشده: </b>{splitPending(g.items).pending.join("، ")}</p>}
          </div>
        ); })}
    </div>
  );
}

const riskTone: Record<number, { text: string; stroke: string; soft: string; bar: string }> = {
  1: { text: "text-primary", stroke: "stroke-primary", soft: "bg-primary/10", bar: "bg-primary" },
  2: { text: "text-coral", stroke: "stroke-coral", soft: "bg-coral/10", bar: "bg-coral" },
  3: { text: "text-destructive", stroke: "stroke-destructive", soft: "bg-destructive/10", bar: "bg-destructive" },
};
const riskLevel = (risk: string) => ({ low: 1, medium: 2, high: 3 }[risk] ?? 0);

/** نوار سه‌قسمتی فشرده: فقط سطح فعلی رنگ می‌گیرد تا سطح بالا همه نوار را قرمز نکند. */
function RiskMeter({ risk }: { risk: string }) {
  const level = riskLevel(risk);
  return (
    <div>
      <div className="flex gap-1.5">{[1, 2, 3].map((i) => <span key={i} className={cn("h-2 flex-1 rounded-full", i === level ? riskTone[i].bar : i < level ? cn(riskTone[level].bar, "opacity-25") : "bg-muted")} />)}</div>
      <div className="mt-2 grid grid-cols-3 text-[11px]">{["کم", "متوسط", "زیاد"].map((t, i) => <span key={t} className={cn("text-center first:text-right last:text-left", i + 1 === level ? cn("font-extrabold", riskTone[level].text) : "font-semibold text-muted-foreground")}>{t}</span>)}</div>
    </div>
  );
}

/** عقربه نیم‌دایره: کم در راست، زیاد در چپ (هم‌جهت با خواندن راست‌به‌چپ). */
/** گیج ریسک راست‌به‌چپ: مثل خواندن فارسی از راست (کم) شروع می‌شود و تا سطح پروژه پر می‌شود؛
 *  رنگ هر نقطه از کمان به جایگاهش بسته است، پس سطح بالاتر یعنی پیمودن رنگ‌های بیشتر. */
const riskHex = ["#94a3a0", "#0f766e", "#d4532f", "#b4291c"];
function RiskGauge({ risk }: { risk: string }) {
  const level = riskLevel(risk);
  const frac = level / 3;
  const pt = (deg: number, r = 80) => [100 + r * Math.cos((deg * Math.PI) / 180), 100 - r * Math.sin((deg * Math.PI) / 180)] as const;
  const arcD = "M180 100 A80 80 0 0 0 20 100";
  const [ex, ey] = pt(frac * 180);
  const labels = ["کم", "متوسط", "زیاد"];
  return (
    <div className="relative mx-auto w-full max-w-[18rem]">
      <svg viewBox="0 -14 200 128" className="block w-full overflow-visible" aria-hidden>
        <defs>
          {/* گرادیان از راست به چپ: x1 سمت راست کمان است */}
          <linearGradient id="risk-rtl" gradientUnits="userSpaceOnUse" x1="180" y1="0" x2="20" y2="0">
            <stop offset="0" stopColor="#0f766e" /><stop offset="0.3" stopColor="#2a9d8f" />
            <stop offset="0.46" stopColor="#ec8f5e" /><stop offset="0.72" stopColor="#d4532f" /><stop offset="1" stopColor="#b4291c" />
          </linearGradient>
          <filter id="risk-soft" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        {/* ریل خاکستری کامل و دو جداکننده سطح */}
        <path d={arcD} fill="none" strokeWidth={12} strokeLinecap="round" className="stroke-muted" />
        {[60, 120].map((d) => { const [x0, y0] = pt(d, 72), [x1, y1] = pt(d, 88); return <line key={d} x1={x0} y1={y0} x2={x1} y2={y1} stroke="white" strokeWidth={2.5} />; })}
        {level > 0 && <>
          <motion.path d={arcD} fill="none" stroke="url(#risk-rtl)" strokeWidth={12} strokeLinecap="round" opacity={0.35} filter="url(#risk-soft)"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: frac }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
          <motion.path d={arcD} fill="none" stroke="url(#risk-rtl)" strokeWidth={12} strokeLinecap="round"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: frac }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
          {[60, 120].filter((d) => d < frac * 180).map((d) => { const [x0, y0] = pt(d, 72), [x1, y1] = pt(d, 88); return <line key={d} x1={x0} y1={y0} x2={x1} y2={y1} stroke="white" strokeWidth={2.5} />; })}
          <motion.g initial={{ opacity: 0, scale: 0.4 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.95, type: "spring", stiffness: 260, damping: 16 }} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <circle cx={ex} cy={ey} r={10} fill="white" stroke={riskHex[level]} strokeWidth={3.5} />
            <circle cx={ex} cy={ey} r={3.5} fill={riskHex[level]} />
          </motion.g>
        </>}
        {/* برچسب سه سطح بیرون کمان، از راست به چپ */}
        {labels.map((t, i) => { const [x, y] = pt(30 + i * 60, 103);
          return <text key={t} x={x} y={y + 3} textAnchor="middle" fontSize={8} fontWeight={600} fill="#8a9290">{t}</text>; })}
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className={cn("font-black leading-none", level ? "text-[1.65rem]" : "text-lg")} style={{ color: riskHex[level] }}>{level ? labels[level - 1] : "ارزیابی‌نشده"}</span>
        <span className="mt-1.5 text-[11px] font-semibold text-muted-foreground">{level ? `سطح ${faNumber(level)} از ${faNumber(3)}` : "سطح ریسک ثبت نشده است"}</span>
      </div>
    </div>
  );
}

/** زمان‌بندی پول: ایستگاه‌های ثابت به ترتیب زمان. نوار و دستگیره ندارد تا قابل تغییر به نظر نرسد. */
function Milestones({ o }: { o: Opportunity }) {
  const all = [
    { at: 0, label: "ورود سرمایه", value: "شروع" as string | null },
    { at: o.firstIncomeMonths ?? null, label: "اولین دریافت", value: o.firstIncomeMonths != null ? `ماه ${faNumber(o.firstIncomeMonths)}` : null },
    { at: o.executionMonths ?? null, label: "پایان اجرا", value: o.executionMonths != null ? `ماه ${faNumber(o.executionMonths)}` : null },
    { at: o.lockupMonths ?? null, label: "پایان قفل سرمایه", value: o.lockupMonths != null ? `ماه ${faNumber(o.lockupMonths)}` : null },
    { at: o.paybackYears != null ? o.paybackYears * 12 : null, label: "بازگشت سرمایه", value: o.paybackYears != null ? `سال ${faNumber(o.paybackYears)}` : null },
    { at: o.paybackDownsideYears != null ? o.paybackDownsideYears * 12 : null, label: "بازگشت در حالت بدبینانه", value: o.paybackDownsideYears != null ? `سال ${faNumber(o.paybackDownsideYears)}` : null },
    { at: o.durationYears != null ? o.durationYears * 12 : null, label: "پایان طرح", value: o.durationYears != null ? `سال ${faNumber(o.durationYears)}` : null },
  ];
  const known = all.filter((m) => m.at != null).sort((a, b) => a.at! - b.at!);
  if (known.length < 2) return null;
  return (
    <div className="surface rounded-[1.75rem] p-6">
      <ol className="grid" style={{ gridTemplateColumns: `repeat(${known.length}, minmax(0, 1fr))` }}>
        {known.map((m, i) => (
          <li key={m.label} className="relative px-1 text-center">
            {i > 0 && <span aria-hidden className="absolute left-1/2 top-[7px] w-full border-t-2 border-dotted border-pine/20" />}
            <span className={cn("relative z-10 mx-auto block size-4 rounded-full ring-4 ring-white", i === 0 ? "bg-pine" : m.label.includes("بدبینانه") ? "bg-coral" : "bg-primary")} />
            <span className="mt-3 block text-base font-black text-ink">{m.value}</span>
            <span className="mt-0.5 block text-xs font-semibold leading-5 text-muted-foreground">{m.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** مسیر پول: تأمین مالی ← بازگشت ← مالکیت؛ کارت‌ها با فلش به هم وصل‌اند */
function MoneyFlow({ o }: { o: { finance?: string; repay?: string; ownership?: string | null } }) {
  const nodes = [
    { I: WalletMoney, t: "پول از کجا می‌آید", d: o.finance },
    { I: MoneyRecive, t: "چطور برمی‌گردد", d: o.repay },
    { I: Key, t: "مالکیت و سهم", d: o.ownership },
  ].filter((x) => x.d);
  return (
    <div className="flex items-stretch gap-2">
      {nodes.map((x, i) => (
        <Fragment key={x.t}>
          {i > 0 && (
            <span aria-hidden className="flex w-12 shrink-0 items-center text-primary">
              <span className="h-0.5 flex-1 bg-primary/30" /><ArrowLeft size={20} className="-mr-1.5" />
            </span>
          )}
          <div className="surface flex-1 rounded-[1.75rem] p-6">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><x.I size={24} variant="Bulk" /></span>
            <h3 className="mt-4 text-sm font-extrabold text-primary">{x.t}</h3>
            <p className="mt-2 text-[15px] font-semibold leading-8 text-ink">{x.d}</p>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/** «مراحل ورود و اسناد لازم» (بخش جزئیات پروژه در نسخه مرجع): مسیر خطی و غیرقابل‌کلیک، با ترتیب روشن گام‌ها */
const ordinal = ["اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم"];
function Steps({ steps }: { steps: string[] }) {
  const cols = Math.min(steps.length, 4);
  return (
    <ol className="grid gap-x-3 gap-y-9" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {steps.map((s, i) => { const lastInRow = (i + 1) % cols === 0 || i === steps.length - 1;
        return (
          <li key={s} className="min-w-0">
            <div className="flex items-center gap-3">
              <span className={cn("grid size-11 shrink-0 place-items-center rounded-full text-base font-black", i === 0 ? "bg-primary text-white shadow-[0_10px_24px_-12px_var(--primary)]" : "bg-primary/10 text-primary")}>{faNumber(i + 1)}</span>
              {!lastInRow && <span aria-hidden className="h-px flex-1 border-t-2 border-dashed border-primary/25" />}
              {!lastInRow && <ArrowLeft size={14} className="-mr-2 shrink-0 text-primary/40" />}
            </div>
            <p className="mt-3 text-xs font-extrabold text-primary">گام {ordinal[i] ?? faNumber(i + 1)}</p>
            <p className="mt-1 pl-4 text-[15px] font-bold leading-7 text-ink">{s}</p>
          </li>
        ); })}
    </ol>
  );
}

/** پرونده کامل: بخش‌های جزئیات نسخه مرجع، هر کدام در یک آکاردئون تا صفحه شلوغ نشود */
function Dossier({ sections }: { sections: DossierSection[] }) {
  return (
    <Accordion type="multiple" defaultValue={[(sections.find((x) => /^terms|^heritage|^rights/.test(x.id)) ?? sections[0]).id]} className="surface rounded-[1.75rem] px-6">
      {sections.map((sec) => (
        <AccordionItem key={sec.id} value={sec.id} className="border-border">
          <AccordionTrigger className="py-4 text-right text-[15px] font-extrabold text-ink hover:no-underline">{sec.title}</AccordionTrigger>
          <AccordionContent className="pb-5">
            {sec.note && <p className="mb-3 text-[13px] font-semibold leading-6 text-muted-foreground">{sec.note}</p>}
            {(() => { const { known, pending } = splitPending(sec.rows);
              return <>
                {known.length > 0 && (
                  <dl className="grid grid-cols-2 gap-x-8">
                    {known.map(([k, v]) => (
                      <div key={k} className="border-b border-dashed border-border/80 py-3">
                        <dt className="text-xs font-semibold text-muted-foreground">{k}</dt>
                        <dd className="mt-1 text-sm font-extrabold leading-7 text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {pending.length > 0 && (
                  <div className={cn("rounded-2xl border border-dashed border-border px-4 py-3", known.length > 0 && "mt-4")}>
                    <p className="text-xs font-extrabold text-ink/70">هنوز ثبت نشده و با دریافت اسناد کامل می‌شود ({faNumber(pending.length)} مورد)</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">{pending.map((k) => <span key={k} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-ink/60">{k}</span>)}</div>
                  </div>
                )}
              </>; })()}
            {!!sec.notes?.length && <div className="mt-4 grid grid-cols-2 gap-3">{sec.notes.map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-muted/70 px-4 py-3"><p className="text-[13px] font-extrabold text-ink">{t}</p><p className="mt-1 text-[13px] font-semibold leading-6 text-ink/70">{d}</p></div>
            ))}</div>}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/** پرسش‌های تخصصی نوع پروژه از نسخه مرجع؛ فقط برای خواندن */
function AdvisoryBlock({ a }: { a: Advisory }) {
  return (
    <div className="space-y-4">
      <p className="border-r-2 border-primary pr-4 text-[15px] font-semibold leading-8 text-ink/85">{a.context}</p>
      {a.baseChecks.length > 0 && (
        <ul className="grid grid-cols-2 gap-2">
          {a.baseChecks.map((c) => <li key={c} className="surface flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold leading-7 text-ink/85"><TickCircle size={18} variant="Bulk" className="mt-1 shrink-0 text-primary" />{c}</li>)}
        </ul>
      )}
      <Accordion type="multiple" className="surface rounded-[1.75rem] px-5">
        {a.questions.map((q, i) => (
          <AccordionItem key={q.id} value={q.id} className="border-border">
            <AccordionTrigger className="py-4 text-right text-[15px] font-bold leading-7 text-ink hover:no-underline"><span className="flex items-start gap-3"><span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-black">{faNumber(i + 1)}</span>{q.label}</span></AccordionTrigger>
            <AccordionContent className="space-y-2 pb-5 pr-9">
              {q.options.map((op) => {
                const block = q.block.includes(op.value), review = q.review.includes(op.value);
                return (
                  <div key={op.value} className="rounded-xl bg-muted/70 px-4 py-2.5">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink">{op.label}
                      {block && <Badge variant="outline" className="gap-1 border-destructive/30 bg-destructive/5 text-[11px] text-destructive"><Danger size={12} variant="Bold" />مانع ادامه</Badge>}
                      {review && <Badge variant="outline" className="bg-white text-[11px] text-ink/70">نیازمند بررسی</Badge>}
                    </p>
                    {q.actions[op.value] && <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{q.actions[op.value]}</p>}
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

/** کارت اقدام: کارشناس و شماره (آیکون کپی داخل خود فیلد) یا فایل راهنما */
function Contact({ l }: { l: Listing }) {
  const o = l.kind === "project" ? (l.raw as Opportunity) : null;
  const expert = o?.expert ?? null;
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(expert!.mobile); setCopied(true); toast("شماره کپی شد."); setTimeout(() => setCopied(false), 2000); };
  return (
    <div id="next-step" className="relative isolate overflow-hidden rounded-[2rem] bg-pine p-6 text-white">
      <AlgoPattern className="-left-8 -top-8 -z-10 h-56 w-72 text-white/[0.07] blur-[1.5px]" fade="radial" />
      {expert ? (
        <>
          <p className="flex items-center gap-2 text-xs font-bold text-white/70"><NodeMark />گام بعدی: با کارشناس پروژه صحبت کنید</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-2xl bg-white/10 text-lg font-black">{expert.name.trim()[0]}</span>
            <span><span className="block text-base font-extrabold">{expert.name}</span><span className="block text-xs text-white/65">کارشناس همین پروژه</span></span>
          </div>
          <div className="mt-5 flex h-14 items-center gap-1 rounded-full bg-white p-1.5 text-ink">
            <Button asChild variant="plain" size="auto" className="size-11 shrink-0 rounded-full bg-coral text-white shadow-[0_8px_18px_-8px_var(--coral)] hover:bg-coral-deep"><a href={`tel:${expert.mobile}`} aria-label="تماس با کارشناس"><Call size={19} variant="Bold" /></a></Button>
            <span dir="ltr" className="flex-1 select-all text-center text-base font-black tracking-wide">{formatMobile(expert.mobile)}</span>
            <Button variant="plain" size="auto" type="button" onClick={copy} aria-label="کپی شماره" title="کپی شماره" className={cn("size-11 shrink-0 rounded-full hover:bg-muted", copied ? "text-primary" : "text-ink/55 hover:text-primary")}>{copied ? <CopySuccess size={20} variant="Bold" /> : <Copy size={20} />}</Button>
          </div>
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 text-xs font-bold text-white/70"><NodeMark />گام بعدی: راهنمای اقدام را بگیرید</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/10"><DocumentDownload size={26} variant="Bulk" /></span>
            <span><span className="block text-base font-extrabold">راهنمای اقدام</span><span className="block text-xs leading-5 text-white/65">مراحل، مدارک و نکته‌های این پروژه در یک فایل</span></span>
          </div>
          <Button asChild variant="plain" size="auto" className="mt-5 h-14 w-full justify-between rounded-full bg-white pl-1.5 pr-6 text-base font-extrabold text-ink hover:bg-white/90">
            <Link href={`/guide/${l.id}`}>دیدن راهنما<span className="grid size-11 place-items-center rounded-full bg-primary text-white"><ArrowLeft size={18} /></span></Link>
          </Button>
        </>
      )}
      <SaveButton id={l.id} label className="mt-2 w-full border-white/20 !bg-white/10 !text-white hover:!bg-white/20" />
    </div>
  );
}

export function Detail({ id }: { id: string }) {
  const [photo, setPhoto] = useState(0);
  const l = listingById(id)!;
  const o = l.kind === "project" ? (l.raw as Opportunity) : null;
  const fund = l.kind === "fund" ? (l.raw as Fund) : null;
  const sale = l.kind === "sale" ? (l.raw as SaleItem) : null;
  const group = projectGroups.find((g) => g.id === l.group);
  const subtype = group?.subtypes.find((s) => s.id === l.subtype);
  const advisory = o ? advisories[o.subtype] : undefined;
  const similar = listings.filter((x) => x.id !== l.id && x.kind === l.kind && (l.kind !== "project" || x.group === l.group))
    .sort((a, b) => Math.abs((a.amount ?? 1e9) - (l.amount ?? 0)) - Math.abs((b.amount ?? 1e9) - (l.amount ?? 0))).slice(0, 3);
  let n = 0;

  const tiles: { I: Icon; label: string; value: string; sub?: string }[] = o
    ? [
        { I: WalletMoney, label: l.amountLabel, value: l.amount != null ? faNumber(l.amount) : NA, sub: l.amount != null ? "میلیارد تومان" : undefined },
        { I: Timer1, label: "دوره بازگشت", value: o.paybackYears != null ? `${faNumber(o.paybackYears)} سال` : NA, sub: o.paybackDownsideYears != null ? `بدبینانه ${faNumber(o.paybackDownsideYears)} سال` : undefined },
        o.metric ? { I: Building, label: o.metric.label, value: faNumber(o.metric.value), sub: o.metric.unit } : { I: Lock1, label: "قفل سرمایه", value: o.lockupMonths != null ? `${faNumber(o.lockupMonths)} ماه` : NA },
        { I: Chart, label: "نوع درآمد", value: incomeLabel[o.income] ?? o.income },
      ]
    : l.stats.map((s, i) => ({ I: [WalletMoney, Chart, ShieldSearch, Calendar][i], label: s.label, value: s.value }));

  const groups = factGroups(l);
  const pics = galleryOf(l);
  const text = (o ?? fund ?? sale)!;
  const hasFlow = !!(text.finance || text.repay || text.ownership);
  const sections = dossier(l);
  const nextSteps = o?.steps.length ? o.steps : fund?.steps?.length ? fund.steps : routeSteps[l.routes[0] as RouteId];
  const hasTime = !!o && [o.firstIncomeMonths, o.executionMonths, o.lockupMonths, o.paybackYears, o.paybackDownsideYears, o.durationYears].some((x) => x != null);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-6">
        <Link href="/opportunities" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-primary"><ArrowRight size={18} />بازگشت به پروژه‌ها</Link>

        {/* پرده اول: تصویر و عنوان */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <SignaturePhoto src={l.image} srcs={pics.map((p) => p.src)} active={photo} alt={l.title} priority sizes="100vw" className="h-[27rem] rounded-[2.25rem]">
            <HeroGallery l={l} index={photo} onIndex={setPhoto} />
            <div className="absolute right-5 top-5 z-10"><SaveButton id={l.id} className="size-12" /></div>
            <div className="absolute inset-x-10 bottom-9 text-white">
              <div className="flex flex-wrap gap-2">
                {l.tags.map((t) => <Badge key={t} variant="outline" className="border-white/30 bg-pine/25 px-3.5 py-1.5 font-bold text-white">{t}</Badge>)}
                {text.stage && <Badge className="bg-white px-3.5 py-1.5 font-extrabold text-ink">{text.stage}</Badge>}
              </div>
              <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.3] text-balance">{l.title}</h1>
              <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold text-white/85">
                {l.city && <span className="flex items-center gap-1.5"><Location size={17} variant="Bold" />{l.province}، {l.city}{sale?.neighborhood ? `، ${sale.neighborhood}` : ""}</span>}
                {text.model && <span>{o ? "مدل همکاری" : "نوع"}: {text.model}</span>}
                <span dir="ltr" className="text-white/60">{l.id}</span>
              </p>
            </div>
          </SignaturePhoto>
        </motion.div>

        <div className="mt-6 grid grid-cols-[1fr_22rem] gap-8">
          <div className="min-w-0 space-y-14">
            <div className="grid grid-cols-4 gap-3">{tiles.map((t) => <Tile key={t.label} {...t} />)}</div>

            {o && group && subtype && (
              <p className="border-r-2 border-primary pr-5 text-lg font-semibold leading-9 text-ink/85">
                این پروژه در گروه <b className="text-primary">{group.name}</b> و از نوع <b className="text-primary">{subtype.name}</b> است؛ با مدل «{o.model}» در {o.city} و در وضعیت «{o.stage}».
              </p>
            )}

            {subtype?.examples && <p className="-mt-8 flex items-start gap-2.5 rounded-2xl bg-muted px-5 py-3.5 text-sm font-semibold leading-7 text-ink/75"><InfoCircle size={18} variant="Bulk" className="mt-1 shrink-0 text-primary" /><span><b className="text-ink">{subtype.name} یعنی: </b>{subtype.examples}</span></p>}

            <Chapter n={++n} title="شناسنامه پروژه"><Facts groups={groups} /></Chapter>

            {o && hasTime && <Chapter n={++n} title="پول شما در طول زمان"><Milestones o={o} /></Chapter>}
            {hasFlow && <Chapter n={++n} title="مسیر پول"><MoneyFlow o={text} /></Chapter>}

            {o && (
              <Chapter n={++n} title="ریسک و نکته‌های مهم">
                <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4">
                  <div className="surface flex flex-col items-center rounded-[1.75rem] p-6 text-center">
                    <h3 className="self-stretch text-right text-sm font-extrabold text-ink">سطح ریسک</h3>
                    <div className="mt-5 w-full"><RiskGauge risk={o.risk} /></div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="surface flex items-center gap-4 rounded-[1.75rem] p-5">
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><ShieldSearch size={22} variant="Bulk" /></span>
                      <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-muted-foreground">وضعیت حقوقی</span><span className="mt-0.5 block text-base font-extrabold text-ink">{legalLabel[o.legalStatus] ?? o.legalStatus}</span></span>
                    </div>
                    {o.caution && <div className="flex flex-1 items-start gap-4 rounded-[1.75rem] bg-white p-5 ring-1 ring-border">
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-coral/10 text-coral"><Warning2 size={22} variant="Bulk" /></span>
                      <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-ink">پیش از تصمیم بدانید</span><span className="mt-1.5 block text-[15px] font-semibold leading-8 text-ink/85">{o.caution}</span></span>
                    </div>}
                  </div>
                </div>
                {!!o.checks?.length && <>
                  <h3 className="mb-2 mt-6 text-sm font-extrabold text-ink">این موارد را بررسی کنید</h3>
                  <ul className="grid grid-cols-2 gap-2">{o.checks.map((c) => <li key={c} className="surface flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold leading-7 text-ink/85"><InfoCircle size={18} variant="Bulk" className="mt-1 shrink-0 text-primary" />{c}</li>)}</ul>
                </>}
              </Chapter>
            )}

            {o && advisory && <Chapter n={++n} title="پرسش‌هایی که باید پاسخشان را آماده کنید" note={subtype?.name}><AdvisoryBlock a={advisory} /></Chapter>}

            {!o && text.caution && (
              <div className="flex items-start gap-4 rounded-[1.75rem] bg-white p-6 ring-1 ring-border">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-coral/10 text-coral"><Warning2 size={22} variant="Bulk" /></span>
                <span><span className="block text-sm font-extrabold text-ink">پیش از تصمیم بدانید</span><span className="mt-1 block text-[15px] font-semibold leading-8 text-ink/85">{text.caution}</span></span>
              </div>
            )}

            <Chapter n={++n} title="پرونده کامل" note="همه اطلاعات ثبت‌شده و آنچه هنوز باید احراز شود"><Dossier sections={sections} /></Chapter>

            {nextSteps && nextSteps.length > 0 && (
              <Chapter n={++n} title="مراحل ورود و اسناد لازم" note="به همین ترتیب پیش بروید؛ هر گام پیش‌نیاز گام بعدی است">
                <div className="surface rounded-[1.75rem] p-7"><Steps steps={nextSteps} /></div>
                <div className="mt-5 flex items-center justify-between gap-4 rounded-[1.75rem] bg-primary/[0.07] p-5 pr-7">
                  <p className="text-[15px] font-extrabold text-ink">{o?.expert ? `برای شروع، با ${o.expert.name} تماس بگیرید.` : "این گام‌ها را در راهنمای اقدام تیک بزنید و همراه خود داشته باشید."}</p>
                  {o?.expert
                    ? <Button asChild className="h-12 gap-2 rounded-full px-6 font-extrabold"><a href={`tel:${o.expert.mobile}`}><Call size={18} variant="Bold" />تماس با کارشناس</a></Button>
                    : <Button asChild className="h-12 gap-2 rounded-full px-6 font-extrabold"><Link href={`/guide/${l.id}`}><DocumentDownload size={18} variant="Bold" />دیدن راهنمای اقدام</Link></Button>}
                </div>
              </Chapter>
            )}

            {fund && (
              <>
                <Chapter n={++n} title="تضمین بانکی">
                  <div className="grid grid-cols-3 gap-3">
                    {([["تضمین بانکی", fund.bank.exists], ["تضمین اصل سرمایه", fund.bank.principal], ["تضمین سود", fund.bank.profit]] as const).map(([t, v]) => (
                      <div key={t} className="surface flex items-center justify-between rounded-[1.5rem] p-5"><span className="text-sm font-bold text-ink">{t}</span>
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold", v ? "bg-primary text-white" : v === false ? "bg-muted text-ink/70" : "bg-muted text-ink/70")}>{v ? <><TickCircle size={14} variant="Bold" />دارد</> : v === false ? "ندارد" : "نامعلوم"}</span></div>
                    ))}
                  </div>
                  {!fund.bank.verified && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><InfoCircle size={16} variant="Bulk" />مستندات تضمین احراز نشده است.</p>}
                </Chapter>
                <Chapter n={++n} title="دریافت سود و خروج">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="surface rounded-[1.75rem] p-6"><h3 className="text-sm font-extrabold text-primary">پرداخت سود</h3><p className="mt-2 text-xl font-black text-ink">{payoutLabel[fund.payout] ?? fund.payout}</p><p className="mt-1 text-sm text-muted-foreground">مدت: {fund.durationMonths != null ? `${faNumber(fund.durationMonths)} ماه` : NA}</p>
                      <div className="mt-5"><RiskMeter risk={fund.risk} /></div></div>
                    <div className="rounded-[1.75rem] bg-white p-6 ring-1 ring-border"><span className="grid size-11 place-items-center rounded-2xl bg-coral/10 text-coral"><Warning2 size={22} variant="Bulk" /></span><h3 className="mt-3 text-sm font-extrabold text-ink">شرایط خروج</h3><p className="mt-2 text-[15px] font-semibold leading-8 text-ink/85">{fund.exit || NA}</p></div>
                  </div>
                </Chapter>
              </>
            )}
          </div>

          <aside className="sticky top-24 space-y-4 self-start">
            <Contact l={l} />
            {l.city && (
              <div className="surface overflow-hidden rounded-[1.75rem]">
                <div className="flex items-center gap-3 p-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><Location size={22} variant="Bulk" /></span>
                  <p className="min-w-0 flex-1 text-base font-extrabold leading-6 text-ink">{l.city}<span className="block text-xs font-semibold text-muted-foreground">استان {l.province}{sale?.neighborhood ? `، ${sale.neighborhood}` : ""}</span></p>
                </div>
                <LocationMap city={l.city} province={l.province!} className="h-40 border-t border-border" />
                <Link href="/opportunities" onClick={() => { useStore.getState().begin({ route: l.routes[0] as never, provinces: [l.province!] }); useStore.getState().setStarted(true); }}
                  className="flex items-center justify-between border-t border-border px-5 py-3 text-[13px] font-bold text-primary hover:bg-primary/[0.05]">پروژه‌های دیگر در {l.province}<ArrowLeft size={16} /></Link>
              </div>
            )}
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-24">
            <h2 className="mb-6 flex items-center gap-3 text-xl font-black text-ink"><NodeMark className="text-primary" />پروژه‌های مشابه</h2>
            <div className="grid grid-cols-3 gap-5">{similar.map((s, i) => <ListingCard key={s.id} listing={s} index={i} />)}</div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
