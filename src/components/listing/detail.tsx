"use client";
// صفحه جزئیات: روایت پروژه به‌جای متن پشت‌سرهم. همه فیلدهای داده نمایش داده می‌شوند؛
// هر جا داده‌ای نیست «ثبت نشده» می‌آید تا ساختار صفحه برای همه پروژه‌ها یکسان بماند.
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowRight, Call, Copy, CopySuccess, DocumentDownload, Location, Warning2, ShieldSearch, WalletMoney, MoneyRecive, Key,
  Timer1, Lock1, Chart, Calendar, Building, TickCircle, InfoCircle, Danger, type Icon,
} from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Header, Footer } from "@/components/site/header";
import { NodeMark } from "@/components/brand/algo-pattern";
import { IranMap } from "@/components/brand/iran-map";
import { Reveal } from "@/components/brand/reveal";
import { SignaturePhoto } from "./signature-photo";
import { ListingCard, SaveButton } from "./listing-card";
import { listingById, listings, payoutLabel } from "@/lib/listings";
import { ownerLabel, phaseLabel, revenueLabel } from "@/lib/criteria";
import { projectGroups } from "@/data/taxonomy";
import { advisories } from "@/data/advisories";
import { usages } from "@/data/provinces";
import { withBase } from "@/lib/image-loader";
import { routes, routeSubcategories } from "@/data/routes";
import { useStore } from "@/lib/store";
import type { Advisory, Fund, Listing, Opportunity, SaleItem } from "@/types";
import { cn, faDigits, faNumber, formatMobile, incomeLabel, legalLabel, riskLabel } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const NA = "ثبت نشده";
type Val = string | null | undefined;
const num = (v: number | null | undefined, unit: string): Val => (v != null ? `${faNumber(v)} ${unit}` : null);

function Chapter({ n, title, note, children }: { n: number; title: string; note?: string; children: React.ReactNode }) {
  return (
    <Reveal className="relative">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-ink text-sm font-black text-white">{faNumber(n)}</span>
        <h2 className="text-2xl font-black text-ink">{title}</h2>
        <span className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
        {note && <span className="text-xs font-semibold text-muted-foreground">{note}</span>}
      </div>
      {children}
    </Reveal>
  );
}

const Empty = ({ text = "برای این پروژه داده‌ای ثبت نشده است." }: { text?: string }) => (
  <p className="rounded-2xl border border-dashed border-border px-5 py-4 text-sm font-semibold text-muted-foreground">{text}</p>
);

function Tile({ I, label, value, sub }: { I: Icon; label: string; value: string; sub?: string }) {
  return (
    <Card className="surface gap-3 rounded-[1.5rem] p-5 shadow-none">
      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><I size={20} variant="Bulk" /></span>
      <span>
        <span className="block text-xs font-semibold text-muted-foreground">{label}</span>
        <span className="mt-1 block text-2xl font-black leading-8 text-ink">{value}</span>
        {sub && <span className="block text-[11px] font-semibold text-muted-foreground">{sub}</span>}
      </span>
    </Card>
  );
}

/** شناسنامه: همه فیلدها در یک جدول خوانا */
function Facts({ items }: { items: [string, Val][] }) {
  return (
    <dl className="surface grid grid-cols-3 overflow-hidden rounded-[1.75rem]">
      {items.map(([k, v], i) => (
        <div key={k} className={cn("border-border px-5 py-4", i % 3 !== 2 && "border-l", i < items.length - (items.length % 3 || 3) && "border-b")}>
          <dt className="text-xs font-semibold text-muted-foreground">{k}</dt>
          <dd className={cn("mt-1 text-[15px] font-extrabold leading-7", v ? "text-ink" : "font-semibold text-ink/35")}>{v || NA}</dd>
        </div>
      ))}
    </dl>
  );
}

function RiskMeter({ risk }: { risk: string }) {
  const level = { low: 1, medium: 2, high: 3 }[risk] ?? 0;
  return (
    <div>
      <div className="flex gap-1.5">{[1, 2, 3].map((i) => <span key={i} className={cn("h-2.5 flex-1 rounded-full", i <= level ? (level === 1 ? "bg-primary" : level === 2 ? "bg-sand" : "bg-destructive") : "bg-muted")} />)}</div>
      <div className="mt-2 flex justify-between text-[11px] font-semibold text-muted-foreground"><span>کم</span><span>متوسط</span><span>زیاد</span></div>
    </div>
  );
}

