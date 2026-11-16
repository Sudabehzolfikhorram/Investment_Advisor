"use client";
// مقایسه روی نمودار: هر شاخص عددی یک نمودار میله‌ای کوچک (small multiples)، با رنگ ثابت هر پروژه.
// بهترین مقدار هر شاخص نشان «بهترین» می‌گیرد؛ داده‌ی اعلام‌نشده با خط‌چین نشان داده می‌شود، نه با صفر.
import { motion } from "motion/react";
import { Award, Clock, Danger, MoneyRecive, Ranking } from "@/components/iconsax";
import { bestOf, oppOf, rows, SERIES, type Row } from "@/lib/compare";
import type { Listing } from "@/types";
import { cn, faNumber } from "@/lib/utils";
import { SeriesDot } from "./timeline";

const months = (m: number) => (m >= 12 && m % 12 === 0 ? `${faNumber(m / 12)} سال` : `${faNumber(m)} ماه`);
/** مقدار کوتاه برای کنار میله */
const short: Record<string, (v: number) => string> = {
  min: (v) => `${faNumber(v)} میلیارد`,
  budget: (v) => `${faNumber(v)} میلیارد`,
  irr: (v) => `${faNumber(v)}٪`,
  first: months, lock: months, exec: months,
  payback: (v) => `${faNumber(v)} سال`,
  downside: (v) => `${faNumber(v)} سال`,
};

const sets = [
  { id: "money", title: "پول", icon: MoneyRecive, ids: ["min", "irr", "budget"] },
  { id: "time", title: "زمان", icon: Clock, ids: ["first", "payback", "downside", "lock", "exec"] },
] as const;

