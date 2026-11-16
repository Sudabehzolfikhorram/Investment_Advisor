"use client";
// نمودارهای صفحه جزئیات کانسپت‌ها. همه با HTML و درصد ساخته شده‌اند تا راست‌به‌چپ طبیعی باشند.
// رنگ از متغیرهای ظرف می‌آید (‎--cv-*‎) تا هر کانسپت جهان رنگی خودش را داشته باشد:
// --cv-accent داده (کبالت)، --cv-soft پس‌زمینه داده، --cv-ink متن، --cv-grid خط راهنما، --cv-surface سطح، --cv-warn فقط هشدار.
// قواعد: خط‌های راهنما یک‌پیکسلی و پیوسته، نشانه‌ها حداقل ۸ پیکسل با حلقه ۲ پیکسلی هم‌رنگ سطح، متن هرگز به رنگ داده نیست.
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Ladder, PeerSet, Sheet, TimeLane } from "@/lib/sheet";
import { cn, faNumber } from "@/lib/utils";

const monthText = (m: number) => (m < 12 ? `ماه ${faNumber(m)}` : m % 12 === 0 ? `سال ${faNumber(m / 12)}` : `سال ${faNumber(Math.floor(m / 12))} و ${faNumber(m % 12)} ماه`);
const ease = [0.16, 1, 0.3, 1] as const;

