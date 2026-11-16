"use client";
// انتخاب بودجه: دو ورودی عددی، نمودار پراکندگی مبلغ پروژه‌ها، اسلایدر با گام‌های غیرخطی و بازه‌های آماده.
// گام‌ها غیرخطی‌اند تا مبلغ‌های کوچک (که بیشتر پروژه‌ها در آن‌اند) فضای کافی روی اسلایدر داشته باشند.
import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn, faNumber } from "@/lib/utils";

const NICE = [0, 0.5, 1, 2, 3, 5, 7, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 30000, 50000, 75000, 100000];

const toLatin = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[,،٬\s]/g, "").replace("٫", ".");

function NumberBox({ label, value, onCommit }: { label: string; value: number; onCommit: (v: number) => void }) {
  const [text, setText] = useState(faNumber(value));
  useEffect(() => setText(faNumber(value)), [value]);
  const commit = () => { const n = Number(toLatin(text)); if (Number.isFinite(n) && text.trim() !== "") onCommit(n); else setText(faNumber(value)); };
  return (
    <label className="flex h-14 min-w-0 flex-1 flex-col justify-center rounded-2xl border border-border bg-white px-4 transition-colors focus-within:border-ink/40">
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      <Input value={text} inputMode="decimal" onChange={(e) => setText(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && commit()}
        className="h-6 rounded-none border-0 bg-transparent p-0 text-base font-extrabold text-ink shadow-none focus-visible:ring-0" />
    </label>
  );
}

// amounts: مبلغ پروژه‌های متناسب با محدوده و حوزه انتخاب‌شده، basis: همه پروژه‌های مسیر (برای ثابت ماندن بازه‌های آماده)
export function BudgetField({ min, max, step = 1, unit, label, value, onChange, amounts, basis, compact }: {
  min: number; max: number; step?: number; unit: string; label?: string; value: [number, number] | null | undefined;
  onChange: (v: [number, number] | null) => void; amounts: number[]; basis?: number[]; compact?: boolean;
}) {
  // اگر در محدوده انتخابی پروژه‌ای با مبلغ اعلام‌شده نباشد، نمودار و شمارها از همه پروژه‌های مسیر ساخته می‌شوند تا خالی نماند
  const wide = !amounts.length && !!basis?.length;
  const src = wide ? basis! : amounts;
  const stops = useMemo(() => { const s = NICE.filter((x) => x > min && x < max && x % step === 0); return [min, ...s, max]; }, [min, max, step]);
  const v = value ?? [min, max];
  const last = stops.length - 1;
  // مقدار → جایگاه روی اسلایدر (با درون‌یابی بین دو گام) و برعکس
  const pos = (x: number) => { for (let i = 0; i < last; i++) if (x <= stops[i + 1]) return i + (x - stops[i]) / (stops[i + 1] - stops[i] || 1); return last; };
  const bins = useMemo(() => stops.slice(0, -1).map((a, i) => src.filter((x) => x >= a && (i === last - 1 ? x <= stops[i + 1] : x < stops[i + 1])).length), [src, stops, last]);
  const peak = Math.max(1, ...bins);
  const lo = pos(v[0]), hi = pos(v[1]);
  const set = (a: number, b: number) => { const x = Math.max(min, Math.min(max, Math.min(a, b))), y = Math.max(min, Math.min(max, Math.max(a, b))); onChange(x === min && y === max ? null : [x, y]); };
  const inRange = (a: number, b: number) => src.filter((x) => x >= a && x <= b).length;
  // چهار بازه آماده بر اساس چارک‌های مبلغ پروژه‌ها، روی نزدیک‌ترین گام
  const presets = useMemo<[number, number][]>(() => {
    const sorted = [...(basis ?? amounts)].sort((a, b) => a - b);
    const snap = (x: number) => stops.reduce((p, c) => (Math.abs(c - x) < Math.abs(p - x) ? c : p), stops[0]);
    const q = sorted.length >= 4 ? [0.25, 0.5, 0.75].map((k) => snap(sorted[Math.floor(k * (sorted.length - 1))])) : [snap(max * 0.04), snap(max * 0.1), snap(max * 0.3)];
    const edges = [...new Set([min, ...q, max])].sort((a, b) => a - b);
    return edges.slice(0, -1).map((a, i) => [a, edges[i + 1]] as [number, number]);
  }, [amounts, basis, stops, min, max]);
  const total = inRange(v[0], v[1]);

  return (
    <div className={cn("space-y-4", compact && "space-y-3.5")}>
      <div className="flex items-center gap-2.5">
        <NumberBox label="از" value={v[0]} onCommit={(n) => set(n, v[1])} />
        <span className="h-px w-4 shrink-0 bg-ink/20" />
        <NumberBox label="تا" value={v[1]} onCommit={(n) => set(v[0], n)} />
        <span className="shrink-0 text-xs font-bold text-muted-foreground">{unit}</span>
      </div>

      <div>
        <BudgetArea bins={bins} peak={peak} lo={lo} hi={hi} last={last} />
        <Slider dir="rtl" min={0} max={last} step={1} value={[lo, hi]} onValueChange={(x) => set(stops[Math.round(x[0])], stops[Math.round(x[1])])} className="-mt-1.5" />
        <div className="mt-2 flex justify-between text-[11px] font-semibold text-muted-foreground">
          <span>{faNumber(min)}</span><span>{faNumber(stops[Math.round(last / 2)])}</span><span>{faNumber(max)}</span>
        </div>
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${presets.length}, minmax(0, 1fr))` }}>
        {presets.map(([a, b]) => { const on = v[0] === a && v[1] === b; const n = inRange(a, b);
          return (
            <Button key={`${a}-${b}`} type="button" variant="outline" onClick={() => set(a, b)} aria-pressed={on}
              className={cn("h-auto flex-col items-start gap-0.5 rounded-2xl bg-white px-3 py-2.5 text-right shadow-none hover:border-ink/25 hover:bg-white", on && "border-cobalt bg-cobalt-soft hover:bg-cobalt-soft")}>
              <span className={cn("text-[13px] font-extrabold", "text-ink")}>{a === min ? `تا ${faNumber(b)}` : b === max ? `بیش از ${faNumber(a)}` : `${faNumber(a)} تا ${faNumber(b)}`}</span>
              <span className="text-[11px] font-semibold text-muted-foreground">{n ? `${faNumber(n)} پروژه` : "بدون پروژه"}</span>
            </Button>
          ); })}
      </div>

      <div className="flex min-h-7 items-center justify-between text-xs">
        <span className="font-semibold text-muted-foreground">{label ? `${label}، ` : ""}<b className="text-ink">{faNumber(total)} پروژه</b> {wide ? "در کل ایران " : ""}با مبلغ اعلام‌شده در این بازه</span>
        {value && <Button type="button" variant="ghost" size="xs" onClick={() => onChange(null)} className="font-bold text-muted-foreground hover:text-destructive">پاک کردن بودجه</Button>}
      </div>
    </div>
  );
}

/** نمودار پُر پراکندگی مبلغ‌ها، راست‌به‌چپ مثل اسلایدر. بخش داخل بازه انتخابی پررنگ می‌شود. */
function BudgetArea({ bins, peak, lo, hi, last }: { bins: number[]; peak: number; lo: number; hi: number; last: number }) {
  const id = useId().replace(/:/g, "");
  const W = 1000, H = 100, n = bins.length;
  // نقطه‌ها: وسط هر بازه، از راست به چپ، دو سر نمودار تا لبه‌ها ادامه پیدا می‌کند
  const pts = bins.map((v, i) => [W - ((i + 0.5) / n) * W, H - (v ? 10 + (v / peak) * 84 : 3)] as const);
  const all = [[W, pts[0]?.[1] ?? H] as const, ...pts, [0, pts.at(-1)?.[1] ?? H] as const];
  let d = `M${all[0][0]},${all[0][1]}`;
  for (let i = 0; i < all.length - 1; i++) {
    const p0 = all[i - 1] ?? all[i], p1 = all[i], p2 = all[i + 1], p3 = all[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${Math.min(H, c1[1])} ${c2[0]},${Math.min(H, c2[1])} ${p2[0]},${p2[1]}`;
  }
  const area = `${d} L0,${H} L${W},${H} Z`;
  const x1 = W * (1 - hi / last), x2 = W * (1 - lo / last);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-16 w-full px-2" aria-hidden>
      <defs>
        {/* همان گرادیان سبز سایت (#0f766e → #14b8a6)، بیرون بازه کم‌رنگ */}
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f766e" stopOpacity="0.5" /><stop offset="0.6" stopColor="#14b8a6" stopOpacity="0.18" /><stop offset="1" stopColor="#14b8a6" stopOpacity="0.03" /></linearGradient>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#14b8a6" /><stop offset="1" stopColor="#0f766e" /></linearGradient>
        <clipPath id={`c${id}`}><rect x={x1} y="0" width={Math.max(0, x2 - x1)} height={H} style={{ transition: "x 0.2s, width 0.2s" }} /></clipPath>
      </defs>
      <path d={area} fill="rgb(15 118 110 / 0.06)" />
      <path d={d} fill="none" stroke="rgb(15 118 110 / 0.2)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <g clipPath={`url(#c${id})`}>
        <path d={area} fill={`url(#g${id})`} />
        <path d={d} fill="none" stroke={`url(#s${id})`} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}
