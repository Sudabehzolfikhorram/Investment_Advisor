"use client";
// ایده ۳ «سبد سرمایه»: به‌جای پیدا کردن یک پروژه، کل سرمایه بین چند پروژه از حوزه‌ها و استان‌های مختلف تقسیم می‌شود.
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/search/controls";
import { Refresh2 } from "@/components/iconsax";
import { provincePaths } from "@/data/iran-map";
import { projectGroups } from "@/data/taxonomy";
import type { Listing } from "@/types";
import { riskLabel, cn, faNumber } from "@/lib/utils";
import { billion, opp, projectListings } from "./shared";

const STOPS = [20, 30, 40, 50, 75, 100, 150, 200, 300, 500];
const SHADES = ["#262c33", "#4a5a70", "#7f8da2", "#b3bdcb"];
const riskRank: Record<string, number> = { medium: 1, high: 2, unknown: 3 };
const pool = projectListings.filter((l) => l.routes.includes("investor") && opp(l).minCapital != null);
const groupName = (id: string | null) => projectGroups.find((g) => g.id === id)?.name ?? "";

type Priority = "fast" | "safe" | "spread";
const order: Record<Priority, (a: Listing, b: Listing) => number> = {
  fast: (a, b) => (opp(a).paybackYears ?? 99) - (opp(b).paybackYears ?? 99) || opp(a).minCapital! - opp(b).minCapital!,
  safe: (a, b) => (riskRank[a.risk] ?? 3) - (riskRank[b.risk] ?? 3) || (opp(a).paybackYears ?? 99) - (opp(b).paybackYears ?? 99),
  spread: (a, b) => (opp(a).paybackYears ?? 99) - (opp(b).paybackYears ?? 99),
};

function build(total: number, count: number, priority: Priority, skip: string[]) {
  const picked: Listing[] = [];
  let sum = 0;
  for (const l of [...pool].sort(order[priority])) {
    if (picked.length >= count) break;
    const o = opp(l);
    if (skip.includes(l.id) || sum + o.minCapital! > total) continue;
    if (picked.some((p) => p.group === l.group)) continue;
    if (priority === "spread" && picked.some((p) => p.province === l.province)) continue;
    picked.push(l); sum += o.minCapital!;
  }
  // باقی‌مانده به نسبت حداقل ورود هر پروژه پخش می‌شود، تا سقف نیاز مالی طرح (اگر اعلام شده باشد)
  let rest = total - sum;
  const alloc = picked.map((l) => opp(l).minCapital!);
  for (let round = 0; round < 3 && rest > 0.5; round++) {
    const open = picked.map((l, i) => { const cap = opp(l).budget; return cap == null || alloc[i] < cap ? i : -1; }).filter((i) => i >= 0);
    const base = open.reduce((s, i) => s + opp(picked[i]).minCapital!, 0);
    if (!base) break;
    let used = 0;
    for (const i of open) { const cap = opp(picked[i]).budget ?? Infinity; const add = Math.min(cap - alloc[i], (rest * opp(picked[i]).minCapital!) / base); alloc[i] += add; used += add; }
    rest -= used;
  }
  return { picked, alloc: alloc.map((a) => Math.round(a)), rest: Math.max(0, Math.round(rest)) };
}