/* ——— ۱. زمان‌بندی پول: اجرا، قفل، اولین درآمد، بازگشت پایه تا بدبینانه، مدت قرارداد ——— */
export function TimeBands({ s, className, dark }: { s: Sheet; className?: string; dark?: boolean }) {
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const T = s.horizon;
  const pos = (m: number) => `${(m / T) * 100}%`;
  const step = Math.max(1, Math.ceil(T / 12 / 7)) * 12;
  const ticks = Array.from({ length: Math.floor(T / step) + 1 }, (_, k) => k * step);
  const onMove = (e: React.PointerEvent) => {
    const r = track.current?.getBoundingClientRect(); if (!r) return;
    const m = Math.round(((r.right - e.clientX) / r.width) * T);
    setHover(m < 0 || m > T ? null : m);
  };
  const state = (ln: TimeLane, m: number) => {
    if (ln.point) return m >= ln.from ? "رسیده" : `${faNumber(ln.from - m)} ماه مانده`;
    if (ln.tone === "pay") return m >= (ln.to ?? ln.from) ? "در هر دو حالت برگشته" : m >= ln.from ? "در حالت پایه برگشته" : "هنوز برنگشته";
    return m <= (ln.to ?? 0) ? "در جریان" : "تمام شده";
  };
  if (!s.lanes.length) return <p className={cn("rounded-2xl px-5 py-6 text-[13.5px] font-semibold leading-7", dark ? "bg-white/5 text-white/70" : "bg-[var(--cv-soft)] text-[var(--cv-ink)]/70", className)}>هیچ‌کدام از زمان‌های این پروژه اعلام نشده است؛ نمودار زمانی ساخته نمی‌شود.</p>;
  return (
    <div className={cn("relative", className)}>
      <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-5">
        {s.lanes.map((ln, i) => (
          <div key={ln.id} className="contents">
            <div className="flex h-12 items-center text-[13px] font-extrabold text-[var(--cv-ink)]">{ln.label}</div>
            <div ref={i === 0 ? track : undefined} onPointerMove={onMove} onPointerLeave={() => setHover(null)} className="relative h-12 border-b border-[var(--cv-grid)]">
              {ln.point ? (
                <motion.span initial={reduce ? false : { scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.12, type: "spring", stiffness: 260, damping: 18 }}
                  className="absolute top-1/2 size-4 -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--cv-accent)] ring-2 ring-[var(--cv-surface)]" style={{ right: pos(ln.from) }} />
              ) : ln.tone === "pay" ? (
                <>
                  {ln.to != null && <motion.span initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.6 + i * 0.12, ease }} style={{ right: pos(ln.from), width: `calc(${pos(ln.to - ln.from)})`, transformOrigin: "right" }}
                    className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-[var(--cv-accent)]/30" />}
                  <motion.span initial={reduce ? false : { scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.12, type: "spring", stiffness: 260, damping: 18 }}
                    className="absolute top-1/2 size-4 -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--cv-accent)] ring-2 ring-[var(--cv-surface)]" style={{ right: pos(ln.from) }} />
                  {ln.to != null && <span className="absolute top-1/2 size-3 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-[var(--cv-accent)] bg-[var(--cv-surface)]" style={{ right: pos(ln.to) }} />}
                </>
              ) : (
                <motion.span initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.15 + i * 0.12, ease }}
                  style={{ right: 0, width: pos(ln.to ?? 0), transformOrigin: "right" }}
                  className={cn("absolute top-1/2 h-5 -translate-y-1/2 rounded-l-[6px]", ln.tone === "exec" ? "bg-[var(--cv-accent)]" : ln.tone === "lock" ? "bg-[var(--cv-ink)]/[0.16]" : "bg-[var(--cv-accent)]/[0.14]")} />
              )}
              {/* برچسب مستقیم: فقط عدد پایان هر نوار یا نقطه */}
              <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[11.5px] font-bold text-[var(--cv-ink)]/70"
                style={ln.point || ln.tone === "pay" ? { right: `calc(${pos(ln.to ?? ln.from)} + 14px)` } : { right: `calc(${pos(ln.to ?? 0)} + 8px)` }}>
                {ln.tone === "pay" && ln.to != null ? `${monthText(ln.from)} تا ${monthText(ln.to)}` : monthText(ln.point || ln.tone === "pay" ? ln.from : ln.to ?? 0)}
              </span>
              {hover != null && <span className="pointer-events-none absolute inset-y-0 w-px bg-[var(--cv-ink)]/30" style={{ right: pos(hover) }} />}
            </div>
          </div>
        ))}
        <div />
        <div className="relative mt-2 h-5">
          {ticks.map((m) => <span key={m} className="absolute translate-x-1/2 whitespace-nowrap text-[11px] font-bold tabular-nums text-[var(--cv-ink)]/55" style={{ right: pos(m) }}>{m === 0 ? "امروز" : `سال ${faNumber(m / 12)}`}</span>)}
        </div>
      </div>
      {hover != null && (
        <div className="pointer-events-none absolute -top-2 z-10 w-60 rounded-2xl border border-[var(--cv-grid)] bg-[var(--cv-surface)] p-3 text-[12px] shadow-[0_18px_40px_-20px_rgb(16_24_40/0.45)]" style={{ left: 0 }}>
          <p className="mb-1.5 font-extrabold text-[var(--cv-ink)]">{hover === 0 ? "امروز" : monthText(hover)}</p>
          <ul className="space-y-1">{s.lanes.map((ln) => <li key={ln.id} className="flex justify-between gap-3 font-bold text-[var(--cv-ink)]/75"><span>{ln.label}</span><span className="text-[var(--cv-ink)]">{state(ln, hover)}</span></li>)}</ul>
        </div>
      )}
      {s.missingTime.length > 0 && <p className="mt-4 text-[12.5px] font-semibold leading-6 text-[var(--cv-ink)]/60">اعلام نشده و روی نمودار نیامده: {s.missingTime.join("، ")}. عدد نامعلوم صفر فرض نمی‌شود.</p>}
    </div>
  );
}

