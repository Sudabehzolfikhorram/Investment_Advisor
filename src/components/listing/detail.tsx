"use client";
// صفحه جزئیات: روایت پروژه به‌جای متن پشت‌سرهم. همه فیلدهای داده نمایش داده می‌شوند،
// هر جا داده‌ای نیست «ثبت نشده» می‌آید تا ساختار صفحه برای همه پروژه‌ها یکسان بماند.
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Call, Copy, CopySuccess, DocumentDownload, Location, Warning2, ShieldSearch, WalletMoney, MoneyRecive, Key,
  Timer1, Lock1, Chart, Calendar, Building, TickCircle, InfoCircle, Danger, Convertshape2, AddCircle, DocumentText, type Icon,
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
import { useHydrated, useStore } from "@/lib/store";
import { ReturnTimeline, type Marker } from "@/components/compare/timeline";
import { COMPARE_MAX, compareListings, oppOf, SERIES } from "@/lib/compare";
import { sheetOf } from "@/lib/sheet";
import { hasAnyCriteria } from "@/lib/criteria";
import { rank } from "@/lib/match";
import { CompareTray } from "@/components/compare/tray";
import type { Advisory, Fund, Listing, Opportunity, RouteId, SaleItem } from "@/types";
import { routeSteps } from "@/data/routes";
import { cn, faNumber, formatMobile, incomeLabel, legalLabel } from "@/lib/utils";


const ease = [0.22, 1, 0.36, 1] as const;
const NA = "ثبت نشده";

/** عنوان هر فصل: بدون شماره و بدون زیرعنوان روبه‌رو */
function Chapter({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal className="relative">
      <div className="mb-5 flex items-center gap-3">
        <h2 className="text-xl font-black text-ink">{title}</h2>
        <span className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
      </div>
      {children}
    </Reveal>
  );
}

function Tile({ I, label, value, sub }: { I: Icon; label: string; value: string; sub?: string }) {
  return (
    <Card className="surface gap-3 rounded-[1.5rem] p-5 shadow-none">
      <span className="grid size-10 place-items-center rounded-xl bg-ink/[0.06] text-primary"><I size={20} variant="Bulk" /></span>
      <span>
        <span className="block text-xs font-semibold text-muted-foreground">{label}</span>
        <span className="mt-1 block text-xl font-black leading-8 text-ink">{value}</span>
        {sub && <span className="block text-[11px] font-semibold text-muted-foreground">{sub}</span>}
      </span>
    </Card>
  );
}

/** شناسنامه: بخش‌های تمام‌عرض بازشونده (فلش برای باز و بسته)، هر ردیف «عنوان | مقدار»، اولی پیش‌فرض باز است.
 *  ارتفاع به متن وابسته نیست چون کارت‌ها کنار هم نیستند. */
const groupIcon: Record<string, Icon> = { project: Building, money: WalletMoney, status: ShieldSearch };
function Facts({ groups }: { groups: FactGroup[] }) {
  return (
    <Accordion type="multiple" defaultValue={groups[0] ? [groups[0].id] : []} className="space-y-3">
      {groups.map((g) => { const I = groupIcon[g.id] ?? Building; const { known, pending } = splitPending(g.items);
        return (
          <AccordionItem key={g.id} value={g.id} className="surface overflow-hidden rounded-[1.5rem] border-0 last:border-b-0">
            <AccordionTrigger className="items-center px-6 py-4 text-right hover:no-underline [&>svg]:size-5 [&>svg]:text-ink/50">
              <span className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-ink/[0.05] text-primary"><I size={18} variant="Bulk" /></span>
                <span className="text-[15px] font-extrabold text-ink">{g.title}</span>
                <span className="text-[12px] font-semibold text-muted-foreground">{faNumber(known.length)} مورد</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="border-t border-border/80 px-6 pb-3 pt-0">
              <dl className="divide-y divide-border/70">
                {known.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[13rem_minmax(0,1fr)] items-baseline gap-6 py-3">
                    <dt className="text-[13px] font-semibold text-muted-foreground">{k}</dt>
                    <dd className={cn("text-[14px] font-bold leading-7", v === NA ? "font-semibold text-ink/35" : "text-ink")}>{v}</dd>
                  </div>
                ))}
              </dl>
              {pending.length > 0 && <p className="mb-1 mt-1 border-t border-dashed border-border pt-3 text-[12.5px] leading-6 text-muted-foreground"><b className="font-extrabold text-ink/70">ثبت نشده: </b>{pending.join("، ")}</p>}
            </AccordionContent>
          </AccordionItem>
        ); })}
    </Accordion>
  );
}

