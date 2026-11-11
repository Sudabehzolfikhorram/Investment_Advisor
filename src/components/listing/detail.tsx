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
        <span className="grid size-9 place-items-center rounded-full bg-coral text-sm font-black text-white">{faNumber(n)}</span>
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
                <div key={k} className={cn("py-2.5", v.length <= 22 && "flex items-baseline justify-between gap-3")}>
                  <dt className="shrink-0 text-xs font-semibold text-muted-foreground">{k}</dt>
                  <dd className={cn("text-sm font-extrabold leading-6", v === NA ? "font-semibold text-ink/35" : "text-ink", v.length <= 22 ? "text-left" : "mt-0.5")}>{v}</dd>
                </div>
              ))}
            </dl>
            {splitPending(g.items).pending.length > 0 && <p className="mt-2 border-t border-dashed border-border pt-2.5 text-xs leading-6 text-muted-foreground"><b className="font-extrabold text-ink/70">ثبت نشده: </b>{splitPending(g.items).pending.join("، ")}</p>}
          </div>
        ); })}
    </div>
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
            {i > 0 && <span aria-hidden className="absolute left-1/2 top-[7px] w-full border-t-2 border-dotted border-ink/20" />}
            <span className={cn("relative z-10 mx-auto block size-4 rounded-full ring-4 ring-white", i === 0 ? "bg-coral" : m.label.includes("بدبینانه") ? "bg-sand" : "bg-primary")} />
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
    <div id="next-step" className="relative isolate overflow-hidden rounded-[2rem] bg-coral-soft p-6 text-ink">
      <AlgoPattern className="-left-8 -top-8 -z-10 h-56 w-72 text-coral/25" fade="radial" />
      {expert ? (
        <>
          <p className="flex items-center gap-2 text-xs font-bold text-coral-deep"><NodeMark />گام بعدی: با کارشناس پروژه صحبت کنید</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-2xl bg-white text-lg text-coral-deep font-black">{expert.name.trim()[0]}</span>
            <span><span className="block text-base font-extrabold">{expert.name}</span><span className="block text-xs text-ink/60">کارشناس همین پروژه</span></span>
          </div>
          <div className="mt-5 flex h-14 items-center gap-1 rounded-full bg-white p-1.5 text-ink">
            <Button asChild variant="plain" size="auto" className="size-11 shrink-0 rounded-full bg-primary text-white hover:bg-deep"><a href={`tel:${expert.mobile}`} aria-label="تماس با کارشناس"><Call size={19} variant="Bold" /></a></Button>
            <span dir="ltr" className="flex-1 select-all text-center text-base font-black tracking-wide">{formatMobile(expert.mobile)}</span>
            <Button variant="plain" size="auto" type="button" onClick={copy} aria-label="کپی شماره" title="کپی شماره" className={cn("size-11 shrink-0 rounded-full hover:bg-muted", copied ? "text-primary" : "text-ink/55 hover:text-primary")}>{copied ? <CopySuccess size={20} variant="Bold" /> : <Copy size={20} />}</Button>
          </div>
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 text-xs font-bold text-coral-deep"><NodeMark />گام بعدی: راهنمای اقدام را بگیرید</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-coral-deep"><DocumentDownload size={26} variant="Bulk" /></span>
            <span><span className="block text-base font-extrabold">راهنمای اقدام</span><span className="block text-xs leading-5 text-ink/60">مراحل، مدارک و نکته‌های این پروژه در یک فایل</span></span>
          </div>
          <Button asChild variant="plain" size="auto" className="mt-5 h-14 w-full justify-between rounded-full bg-white pl-1.5 pr-6 text-base font-extrabold text-ink hover:bg-white/90">
            <Link href={`/guide/${l.id}`}>دیدن راهنما<span className="grid size-11 place-items-center rounded-full bg-primary text-white"><ArrowLeft size={18} /></span></Link>
          </Button>
        </>
      )}
      <SaveButton id={l.id} label className="mt-2 w-full border-coral/25 !bg-white/70 !text-ink hover:!bg-white" />
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
                {l.tags.map((t) => <Badge key={t} variant="outline" className="border-white/30 bg-black/25 px-3.5 py-1.5 font-bold text-white">{t}</Badge>)}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="surface rounded-[1.75rem] p-6">
                    <div className="flex items-center justify-between"><h3 className="text-sm font-extrabold text-ink">سطح ریسک</h3><span className="text-base font-black text-ink">{riskLabel[o.risk] ?? o.risk}</span></div>
                    <div className="mt-4"><RiskMeter risk={o.risk} /></div>
                    <p className="mt-5 flex items-center gap-2 border-t border-dashed border-border pt-4 text-sm font-bold text-ink/80"><ShieldSearch size={18} variant="Bulk" className="text-primary" />وضعیت حقوقی: {legalLabel[o.legalStatus] ?? o.legalStatus}</p>
                  </div>
                  {o.caution && <div className="rounded-[1.75rem] bg-sand/15 p-6 ring-1 ring-sand/40">
                    <span className="grid size-11 place-items-center rounded-2xl bg-sand/70 text-ink"><Warning2 size={22} variant="Bulk" /></span>
                    <h3 className="mt-3 text-sm font-extrabold text-ink">پیش از تصمیم بدانید</h3>
                    <p className="mt-2 text-[15px] font-semibold leading-8 text-ink/85">{o.caution}</p>
                  </div>}
                </div>
                {!!o.checks?.length && <>
                  <h3 className="mb-2 mt-6 text-sm font-extrabold text-ink">این موارد را بررسی کنید</h3>
                  <ul className="grid grid-cols-2 gap-2">{o.checks.map((c) => <li key={c} className="surface flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold leading-7 text-ink/85"><InfoCircle size={18} variant="Bulk" className="mt-1 shrink-0 text-primary" />{c}</li>)}</ul>
                </>}
              </Chapter>
            )}

            {o && advisory && <Chapter n={++n} title="پرسش‌هایی که باید پاسخشان را آماده کنید" note={subtype?.name}><AdvisoryBlock a={advisory} /></Chapter>}

            {!o && text.caution && (
              <div className="flex items-start gap-4 rounded-[1.75rem] bg-sand/15 p-6 ring-1 ring-sand/40">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sand/70 text-ink"><Warning2 size={22} variant="Bulk" /></span>
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
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold", v ? "bg-primary text-white" : v === false ? "bg-muted text-ink/70" : "bg-sand/30 text-ink")}>{v ? <><TickCircle size={14} variant="Bold" />دارد</> : v === false ? "ندارد" : "نامعلوم"}</span></div>
                    ))}
                  </div>
                  {!fund.bank.verified && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><InfoCircle size={16} variant="Bulk" />مستندات تضمین احراز نشده است.</p>}
                </Chapter>
                <Chapter n={++n} title="دریافت سود و خروج">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="surface rounded-[1.75rem] p-6"><h3 className="text-sm font-extrabold text-primary">پرداخت سود</h3><p className="mt-2 text-xl font-black text-ink">{payoutLabel[fund.payout] ?? fund.payout}</p><p className="mt-1 text-sm text-muted-foreground">مدت: {fund.durationMonths != null ? `${faNumber(fund.durationMonths)} ماه` : NA}</p>
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