/* ——— ۲. جایگاه در میان پروژه‌های هم‌گروه: نوار نقطه‌ای با مقیاس لگاریتمی ——— */
export function PeerStrip({ p, className }: { p: PeerSet; className?: string }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const vals = p.values.map((x) => x.v).filter((v) => v > 0);
  const lo = Math.min(...vals, p.me), hi = Math.max(...vals, p.me);
  const log = hi / Math.max(lo, 1e-6) > 30;
  const f = (v: number) => (log ? Math.log10(Math.max(v, lo)) : v);
  const a = f(lo), b = f(hi);
  const x = (v: number) => (b === a ? 50 : ((f(v) - a) / (b - a)) * 100);
  const ticks = useMemo(() => {
    if (!log) return [lo, (lo + hi) / 2, hi].map((v) => Math.round(v * 10) / 10);
    const out: number[] = []; for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) { const v = 10 ** e; if (v >= lo * 0.8 && v <= hi * 1.25) out.push(v); }
    return out.length >= 2 ? out : [lo, hi];
  }, [lo, hi, log]);
  const h = p.values.find((v) => v.id === hover);
  const share = Math.round((p.below / Math.max(1, p.values.length)) * 100);
  return (
    <div className={className}>
      <div className="relative h-16">
        <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--cv-grid)]" />
        {p.values.map((v, i) => (
          <motion.button type="button" key={v.id} onPointerEnter={() => setHover(v.id)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(v.id)} onBlur={() => setHover(null)} aria-label={`${v.title}: ${faNumber(v.v)} ${p.unit}`}
            initial={reduce ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + (i % 30) * 0.015, duration: 0.5, ease }}
            className="absolute top-1/2 grid size-5 -translate-y-1/2 translate-x-1/2 place-items-center" style={{ right: `${x(v.v)}%`, marginTop: ((i * 37) % 3 - 1) * 9 }}>
            <span className="size-2.5 rounded-full bg-[var(--cv-ink)]/30 ring-2 ring-[var(--cv-surface)] transition-transform hover:scale-150" />
          </motion.button>
        ))}
        <motion.span initial={reduce ? false : { scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.9, type: "spring", stiffness: 240, damping: 16 }}
          className="absolute top-1/2 size-[18px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--cv-accent)] ring-[3px] ring-[var(--cv-surface)]" style={{ right: `${x(p.me)}%` }} />
        <span className="absolute -top-1 translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--cv-ink)] px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--cv-surface)]" style={{ right: `${Math.min(92, Math.max(8, x(p.me)))}%` }}>این پروژه: {faNumber(Math.round(p.me * 10) / 10)}</span>
        {h && <span className="pointer-events-none absolute bottom-0 z-10 max-w-[16rem] translate-x-1/2 truncate rounded-xl border border-[var(--cv-grid)] bg-[var(--cv-surface)] px-3 py-1 text-[11.5px] font-bold text-[var(--cv-ink)] shadow-[0_12px_28px_-16px_rgb(16_24_40/0.45)]" style={{ right: `${Math.min(85, Math.max(15, x(h.v)))}%` }}>{h.title}: {faNumber(h.v)}</span>}
      </div>
      <div className="relative h-5">
        {ticks.map((t, ti) => <span key={`${t}-${ti}`} className="absolute translate-x-1/2 text-[11px] font-bold tabular-nums text-[var(--cv-ink)]/55" style={{ right: `${x(t)}%` }}>{faNumber(t)}</span>)}
      </div>
      <p className="mt-2 text-[12.5px] font-semibold leading-6 text-[var(--cv-ink)]/65">
        {p.label} این پروژه از {faNumber(share)}٪ پروژه‌های {p.scope} بیشتر است ({faNumber(p.values.length)} پروژه، واحد {p.unit}{log ? "، مقیاس لگاریتمی" : ""}).
      </p>
    </div>
  );
}

/* ——— ۳. نردبان وضعیت: ریسک، حقوقی، مرحله، صاحب پروژه ——— */
export function Ladders({ items, className }: { items: Ladder[]; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <ul className={cn("space-y-4", className)}>
      {items.map((ld, r) => (
        <li key={ld.id}>
          <div className="mb-1.5 flex items-baseline justify-between text-[12.5px] font-bold"><span className="text-[var(--cv-ink)]/65">{ld.label}</span><span className="font-extrabold text-[var(--cv-ink)]">{ld.at != null ? ld.steps[ld.at] : ld.note ?? "اعلام نشده"}</span></div>
          <div className="flex gap-[3px]">
            {ld.steps.map((st, i) => {
              const on = ld.at != null && i <= ld.at; const top = ld.at === i;
              return (
                <motion.span key={st} title={st} initial={reduce ? false : { opacity: 0.25 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 * i + r * 0.1 }}
                  className={cn("h-2.5 flex-1 first:rounded-r-full last:rounded-l-full", !on ? "bg-[var(--cv-ink)]/[0.09]" : ld.warn && top ? "bg-[var(--cv-warn)]" : top ? "bg-[var(--cv-accent)]" : "bg-[var(--cv-accent)]/35")} />
              );
            })}
          </div>
          {ld.at == null && <p className="mt-1 text-[11.5px] font-semibold text-[var(--cv-ink)]/55">{ld.note ? `${ld.note}؛ صفر یا کم فرض نمی‌شود.` : "اعلام نشده"}</p>}
        </li>
      ))}
    </ul>
  );
}