function MetricCard({ row, items }: { row: Row; items: Listing[] }) {
  const vals = items.map((l) => row.num(oppOf(l)));
  const max = Math.max(...vals.map((v) => v ?? 0));
  const best = bestOf(row, items);
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="mb-3.5 flex items-center gap-2">
        <h4 className="min-w-0 flex-1 truncate text-[13.5px] font-extrabold text-ink">{row.label}</h4>
        {row.better && <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-bold text-ink/60">{row.better === "low" ? "کمتر، بهتر" : "بیشتر، بهتر"}</span>}
      </div>
      <ul className="space-y-2.5">
        {items.map((l, i) => {
          const v = vals[i]; const win = best.includes(i);
          return (
            <li key={l.id} className="grid grid-cols-[1.1rem_minmax(0,1fr)_5.6rem] items-center gap-2">
              <SeriesDot i={i} small />
              {v == null ? (
                <span className="h-2.5 rounded-full border border-dashed border-ink/15" title="اعلام نشده" />
              ) : (
                <span className="relative h-2.5 overflow-hidden rounded-full bg-ink/[0.05]">
                  <motion.span className="absolute inset-y-0 right-0 rounded-full" style={{ background: SERIES[i], opacity: best.length && !win ? 0.55 : 1 }}
                    initial={{ width: 0 }} whileInView={{ width: `${max ? Math.max(4, (v / max) * 100) : 0}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.07, ease: [0.2, 0.7, 0.2, 1] }} />
                </span>
              )}
              <span className={cn("flex items-center justify-end gap-1 truncate text-left text-[12px] tabular-nums", v == null ? "font-semibold text-ink/35" : win ? "font-black text-ink" : "font-bold text-ink/70")}>
                {win && <Award size={13} variant="Bold" className="shrink-0" style={{ color: SERIES[i] }} />}
                {v == null ? "اعلام نشده" : short[row.id]?.(v) ?? faNumber(v)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** ریسک سه‌سطحی است؛ به‌جای میله، سنجه‌ی سه‌خانه‌ای */
function RiskCard({ items }: { items: Listing[] }) {
  const row = rows.find((r) => r.id === "risk")!;
  const best = bestOf(row, items);
  const label = ["کم", "متوسط", "زیاد"];
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="mb-3.5 flex items-center gap-2">
        <h4 className="min-w-0 flex-1 truncate text-[13.5px] font-extrabold text-ink">سطح ریسک</h4>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-bold text-ink/60">کمتر، بهتر</span>
      </div>
      <ul className="space-y-2.5">
        {items.map((l, i) => {
          const v = row.num(oppOf(l)); const win = best.includes(i);
          return (
            <li key={l.id} className="grid grid-cols-[1.1rem_minmax(0,1fr)_5.6rem] items-center gap-2">
              <SeriesDot i={i} small />
              <span className="grid grid-cols-3 gap-1">
                {[1, 2, 3].map((k) => <span key={k} className={cn("h-2.5 rounded-full", v == null ? "border border-dashed border-ink/15" : k <= v ? "" : "bg-ink/[0.06]")} style={v != null && k <= v ? { background: SERIES[i] } : undefined} />)}
              </span>
              <span className={cn("flex items-center justify-end gap-1 text-[12px]", v == null ? "font-semibold text-ink/35" : win ? "font-black text-ink" : "font-bold text-ink/70")}>
                {win && <Award size={13} variant="Bold" style={{ color: SERIES[i] }} />}{v == null ? "اعلام نشده" : label[v - 1]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** امتیاز کلی: هر پروژه در چند شاخص بهترین است (از میان شاخص‌هایی که دست‌کم دو پروژه اعلام کرده‌اند) */
function Wins({ items }: { items: Listing[] }) {
  const scored = rows.filter((r) => r.better && bestOf(r, items).length);
  const wins = items.map((_, i) => scored.filter((r) => bestOf(r, items).includes(i)).length);
  const top = Math.max(...wins, 1);
  return (
    <div className="rounded-2xl bg-[#f3f6fa] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Ranking size={18} variant="Bulk" className="text-ink/70" />
        <h4 className="text-[13.5px] font-extrabold text-ink">برتری در شاخص‌ها</h4>
        <span className="mr-auto text-[11.5px] font-semibold text-muted-foreground">از {faNumber(scored.length)} شاخص قابل‌مقایسه</span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((l, i) => (
          <div key={l.id} className="rounded-xl bg-white p-3">
            <div className="flex items-center gap-1.5"><SeriesDot i={i} small /><span className="truncate text-[12px] font-bold text-ink/75" title={l.title}>{l.title}</span></div>
            <div className="mt-2 flex items-end gap-1.5"><b className="text-[1.6rem] font-black leading-none tabular-nums text-ink">{faNumber(wins[i])}</b><span className="pb-0.5 text-[11.5px] font-semibold text-muted-foreground">شاخص</span></div>
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-ink/[0.06]"><motion.span className="block h-full rounded-full" style={{ background: SERIES[i] }} initial={{ width: 0 }} whileInView={{ width: `${(wins[i] / top) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.08 }} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricCharts({ items }: { items: Listing[] }) {
  const has = (id: string) => items.filter((l) => rows.find((r) => r.id === id)!.num(oppOf(l)) != null).length >= 2;
  const riskOk = has("risk");
  return (
    <div className="space-y-5">
      <Wins items={items} />
      {sets.map((s) => {
        const list = s.ids.filter(has).map((id) => rows.find((r) => r.id === id)!);
        if (!list.length) return null;
        return (
          <div key={s.id}>
            <p className="mb-2.5 flex items-center gap-2 text-[13px] font-black text-ink/80"><s.icon size={17} variant="Bulk" className="text-ink/55" />{s.title}</p>
            <div className="grid grid-cols-2 gap-3">{list.map((r) => <MetricCard key={r.id} row={r} items={items} />)}</div>
          </div>
        );
      })}
      {riskOk && (
        <div>
          <p className="mb-2.5 flex items-center gap-2 text-[13px] font-black text-ink/80"><Danger size={17} variant="Bulk" className="text-ink/55" />ریسک</p>
          <div className="grid grid-cols-2 gap-3"><RiskCard items={items} /></div>
        </div>
      )}
    </div>
  );
}