const riskTone: Record<number, { text: string; stroke: string; soft: string; bar: string }> = {
  1: { text: "text-primary", stroke: "stroke-primary", soft: "bg-ink/[0.06]", bar: "bg-primary" },
  2: { text: "text-warn", stroke: "stroke-warn", soft: "bg-warn/10", bar: "bg-warn" },
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
/** گیج ریسک راست‌به‌چپ: مثل خواندن فارسی از راست (کم) شروع می‌شود و تا سطح پروژه پر می‌شود،
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

/** مسیر پول به شکل ردیف‌های «عنوان | متن» (مثل شناسنامه)، داخل همان کارت «پول شما در طول زمان» */
function MoneyFlow({ o }: { o: { finance?: string; repay?: string; ownership?: string | null } }) {
  const nodes = [
    { I: WalletMoney, t: "پول از کجا می‌آید", d: o.finance },
    { I: MoneyRecive, t: "چطور برمی‌گردد", d: o.repay },
    { I: Key, t: "مالکیت و سهم", d: o.ownership },
  ].filter((x) => x.d);
  return (
    <dl className="divide-y divide-border/70">
      {nodes.map((x) => (
        <div key={x.t} className="grid grid-cols-[13rem_minmax(0,1fr)] items-start gap-6 py-3.5">
          <dt className="flex items-center gap-2.5 text-[13px] font-bold text-ink/70"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink/[0.05] text-primary"><x.I size={17} variant="Bulk" /></span>{x.t}</dt>
          <dd className="pt-1 text-[14.5px] font-semibold leading-7 text-ink">{x.d}</dd>
        </div>
      ))}
    </dl>
  );
}

/** نقاط عطف زمانی روی محور نمودار بازگشت (به‌جای ردیف جدای زیر نمودار) */
const when = (m: number) => (m >= 12 && m % 12 === 0 ? `سال ${faNumber(m / 12)}` : `ماه ${faNumber(m)}`);
function markersOf(o: Opportunity): Marker[] {
  const out: (Marker | false)[] = [
    o.firstIncomeMonths != null && o.firstIncomeMonths > 0 && { at: o.firstIncomeMonths, label: "اولین دریافت", value: when(o.firstIncomeMonths) },
    o.executionMonths != null && { at: o.executionMonths, label: "پایان اجرا", value: when(o.executionMonths) },
    o.lockupMonths != null && { at: o.lockupMonths, label: "پایان قفل سرمایه", value: when(o.lockupMonths) },
    o.paybackYears != null && { at: o.paybackYears * 12, label: "بازگشت سرمایه", value: `سال ${faNumber(o.paybackYears)}` },
    o.paybackDownsideYears != null && o.paybackDownsideYears !== o.paybackYears && { at: o.paybackDownsideYears * 12, label: "بازگشت بدبینانه", value: `سال ${faNumber(o.paybackDownsideYears)}`, warn: true },
    o.durationYears != null && { at: o.durationYears * 12, label: "پایان طرح", value: `سال ${faNumber(o.durationYears)}` },
  ];
  return (out.filter(Boolean) as Marker[]).sort((a, b) => a.at - b.at);
}

/** «مراحل ورود و اسناد لازم» نسخه مرجع با نام «گام‌های ورود و مدارک لازم»: عمودی و زیر هم، با خط پیوسته بین گام‌ها */
const ordinal = ["اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم"];
function Steps({ steps }: { steps: string[] }) {
  return (
    <ol>
      {steps.map((s, i) => (
        <li key={s} className="relative flex gap-4 pb-3 last:pb-0">
          {i < steps.length - 1 && <span aria-hidden className="absolute bottom-0 right-[1.375rem] top-11 border-r-2 border-dashed border-ink/15" />}
          <span className={cn("relative z-10 grid size-11 shrink-0 place-items-center rounded-full text-base font-black", i === 0 ? "bg-primary text-white shadow-[0_10px_24px_-12px_var(--primary)]" : "bg-white text-primary ring-1 ring-border")}>{faNumber(i + 1)}</span>
          <div className="surface min-w-0 flex-1 rounded-2xl px-5 py-3.5">
            <p className="text-[12px] font-extrabold text-primary">گام {ordinal[i] ?? faNumber(i + 1)}</p>
            <p className="mt-0.5 text-[15px] font-bold leading-7 text-ink">{s}</p>
          </div>
        </li>
      ))}
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

/** پرسش‌های تخصصی نوع پروژه از نسخه مرجع، فقط برای خواندن */
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
            <AccordionContent className="pb-5 pr-9">
              {/* گزینه‌ها بدون پس‌زمینه، عنوان هر گزینه با بولت */}
              <ul className="space-y-3">
                {q.options.map((op) => {
                  const block = q.block.includes(op.value), review = q.review.includes(op.value);
                  return (
                    <li key={op.value} className="relative pr-4">
                      <span aria-hidden className="absolute right-0 top-[0.7rem] size-1.5 rounded-full bg-ink/45" />
                      <p className="flex flex-wrap items-center gap-2 text-sm font-bold leading-7 text-ink">{op.label}
                        {block && <Badge variant="outline" className="gap-1 border-destructive/30 bg-destructive/5 text-[11px] text-destructive"><Danger size={12} variant="Bold" />مانع ادامه</Badge>}
                        {review && <Badge variant="outline" className="bg-white text-[11px] text-ink/70">نیازمند بررسی</Badge>}
                      </p>
                      {q.actions[op.value] && <p className="text-[13px] leading-6 text-muted-foreground">{q.actions[op.value]}</p>}
                    </li>
                  );
                })}
              </ul>
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
            <Button asChild variant="plain" size="auto" className="size-11 shrink-0 rounded-full bg-cobalt text-white shadow-[0_8px_18px_-8px_var(--cobalt)] hover:bg-cobalt-deep"><a href={`tel:${expert.mobile}`} aria-label="تماس با کارشناس"><Call size={19} variant="Bold" /></a></Button>
            <span dir="ltr" className="flex-1 select-all text-center text-base font-black tracking-wide">{formatMobile(expert.mobile)}</span>
            <Button variant="plain" size="auto" type="button" onClick={copy} aria-label="کپی شماره" title="کپی شماره" className={cn("size-11 shrink-0 rounded-full hover:bg-muted", copied ? "text-primary" : "text-ink/55 hover:text-ink")}>{copied ? <CopySuccess size={20} variant="Bold" /> : <Copy size={20} />}</Button>
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

/** پروژه‌های نزدیک: هم‌گروه و هم‌مسیر، با مبلغ نزدیک، اگر کاربر شرایطی وارد کرده، تطابق با آن هم وزن دارد */
function useNearby(l: Listing, needPayback = false) {
  const hydrated = useHydrated();
  const criteria = useStore((st) => st.criteria);
  return useMemo(() => {
    if (l.kind !== "project") return [];
    const withCrit = hydrated && hasAnyCriteria(criteria);
    const fit = withCrit ? Object.fromEntries(rank(compareListings, criteria).map((r) => [r.listing.id, r.score])) : {};
    const span = Math.max(1, ...compareListings.map((x) => x.amount ?? 0));
    return compareListings
      .filter((x) => x.id !== l.id && (!needPayback || oppOf(x).paybackYears != null))
      .map((x) => ({ x, s: (x.group === l.group ? 3 : 0) + (x.subtype === l.subtype ? 1 : 0) + (x.routes.some((r) => l.routes.includes(r)) ? 1 : 0) + (withCrit ? (fit[x.id] ?? 0) / 40 : 0) - Math.abs((x.amount ?? span) - (l.amount ?? 0)) / span }))
      .sort((a, b) => b.s - a.s).slice(0, 3).map((e) => e.x);
  }, [l, needPayback, hydrated, criteria]);
}

/** کنار پروژه‌های نزدیک بسنجید: در ستون کناری و کم‌اولویت‌تر از تماس، هر پروژه جدا به مقایسه اضافه می‌شود */
function CompareCard({ l, near }: { l: Listing; near: Listing[] }) {
  const router = useRouter();
  const { compare, toggleCompare, setCompare, criteria } = useStore();
  const hydrated = useHydrated();
  const inList = (id: string) => hydrated && compare.includes(id);
  const add = (id: string) => { if (!inList(id) && compare.length >= COMPARE_MAX) return toast("حداکثر چهار پروژه را می‌توانید مقایسه کنید."); toggleCompare(id); };
  if (!near.length) return null;
  return (
    <div className="surface rounded-[1.75rem] p-5">
      <p className="flex items-center gap-2 text-[13.5px] font-extrabold text-ink"><Convertshape2 size={18} variant="Bulk" className="text-cobalt" />با پروژه‌های نزدیک بسنجید</p>
      <p className="mt-1 text-[11.5px] font-semibold leading-5 text-muted-foreground">{hydrated && hasAnyCriteria(criteria) ? "نزدیک به شرایط شما و هم‌گروه همین پروژه" : "هم‌گروه و با مبلغ نزدیک"}</p>
      <ul className="mt-3 space-y-1">
        {near.map((x) => { const ox = oppOf(x); const on = inList(x.id);
          return (
            <li key={x.id} className="flex items-center gap-2.5 rounded-2xl p-1.5 transition-colors hover:bg-muted/60">
              <Link href={`/opportunities/${x.id}`} className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-muted"><Image src={x.image} alt="" fill sizes="44px" className="object-cover" /></Link>
              <Link href={`/opportunities/${x.id}`} className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-extrabold text-ink" title={x.title}>{x.title}</span>
                <span className="block truncate text-[11px] font-semibold text-muted-foreground">{ox.minCapital != null ? `ورود از ${faNumber(ox.minCapital)} میلیارد` : x.city}{ox.paybackYears != null && ` · بازگشت ${faNumber(ox.paybackYears)} سال`}</span>
              </Link>
              <Button type="button" variant="plain" size="auto" aria-pressed={on} onClick={() => add(x.id)} aria-label={on ? `برداشتن ${x.title} از مقایسه` : `افزودن ${x.title} به مقایسه`} title={on ? "در مقایسه است" : "افزودن به مقایسه"}
                className={cn("grid size-8 shrink-0 place-items-center rounded-full transition-colors", on ? "bg-cobalt text-white" : "border border-border text-ink/50 hover:border-cobalt/40 hover:text-cobalt")}>
                {on ? <TickCircle size={16} variant="Bold" /> : <AddCircle size={16} />}
              </Button>
            </li>
          ); })}
      </ul>
      <Button type="button" variant="plain" size="auto" onClick={() => { setCompare([l.id, ...near.map((x) => x.id)]); router.push("/compare"); }}
        className="group mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-cobalt-soft text-[13px] font-extrabold text-cobalt-deep transition-colors hover:bg-cobalt hover:text-white">
        مقایسه این پروژه با هر {near.length === 3 ? "سه" : near.length === 2 ? "دو" : "یک"}<ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
      </Button>
    </div>
  );
}

/** یک برچسب زمان: زیر یک سال به ماه، بالاتر به سال و ماه (مثل «۸ سال و ۶ ماه») */
const span = (m: number) => { const t = Math.round(m), y = Math.floor(t / 12), r = t % 12; return y === 0 ? `${faNumber(r)} ماه` : r === 0 ? `${faNumber(y)} سال` : `${faNumber(y)} سال و ${faNumber(r)} ماه`; };

/** بازگشت سرمایه این پروژه کنار پروژه‌های مشابه: هر پروژه یک ردیف روی یک محور سال مشترک، همین پروژه همیشه ردیف اول.
 *  خاکستری: پیش از اولین درآمد، رنگی: از اولین درآمد تا بازگشت کامل سرمایه، خط‌چین: حالت بدبینانه. خط‌ها هیچ‌وقت روی هم نمی‌افتند. */
function PeerReturn({ l, peers }: { l: Listing; peers: Listing[] }) {
  const router = useRouter();
  const { setCompare, setPinned, begin, setStarted } = useStore();
  const rows = [l, ...peers].map((x, i) => { const ox = oppOf(x); return { x, i, first: ox.firstIncomeMonths, pay: ox.paybackYears != null ? ox.paybackYears * 12 : null, down: ox.paybackDownsideYears != null ? ox.paybackDownsideYears * 12 : null }; });
  const mine = rows[0].pay;
  const known = rows.slice(1).map((r) => r.pay).filter((v): v is number => v != null);
  const avg = known.length ? known.reduce((a, b) => a + b, 0) / known.length : null;
  const diff = mine != null && avg != null ? Math.round(avg - mine) : null; // به ماه
  const same = peers.filter((p) => p.group === l.group).length;
  const gName = projectGroups.find((g) => g.id === l.group)?.name;
  const scope = same === peers.length ? `${faNumber(peers.length)} پروژه هم‌گروه${gName ? ` در «${gName}»` : ""} که دوره بازگشتشان اعلام شده، با مبلغ نزدیک.`
    : same > 0 ? `${faNumber(same)} پروژه هم‌گروه و ${faNumber(peers.length - same)} پروژه نزدیک از گروه‌های دیگر، چون پروژه هم‌گروه دیگری با دوره بازگشت اعلام‌شده نبود.`
    : `در گروه این پروژه، پروژه دیگری با دوره بازگشت اعلام‌شده نبود. نزدیک‌ترین پروژه‌ها از گروه‌های دیگر آمده‌اند.`;
  const T = Math.max(36, Math.ceil(Math.max(...rows.map((r) => Math.max(r.pay ?? 0, r.down ?? 0, r.first ?? 0))) / 12) * 12 + 6);
  const step = T > 192 ? 36 : T > 120 ? 24 : 12;
  const ticks = Array.from({ length: Math.floor(T / step) + 1 }, (_, k) => k * step);
  const pct = (m: number) => `${(m / T) * 100}%`;
  const showInList = () => {
    begin({ route: l.routes[0] as RouteId, groups: l.group ? [l.group] : [] });
    setStarted(true);
    setPinned({ from: l.title, ids: [l.id, ...peers.map((p) => p.id)] });
    router.push("/opportunities");
  };
  const box = (label: string, value: string, tone = "bg-[#f5f7fa]", vTone = "text-ink") => (
    <div className={cn("rounded-2xl p-4", tone)}><p className="text-[12px] font-bold text-ink/60">{label}</p><p className={cn("mt-1 text-[15px] font-black leading-7", vTone)}>{value}</p></div>
  );
  return (
    <div className="surface rounded-[1.75rem] p-6">
      <div className="grid grid-cols-3 gap-3">
        {box("همین پروژه", mine != null ? span(mine) : "اعلام نشده", "bg-cobalt-soft", mine != null ? "text-cobalt-deep" : "font-semibold text-ink/45")}
        {box(`میانگین ${faNumber(known.length)} پروژه مشابه`, avg != null ? span(avg) : "اعلام نشده")}
        {mine == null ? box("نتیجه", "مقایسه ممکن نیست، دوره بازگشت را از کارشناس بپرسید", "bg-[#f5f7fa]", "text-[13.5px] text-ink/70")
          : box("نتیجه", diff == null || diff === 0 ? "هم‌اندازه مشابه‌ها" : diff > 0 ? `${span(diff)} زودتر از میانگین` : `${span(-diff)} دیرتر از میانگین`,
            diff != null && diff > 0 ? "bg-primary/10" : diff != null && diff < 0 ? "bg-warn/10" : "bg-[#f5f7fa]", diff != null && diff > 0 ? "text-primary" : diff != null && diff < 0 ? "text-warn" : "text-ink")}
      </div>
      <p className="mt-4 text-[12.5px] font-semibold leading-6 text-muted-foreground">{scope}</p>

      <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] font-bold text-ink/70">
        <li className="flex items-center gap-2"><span className="h-2 w-6 rounded-full bg-ink/15" />پیش از اولین درآمد</li>
        <li className="flex items-center gap-2"><span className="h-2 w-6 rounded-full bg-cobalt" />از اولین درآمد تا بازگشت کامل سرمایه</li>
        <li className="flex items-center gap-2"><span className="w-6 border-t-2 border-dashed border-ink/40" />حالت بدبینانه</li>
      </ul>

      <div className="mt-4 grid grid-cols-[14rem_minmax(0,1fr)_7.5rem] gap-x-5">
        {rows.map((r) => {
          const c = SERIES[r.i]; const f = r.pay != null ? Math.min(r.first ?? 0, r.pay) : null;
          return (
            <div key={r.x.id} className={cn("contents")}>
              <Link href={`/opportunities/${r.x.id}`} className={cn("flex min-w-0 items-center gap-2.5 rounded-2xl py-2 pl-2", r.i === 0 && "bg-cobalt-soft/60 pr-2")}>
                <span className="relative size-9 shrink-0 overflow-hidden rounded-xl bg-muted"><Image src={r.x.image} alt="" fill sizes="36px" className="object-cover" /></span>
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-extrabold text-ink" title={r.x.title}>{r.x.title}</span>
                  <span className="block truncate text-[11px] font-semibold text-muted-foreground">{r.i === 0 ? "همین پروژه" : projectGroups.find((g) => g.id === r.x.group)?.name}</span>
                </span>
              </Link>
              <div className="relative flex h-[3.25rem] items-center">
                <span className="absolute inset-x-0 h-2 rounded-full bg-ink/[0.04]" />
                {r.pay == null ? (
                  <span className="relative text-[12px] font-semibold text-ink/40">دوره بازگشت اعلام نشده</span>
                ) : (
                  <>
                    {f! > 0 && <motion.span initial={{ width: 0 }} whileInView={{ width: pct(f!) }} viewport={{ once: true }} transition={{ duration: 0.6, delay: r.i * 0.08, ease }} className="absolute right-0 h-2 rounded-full bg-ink/15" />}
                    <motion.span initial={{ width: 0 }} whileInView={{ width: pct(r.pay - f!) }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 + r.i * 0.08, ease }} className="absolute h-2 rounded-full" style={{ right: pct(f!), background: c }} />
                    {r.down != null && r.down > r.pay && <span className="absolute border-t-2 border-dashed" style={{ right: pct(r.pay), width: pct(r.down - r.pay), borderColor: c, opacity: 0.6 }} />}
                    <span className="absolute size-3.5 rounded-full border-2 border-white shadow" style={{ right: `calc(${pct(r.pay)} - 0.44rem)`, background: c }} />
                  </>
                )}
              </div>
              {/* عدد هر ردیف در ستون ثابت کنار نمودار، تا هیچ‌وقت از کارت بیرون نزند */}
              <div className="flex flex-col justify-center text-left">
                <span className={cn("text-[13.5px] font-black", r.pay != null ? "text-ink" : "font-semibold text-ink/35")}>{r.pay != null ? span(r.pay) : "اعلام نشده"}</span>
                {r.down != null && r.pay != null && r.down > r.pay && <span className="text-[11px] font-semibold text-ink/50">بدبینانه {span(r.down)}</span>}
              </div>
            </div>
          );
        })}
        <span />
        <span className="relative mt-1 h-7 border-t border-border">
          {ticks.map((t) => <span key={t} className="absolute top-0 whitespace-nowrap text-[11px] font-semibold text-muted-foreground" style={{ right: pct(t), transform: "translateX(50%)" }}><span className="mx-auto block h-1.5 w-px bg-border" />{t === 0 ? "امروز" : `سال ${faNumber(t / 12)}`}</span>)}
        </span>
        <span />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <Button type="button" onClick={showInList} className="group h-12 gap-2 rounded-full px-6 text-[14px] font-extrabold">پروژه‌های مشابه را در فهرست ببینید<ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" /></Button>
        <Button type="button" variant="outline" onClick={() => { setCompare([l.id, ...peers.map((p) => p.id)]); router.push("/compare"); }} className="h-12 gap-2 rounded-full bg-white px-5 text-[13.5px] font-extrabold shadow-none"><Convertshape2 size={18} />مقایسه کامل این {faNumber(peers.length + 1)} پروژه</Button>
      </div>
    </div>
  );
}

/** داده‌ها و الگوی دریافت: درآمد کی و به چه شکلی به دست سرمایه‌گذار می‌رسد، و از داده‌های کلیدی چندتا اعلام شده */
function DataPattern({ l, o }: { l: Listing; o: Opportunity }) {
  const known = sheetOf(l).known;
  const ok = known.filter((k) => k.ok), miss = known.filter((k) => !k.ok);
  const first = o.firstIncomeMonths, term = o.durationYears != null ? o.durationYears * 12 : null;
  const T = Math.max(36, Math.ceil(Math.max(first ?? 0, term ?? 0, o.executionMonths ?? 0, o.paybackYears != null ? o.paybackYears * 12 : 0) / 12) * 12 + 12);
  const end = term ?? T - 12;
  const pct = (m: number) => `${(m / T) * 100}%`;
  const step = T > 192 ? 36 : T > 120 ? 24 : 12;
  const ticks = Array.from({ length: Math.floor(T / step) + 1 }, (_, k) => k * step);
  // هر ستون یک دوره دریافت است، هم‌قد، چون مبلغ هر دوره در داده‌ها نیست
  const every = T > 180 ? 24 : 12;
  const periodic = o.income === "periodic";
  const start = first ?? o.executionMonths ?? null;
  const pays = periodic && start != null ? Array.from({ length: Math.max(1, Math.floor((end - start) / every) + 1) }, (_, k) => start + k * every).filter((m) => m <= end) : o.income === "end" ? [end] : [];
  const headline = periodic
    ? start != null ? `از ${when(start)}${first == null ? " (پس از پایان اجرا)" : ""}${term ? ` تا پایان طرح در ${when(term)}` : ""}، درآمد به شکل دوره‌ای می‌رسد.` : "درآمد دوره‌ای است، اما زمان اولین دریافت اعلام نشده."
    : o.income === "end" ? `سود یک‌جا در پایان طرح${term ? ` (${when(term)})` : ""} دریافت می‌شود.` : "شکل دریافت درآمد محدود نشده و در قرارداد تعیین می‌شود.";
  return (
    <div className="grid grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-4">
      <div className="surface rounded-[1.75rem] p-6">
        <p className="flex items-center gap-2 text-[13px] font-extrabold text-ink/70"><MoneyRecive size={18} variant="Bulk" className="text-cobalt" />الگوی دریافت درآمد</p>
        <p className="mt-2 text-[16px] font-black leading-8 text-ink">{headline}</p>
        <ul className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] font-bold text-ink/65">
          {start != null && start > 0 && <li className="flex items-center gap-2"><span className="h-3 w-5 rounded-[5px] border border-dashed border-ink/25 bg-ink/[0.03]" />بدون درآمد (اجرا و راه‌اندازی)</li>}
          {pays.length > 0 && <li className="flex items-center gap-2"><span className="h-3 w-1.5 rounded-sm bg-cobalt" />{o.income === "end" ? "دریافت یک‌جا" : "یک نوبت دریافت"}</li>}
        </ul>
        <div className="relative mt-5 h-28">
          {/* پیش از اولین دریافت: بدون درآمد */}
          {start != null && start > 0 && (
            <span className="absolute bottom-0 right-0 h-9 rounded-xl border border-dashed border-ink/20 bg-ink/[0.03]" style={{ width: pct(start) }} />
          )}
          {pays.map((m, k) => (
            <motion.span key={m} initial={{ height: 0 }} whileInView={{ height: o.income === "end" ? "100%" : "62%" }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 + k * 0.05, ease }}
              className="absolute bottom-0 w-3 rounded-t-md bg-cobalt" style={{ right: `calc(${pct(m)} - 0.375rem)` }} />
          ))}
          {!pays.length && <span className="absolute inset-x-0 bottom-0 flex h-9 items-center justify-center rounded-xl border border-dashed border-ink/20 text-[12px] font-bold text-ink/45">زمان و شکل دریافت در قرارداد تعیین می‌شود</span>}
        </div>
        <div className="relative h-7 border-t border-border">
          {ticks.map((t) => <span key={t} className="absolute top-0 whitespace-nowrap text-[11px] font-semibold text-muted-foreground" style={{ right: pct(t), transform: "translateX(50%)" }}><span className="mx-auto block h-1.5 w-px bg-border" />{t === 0 ? "امروز" : `سال ${faNumber(t / 12)}`}</span>)}
        </div>
        <p className="mt-3 flex items-start gap-2 text-[12px] font-semibold leading-6 text-muted-foreground"><InfoCircle size={15} variant="Bulk" className="mt-1 shrink-0" />هر ستون یک نوبت دریافت است. ستون‌ها هم‌قدند چون این نمودار زمان دریافت را نشان می‌دهد، نه مبلغ آن.</p>
      </div>
      <div className="surface rounded-[1.75rem] p-6">
        <p className="flex items-center gap-2 text-[13px] font-extrabold text-ink/70"><DocumentText size={18} variant="Bulk" className="text-cobalt" />کامل بودن اطلاعات</p>
        <p className="mt-2 text-[16px] font-black leading-8 text-ink">{faNumber(ok.length)} از {faNumber(known.length)} داده کلیدی اعلام شده</p>
        <div className="mt-3 flex gap-1" aria-hidden>{known.map((k) => <span key={k.label} className={cn("h-2 flex-1 rounded-full", k.ok ? "bg-cobalt" : "bg-ink/10")} />)}</div>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {ok.map((k) => <li key={k.label} className="inline-flex items-center gap-1 rounded-full bg-cobalt-soft px-2.5 py-1 text-[11.5px] font-bold text-cobalt-deep"><TickCircle size={13} variant="Bold" />{k.label}</li>)}
        </ul>
        {miss.length > 0 && <>
          <p className="mt-4 text-[12px] font-extrabold text-ink/70">اعلام نشده، پیش از تصمیم از کارشناس بپرسید:</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">{miss.map((k) => <li key={k.label} className="rounded-full border border-dashed border-ink/25 px-2.5 py-1 text-[11.5px] font-semibold text-ink/55">{k.label}</li>)}</ul>
        </>}
      </div>
    </div>
  );
}

