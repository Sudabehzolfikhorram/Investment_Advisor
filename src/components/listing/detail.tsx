"use client";
// صفحه جزئیات: روایت پروژه به‌جای متن پشت‌سرهم — عدد، خط زمان، مسیر پول، گام‌ها، نقشه و کارشناس.
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowRight, Call, Copy, DocumentDownload, Location, Warning2, ShieldSearch, WalletMoney, MoneyRecive, Key,
  Timer1, Lock1, Chart, Calendar, Building, TickCircle, InfoCircle, type Icon,
} from "@/components/iconsax";
import { Header, Footer } from "@/components/site/header";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { IranMap } from "@/components/brand/iran-map";
import { Reveal } from "@/components/brand/reveal";
import { SignaturePhoto } from "./signature-photo";
import { ListingCard, SaveButton } from "./listing-card";
import { listingById, listings, payoutLabel } from "@/lib/listings";
import { projectGroups } from "@/data/taxonomy";
import { routes } from "@/data/routes";
import type { Fund, Listing, Opportunity, SaleItem } from "@/types";
import { cn, faNumber, formatMobile, incomeLabel, legalLabel, riskLabel } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

function Chapter({ n, title, children, className }: { n: number; title: string; children: React.ReactNode; className?: string }) {
  return (
    <Reveal className={cn("relative", className)}>
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-ink text-sm font-black text-white">{faNumber(n)}</span>
        <h2 className="text-xl font-black text-ink sm:text-2xl">{title}</h2>
        <span className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
      </div>
      {children}
    </Reveal>
  );
}

function Tile({ I, label, value, sub, accent }: { I: Icon; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-[1.5rem] p-4 sm:p-5", accent ? "bg-deep text-white" : "glass")}>
      <span className={cn("grid size-10 place-items-center rounded-xl", accent ? "bg-white/10 text-sand" : "bg-primary/10 text-primary")}><I size={20} variant="Bulk" /></span>
      <span>
        <span className={cn("block text-xs font-semibold", accent ? "text-white/65" : "text-muted-foreground")}>{label}</span>
        <span className="mt-1 block text-xl font-black leading-8 sm:text-2xl">{value}</span>
        {sub && <span className={cn("block text-[11px] font-semibold", accent ? "text-white/60" : "text-muted-foreground")}>{sub}</span>}
      </span>
    </div>
  );
}

function RiskMeter({ risk }: { risk: string }) {
  const level = { low: 1, medium: 2, high: 3 }[risk] ?? 0;
  return (
    <div>
      <div className="flex gap-1.5">{[1, 2, 3].map((i) => <motion.span key={i} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }} className={cn("h-2.5 flex-1 origin-right rounded-full", i <= level ? (level === 1 ? "bg-primary" : level === 2 ? "bg-sand" : "bg-destructive") : "bg-muted")} />)}</div>
      <div className="mt-2 flex justify-between text-[11px] font-semibold text-muted-foreground"><span>کم</span><span>متوسط</span><span>زیاد</span></div>
    </div>
  );
}

