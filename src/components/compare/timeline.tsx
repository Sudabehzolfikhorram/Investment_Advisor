"use client";
// نمودار «سرمایه شما کی برمی‌گردد؟»: درصد سرمایه برگشته در طول زمان برای هر پروژه.
// خط تا زمان اولین درآمد روی صفر می‌ماند و در سال بازگشت به ۱۰۰٪ می‌رسد، خط‌چین همان مسیر در حالت بدبینانه است.
// زمان از راست به چپ جلو می‌رود (هم‌جهت با خواندن فارسی). پروژه‌ای که دوره بازگشتش اعلام نشده روی نمودار نمی‌آید.
import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { oppOf, SERIES } from "@/lib/compare";
import type { Listing } from "@/types";
import { cn, faNumber } from "@/lib/utils";

const W = 880, H = 290, L = 28, R = 828, TOP = 24, BOT = 250;

export type Marker = { at: number; label: string; value: string; warn?: boolean };

/** ردیف برچسب‌های نقاط عطف زیر محور زمان، برچسب‌های نزدیک به هم در ردیف بعدی می‌نشینند تا روی هم نیفتند */
function lanes(ms: Marker[], pos: (m: number) => number) {
  const last: number[] = [];
  return ms.map((m) => { const p = pos(m.at); let r = 0; while (last[r] != null && Math.abs(p - last[r]) < 13) r++; last[r] = p; return r; });
}