/** شناسه پروژه زیر عنوان: گروه، نوع، مدل همکاری و وضعیت در یک نوار، جای بج‌های روی عکس و جمله‌ی تکراری معرفی */
function IdentityStrip({ items, note }: { items: [string, string][]; note?: React.ReactNode }) {
  if (!items.length) return null;
  return (
    <div className="surface mt-5 overflow-hidden rounded-[1.5rem]">
      <dl className="grid [&>div+div]:border-r [&>div+div]:border-border" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map(([k, v]) => (
          <div key={k} className="min-w-0 px-5 py-4">
            <dt className="text-[11.5px] font-semibold text-muted-foreground">{k}</dt>
            <dd className="mt-1 text-[14.5px] font-extrabold leading-6 text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      {note && <div className="flex items-start gap-2.5 border-t border-border bg-[#f8fafc] px-5 py-3 text-[13px] font-semibold leading-7 text-ink/75"><InfoCircle size={17} variant="Bulk" className="mt-1 shrink-0 text-ink/45" /><span>{note}</span></div>}
    </div>
  );
}

/** بازه‌های زمانی روی یک محور ماه: اجرا، قفل سرمایه و کل طرح، اولین دریافت به شکل نشانگر.
 *  وقتی دوره بازگشت اعلام نشده، جای نمودار بازگشت را می‌گیرد تا زمان‌بندی با یک نگاه خوانده شود. */
function PhaseTrack({ o }: { o: Opportunity }) {
  const bars = [
    { label: "اجرای پروژه", end: o.executionMonths, cls: "bg-ink/70" },
    { label: "قفل سرمایه", end: o.lockupMonths, cls: "bg-cobalt/70" },
    { label: "کل دوره طرح", end: o.durationYears != null ? o.durationYears * 12 : null, cls: "bg-ink/25" },
  ].filter((b): b is { label: string; end: number; cls: string } => b.end != null && b.end > 0);
  const first = o.firstIncomeMonths != null && o.firstIncomeMonths > 0 ? o.firstIncomeMonths : null;
  if (!bars.length && first == null) return null;
  // یک سال فضای خالی بعد از آخرین بازه، تا برچسب پایان بازه کنار نوار جا شود
  const T = Math.ceil(Math.max(12, ...bars.map((b) => b.end), first ?? 0) / 12) * 12 + 12;
  const pct = (m: number) => `${(m / T) * 100}%`;
  const ticks = Array.from({ length: T / 12 + 1 }, (_, i) => i * 12);
  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-x-4">
      {bars.map((b, i) => (
        <div key={b.label} className="contents">
          <span className="flex h-11 items-center text-[13px] font-bold text-ink/75">{b.label}</span>
          <span className="relative flex h-11 items-center">
            <span className="absolute inset-x-0 h-2.5 rounded-full bg-ink/[0.05]" />
            <motion.span initial={{ width: 0 }} whileInView={{ width: pct(b.end) }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.12, ease }} className={cn("absolute right-0 h-2.5 rounded-full", b.cls)} />
            <span className="absolute whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-[12px] font-extrabold text-ink ring-1 ring-border" style={{ right: `calc(${pct(b.end)} + 0.5rem)` }}>{when(b.end)}</span>
          </span>
        </div>
      ))}
      <span />
      <span className="relative mt-1 h-10 border-t border-border">
        {ticks.map((t) => <span key={t} className="absolute top-0 whitespace-nowrap text-center text-[11px] font-semibold text-muted-foreground" style={{ right: pct(t), transform: "translateX(50%)" }}><span className="mx-auto block h-1.5 w-px bg-border" />{t === 0 ? "شروع" : `سال ${faNumber(t / 12)}`}</span>)}
        {first != null && (
          <span className="absolute -top-[4.6rem] flex flex-col items-center" style={{ right: pct(first), transform: "translateX(50%)" }}>
            <span className="whitespace-nowrap rounded-full bg-primary px-2.5 py-0.5 text-[11.5px] font-extrabold text-white">اولین دریافت · {when(first)}</span>
            <span className="h-14 border-r border-dashed border-primary/60" />
          </span>
        )}
      </span>
    </div>
  );
}

/** مسیر احتمالی بازگشت، وقتی دوره بازگشت پروژه اعلام نشده: از پروژه‌های مشابه ساخته می‌شود و همه‌جا «احتمالی» نوشته می‌شود */
type Probable = { first: number; pay: number; n: number; firstKnown: boolean };

/** «پول شما در طول زمان»: چهار عدد کلیدی، نمودار (بازگشت، مسیر احتمالی یا بازه‌ها) و سه کارت مسیر پول در یک کارت */
function MoneyTime({ o, l, text, probable }: { o: Opportunity; l: Listing; text: { finance?: string; repay?: string; ownership?: string | null }; probable: Probable | null }) {
  const stats: [Icon, string, string | null, string?, string?][] = [
    [Timer1, "اولین دریافت", o.firstIncomeMonths != null ? (o.firstIncomeMonths === 0 ? "از ابتدا" : when(o.firstIncomeMonths)) : null, undefined, probable && !probable.firstKnown ? `احتمالی: ${when(probable.first)}` : undefined],
    [Building, "مدت اجرا", o.executionMonths != null ? `${faNumber(o.executionMonths)} ماه` : null],
    [Lock1, "قفل سرمایه", o.lockupMonths != null ? `${faNumber(o.lockupMonths)} ماه` : null],
    [Chart, "بازگشت سرمایه", o.paybackYears != null ? `${faNumber(o.paybackYears)} سال` : null, o.paybackDownsideYears != null && o.paybackDownsideYears !== o.paybackYears ? `بدبینانه ${faNumber(o.paybackDownsideYears)} سال` : undefined, probable ? `احتمالی: ${span(probable.pay)}` : undefined],
  ];
  const flow: [Icon, string, string | null | undefined][] = [[WalletMoney, "پول از کجا می‌آید", text.finance], [MoneyRecive, "چطور برمی‌گردد", text.repay], [Key, "مالکیت و سهم", text.ownership]];
  let chart: React.ReactNode;
  if (o.paybackYears != null) chart = <ReturnTimeline items={[l]} single markers={markersOf(o)} />;
  else if (probable) {
    // همان نمودار بازگشت، با خط‌چین و برچسب «احتمالی»، روی داده‌های تخمینی
    const est = { ...o, firstIncomeMonths: probable.first, paybackYears: probable.pay / 12, paybackDownsideYears: null };
    const marks = markersOf(est).map((m) => m.label === "بازگشت سرمایه" ? { ...m, label: "بازگشت احتمالی", value: `حدود ${span(probable.pay)}` } : m.label === "اولین دریافت" && !probable.firstKnown ? { ...m, label: "اولین دریافت احتمالی", value: `حدود ${m.value}` } : m);
    chart = <ReturnTimeline items={[{ ...l, raw: est }]} single probable markers={marks}
      note={`این مسیر احتمالی است. دوره بازگشت این پروژه اعلام نشده و این مسیر از ${o.firstIncomeMonths != null ? "زمان اولین دریافت همین پروژه" : o.executionMonths != null ? "پایان اجرای همین پروژه" : "میانگین اولین دریافت پروژه‌های مشابه"} و فاصله اولین دریافت تا بازگشت سرمایه در ${faNumber(probable.n)} پروژه مشابه ساخته شده. عدد قطعی را از کارشناس بپرسید.`} />;
  } else chart = <PhaseTrack o={o} />;
  return (
    <div className="surface overflow-hidden rounded-[1.75rem]">
      <dl className="grid grid-cols-4 border-b border-border [&>div+div]:border-r [&>div+div]:border-border">
        {stats.map(([I, k, v, sub, guess]) => (
          <div key={k} className="flex items-center gap-3 px-5 py-4">
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", v ? "bg-ink/[0.05] text-ink/70" : "bg-ink/[0.03] text-ink/30")}><I size={18} variant="Bulk" /></span>
            <span className="min-w-0"><dt className="text-[11.5px] font-semibold text-muted-foreground">{k}</dt><dd className={cn("text-[15px] font-black leading-6", v ? "text-ink" : "font-semibold text-ink/35")}>{v ?? "اعلام نشده"}</dd>
              {sub && <dd className="text-[11px] font-bold text-warn-deep">{sub}</dd>}
              {!v && guess && <dd className="whitespace-nowrap text-[11px] font-bold text-cobalt">{guess}</dd>}</span>
          </div>
        ))}
      </dl>
      {chart && <div className={cn("px-8", o.paybackYears != null || probable || o.firstIncomeMonths == null || o.firstIncomeMonths === 0 ? "pt-6" : "pt-24")}>{chart}</div>}
      <div className="grid grid-cols-3 gap-3 p-6 pt-5">
        {flow.map(([I, k, v]) => (
          <div key={k} className={cn("rounded-2xl p-4", v ? "bg-[#f5f7fa]" : "border border-dashed border-border")}>
            <p className="flex items-center gap-2 text-[12.5px] font-extrabold text-ink/70"><I size={16} variant="Bulk" className="text-ink/50" />{k}</p>
            <p className={cn("mt-2 text-[13.5px] leading-7", v ? "font-semibold text-ink" : "font-semibold text-ink/35")}>{v || "اعلام نشده"}</p>
          </div>
        ))}
      </div>
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
  const near = useNearby(l);
  const peers = useNearby(l, true);
  // اگر هم‌گروه کافی نبود، نزدیک‌ترین پروژه‌ها جای خالی را پر می‌کنند تا این بخش در همه پروژه‌ها سه کارت داشته باشد
  const sameCount = similar.length;
  const similarAll = o && similar.length < 3 ? [...similar, ...near.filter((x) => !similar.some((y) => y.id === x.id))].slice(0, 3) : similar;
  const probable = useMemo<Probable | null>(() => {
    if (!o || o.paybackYears != null || !peers.length) return null;
    const ps = peers.map(oppOf).filter((p) => p.paybackYears != null);
    if (!ps.length) return null;
    const firsts = ps.map((p) => p.firstIncomeMonths).filter((v): v is number => v != null);
    const first = o.firstIncomeMonths ?? o.executionMonths ?? (firsts.length ? Math.round(firsts.reduce((a, b) => a + b, 0) / firsts.length) : 12);
    const gap = ps.reduce((a, p) => a + (p.paybackYears! * 12 - (p.firstIncomeMonths ?? 0)), 0) / ps.length;
    return { first, pay: Math.max(first + 12, Math.round((first + gap) / 6) * 6), n: ps.length, firstKnown: o.firstIncomeMonths != null };
  }, [o, peers]);

  const tiles: { I: Icon; label: string; value: string; sub?: string }[] = o
    ? [
        { I: WalletMoney, label: l.amountLabel, value: l.amount != null ? faNumber(l.amount) : NA, sub: l.amount != null ? "میلیارد تومان" : undefined },
        { I: Timer1, label: "دوره بازگشت", value: o.paybackYears != null ? `${faNumber(o.paybackYears)} سال` : NA, sub: o.paybackDownsideYears != null ? `بدبینانه ${faNumber(o.paybackDownsideYears)} سال` : undefined },
        o.metric ? { I: Building, label: o.metric.label, value: faNumber(o.metric.value), sub: o.metric.unit } : { I: Lock1, label: "قفل سرمایه", value: o.lockupMonths != null ? `${faNumber(o.lockupMonths)} ماه` : NA },
        { I: Chart, label: "نوع درآمد", value: incomeLabel[o.income] ?? o.income },
      ]
    : l.stats.map((s, i) => ({ I: [WalletMoney, Chart, ShieldSearch, Calendar][i], label: s.label, value: s.value }));

  // گروه و نوع یک بار، همین‌جا، بج‌های روی عکس و جمله‌ی معرفی که همین‌ها را تکرار می‌کردند حذف شده‌اند
  const identity = ([
    o ? ["گروه", group?.name] : ["دسته", l.tags[0]],
    o ? ["نوع پروژه", subtype?.name] : ["نوع", l.tags[1]],
    [o ? "مدل همکاری" : "شیوه", (o ?? fund ?? sale)?.model],
    ["وضعیت", (o ?? fund ?? sale)?.stage],
  ] as [string, string | undefined][]).filter((x): x is [string, string] => !!x[1]);
  const groups = factGroups(l);
  const pics = galleryOf(l);
  const text = (o ?? fund ?? sale)!;
  const hasFlow = !!(text.finance || text.repay || text.ownership);
  const sections = dossier(l);
  const nextSteps = o?.steps.length ? o.steps : fund?.steps?.length ? fund.steps : routeSteps[l.routes[0] as RouteId];
  const sameGroup = listings.filter((x) => x.kind === l.kind && (l.kind !== "project" || x.group === l.group) && x.routes.includes(l.routes[0])).length;

  return (
    <>
      <Header />
      <main className="focus-blur mx-auto max-w-7xl px-6 pt-6">
        <Link href="/opportunities" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-ink"><ArrowRight size={18} />بازگشت به پروژه‌ها</Link>

        {/* پرده اول: تصویر و عنوان */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <SignaturePhoto src={l.image} srcs={pics.map((p) => p.src)} active={photo} alt={l.title} priority sizes="100vw" className="h-[27rem] rounded-[2.25rem]">
            <HeroGallery l={l} index={photo} onIndex={setPhoto} />
            <div className="absolute right-5 top-5 z-10"><SaveButton id={l.id} className="size-12" /></div>
          </SignaturePhoto>
        </motion.div>

        {/* عنوان و شناسه زیر عکس، نه روی آن */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08, ease }} className="mt-7">
          <h1 className="max-w-5xl text-[2.25rem] font-black leading-[1.35] text-ink text-balance">{l.title}</h1>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] font-semibold text-muted-foreground">
            {l.city && <span className="flex items-center gap-1.5 text-ink/75"><Location size={17} variant="Bulk" className="text-ink/45" />{l.province}، {l.city}{sale?.neighborhood ? `، ${sale.neighborhood}` : ""}</span>}
          </p>
          <IdentityStrip items={identity} note={subtype?.examples ? <><b className="font-extrabold text-ink">{subtype.name} یعنی: </b>{subtype.examples}</> : undefined} />
        </motion.div>

        <div className="mt-8 grid grid-cols-[1fr_22rem] gap-8">
          <div className="min-w-0 space-y-14">
            <div className="grid grid-cols-4 gap-3">{tiles.map((t) => <Tile key={t.label} {...t} />)}</div>

            <Chapter title="شناسنامه پروژه"><Facts groups={groups} /></Chapter>

            {/* ساختار یکسان همه پروژه‌ها: همین بخش‌ها با همین ترتیب، داده‌ای که نیست «اعلام نشده» نوشته می‌شود */}
            {o && <Chapter title="پول شما در طول زمان"><MoneyTime o={o} l={l} text={text} probable={probable} /></Chapter>}
            {o && <Chapter title="داده‌ها و الگوی دریافت"><DataPattern l={l} o={o} /></Chapter>}
            {o && peers.length > 0 && (
              <Chapter title="بازگشت سرمایه در برابر پروژه‌های مشابه"><PeerReturn l={l} peers={peers} /></Chapter>
            )}
            {similarAll.length > 0 && (
              <Chapter title="در کنار موارد مشابه">
                <div className="-mt-2 mb-4 flex items-center justify-between gap-4">
                  <p className="text-[13.5px] font-semibold text-muted-foreground">{sameCount >= similarAll.length ? `${faNumber(similarAll.length)} پروژه نزدیک به این پروژه${group ? ` در گروه «${group.name}»` : ""}، با مبلغ ورود نزدیک.` : sameCount > 0 ? `${faNumber(sameCount)} پروژه هم‌گروه و ${faNumber(similarAll.length - sameCount)} پروژه نزدیک از گروه‌های دیگر.` : "پروژه هم‌گروهی نبود، نزدیک‌ترین پروژه‌ها از گروه‌های دیگر آمده‌اند."}</p>
                  <Link href="/opportunities" onClick={() => { useStore.getState().begin({ route: l.routes[0] as never, ...(l.group ? { groups: [l.group] } : {}) }); useStore.getState().setStarted(true); }}
                    className="group inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-[13px] font-extrabold text-ink hover:border-ink/30">مشاهده همه {faNumber(sameGroup)} پروژه<ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" /></Link>
                </div>
                <div className="grid grid-cols-3 gap-4">{similarAll.map((x, i) => <ListingCard key={x.id} listing={x} index={i} comparable />)}</div>
              </Chapter>
            )}
            {hasFlow && !o && <Chapter title="مسیر پول"><div className="surface rounded-[1.75rem] px-6 py-2"><MoneyFlow o={text} /></div></Chapter>}

            {o && (
              <Chapter title="ریسک و نکته‌های مهم">
                <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4">
                  <div className="surface flex flex-col items-center rounded-[1.75rem] p-6 text-center">
                    <h3 className="self-stretch text-right text-sm font-extrabold text-ink">سطح ریسک</h3>
                    <div className="mt-5 w-full"><RiskGauge risk={o.risk} /></div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="surface flex items-center gap-4 rounded-[1.75rem] p-5">
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink/[0.06] text-primary"><ShieldSearch size={22} variant="Bulk" /></span>
                      <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-muted-foreground">وضعیت حقوقی</span><span className="mt-0.5 block text-base font-extrabold text-ink">{legalLabel[o.legalStatus] ?? o.legalStatus}</span></span>
                    </div>
                    {o.caution && <div className="flex flex-1 items-start gap-4 rounded-[1.75rem] bg-white p-5 ring-1 ring-border">
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-warn/10 text-warn"><Warning2 size={22} variant="Bulk" /></span>
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

            {o && advisory && <Chapter title="پرسش‌هایی که باید پاسخشان را آماده کنید"><AdvisoryBlock a={advisory} /></Chapter>}

            {!o && text.caution && (
              <div className="flex items-start gap-4 rounded-[1.75rem] bg-white p-6 ring-1 ring-border">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-warn/10 text-warn"><Warning2 size={22} variant="Bulk" /></span>
                <span><span className="block text-sm font-extrabold text-ink">پیش از تصمیم بدانید</span><span className="mt-1 block text-[15px] font-semibold leading-8 text-ink/85">{text.caution}</span></span>
              </div>
            )}

            <Chapter title="پرونده کامل"><Dossier sections={sections} /></Chapter>

            {nextSteps && nextSteps.length > 0 && (
              <Chapter title="گام‌های ورود و مدارک لازم">
                <Steps steps={nextSteps} />
                <div className="mt-5 flex items-center justify-between gap-4 rounded-[1.75rem] bg-ink/[0.05] p-5 pr-7">
                  <p className="text-[15px] font-extrabold text-ink">{o?.expert ? `برای شروع، با ${o.expert.name} تماس بگیرید.` : "این گام‌ها را در راهنمای اقدام تیک بزنید و همراه خود داشته باشید."}</p>
                  {o?.expert
                    ? <Button asChild className="h-12 gap-2 rounded-full px-6 font-extrabold"><a href={`tel:${o.expert.mobile}`}><Call size={18} variant="Bold" />تماس با کارشناس</a></Button>
                    : <Button asChild className="h-12 gap-2 rounded-full px-6 font-extrabold"><Link href={`/guide/${l.id}`}><DocumentDownload size={18} variant="Bold" />دیدن راهنمای اقدام</Link></Button>}
                </div>
              </Chapter>
            )}

            {fund && (
              <>
                <Chapter title="تضمین بانکی">
                  <div className="grid grid-cols-3 gap-3">
                    {([["تضمین بانکی", fund.bank.exists], ["تضمین اصل سرمایه", fund.bank.principal], ["تضمین سود", fund.bank.profit]] as const).map(([t, v]) => (
                      <div key={t} className="surface flex items-center justify-between rounded-[1.5rem] p-5"><span className="text-sm font-bold text-ink">{t}</span>
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold", v ? "bg-primary text-white" : v === false ? "bg-muted text-ink/70" : "bg-muted text-ink/70")}>{v ? <><TickCircle size={14} variant="Bold" />دارد</> : v === false ? "ندارد" : "نامعلوم"}</span></div>
                    ))}
                  </div>
                  {!fund.bank.verified && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><InfoCircle size={16} variant="Bulk" />مستندات تضمین احراز نشده است.</p>}
                </Chapter>
                <Chapter title="دریافت سود و خروج">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="surface rounded-[1.75rem] p-6"><h3 className="text-sm font-extrabold text-primary">پرداخت سود</h3><p className="mt-2 text-xl font-black text-ink">{payoutLabel[fund.payout] ?? fund.payout}</p><p className="mt-1 text-sm text-muted-foreground">مدت: {fund.durationMonths != null ? `${faNumber(fund.durationMonths)} ماه` : NA}</p>
                      <div className="mt-5"><RiskMeter risk={fund.risk} /></div></div>
                    <div className="rounded-[1.75rem] bg-white p-6 ring-1 ring-border"><span className="grid size-11 place-items-center rounded-2xl bg-warn/10 text-warn"><Warning2 size={22} variant="Bulk" /></span><h3 className="mt-3 text-sm font-extrabold text-ink">شرایط خروج</h3><p className="mt-2 text-[15px] font-semibold leading-8 text-ink/85">{fund.exit || NA}</p></div>
                  </div>
                </Chapter>
              </>
            )}
          </div>

          <aside className="sticky top-24 space-y-4 self-start">
            <Contact l={l} />
            {o && <CompareCard l={l} near={near} />}
            {l.city && (
              <div className="surface overflow-hidden rounded-[1.75rem]">
                <div className="flex items-center gap-3 p-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink/[0.06] text-primary"><Location size={22} variant="Bulk" /></span>
                  <p className="min-w-0 flex-1 text-base font-extrabold leading-6 text-ink">{l.city}<span className="block text-xs font-semibold text-muted-foreground">استان {l.province}{sale?.neighborhood ? `، ${sale.neighborhood}` : ""}</span></p>
                </div>
                <LocationMap city={l.city} province={l.province!} className="h-40 border-t border-border" />
                <Link href="/opportunities" onClick={() => { useStore.getState().begin({ route: l.routes[0] as never, provinces: [l.province!] }); useStore.getState().setStarted(true); }}
                  className="flex items-center justify-between border-t border-border px-5 py-3 text-[13px] font-bold text-primary hover:bg-ink/[0.03]">پروژه‌های دیگر در {l.province}<ArrowLeft size={16} /></Link>
              </div>
            )}
          </aside>
        </div>

        <CompareTray />
      </main>
      <Footer />
    </>
  );
}