export function PortfolioIdea() {
  const [total, setTotal] = useState(100);
  const [count, setCount] = useState("3");
  const [priority, setPriority] = useState<Priority>("spread");
  const [skip, setSkip] = useState<string[]>([]);
  const { picked, alloc, rest } = useMemo(() => build(total, Number(count), priority, skip), [total, count, priority, skip]);

  const known = picked.map((l, i) => ({ y: opp(l).paybackYears, w: alloc[i] })).filter((x) => x.y != null);
  const wPayback = known.length ? known.reduce((s, x) => s + x.y! * x.w, 0) / known.reduce((s, x) => s + x.w, 0) : null;
  const firstIncome = Math.min(...picked.map((l) => opp(l).firstIncomeMonths ?? Infinity));
  const provs = [...new Set(picked.map((l) => l.province!))];

  return (
    <div className="rounded-[2rem] border border-border bg-white p-8">
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-3">
          <span className="flex justify-between text-[12px] font-bold text-muted-foreground"><span>کل سرمایه</span><span className="text-[15px] font-black text-ink">{billion(total)} تومان</span></span>
          <Slider dir="rtl" min={0} max={STOPS.length - 1} step={1} value={[STOPS.indexOf(total)]} onValueChange={([i]) => { setTotal(STOPS[i]); setSkip([]); }} aria-label="کل سرمایه" />
        </div>
        <div className="space-y-2">
          <span className="text-[12px] font-bold text-muted-foreground">چند پروژه؟</span>
          <Segmented options={[{ value: "2", label: "۲ پروژه" }, { value: "3", label: "۳ پروژه" }, { value: "4", label: "۴ پروژه" }]} value={count} onChange={(v) => v && setCount(v)} />
        </div>
        <div className="space-y-2">
          <span className="text-[12px] font-bold text-muted-foreground">برایتان مهم‌تر است</span>
          <Segmented options={[{ value: "fast", label: "بازگشت زودتر" }, { value: "safe", label: "ریسک کمتر" }, { value: "spread", label: "پخش در استان‌ها" }]} value={priority} onChange={(v) => { if (v) { setPriority(v as Priority); setSkip([]); } }} />
        </div>
      </div>

      {/* نوار تقسیم سرمایه */}
      <div className="mt-8 flex h-14 overflow-hidden rounded-2xl bg-[repeating-linear-gradient(135deg,#eef2f7_0_8px,#f7f9fc_8px_16px)]">
        {picked.map((l, i) => (
          <motion.div key={l.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1, width: `${(alloc[i] / total) * 100}%` }} transition={{ type: "spring", stiffness: 160, damping: 24 }}
            className="flex min-w-0 items-center justify-center border-l-2 border-white px-2 text-[13px] font-extrabold text-white" style={{ background: SHADES[i] }}>
            <span className="truncate">{faNumber(Math.round((alloc[i] / total) * 100))}٪</span>
          </motion.div>
        ))}
        {rest > 0 && <div className="flex flex-1 items-center justify-center px-2 text-[12px] font-bold text-muted-foreground"><span className="truncate">آزاد: {billion(rest)}</span></div>}
      </div>

      <div className="mt-6 grid grid-cols-[1fr_17rem] gap-6">
        <ul className="space-y-2.5">
          {picked.map((l, i) => { const o = opp(l); return (
            <motion.li key={l.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 rounded-2xl border border-border p-3 pr-4">
              <span className="size-3.5 shrink-0 rounded-full" style={{ background: SHADES[i] }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-extrabold text-ink">{l.title}</p>
                <p className="mt-0.5 truncate text-[12.5px] font-semibold text-muted-foreground">{groupName(l.group)} · {l.province}، {l.city} · بازگشت {o.paybackYears != null ? `${faNumber(o.paybackYears)} سال` : "نامعلوم"} · ریسک {riskLabel[l.risk]}</p>
              </div>
              <div className="text-left">
                <p className="text-[15px] font-black text-ink">{billion(alloc[i])}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">حداقل ورود {faNumber(o.minCapital!)}</p>
              </div>
              <Button type="button" variant="plain" size="auto" onClick={() => setSkip([...skip, l.id])} aria-label="پروژه‌ی دیگری بگذار" title="پروژه‌ی دیگری بگذار" className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-ink/60 hover:border-ink/30 hover:text-ink"><Refresh2 size={16} /></Button>
            </motion.li>); })}
          {picked.length < Number(count) && <li className="rounded-2xl border border-dashed border-border p-4 text-[13px] font-semibold leading-7 text-muted-foreground">با این مبلغ، پروژه‌ی دیگری از حوزه‌ای تازه{priority === "spread" ? " و استانی تازه" : ""} نماند. کل سرمایه را بیشتر کنید.</li>}
        </ul>

        <div className="rounded-2xl bg-muted/70 p-5">
          <svg viewBox="8 8 344 316" className="mx-auto h-auto w-44" aria-hidden>
            {Object.entries(provincePaths).map(([name, d]) => { const k = picked.findIndex((p) => p.province === name);
              return <path key={name} d={d} strokeWidth="0.8" className="stroke-white transition-[fill] duration-500" style={{ fill: k >= 0 ? SHADES[k] : "rgb(47 53 51 / 0.08)" }} />; })}
          </svg>
          <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
            <div><dt className="text-[11px] font-semibold text-muted-foreground">بازگشت میانگین</dt><dd className="text-[15px] font-black text-ink">{wPayback != null ? `${faNumber(Math.round(wPayback * 10) / 10)} سال` : "نامعلوم"}</dd></div>
            <div><dt className="text-[11px] font-semibold text-muted-foreground">اولین دریافت</dt><dd className="text-[15px] font-black text-ink">{Number.isFinite(firstIncome) ? `ماه ${faNumber(firstIncome)}` : "نامعلوم"}</dd></div>
            <div><dt className="text-[11px] font-semibold text-muted-foreground">استان‌ها</dt><dd className="text-[15px] font-black text-ink">{faNumber(provs.length)}</dd></div>
            <div><dt className="text-[11px] font-semibold text-muted-foreground">حوزه‌ها</dt><dd className="text-[15px] font-black text-ink">{faNumber(new Set(picked.map((l) => l.group)).size)}</dd></div>
          </dl>
          <p className={cn("mt-4 text-[11.5px] font-semibold leading-6 text-muted-foreground")}>بازگشت میانگین با وزن سهم هر پروژه حساب شده است.</p>
        </div>
      </div>
    </div>
  );
}