// probable: مسیر تخمینی (خط‌چین با برچسب «مسیر احتمالی»)، note: توضیح زیر نمودار به‌جای متن پیش‌فرض
export function ReturnTimeline({ items, single = false, markers = [], probable = false, note }: { items: Listing[]; single?: boolean; markers?: Marker[]; probable?: boolean; note?: string }) {
  const reduce = useReducedMotion();
  const box = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const lines = items.map((l, i) => {
    const o = oppOf(l);
    return { i, l, first: o.firstIncomeMonths, pay: o.paybackYears != null ? o.paybackYears * 12 : null, down: o.paybackDownsideYears != null ? o.paybackDownsideYears * 12 : null };
  });
  const plotted = lines.filter((x) => x.pay != null);
  const T = useMemo(() => Math.max(24, Math.ceil(Math.max(0, ...plotted.map((x) => Math.max(x.pay!, x.down ?? 0)), ...markers.map((m) => m.at)) / 12) * 12 + 12), [plotted, markers]);
  const x = (m: number) => R - (m / T) * (R - L);
  const y = (p: number) => BOT - (p / 100) * (BOT - TOP);
  const pct = (ln: (typeof lines)[number], m: number, down = false) => {
    const end = down ? ln.down : ln.pay;
    if (end == null) return null;
    const f = Math.min(ln.first ?? 0, end);
    if (m <= f) return 0;
    return Math.min(100, ((m - f) / Math.max(1, end - f)) * 100);
  };
  const path = (ln: (typeof lines)[number], down = false) => {
    const end = (down ? ln.down : ln.pay)!;
    const f = Math.min(ln.first ?? 0, end);
    return `M${x(0)},${y(0)} L${x(f)},${y(0)} L${x(end)},${y(100)} L${x(T)},${y(100)}`;
  };
  const step = T > 144 ? 24 : 12;
  const ticks = Array.from({ length: Math.floor(T / step) + 1 }, (_, k) => k * step);

  const onMove = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect(); if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * W;
    const m = Math.round(((R - px) / (R - L)) * T);
    setHover(m < 0 || m > T ? null : m);
  };

  const missing = lines.filter((x) => x.pay == null);
  return (
    <div>
      {/* راهنما: شماره و رنگ هر پروژه، با نگه داشتن نشانگر روی هر کدام خطش پررنگ می‌شود */}
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-bold text-ink/80">
        {single && <li className="flex items-center gap-2"><svg width="26" height="6" aria-hidden><line x1="0" y1="3" x2="26" y2="3" stroke={SERIES[0]} strokeWidth="2.5" strokeDasharray={probable ? "5 4" : undefined} /></svg>{probable ? "مسیر احتمالی بازگشت سرمایه" : "حالت پایه"}</li>}
        {single && lines[0]?.l && (lines[0].l.raw as { lockupMonths?: number | null }).lockupMonths != null && <li className="flex items-center gap-2"><span className="h-3 w-6 rounded-[4px] bg-ink/[0.07]" />دوره قفل سرمایه</li>}
        {!single && lines.map((ln) => (
          <li key={ln.l.id} onPointerEnter={() => setFocus(ln.i)} onPointerLeave={() => setFocus(null)} className={cn("flex items-center gap-2 transition-opacity", focus != null && focus !== ln.i && "opacity-40", ln.pay == null && "text-muted-foreground")}>
            <SeriesDot i={ln.i} />
            <span className="max-w-[16rem] truncate">{ln.l.title}</span>
            {ln.pay == null && <span className="font-semibold">(دوره بازگشت اعلام نشده)</span>}
          </li>
        ))}
        {!probable && <li className="flex items-center gap-2 text-muted-foreground"><svg width="26" height="6" aria-hidden><line x1="0" y1="3" x2="26" y2="3" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" /></svg>حالت بدبینانه</li>}
      </ul>

      {plotted.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-muted/60 px-5 py-8 text-center text-[13.5px] font-semibold leading-7 text-muted-foreground">دوره بازگشت هیچ‌کدام از این پروژه‌ها اعلام نشده است، پس نمودار زمانی ساخته نمی‌شود.</p>
      ) : (
        <div className="relative mt-4">
          <svg ref={box} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none select-none [direction:ltr]" role="img" aria-label="درصد سرمایه برگشته در طول زمان برای هر پروژه" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
            {single && (() => { const lock = (items[0].raw as { lockupMonths?: number | null }).lockupMonths; if (lock == null) return null; const m = Math.min(lock, T); return (
              <g>
                <rect x={x(m)} y={TOP - 8} width={x(0) - x(m)} height={BOT - TOP + 8} rx={10} className="fill-ink/[0.045]" />
                <text x={(x(m) + x(0)) / 2} y={TOP + 8} textAnchor="middle" className="fill-ink/45 text-[11px] font-bold">قفل سرمایه تا {m >= 12 && m % 12 === 0 ? `سال ${faNumber(m / 12)}` : `ماه ${faNumber(m)}`}</text>
              </g>); })()}
            {[0, 50, 100].map((p) => (
              <g key={p}>
                <line x1={L} x2={R} y1={y(p)} y2={y(p)} className="stroke-ink/10" strokeDasharray={p === 0 ? undefined : "3 5"} />
                <text x={W - 4} y={y(p) + 4} className="fill-muted-foreground text-[11px] font-bold" textAnchor="end">{faNumber(p)}٪</text>
              </g>
            ))}
            {ticks.map((m) => <text key={m} x={x(m)} y={BOT + 22} textAnchor="middle" className="fill-muted-foreground text-[11px] font-bold">{m === 0 ? "امروز" : `سال ${faNumber(m / 12)}`}</text>)}
            {plotted.map((ln) => {
              const dim = focus != null && focus !== ln.i;
              return (
                <g key={ln.l.id} style={{ opacity: dim ? 0.18 : 1, transition: "opacity .2s" }}>
                  {ln.down != null && ln.down !== ln.pay && <path d={path(ln, true)} fill="none" stroke={SERIES[ln.i]} strokeWidth={2} strokeDasharray="4 5" strokeLinejoin="round" opacity={0.55} />}
                  <motion.path d={path(ln)} fill="none" stroke={SERIES[ln.i]} strokeWidth={focus === ln.i ? 3 : 2.25} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={probable ? "7 6" : undefined}
                    initial={reduce || probable ? false : { pathLength: 0 }} whileInView={probable ? undefined : { pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: ln.i * 0.15, ease: "easeOut" }} />
                  {/* نقطه بازگشت کامل، با شماره پروژه */}
                  <g transform={`translate(${x(ln.pay!)},${y(100)})`}>
                    <circle r={10} fill="white" stroke={SERIES[ln.i]} strokeWidth={2} />
                    <text y={4} textAnchor="middle" className="text-[11px] font-black" fill={SERIES[ln.i]}>{faNumber(ln.i + 1)}</text>
                  </g>
                  {ln.first != null && ln.first > 0 && <circle cx={x(Math.min(ln.first, ln.pay!))} cy={y(0)} r={4.5} fill={SERIES[ln.i]} stroke="white" strokeWidth={2} />}
                </g>
              );
            })}
            {/* نقاط عطف (اولین دریافت، پایان اجرا، پایان قفل، بازگشت، پایان طرح) روی همان محور زمان */}
            {markers.map((m) => (
              <g key={m.label}>
                <line x1={x(m.at)} x2={x(m.at)} y1={TOP} y2={BOT} className={m.warn ? "stroke-warn/35" : "stroke-ink/15"} strokeDasharray="2 4" />
                <circle cx={x(m.at)} cy={BOT} r={5} fill="white" className={m.warn ? "stroke-warn" : "stroke-ink/60"} strokeWidth={2} />
              </g>
            ))}
            {hover != null && <line x1={x(hover)} x2={x(hover)} y1={TOP - 8} y2={BOT} className="stroke-ink/30" strokeWidth={1} />}
          </svg>
          {hover != null && (
            <div className="pointer-events-none absolute top-0 z-10 w-56 -translate-x-1/2 rounded-2xl border border-border bg-white/95 p-3 text-[12px] shadow-[0_18px_40px_-20px_rgb(22_32_48/0.45)] backdrop-blur" style={{ left: `${(x(hover) / W) * 100}%` }}>
              <p className="mb-1.5 font-extrabold text-ink">{hover < 12 ? `ماه ${faNumber(hover)}` : `سال ${faNumber(Math.floor(hover / 12))}${hover % 12 ? `، ماه ${faNumber(hover % 12)}` : ""}`}</p>
              <ul className="space-y-1">
                {plotted.map((ln) => { const v = pct(ln, hover)!; return (
                  <li key={ln.l.id} className="flex items-center gap-2 font-bold text-ink/80"><SeriesDot i={ln.i} small /><span className="min-w-0 flex-1 truncate">{ln.l.title}</span><span className="text-ink">{faNumber(Math.round(v))}٪</span></li>); })}
              </ul>
            </div>
          )}
          {markers.length > 0 && (() => { const pos = (m: number) => (x(m) / W) * 100; const ln = lanes(markers, pos); const rowsN = Math.max(...ln) + 1; return (
            <div className="relative mt-1 [direction:ltr]" style={{ height: rowsN * 44 + 6 }}>
              {markers.map((m, k) => (
                <div key={m.label} className="absolute flex -translate-x-1/2 flex-col items-center text-center [direction:rtl]" style={{ left: `${pos(m.at)}%`, top: ln[k] * 44 }}>
                  <span className={cn("whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-black", m.warn ? "bg-warn/10 text-warn" : "bg-ink/[0.06] text-ink")}>{m.value}</span>
                  <span className="mt-0.5 whitespace-nowrap text-[11px] font-semibold text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>); })()}
          <p className="mt-1 text-[12px] font-semibold leading-6 text-muted-foreground">
            {note ?? <>نقطه کوچک روی خط صفر، زمان اولین درآمد است و دایره شماره‌دار، زمان بازگشت کامل سرمایه. سود پس از بازگشت سرمایه در داده‌ها اعلام نشده، پس خط پس از آن صاف می‌ماند.
            {missing.length > 0 && ` ${missing.map((m) => `«${m.l.title}»`).join("، ")} به دلیل نبودن دوره بازگشت روی نمودار نیست.`}</>}
          </p>
        </div>
      )}
    </div>
  );
}

export function SeriesDot({ i, small, className }: { i: number; small?: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-full font-black text-white", small ? "size-4 text-[9px]" : "size-5 text-[10.5px]", className)} style={{ background: SERIES[i] }}>{faNumber(i + 1)}</span>
  );
}
