"use client";
// ایده ۲ «فیلم سرمایه»: مسیر پول سرمایه‌گذار در طول زمان، فقط از داده‌های اعلام‌شده پروژه
// (زمان اولین دریافت، قفل سرمایه، دوره بازگشت در حالت پایه و بدبینانه). بین این نقطه‌ها خط تقریبی است و این را صریح می‌گوییم.
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Lock1, Refresh2 } from "@/components/iconsax";
import { riskLabel, incomeLabel, cn, faNumber } from "@/lib/utils";
import { billion, fullData, opp } from "./shared";

const options = fullData.filter((l) => l.id.startsWith("DEMO")).slice(0, 12);
const W = 880, H = 360, L = 36, R = 844, TOP = 84, BOT = 280;

export function MoneyFilmIdea() {
  const [id, setId] = useState(options[0].id);
  const l = options.find((x) => x.id === id)!;
  const o = opp(l);
  const min = o.minCapital!;
  const [amount, setAmount] = useState(min);
  const pick = (v: string) => { setId(v); setAmount(opp(options.find((x) => x.id === v)!).minCapital!); };

  const first = o.firstIncomeMonths!, pb = o.paybackYears! * 12, down = (o.paybackDownsideYears ?? o.paybackYears!) * 12, lock = o.lockupMonths ?? 0;
  const T = Math.ceil((Math.max(down, lock, pb) + 12) / 12) * 12;
  // ارزش خالص سرمایه‌گذار در ماه m (منفی یعنی هنوز اصل پول برنگشته)
  // بعد از برگشت اصل پول خط صاف می‌ماند: مقدار سود بعدی در داده‌ی پروژه نیست و آن را نمی‌سازیم
  const value = (m: number, end: number) => (m <= first ? -amount : Math.min(0, -amount + (amount * (m - first)) / (end - first)));
  const top = amount * 0.12;
  const x = (m: number) => R - (m / T) * (R - L); // زمان از راست به چپ
  const y = (v: number) => TOP + ((top - v) / (top + amount)) * (BOT - TOP);
  const path = (end: number) => `M${x(0)} ${y(-amount)} L${x(first)} ${y(-amount)} L${x(end)} ${y(0)}`;

  const [m, setM] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.5 });
  const ctl = useRef<ReturnType<typeof animate> | null>(null);
  const play = () => { ctl.current?.stop(); ctl.current = animate(0, T, { duration: 7, ease: "linear", onUpdate: (v) => setM(v) }); };
  useEffect(() => { if (inView) play(); return () => ctl.current?.stop(); }, [inView, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const back = Math.max(0, Math.min(amount, amount + value(m, pb)));
  const backDown = Math.max(0, Math.min(amount, amount + value(m, down)));
  const mi = Math.round(m);
  // نشانه‌های هم‌زمان در یک برچسب جمع می‌شوند
  const marks = Object.values([
    { m: first, label: "اولین دریافت" },
    { m: lock, label: "پایان قفل سرمایه" },
    { m: pb, label: "برگشت اصل پول" },
    { m: down, label: "برگشت در حالت بدبینانه" },
  ].filter((k) => k.m > 0).reduce<Record<number, { m: number; label: string }>>((acc, k) => { acc[k.m] = acc[k.m] ? { m: k.m, label: `${acc[k.m].label} و ${k.label}` } : k; return acc; }, {})).sort((a, b) => a.m - b.m);

  const phase = mi < first ? 0 : back < amount ? 1 : 2;
  const status = mi < first ? `هنوز دریافتی ندارید؛ اولین دریافت حدود ماه ${faNumber(first)} است.`
    : back < amount ? `حدود ${billion(back)} از ${billion(amount)} تومان برگشته است.`
    : "اصل پول برگشته و از اینجا به بعد سود شماست.";

  return (
    <div ref={ref} className="rounded-[2rem] border border-border bg-white p-8">
      <div className="flex flex-wrap items-end gap-4">
        <label className="min-w-0 flex-1 space-y-1.5">
          <span className="block text-[12px] font-bold text-muted-foreground">پروژه</span>
          <Select dir="rtl" value={id} onValueChange={pick}>
            <SelectTrigger className="h-12 w-full rounded-2xl bg-white px-4 text-[15px] font-extrabold text-ink shadow-none data-[size=default]:h-12"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-2xl">{options.map((x) => <SelectItem key={x.id} value={x.id} className="rounded-xl">{x.title}، {x.city}</SelectItem>)}</SelectContent>
          </Select>
        </label>
        <div className="w-72 space-y-3">
          <span className="flex justify-between text-[12px] font-bold text-muted-foreground"><span>سهم شما</span><span className="text-ink">{billion(amount)} تومان</span></span>
          <Slider dir="rtl" min={min} max={min * 4} step={Math.max(1, Math.round(min / 4))} value={[amount]} onValueChange={([v]) => setAmount(v)} aria-label="سهم شما" />
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-6 h-auto w-full" role="img" aria-label={`مسیر برگشت پول در ${l.title}`}>
        <defs>
          <clipPath id="film-past"><rect x={x(m)} y="0" width={R - x(m) + 2} height={H} /></clipPath>
        </defs>
        {/* خط صفر: جایی که اصل پول برمی‌گردد */}
        <line x1={L} x2={R} y1={y(0)} y2={y(0)} className="stroke-ink/20" strokeDasharray="3 5" />
        <line x1={L} x2={R} y1={y(-amount)} y2={y(-amount)} className="stroke-ink/10" />
        <text x={R} y={y(-amount) + 22} textAnchor="start" className="fill-muted-foreground text-[13px] font-bold">سهم شما: {billion(amount)}</text>
        {/* سال‌ها */}
        {Array.from({ length: T / 12 + 1 }, (_, i) => (
          <text key={i} x={x(i * 12)} y={BOT + 50} textAnchor="middle" className="fill-muted-foreground text-[13px] font-bold">{i === 0 ? "امروز" : `سال ${faNumber(i)}`}</text>
        ))}
        {/* نشانه‌ها: فقط همین نقطه‌ها داده‌ی پروژه است */}
        {marks.map((k, i) => (
          <g key={k.label}>
            <line x1={x(k.m)} x2={x(k.m)} y1={TOP - 8 - (i % 2) * 26} y2={BOT + 30} className={cn("transition-colors", mi >= k.m ? "stroke-ink/40" : "stroke-ink/12")} strokeDasharray="2 4" />
            <text x={x(k.m)} y={TOP - 16 - (i % 2) * 26} textAnchor="middle" className={cn("text-[14px] font-extrabold transition-colors", mi >= k.m ? "fill-ink" : "fill-ink/35")}>{k.label}</text>
          </g>
        ))}
        <line x1={x(pb)} x2={x(T)} y1={y(0)} y2={y(0)} className="stroke-primary/60" strokeWidth="3" strokeDasharray="1 7" strokeLinecap="round" />
        {/* بدبینانه و پایه: کم‌رنگ برای کل مسیر، پررنگ تا لحظه‌ی فعلی */}
        <path d={path(down)} fill="none" className="stroke-ink/15" strokeWidth="2" strokeDasharray="7 6" />
        <path d={path(pb)} fill="none" className="stroke-ink/15" strokeWidth="3" />
        <g clipPath="url(#film-past)">
          <path d={`${path(pb)} L${x(pb)} ${y(-amount)} Z`} className="fill-ink/[0.05]" />
          <path d={path(down)} fill="none" className="stroke-ink/50" strokeWidth="2" strokeDasharray="7 6" />
          <path d={path(pb)} fill="none" className="stroke-ink" strokeWidth="3.5" strokeLinejoin="round" />
        </g>
        <line x1={x(m)} x2={x(m)} y1={TOP - 4} y2={BOT + 30} className="stroke-coral" strokeWidth="1.5" />
        <circle cx={x(m)} cy={y(value(m, pb))} r="7" className="fill-coral stroke-white" strokeWidth="3" />
      </svg>
      <div className="flex items-center gap-3">
        <Button type="button" variant="plain" size="auto" onClick={play} aria-label="پخش دوباره" className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-ink hover:border-ink/30"><Refresh2 size={17} /></Button>
        <Slider dir="rtl" min={0} max={T} step={1} value={[m]} onValueChange={([v]) => { ctl.current?.stop(); setM(v); }} aria-label="ماه" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] font-semibold text-muted-foreground">
        <span className="flex items-center gap-2"><span className="h-[3px] w-6 rounded-full bg-ink" />حالت پایه</span>
        <span className="flex items-center gap-2"><span className="w-6 border-t-2 border-dashed border-ink/50" />حالت بدبینانه</span>
        <span className="flex items-center gap-2"><span className="w-6 border-t-[3px] border-dotted border-primary/70" />بعد از برگشت اصل پول؛ مقدار سود اعلام نشده</span>
        <span className="mr-auto">نقطه‌های علامت‌خورده داده‌ی پروژه است؛ خط بین آن‌ها تقریبی است و پیش‌بینی سود نیست.</span>
      </div>

      <div className="mt-6 grid grid-cols-[1.4fr_1fr_1fr] gap-3">
        <div className="rounded-2xl bg-pine p-5 text-white">
          <p className="text-[12px] font-bold text-white/60">ماه {faNumber(mi)}{mi >= 12 && ` · ${faNumber(Math.round((mi / 12) * 10) / 10)} سال`}</p>
          <motion.p key={phase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-[15.5px] font-extrabold leading-8">{status}</motion.p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-white" style={{ width: `${(back / amount) * 100}%` }} /></div>
          <p className="mt-2 text-[12px] font-semibold text-white/60">در حالت بدبینانه: {billion(backDown)} تومان</p>
        </div>
        <div className={cn("flex flex-col justify-between rounded-2xl border p-5 transition-colors", mi < lock ? "border-coral/40 bg-coral-soft text-coral-deep" : "border-border text-ink")}>
          <Lock1 size={22} variant="Bold" />
          <p className="mt-3 text-[14px] font-extrabold leading-7">{mi < lock ? `سرمایه تا ماه ${faNumber(lock)} قفل است و نمی‌توانید خارج شوید.` : "قفل سرمایه باز شده است."}</p>
        </div>
        <dl className="grid content-between gap-3 rounded-2xl border border-border p-5">
          <div><dt className="text-[12px] font-semibold text-muted-foreground">نوع دریافت</dt><dd className="text-[15px] font-extrabold text-ink">{incomeLabel[o.income] ?? "اعلام نشده"}</dd></div>
          <div><dt className="text-[12px] font-semibold text-muted-foreground">ریسک</dt><dd className="text-[15px] font-extrabold text-ink">{riskLabel[o.risk]}</dd></div>
        </dl>
      </div>
    </div>
  );
}