/* ——— ۴. الگوی دریافت: شکل جریان درآمد، نه مبلغ ——— */
export function IncomeShape({ s, className }: { s: Sheet; className?: string }) {
  const reduce = useReducedMotion();
  const n = 24;
  const first = s.income.first ?? 0;
  const end = s.income.term ?? n;
  const cols = Array.from({ length: n }, (_, i) => {
    const m = Math.round(((i + 1) / n) * Math.max(end, first + 1, 12));
    if (s.income.id === "periodic") return m >= first ? 0.55 : 0;
    if (s.income.id === "end") return i === n - 1 ? 1 : 0;
    if (s.fund) { const every = Number(s.fund.payout); return every ? (i % Math.max(1, Math.round((every / 12) * n * 0.5)) === 0 ? 0.5 : 0) : s.fund.payout === "maturity" ? (i === n - 1 ? 1 : 0) : 0.12 + i * 0.03; }
    return 0;
  });
  return (
    <div className={className}>
      {s.income.id === "any" ? (
        <p className="rounded-2xl bg-[var(--cv-soft)] px-4 py-5 text-[13px] font-semibold leading-7 text-[var(--cv-ink)]/70">نوع درآمد «بدون محدودیت» اعلام شده؛ زمان و شکل دریافت در قرارداد تعیین می‌شود.</p>
      ) : (
        <div className="flex h-24 items-end gap-[3px] border-b border-[var(--cv-grid)] [direction:rtl]">
          {cols.map((v, i) => (
            <motion.span key={i} initial={reduce ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.03, duration: 0.5, ease }} style={{ height: `${Math.max(v * 100, v ? 8 : 3)}%`, transformOrigin: "bottom" }}
              className={cn("flex-1 rounded-t-[4px]", v ? "bg-[var(--cv-accent)]" : "bg-[var(--cv-ink)]/[0.08]")} />
          ))}
        </div>
      )}
      <p className="mt-2 text-[12px] font-semibold leading-6 text-[var(--cv-ink)]/60">{s.income.label}{s.income.first != null && s.income.id === "periodic" ? `، از ${monthText(s.income.first)}` : ""}. این شکل الگوی دریافت است، نه مبلغ آن.</p>
    </div>
  );
}

/* ——— ۵. کدام داده اعلام شده؟ ——— */
export function KnownGrid({ s, className }: { s: Sheet; className?: string }) {
  const ok = s.known.filter((k) => k.ok).length;
  return (
    <div className={className}>
      <div className="mb-3 flex h-2 gap-[2px] overflow-hidden rounded-full">
        {s.known.map((k, i) => <span key={i} className={cn("flex-1", k.ok ? "bg-[var(--cv-accent)]" : "bg-[var(--cv-ink)]/[0.1]")} />)}
      </div>
      <p className="mb-3 text-[13px] font-extrabold text-[var(--cv-ink)]">{faNumber(ok)} از {faNumber(s.known.length)} داده کلیدی اعلام شده</p>
      <ul className="flex flex-wrap gap-1.5">
        {s.known.map((k) => <li key={k.label} className={cn("rounded-full px-2.5 py-1 text-[11.5px] font-bold", k.ok ? "bg-[var(--cv-soft)] text-[var(--cv-ink)]" : "border border-dashed border-[var(--cv-ink)]/25 text-[var(--cv-ink)]/55")}>{k.label}{!k.ok && " · اعلام نشده"}</li>)}
      </ul>
    </div>
  );
}