/** زمان‌بندی پول: ایستگاه‌های ثابت به ترتیب زمان. نوار و دستگیره ندارد تا قابل تغییر به نظر نرسد. */
function Milestones({ o }: { o: Opportunity }) {
  const all = [
    { at: 0, label: "ورود سرمایه", value: "شروع" as Val },
    { at: o.firstIncomeMonths ?? null, label: "اولین دریافت", value: o.firstIncomeMonths != null ? `ماه ${faNumber(o.firstIncomeMonths)}` : null },
    { at: o.executionMonths ?? null, label: "پایان اجرا", value: o.executionMonths != null ? `ماه ${faNumber(o.executionMonths)}` : null },
    { at: o.lockupMonths ?? null, label: "پایان قفل سرمایه", value: o.lockupMonths != null ? `ماه ${faNumber(o.lockupMonths)}` : null },
    { at: o.paybackYears != null ? o.paybackYears * 12 : null, label: "بازگشت سرمایه", value: o.paybackYears != null ? `سال ${faNumber(o.paybackYears)}` : null },
    { at: o.paybackDownsideYears != null ? o.paybackDownsideYears * 12 : null, label: "بازگشت در حالت بدبینانه", value: o.paybackDownsideYears != null ? `سال ${faNumber(o.paybackDownsideYears)}` : null },
    { at: o.durationYears != null ? o.durationYears * 12 : null, label: "پایان طرح", value: o.durationYears != null ? `سال ${faNumber(o.durationYears)}` : null },
  ];
  const known = all.filter((m) => m.at != null).sort((a, b) => a.at! - b.at!);
  const unknown = all.filter((m) => m.at == null);
  return (
    <div className="surface rounded-[1.75rem] p-6">
      <ol className="grid" style={{ gridTemplateColumns: `repeat(${known.length}, minmax(0, 1fr))` }}>
        {known.map((m, i) => (
          <li key={m.label} className="relative px-1 text-center">
            {i > 0 && <span aria-hidden className="absolute left-1/2 top-[7px] w-full border-t-2 border-dotted border-ink/20" />}
            <span className={cn("relative z-10 mx-auto block size-4 rounded-full ring-4 ring-white", i === 0 ? "bg-ink" : m.label.includes("بدبینانه") ? "bg-sand" : "bg-primary")} />
            <span className="mt-3 block text-lg font-black text-ink">{m.value}</span>
            <span className="mt-0.5 block text-xs font-semibold leading-5 text-muted-foreground">{m.label}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-dashed border-border pt-4 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5"><InfoCircle size={15} variant="Bulk" className="text-primary" />برآورد ثابت پروژه است و قابل تغییر نیست.</span>
        {unknown.map((m) => <span key={m.label}>{m.label}: <span className="text-ink/40">{NA}</span></span>)}
      </div>
    </div>
  );
}

/** مسیر پول: تأمین مالی ← بازگشت ← مالکیت */
function MoneyFlow({ o }: { o: Opportunity }) {
  const nodes = [
    { I: WalletMoney, t: "پول از کجا می‌آید", d: o.finance },
    { I: MoneyRecive, t: "چطور برمی‌گردد", d: o.repay },
    { I: Key, t: "مالکیت و سهم", d: o.ownership },
  ];
  return (
    <div className="grid grid-cols-3 gap-4">
      {nodes.map((n, i) => (
        <div key={n.t} className="surface relative h-full rounded-[1.75rem] p-6">
          {i < nodes.length - 1 && <NodeMark className="absolute -left-9 top-9 z-10 text-primary/50" />}
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><n.I size={24} variant="Bulk" /></span>
          <h3 className="mt-4 text-sm font-extrabold text-primary">{n.t}</h3>
          <p className={cn("mt-2 text-[15px] font-semibold leading-8", n.d ? "text-ink" : "text-ink/35")}>{n.d || NA}</p>
        </div>
      ))}
    </div>
  );
}

function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="relative space-y-3 pr-5">
      <span aria-hidden className="absolute bottom-6 right-[1.05rem] top-6 w-px bg-primary/30" />
      {steps.map((s, i) => (
        <li key={s} className="relative flex items-center gap-4">
          <span className="relative z-10 -mr-5 grid size-9 shrink-0 place-items-center rounded-full border border-primary/30 bg-white text-sm font-black text-primary">{faNumber(i + 1)}</span>
          <span className="surface flex-1 rounded-2xl px-5 py-3.5 text-[15px] font-bold leading-7 text-ink">{s}</span>
        </li>
      ))}
    </ol>
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
                      {a.example[q.id] === op.value && <Badge className="text-[11px]">پاسخ نمونه</Badge>}
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

function Contact({ l }: { l: Listing }) {
  const o = l.kind === "project" ? (l.raw as Opportunity) : null;
  const expert = o?.expert ?? null;
  const guide = o?.guideFileUrl ?? (!expert ? "/guides/sample-guide.pdf" : null);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(expert!.mobile); setCopied(true); toast("شماره کپی شد."); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="surface rounded-[1.75rem] p-5">
      {expert ? (
        <>
          <p className="flex items-center gap-2 text-xs font-extrabold text-primary"><NodeMark />کارشناس این پروژه</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-xl font-black text-primary">{expert.name.trim()[0]}</span>
            <span><span className="block text-lg font-extrabold text-ink">{expert.name}</span><span className="block text-xs text-muted-foreground">پاسخ‌گوی پرسش‌های شما درباره همین پروژه</span></span>
          </div>
          {/* فیلد شماره: آیکون کپی داخل خود فیلد */}
          <div className="mt-5 flex h-14 items-center gap-1 rounded-2xl border border-border bg-muted/60 p-1.5">
            <Button asChild variant="plain" size="auto" className="size-11 shrink-0 rounded-xl bg-primary text-white hover:bg-deep"><a href={`tel:${expert.mobile}`} aria-label="تماس با کارشناس"><Call size={19} variant="Bold" /></a></Button>
            <span dir="ltr" className="flex-1 select-all text-center text-lg font-black tracking-wide text-ink">{formatMobile(expert.mobile)}</span>
            <Button variant="plain" size="auto" type="button" onClick={copy} aria-label="کپی شماره" title="کپی شماره" className={cn("size-11 shrink-0 rounded-xl hover:bg-white", copied ? "text-primary" : "text-ink/60 hover:text-primary")}>{copied ? <CopySuccess size={20} variant="Bold" /> : <Copy size={20} />}</Button>
          </div>
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 text-xs font-extrabold text-primary"><NodeMark />فایل راهنمای پروژه</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><DocumentDownload size={26} variant="Bulk" /></span>
            <span><span className="block text-base font-extrabold text-ink">راهنمای ورود به این پروژه</span><span className="block text-xs leading-5 text-muted-foreground">این پروژه کارشناس اختصاصی ندارد؛ مراحل و مدارک در فایل آمده است.</span></span>
          </div>
          <Button asChild className="mt-5 h-14 w-full gap-2 rounded-2xl text-base font-extrabold"><a href={withBase(guide!)} download><DocumentDownload size={20} variant="Bold" />دانلود فایل راهنما<span className="text-xs font-semibold opacity-75">PDF</span></a></Button>
        </>
      )}
      <SaveButton id={l.id} label className="mt-2 w-full !rounded-2xl" />
    </div>
  );
}

export function Detail({ id }: { id: string }) {
  const l = listingById(id)!;
  const o = l.kind === "project" ? (l.raw as Opportunity) : null;
  const fund = l.kind === "fund" ? (l.raw as Fund) : null;
  const sale = l.kind === "sale" ? (l.raw as SaleItem) : null;
  const group = projectGroups.find((g) => g.id === l.group);
  const subtype = group?.subtypes.find((s) => s.id === l.subtype);
  const advisory = o ? advisories[o.subtype] : undefined;
  const similar = listings.filter((x) => x.id !== l.id && x.kind === l.kind && (l.kind !== "project" || x.group === l.group)).slice(0, 3);
  const routeNames = l.routes.map((r) => routes.find((x) => x.id === r)?.name).filter(Boolean).join("، ");
  let n = 0;

  const tiles: { I: Icon; label: string; value: string; sub?: string }[] = o
    ? [
        { I: WalletMoney, label: l.amountLabel, value: l.amount != null ? faNumber(l.amount) : NA, sub: l.amount != null ? "میلیارد تومان" : undefined },
        { I: Timer1, label: "دوره بازگشت", value: o.paybackYears != null ? `${faNumber(o.paybackYears)} سال` : NA, sub: o.paybackDownsideYears != null ? `بدبینانه ${faNumber(o.paybackDownsideYears)} سال` : undefined },
        o.metric ? { I: Building, label: o.metric.label, value: faNumber(o.metric.value), sub: o.metric.unit } : { I: Lock1, label: "قفل سرمایه", value: o.lockupMonths != null ? `${faNumber(o.lockupMonths)} ماه` : NA },
        { I: Chart, label: "نوع درآمد", value: incomeLabel[o.income] ?? o.income },
      ]
    : l.stats.map((s, i) => ({ I: [WalletMoney, Chart, ShieldSearch, Calendar][i], label: s.label, value: s.value }));

  const facts: [string, Val][] = o
    ? [
        ["شناسه", o.id], ["گروه پروژه", group?.name], ["نوع پروژه", subtype?.name],
        ["نمونه‌های این نوع", subtype?.examples], ["استان", o.province], ["شهر", o.city],
        ["دسته‌بندی اصلی", routeNames], ["وضعیت", o.stage], ["مرحله پروژه", phaseLabel[o.phase] ?? o.phase],
        ["مدل همکاری", o.model], ["صاحب پروژه", o.owner ? ownerLabel[o.owner] ?? o.owner : null], ["منابع درآمد", o.revenues?.length ? o.revenues.map((r) => revenueLabel[r] ?? r).join("، ") : null],
        ["حداقل سرمایه ورود", num(o.minCapital, "میلیارد تومان")], ["نیاز مالی طرح", num(o.budget, "میلیارد تومان")], ["مدت اجرا", num(o.executionMonths, "ماه")],
        ["دوره بازگشت", num(o.paybackYears, "سال")], ["بازگشت بدبینانه", num(o.paybackDownsideYears, "سال")], ["قفل سرمایه", num(o.lockupMonths, "ماه")],
        ["اولین دریافت", num(o.firstIncomeMonths, "ماه")], ["نوع درآمد", incomeLabel[o.income] ?? o.income], ["مدت کل طرح", num(o.durationYears, "سال")],
        ["سطح ریسک", riskLabel[o.risk] ?? o.risk], ["وضعیت حقوقی", legalLabel[o.legalStatus] ?? o.legalStatus], [o.metric?.label ?? "ظرفیت طرح", o.metric ? `${faNumber(o.metric.value)} ${o.metric.unit}` : null],
        ["تاریخ ثبت", faDigits(o.publishedAt.replaceAll("-", "/"))], ["کارشناس", o.expert?.name], ["فایل راهنما", o.guideFileUrl ? "دارد" : null],
      ]
    : fund
      ? [
          ["شناسه", fund.id], ["نوع", fund.kind === "fund" ? "صندوق" : "طرح جمعی"], ["دسته", routeSubcategories.fund?.find((x) => x.id === fund.type)?.name ?? fund.type],
          ["حداقل ورود", num(fund.minimumMillion, "میلیون تومان")], ["بازده پیش‌بینی", fund.forecast != null ? `${faNumber(fund.forecast)}٪ سالانه` : null], ["پرداخت سود", payoutLabel[fund.payout] ?? fund.payout],
          ["سطح ریسک", riskLabel[fund.risk] ?? fund.risk], ["مدت", num(fund.durationMonths, "ماه")], ["حوزه دارایی", fund.assetSector],
          ["تضمین بانکی", fund.bank.exists == null ? null : fund.bank.exists ? "دارد" : "ندارد"], ["تضمین اصل سرمایه", fund.bank.principal == null ? null : fund.bank.principal ? "دارد" : "ندارد"], ["تضمین سود", fund.bank.profit == null ? null : fund.bank.profit ? "دارد" : "ندارد"],
        ]
      : sale
        ? [
            ["شناسه", sale.id], ["دسته", routeSubcategories.buyer?.find((x) => x.id === sale.category)?.name ?? sale.category], ["نوع", routeSubcategories.buyer?.flatMap((x) => x.children ?? []).find((c) => c.id === (sale.buildingType ?? sale.scrapType))?.name],
            ["کاربری", usages.find((u) => u.value === sale.usage)?.label], ["قیمت", num(sale.price, sale.category === "scrap" ? "میلیون تومان" : "میلیارد تومان")], ["مساحت", num(sale.area, "مترمربع")],
            ["مساحت عرصه", num(sale.landArea, "مترمربع")], ["مقدار", sale.quantity], ["موضوع", sale.subject],
            ["استان", sale.province], ["شهر", sale.city], ["محله یا محدوده", sale.neighborhood],
          ]
        : [];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-6">
        <Link href="/opportunities" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-primary"><ArrowRight size={18} />بازگشت به پروژه‌ها</Link>

        {/* پرده اول: تصویر و عنوان */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <SignaturePhoto src={l.image} alt={l.title} priority sizes="100vw" className="h-[27rem] rounded-[2.25rem]">
            <div className="absolute right-5 top-5 z-10"><SaveButton id={l.id} className="size-12" /></div>
            <div className="absolute inset-x-10 bottom-9 text-white">
              <div className="flex flex-wrap gap-2">
                {l.tags.map((t) => <Badge key={t} variant="outline" className="border-white/30 bg-black/25 px-3.5 py-1.5 font-bold text-white">{t}</Badge>)}
                {o && <Badge className="bg-white px-3.5 py-1.5 font-extrabold text-ink">{o.stage}</Badge>}
              </div>
              <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.3] text-balance">{l.title}</h1>
              <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold text-white/85">
                {l.city && <span className="flex items-center gap-1.5"><Location size={17} variant="Bold" />{l.province}، {l.city}{sale?.neighborhood ? `، ${sale.neighborhood}` : ""}</span>}
                {o && <span>مدل همکاری: {o.model}</span>}
                <span dir="ltr" className="text-white/60">{l.id}</span>
              </p>
            </div>
          </SignaturePhoto>
        </motion.div>

        <div className="mt-6 grid grid-cols-[1fr_22rem] gap-8">
          <div className="min-w-0 space-y-14">
            <div className="grid grid-cols-4 gap-3">{tiles.map((t) => <Tile key={t.label} {...t} />)}</div>

            {o && group && subtype && (
              <p className="border-r-2 border-primary pr-5 text-xl font-semibold leading-[2.6rem] text-ink/85">
                این پروژه در گروه <b className="text-primary">{group.name}</b> و از نوع <b className="text-primary">{subtype.name}</b> است؛ با مدل «{o.model}» در {o.city} و در وضعیت «{o.stage}».
              </p>
            )}

            <Chapter n={++n} title="شناسنامه" note="همه داده‌های ثبت‌شده"><Facts items={facts} /></Chapter>

            {o && <Chapter n={++n} title="پول شما در طول زمان"><Milestones o={o} /></Chapter>}
            {o && <Chapter n={++n} title="مسیر پول"><MoneyFlow o={o} /></Chapter>}

            {o && (
              <Chapter n={++n} title="ریسک و نکته‌های مهم">
                <div className="grid grid-cols-2 gap-4">
                  <div className="surface rounded-[1.75rem] p-6">
                    <div className="flex items-center justify-between"><h3 className="text-sm font-extrabold text-ink">سطح ریسک</h3><span className="text-lg font-black text-ink">{riskLabel[o.risk] ?? o.risk}</span></div>
                    <div className="mt-4"><RiskMeter risk={o.risk} /></div>
                    <p className="mt-5 flex items-center gap-2 border-t border-dashed border-border pt-4 text-sm font-bold text-ink/80"><ShieldSearch size={18} variant="Bulk" className="text-primary" />وضعیت حقوقی: {legalLabel[o.legalStatus] ?? o.legalStatus}</p>
                  </div>
                  <div className="rounded-[1.75rem] bg-sand/15 p-6 ring-1 ring-sand/40">
                    <span className="grid size-11 place-items-center rounded-2xl bg-sand/70 text-ink"><Warning2 size={22} variant="Bulk" /></span>
                    <h3 className="mt-3 text-sm font-extrabold text-ink">پیش از تصمیم بدانید</h3>
                    <p className={cn("mt-2 text-[15px] font-semibold leading-8", o.caution ? "text-ink/85" : "text-ink/35")}>{o.caution || NA}</p>
                  </div>
                </div>
                <h3 className="mb-2 mt-6 text-sm font-extrabold text-ink">مواردی که باید بررسی شود</h3>
                {o.checks?.length
                  ? <ul className="grid grid-cols-2 gap-2">{o.checks.map((c) => <li key={c} className="surface flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold leading-7 text-ink/85"><InfoCircle size={18} variant="Bulk" className="mt-1 shrink-0 text-primary" />{c}</li>)}</ul>
                  : <Empty />}
              </Chapter>
            )}

            {o && (
              <Chapter n={++n} title="پرسش‌های تخصصی این نوع پروژه" note={subtype?.name}>
                {advisory ? <AdvisoryBlock a={advisory} /> : <Empty text="برای این نوع پروژه پرسش تخصصی ثبت نشده است." />}
              </Chapter>
            )}

            {o && <Chapter n={++n} title="گام‌های بعدی">{o.steps.length ? <Steps steps={o.steps} /> : <Empty />}</Chapter>}

            {fund && (
              <>
                <Chapter n={++n} title="تضمین بانکی">
                  <div className="grid grid-cols-3 gap-3">
                    {([["تضمین بانکی", fund.bank.exists], ["تضمین اصل سرمایه", fund.bank.principal], ["تضمین سود", fund.bank.profit]] as const).map(([t, v]) => (
                      <div key={t} className="surface flex items-center justify-between rounded-[1.5rem] p-5"><span className="text-sm font-bold text-ink">{t}</span>
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold", v ? "bg-primary text-white" : v === false ? "bg-muted text-ink/70" : "bg-sand/30 text-ink")}>{v ? <><TickCircle size={14} variant="Bold" />دارد</> : v === false ? "ندارد" : "نامعلوم"}</span></div>
                    ))}
                  </div>
                  {!fund.bank.verified && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><InfoCircle size={16} variant="Bulk" />مستندات تضمین احراز نشده است.</p>}
                </Chapter>
                <Chapter n={++n} title="دریافت سود و خروج">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="surface rounded-[1.75rem] p-6"><h3 className="text-sm font-extrabold text-primary">پرداخت سود</h3><p className="mt-2 text-2xl font-black text-ink">{payoutLabel[fund.payout] ?? fund.payout}</p><p className="mt-1 text-sm text-muted-foreground">مدت: {fund.durationMonths != null ? `${faNumber(fund.durationMonths)} ماه` : NA}</p>
                      <div className="mt-5"><RiskMeter risk={fund.risk} /></div></div>
                    <div className="rounded-[1.75rem] bg-sand/15 p-6 ring-1 ring-sand/40"><span className="grid size-11 place-items-center rounded-2xl bg-sand/70 text-ink"><Warning2 size={22} variant="Bulk" /></span><h3 className="mt-3 text-sm font-extrabold text-ink">شرایط خروج</h3><p className="mt-2 text-[15px] font-semibold leading-8 text-ink/85">{fund.exit || NA}</p></div>
                  </div>
                </Chapter>
              </>
            )}
          </div>

          <aside className="sticky top-24 space-y-4 self-start">
            <Contact l={l} />
            {l.city && (
              <div className="surface flex items-center gap-4 rounded-[1.75rem] p-4">
                <IranMap points={[{ city: l.city, province: l.province!, count: 1 }]} labels={false} links={false} pulse={false} className="w-24 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">محل پروژه</p>
                  <p className="text-base font-extrabold text-ink">{l.city}</p>
                  <p className="text-xs text-muted-foreground">استان {l.province}{sale?.neighborhood ? ` · ${sale.neighborhood}` : ""}</p>
                  <Link href="/opportunities" onClick={() => { useStore.getState().begin({ route: l.routes[0] as never, provinces: [l.province!] }); useStore.getState().setStarted(true); }} className="mt-1 inline-flex text-xs font-bold text-primary hover:underline">پروژه‌های دیگر این استان</Link>
                </div>
              </div>
            )}
            <p className="px-2 text-xs leading-6 text-muted-foreground">اطلاعات این صفحه نمونه و فرضی است و تعهد پرداخت یا تضمین سود نیست.</p>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-24">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-black text-ink"><NodeMark className="text-primary" />پروژه‌های مشابه</h2>
            <div className="grid grid-cols-3 gap-5">{similar.map((s, i) => <ListingCard key={s.id} listing={s} index={i} />)}</div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