/** خط زمان پول: از ورود سرمایه تا بازگشت */
function Timeline({ o }: { o: Opportunity }) {
  const marks = [
    o.firstIncomeMonths != null && { at: o.firstIncomeMonths / 12, label: "اولین دریافت", value: `ماه ${faNumber(o.firstIncomeMonths)}`, tone: "bg-primary" },
    o.lockupMonths != null && { at: o.lockupMonths / 12, label: "پایان قفل سرمایه", value: `ماه ${faNumber(o.lockupMonths)}`, tone: "bg-ink" },
    o.paybackYears != null && { at: o.paybackYears, label: "بازگشت سرمایه", value: `سال ${faNumber(o.paybackYears)}`, tone: "bg-sand" },
    o.paybackDownsideYears != null && { at: o.paybackDownsideYears, label: "بازگشت در حالت بدبینانه", value: `سال ${faNumber(o.paybackDownsideYears)}`, tone: "bg-destructive" },
    o.executionMonths != null && { at: o.executionMonths / 12, label: "پایان اجرا", value: `ماه ${faNumber(o.executionMonths)}`, tone: "bg-primary" },
  ].filter(Boolean) as { at: number; label: string; value: string; tone: string }[];
  if (!marks.length) return null;
  const max = Math.max(o.durationYears ?? 0, ...marks.map((m) => m.at)) + 1;
  const years = Array.from({ length: Math.ceil(max) + 1 }, (_, i) => i);
  const sorted = [...marks].sort((a, b) => a.at - b.at);
  return (
    <div className="glass rounded-[2rem] p-5 sm:p-7">
      <div className="relative mx-2 mt-24 mb-10 sm:mx-4">
        <div className="h-2 rounded-full bg-muted" />
        {o.paybackYears != null && <motion.div initial={{ width: 0 }} whileInView={{ width: `${(o.paybackYears / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.4, ease }} className="absolute right-0 top-0 h-2 rounded-full bg-gradient-to-l from-primary to-sand" />}
        {o.executionMonths != null && o.paybackYears == null && <motion.div initial={{ width: 0 }} whileInView={{ width: `${(o.executionMonths / 12 / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.4, ease }} className="absolute right-0 top-0 h-2 rounded-full bg-primary" />}
        {years.map((y) => <span key={y} className="absolute top-4 -translate-x-1/2 text-[10px] font-semibold text-muted-foreground" style={{ right: `${(y / max) * 100}%`, transform: "translateX(50%)" }}>{y === 0 ? "ورود" : faNumber(y)}</span>)}
        {sorted.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.2 }} className="absolute top-1 flex translate-x-1/2 flex-col items-center" style={{ right: `${(m.at / max) * 100}%`, bottom: 0 }}>
            <span className={cn("absolute bottom-0 flex flex-col items-center", i % 2 ? "pb-12" : "pb-3")}>
              <span className="whitespace-nowrap rounded-xl bg-white px-2.5 py-1 text-center shadow-md ring-1 ring-black/5"><span className="block text-[10px] font-semibold text-muted-foreground">{m.label}</span><span className="block text-xs font-black text-ink">{m.value}</span></span>
              <span className="h-full min-h-2 w-px flex-1 bg-ink/20" />
            </span>
            <span className={cn("absolute -top-2 size-4 rounded-full ring-4 ring-white", m.tone)} />
          </motion.div>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">محور به سال است{o.durationYears != null && ` · مدت کل طرح ${faNumber(o.durationYears)} سال`}</p>
    </div>
  );
}

/** مسیر پول: تأمین مالی ← بازگشت ← مالکیت */
function MoneyFlow({ o }: { o: Opportunity }) {
  const nodes = [
    { I: WalletMoney, t: "پول از کجا می‌آید", d: o.finance },
    { I: MoneyRecive, t: "چطور برمی‌گردد", d: o.repay },
    { I: Key, t: "مالکیت و سهم", d: o.ownership ?? "" },
  ].filter((n) => n.d);
  return (
    <div className="relative grid gap-4 md:grid-cols-3">
      {nodes.map((n, i) => (
        <motion.div key={n.t} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.18, duration: 0.6, ease }} className="relative">
          {i < nodes.length - 1 && <svg aria-hidden className="absolute -left-4 top-10 z-10 hidden h-4 w-4 text-primary md:block" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" fill="currentColor" /><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeOpacity=".3" /></svg>}
          <div className="h-full rounded-[1.75rem] bg-white p-6 ring-1 ring-black/[0.04]">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary text-white shadow-[0_12px_26px_-12px_var(--primary)]"><n.I size={24} variant="Bulk" /></span>
            <h3 className="mt-4 text-sm font-extrabold text-primary">{n.t}</h3>
            <p className="mt-2 text-[15px] font-semibold leading-8 text-ink">{n.d}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Steps({ steps, title }: { steps: string[]; title?: string }) {
  return (
    <ol className="relative space-y-3 pr-5">
      <motion.span aria-hidden initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease }} className="absolute bottom-6 right-[1.05rem] top-6 w-px origin-top bg-primary/40" />
      {title && <li className="sr-only">{title}</li>}
      {steps.map((s, i) => (
        <motion.li key={s} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative flex items-center gap-4">
          <span className="relative z-10 -mr-5 grid size-9 shrink-0 place-items-center rounded-full border border-primary/30 bg-background text-sm font-black text-primary">{faNumber(i + 1)}</span>
          <span className="glass flex-1 rounded-2xl px-5 py-3.5 text-[15px] font-bold leading-7 text-ink">{s}</span>
        </motion.li>
      ))}
    </ol>
  );
}

function Contact({ l }: { l: Listing }) {
  const o = l.kind === "project" ? (l.raw as Opportunity) : null;
  const expert = o?.expert ?? null;
  const guide = o?.guideFileUrl ?? (!expert ? "/guides/sample-guide.pdf" : null);
  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] bg-deep p-6 text-white">
      <AlgoPattern className="-left-8 -top-8 h-56 w-72 text-white/[0.13]" fade="radial" scale={0.55} />
      {expert ? (
        <>
          <p className="relative text-xs font-bold text-sand">کارشناس این پروژه</p>
          <div className="relative mt-4 flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-2xl bg-white/10 text-xl font-black text-sand">{expert.name.trim()[0]}</span>
            <span><span className="block text-lg font-extrabold">{expert.name}</span><span className="block text-xs text-white/60">پاسخ‌گوی پرسش‌های شما درباره همین پروژه</span></span>
          </div>
          <a href={`tel:${expert.mobile}`} className="relative mt-5 flex h-14 items-center justify-between rounded-full bg-white pl-2 pr-5 text-ink transition-colors hover:bg-sand">
            <span dir="ltr" className="text-lg font-black tracking-wide">{formatMobile(expert.mobile)}</span>
            <span className="grid size-10 place-items-center rounded-full bg-primary text-white"><Call size={18} variant="Bold" /></span>
          </a>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(expert.mobile); toast("شماره کپی شد."); }} className="relative mt-2 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white/70 hover:text-white"><Copy size={14} />کپی شماره</button>
        </>
      ) : (
        <>
          <p className="relative text-xs font-bold text-sand">فایل راهنمای پروژه</p>
          <p className="relative mt-3 text-[15px] font-semibold leading-7 text-white/85">برای این پروژه به‌جای کارشناس، فایل راهنما آماده شده است.</p>
          <a href={guide!} download className="relative mt-5 flex h-14 items-center justify-between rounded-full bg-white pl-2 pr-5 font-extrabold text-ink transition-colors hover:bg-sand">
            دانلود فایل راهنما<span className="grid size-10 place-items-center rounded-full bg-primary text-white"><DocumentDownload size={18} variant="Bold" /></span>
          </a>
        </>
      )}
      <SaveButton id={l.id} label className="relative mt-3 w-full" />
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
  const similar = listings.filter((x) => x.id !== l.id && x.kind === l.kind && (l.kind !== "project" || x.group === l.group)).slice(0, 3);
  let n = 0;

  const tiles: { I: Icon; label: string; value: string; sub?: string }[] = o
    ? [
        { I: WalletMoney, label: l.amountLabel, value: l.amount != null ? faNumber(l.amount) : "اعلام نشده", sub: l.amount != null ? "میلیارد تومان" : undefined },
        o.paybackYears != null ? { I: Timer1, label: "دوره بازگشت", value: `${faNumber(o.paybackYears)} سال`, sub: o.paybackDownsideYears != null ? `بدبینانه ${faNumber(o.paybackDownsideYears)} سال` : undefined } : { I: Calendar, label: "مدت اجرا", value: o.executionMonths != null ? `${faNumber(o.executionMonths)} ماه` : "نامعلوم" },
        o.lockupMonths != null ? { I: Lock1, label: "قفل سرمایه", value: `${faNumber(o.lockupMonths)} ماه` } : o.metric ? { I: Building, label: o.metric.label, value: faNumber(o.metric.value), sub: o.metric.unit } : { I: Lock1, label: "قفل سرمایه", value: "نامعلوم" },
        { I: Chart, label: "نوع درآمد", value: incomeLabel[o.income] ?? o.income },
      ]
    : l.stats.map((s, i) => ({ I: [WalletMoney, Chart, ShieldSearch, Calendar][i], label: s.label, value: s.value }));

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-3 pt-6 sm:px-6">
        <Link href="/opportunities" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-primary"><ArrowRight size={18} />بازگشت به پروژه‌ها</Link>

        {/* پرده اول: تصویر و عنوان */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease }}>
          <SignaturePhoto src={l.image} alt={l.title} priority sizes="100vw" className="h-[26rem] rounded-[2rem] sm:h-[32rem] sm:rounded-[2.75rem]">
            <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/30 to-transparent" />
            <div className="absolute right-5 top-5 z-10"><SaveButton id={l.id} className="size-12" /></div>
            <div className="absolute inset-x-5 bottom-6 text-white sm:inset-x-10 sm:bottom-10">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-2">
                {l.tags.map((t) => <span key={t} className="glass-dark rounded-full px-3.5 py-1.5 text-xs font-bold">{t}</span>)}
                {o && <span className="rounded-full bg-sand px-3.5 py-1.5 text-xs font-extrabold text-ink">{o.stage}</span>}
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8, ease }} className="mt-4 max-w-4xl text-3xl font-black leading-[1.35] text-balance sm:text-5xl sm:leading-[1.3]">{l.title}</motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold text-white/80">
                {l.city && <span className="flex items-center gap-1.5"><Location size={17} variant="Bold" />{l.province}، {l.city}{sale?.neighborhood ? `، ${sale.neighborhood}` : ""}</span>}
                {o && <span>مدل همکاری: {o.model}</span>}
                <span dir="ltr" className="text-white/50">{l.id}</span>
              </motion.p>
            </div>
          </SignaturePhoto>
        </motion.div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0 space-y-14">
            {/* پرده دوم: عددها */}
            <Reveal className="grid grid-cols-2 gap-3 md:grid-cols-4">{tiles.map((t, i) => <Tile key={t.label} {...t} accent={i === 0} />)}</Reveal>

            {o && subtype && subtype.includes.length > 0 && (
              <Reveal><p className="border-r-2 border-sand pr-5 text-lg font-semibold leading-10 text-ink/85 sm:text-xl sm:leading-[2.6rem]">
                این پروژه در گروه <b className="text-primary">{group!.name}</b> و از نوع <b className="text-primary">{subtype.name}</b> است؛ با مدل «{o.model}» در {o.city} و در مرحله «{o.stage}».
              </p></Reveal>
            )}

            {o && (o.paybackYears != null || o.executionMonths != null || o.lockupMonths != null) && (
              <Chapter n={++n} title="پول شما در طول زمان"><Timeline o={o} /></Chapter>
            )}

            {o && (o.finance || o.repay || o.ownership) && <Chapter n={++n} title="مسیر پول"><MoneyFlow o={o} /></Chapter>}

            {o && (
              <Chapter n={++n} title="ریسک و نکته‌های مهم">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="glass rounded-[1.75rem] p-6">
                    <div className="flex items-center justify-between"><h3 className="text-sm font-extrabold text-ink">سطح ریسک</h3><span className="text-lg font-black text-ink">{riskLabel[o.risk] ?? o.risk}</span></div>
                    <div className="mt-4"><RiskMeter risk={o.risk} /></div>
                    <p className="mt-5 flex items-center gap-2 border-t border-dashed border-border pt-4 text-sm font-bold text-ink/80"><ShieldSearch size={18} variant="Bulk" className="text-primary" />وضعیت حقوقی: {legalLabel[o.legalStatus] ?? o.legalStatus}</p>
                  </div>
                  <div className="relative overflow-hidden rounded-[1.75rem] bg-sand/20 p-6 ring-1 ring-sand/40">
                    <span className="grid size-11 place-items-center rounded-2xl bg-sand text-ink"><Warning2 size={22} variant="Bulk" /></span>
                    <h3 className="mt-3 text-sm font-extrabold text-ink">پیش از تصمیم بدانید</h3>
                    <p className="mt-2 text-[15px] font-semibold leading-8 text-ink/85">{o.caution}</p>
                  </div>
                </div>
                {o.checks && o.checks.length > 0 && (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {o.checks.map((c, i) => <motion.li key={c} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex items-start gap-2.5 rounded-2xl bg-white px-4 py-3 text-sm font-semibold leading-7 text-ink/85 ring-1 ring-black/[0.04]"><InfoCircle size={18} variant="Bulk" className="mt-1 shrink-0 text-primary" />{c}</motion.li>)}
                  </ul>
                )}
              </Chapter>
            )}

            {o && o.steps.length > 0 && <Chapter n={++n} title="گام‌های بعدی"><Steps steps={o.steps} /></Chapter>}

            {fund && (
              <>
                <Chapter n={++n} title="تضمین بانکی">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {([["تضمین بانکی", fund.bank.exists], ["تضمین اصل سرمایه", fund.bank.principal], ["تضمین سود", fund.bank.profit]] as const).map(([t, v]) => (
                      <div key={t} className="glass flex items-center justify-between rounded-[1.5rem] p-5"><span className="text-sm font-bold text-ink">{t}</span>
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold", v ? "bg-primary text-white" : v === false ? "bg-muted text-ink/70" : "bg-sand/30 text-ink")}>{v ? <><TickCircle size={14} variant="Bold" />دارد</> : v === false ? "ندارد" : "نامعلوم"}</span></div>
                    ))}
                  </div>
                  {!fund.bank.verified && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><InfoCircle size={16} variant="Bulk" />مستندات تضمین احراز نشده است.</p>}
                </Chapter>
                <Chapter n={++n} title="دریافت سود و خروج">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="glass rounded-[1.75rem] p-6"><h3 className="text-sm font-extrabold text-primary">پرداخت سود</h3><p className="mt-2 text-2xl font-black text-ink">{payoutLabel[fund.payout] ?? fund.payout}</p>{fund.durationMonths != null && <p className="mt-1 text-sm text-muted-foreground">مدت: {faNumber(fund.durationMonths)} ماه</p>}
                      <div className="mt-5"><RiskMeter risk={fund.risk} /></div></div>
                    <div className="rounded-[1.75rem] bg-sand/20 p-6 ring-1 ring-sand/40"><span className="grid size-11 place-items-center rounded-2xl bg-sand text-ink"><Warning2 size={22} variant="Bulk" /></span><h3 className="mt-3 text-sm font-extrabold text-ink">شرایط خروج</h3><p className="mt-2 text-[15px] font-semibold leading-8 text-ink/85">{fund.exit}</p></div>
                  </div>
                </Chapter>
              </>
            )}

            {l.city && (
              <Chapter n={++n} title="محل پروژه">
                <div className="relative isolate grid items-center gap-6 overflow-hidden rounded-[2rem] bg-white p-6 ring-1 ring-black/[0.04] md:grid-cols-[1fr_1.2fr]">
                  <div>
                    <span className="inline-flex items-center gap-2 text-xs font-extrabold text-primary"><NodeMark />موقعیت</span>
                    <p className="mt-3 text-3xl font-black text-ink">{l.city}</p>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">استان {l.province}{sale?.neighborhood ? ` · ${sale.neighborhood}` : ""}</p>
                    <Link href="/opportunities" className="mt-5 inline-flex text-sm font-bold text-primary hover:underline">پروژه‌های دیگر این استان</Link>
                  </div>
                  <IranMap points={[{ city: l.city, province: l.province!, count: 1 }]} active={[l.province!]} labels={false} className="mx-auto max-w-md" />
                </div>
              </Chapter>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Contact l={l} />
            <ul className="glass mt-4 space-y-3 rounded-[2rem] p-6 text-sm">
              {l.stats.map((s) => <li key={s.label} className="flex items-center justify-between gap-3"><span className="text-muted-foreground">{s.label}</span><span className="font-extrabold text-ink">{s.value}</span></li>)}
              <li className="flex items-center justify-between gap-3 border-t border-dashed border-border pt-3"><span className="text-muted-foreground">مسیر</span><span className="text-left font-extrabold text-ink">{l.routes.map((r) => routes.find((x) => x.id === r)?.name).join("، ")}</span></li>
            </ul>
            <p className="mt-3 px-2 text-xs leading-6 text-muted-foreground">اطلاعات این صفحه نمونه و فرضی است و تعهد پرداخت یا تضمین سود نیست.</p>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-24">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-black text-ink"><NodeMark className="text-primary" />پروژه‌های مشابه</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{similar.map((s, i) => <ListingCard key={s.id} listing={s} index={i} />)}</div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