/* ——— ۶. صندوق: تقویم پرداخت سود ۱۲ ماه نخست و جدول تضمین ——— */
export function PayoutCalendar({ s, className }: { s: Sheet; className?: string }) {
  const reduce = useReducedMotion();
  if (!s.fund) return null;
  const months = new Set(s.fund.payoutMonths);
  const span = Math.max(12, ...s.fund.payoutMonths);
  return (
    <div className={className}>
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${span}, minmax(0,1fr))` } as CSSProperties}>
        {Array.from({ length: span }, (_, i) => i + 1).map((m) => (
          <motion.div key={m} initial={reduce ? false : { opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: m * 0.03 }} className="text-center">
            <span className={cn("block h-10 rounded-[6px]", months.has(m) ? "bg-[var(--cv-accent)]" : "bg-[var(--cv-ink)]/[0.07]")} />
            {(m === 1 || m % 3 === 0) && <span className="mt-1 block text-[10.5px] font-bold tabular-nums text-[var(--cv-ink)]/55">{faNumber(m)}</span>}
          </motion.div>
        ))}
      </div>
      <p className="mt-2 text-[12px] font-semibold leading-6 text-[var(--cv-ink)]/60">ماه‌های پس از ورود. پرداخت سود: {s.fund.payoutLabel}{!months.size ? "؛ سود دوره‌ای پرداخت نمی‌شود" : ""}.</p>
    </div>
  );
}

export function Guarantees({ s, className }: { s: Sheet; className?: string }) {
  if (!s.fund) return null;
  const t = { yes: "دارد", no: "ندارد", unknown: "اعلام نشده" } as const;
  return (
    <ul className={cn("divide-y divide-[var(--cv-grid)]", className)}>
      {s.fund.guarantees.map((g) => (
        <li key={g.label} className="flex items-center justify-between py-2.5 text-[13px] font-bold text-[var(--cv-ink)]/75">
          <span>{g.label}</span>
          <span className={cn("inline-flex items-center gap-2 font-extrabold", g.state === "unknown" ? "text-[var(--cv-ink)]/55" : "text-[var(--cv-ink)]")}>
            <span className={cn("size-2.5 rounded-full", g.state === "yes" ? "bg-[var(--cv-accent)]" : g.state === "no" ? "bg-[var(--cv-ink)]/30" : "border border-dashed border-[var(--cv-ink)]/40")} />{t[g.state]}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ——— چیدن نمودارها: فقط نمودارهایی که برای این مورد داده دارند، بدون خانه خالی ——— */
export type ChartItem = { id: string; size: "wide" | "mid" | "small"; title: string; note?: string; node: React.ReactNode };
export function chartList(s: Sheet, t: { time: string; timeNote: string; ladder: string }, extra: ChartItem[] = []): ChartItem[] {
  const c: ChartItem[] = [];
  if (s.lanes.length) c.push({ id: "time", size: "wide", title: t.time, note: t.timeNote, node: <TimeBands s={s} /> });
  if (s.ladders.length) c.push({ id: "ladder", size: "small", title: t.ladder, node: <Ladders items={s.ladders} /> });
  if (s.fund) c.push({ id: "payout", size: "small", title: "تقویم پرداخت سود", node: <PayoutCalendar s={s} /> }, { id: "guarantee", size: "small", title: "تضمین‌ها", node: <Guarantees s={s} /> });
  if (s.kind !== "sale") c.push({ id: "income", size: "small", title: "الگوی دریافت", node: <IncomeShape s={s} /> });
  c.push({ id: "known", size: "small", title: "داده‌های اعلام‌شده", node: <KnownGrid s={s} /> });
  c.push(...extra);
  if (s.moneyPeers) c.push({ id: "money", size: "mid", title: `${s.moneyPeers.label} در کنار پروژه‌های مشابه`, node: <PeerStrip p={s.moneyPeers} /> });
  if (s.metricPeers) c.push({ id: "metric", size: "mid", title: `${s.metricPeers.label} در کنار پروژه‌های مشابه`, node: <PeerStrip p={s.metricPeers} /> });
  if (s.fund?.forecastPeers) c.push({ id: "forecast", size: "mid", title: "بازده پیش‌بینی در کنار صندوق‌های دیگر", node: <PeerStrip p={s.fund.forecastPeers} /> });
  if (s.sale?.ppmPeers) c.push({ id: "ppm", size: "mid", title: "قیمت هر مترمربع در کنار آگهی‌های دیگر", node: <PeerStrip p={s.sale.ppmPeers} /> });
  return c;
}
/** ردیف اول: پهن‌ترین نمودار؛ بقیه به ترتیب: کوچک‌ها اول (ردیف‌های سه‌تایی) و نوارهای مقایسه آخر (ردیف دوتایی) */
export function arrange(list: ChartItem[]) {
  const first = list.find((c) => c.size === "wide") ?? list.find((c) => c.size === "mid") ?? list[0];
  const rest = list.filter((c) => c !== first);
  return { first, rest: [...rest.filter((c) => c.size !== "mid"), ...rest.filter((c) => c.size === "mid")] };
}
