"use client";
// ایده ۴ «این یا آن؟»: مثل معاینه‌ی چشم («کدام واضح‌تر است؟ ۱ یا ۲؟»). کاربر فیلتر پر نمی‌کند؛
// در پنج دور بین دو پروژه یکی را انتخاب می‌کند. در هر دور دو پروژه فقط در یک ویژگی فرق جدی دارند و همان ویژگی واضح دیده می‌شود.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { SignaturePhoto } from "@/components/listing/signature-photo";
import { ArrowLeft, CloseCircle, Refresh2 } from "@/components/iconsax";
import { projectGroups } from "@/data/taxonomy";
import { listings } from "@/lib/listings";
import { rank } from "@/lib/match";
import { useStore } from "@/lib/store";
import type { Listing, SearchCriteria } from "@/types";
import { cn, faNumber, incomeLabel, riskLabel } from "@/lib/utils";
import { MiniResult, fullData, opp } from "./shared";

type Dim = "amount" | "payback" | "risk" | "income" | "group";
const groupName = (id: string | null) => projectGroups.find((g) => g.id === id)?.name ?? "";
const pool = fullData.filter((l) => l.routes.includes("investor") && opp(l).minCapital! <= 500);

const feat = (l: Listing): Record<Exclude<Dim, "group">, number> => {
  const o = opp(l);
  return {
    amount: Math.log(o.minCapital!) / Math.log(500),
    payback: o.paybackYears! / 15,
    risk: l.risk === "medium" ? 0 : l.risk === "high" ? 1 : 0.5,
    income: o.income === "periodic" ? 0 : o.income === "end" ? 1 : 0.5,
  };
};

const rounds: { dim: Dim; q: string; need: number }[] = [
  { dim: "amount", q: "کدام برایتان راحت‌تر است؟", need: 0.25 },
  { dim: "payback", q: "کدام را ترجیح می‌دهید؟", need: 0.15 },
  { dim: "risk", q: "با کدام آسوده‌ترید؟", need: 0.9 },
  { dim: "income", q: "پولتان را چطور پس بگیرید؟", need: 0.9 },
  { dim: "group", q: "کدام حوزه را بیشتر دوست دارید؟", need: 1 },
];

/** برای هر دور، دو پروژه‌ای که در همان ویژگی بیشترین فرق و در بقیه کمترین فرق را دارند */
const pairs: [Listing, Listing][] = (() => {
  const used = new Set<string>(), usedImg = new Set<string>(), out: [Listing, Listing][] = [];
  for (const r of rounds) {
    let best: [Listing, Listing] | null = null, bestScore = -Infinity;
    for (const a of pool) for (const b of pool) {
      if (a.id >= b.id || used.has(a.id) || used.has(b.id) || a.image === b.image || usedImg.has(a.image) || usedImg.has(b.image)) continue;
      const fa = feat(a), fb = feat(b);
      const contrast = r.dim === "group" ? (a.group !== b.group ? 1 : 0) : Math.abs(fa[r.dim] - fb[r.dim]);
      if (contrast < r.need) continue;
      const others = (Object.keys(fa) as (keyof typeof fa)[]).filter((k) => k !== r.dim).reduce((s, k) => s + Math.abs(fa[k] - fb[k]), 0) + (r.dim !== "group" && a.group !== b.group ? 0.3 : 0);
      const score = contrast * 2 - others;
      if (score > bestScore) { bestScore = score; best = [a, b]; }
    }
    if (best) { out.push(best); best.forEach((l) => { used.add(l.id); usedImg.add(l.image); }); }
  }
  return out;
})();

const facts = (l: Listing): { dim: Dim; label: string; value: string }[] => {
  const o = opp(l);
  return [
    { dim: "amount", label: "حداقل ورود", value: `${faNumber(o.minCapital!)} میلیارد تومان` },
    { dim: "payback", label: "برگشت اصل پول", value: `${faNumber(o.paybackYears!)} سال` },
    { dim: "risk", label: "ریسک", value: riskLabel[l.risk] },
    { dim: "income", label: "نوع دریافت", value: incomeLabel[o.income] ?? "اعلام نشده" },
    { dim: "group", label: "حوزه", value: groupName(l.group) },
  ];
};

type Pick = Listing | null;
interface Trait { key: Dim; label: string; apply: (c: SearchCriteria) => void }

function infer(picks: Pick[]): Trait[] {
  const out: Trait[] = [];
  picks.forEach((p, i) => {
    if (!p) return;
    const [a, b] = pairs[i]; const other = p === a ? b : a; const o = opp(p), q = opp(other);
    const dim = rounds[i].dim;
    if (dim === "amount") { const cap = Math.min(500, Math.max(10, Math.round(o.minCapital! * 2))); out.push({ key: dim, label: o.minCapital! < q.minCapital! ? `ورود با مبلغ کمتر (تا ${faNumber(cap)} میلیارد)` : `ورود با مبلغ بالا (تا ${faNumber(cap)} میلیارد)`, apply: (c) => { c.amount = [1, cap]; } }); }
    if (dim === "payback" && o.paybackYears! < q.paybackYears!) out.push({ key: dim, label: `برگشت پول تا ${faNumber(o.paybackYears! + 1)} سال`, apply: (c) => { c.filters.horizon = o.paybackYears! + 1; } });
    if (dim === "payback" && o.paybackYears! > q.paybackYears!) out.push({ key: dim, label: "برای سود بیشتر، صبر بلندمدت را می‌پذیرید", apply: () => {} });
    if (dim === "risk" && p.risk === "medium") out.push({ key: dim, label: "ریسک متوسط، نه بیشتر", apply: (c) => { c.filters.risk = "medium"; } });
    if (dim === "risk" && p.risk === "high") out.push({ key: dim, label: "ریسک بالا را می‌پذیرید", apply: () => {} });
    if (dim === "income") out.push({ key: dim, label: o.income === "periodic" ? "درآمد دوره‌ای در طول پروژه" : "عایدی یکجا در پایان پروژه", apply: (c) => { c.filters.income = o.income; } });
    if (dim === "group") out.push({ key: dim, label: `حوزه‌ی ${groupName(p.group)}`, apply: (c) => { c.groups = [p.group!]; } });
  });
  return out;
}

function DuelCard({ l, focus, onPick, side }: { l: Listing; focus: Dim; onPick: () => void; side: "a" | "b" }) {
  return (
    <motion.button type="button" onClick={onPick} initial={{ opacity: 0, x: side === "a" ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group/duel flex flex-col overflow-hidden rounded-[1.75rem] border border-border bg-white text-right outline-none transition-[border-color,box-shadow,transform] hover:-translate-y-1 hover:border-ink/25 hover:shadow-[0_26px_50px_-34px_rgb(22_32_48/0.5)] focus-visible:ring-4 focus-visible:ring-ring/30">
      <SignaturePhoto src={l.image} alt={l.title} className="m-2 aspect-[16/7] rounded-[1.35rem]" sizes="30vw" />
      <div className="flex flex-1 flex-col gap-3 p-5 pt-2">
        <p className="line-clamp-1 text-[16px] font-extrabold text-ink">{l.title}</p>
        <dl className="space-y-1.5">
          {facts(l).map((f) => (
            <div key={f.dim} className={cn("flex items-center justify-between rounded-xl px-3 py-2 transition-[filter,opacity,background-color] duration-300",
              f.dim === focus ? "bg-ink text-white" : "opacity-55 blur-[1.6px] group-hover/duel:opacity-80 group-hover/duel:blur-0")}>
              <dt className={cn("text-[12.5px] font-semibold", f.dim === focus ? "text-white/70" : "text-muted-foreground")}>{f.label}</dt>
              <dd className="text-[14px] font-extrabold">{f.value}</dd>
            </div>
          ))}
        </dl>
        <span className="mt-auto inline-flex items-center gap-1.5 self-end rounded-full bg-muted px-4 py-2 text-[13px] font-extrabold text-ink transition-colors group-hover/duel:bg-ink group-hover/duel:text-white">این یکی<ArrowLeft size={16} /></span>
      </div>
    </motion.button>
  );
}

export function DuelIdea() {
  const router = useRouter();
  const [picks, setPicks] = useState<Pick[]>([]);
  const [off, setOff] = useState<Dim[]>([]);
  const step = picks.length, done = step >= pairs.length;
  const traits = useMemo(() => infer(picks), [picks]);
  const criteria = useMemo<SearchCriteria>(() => {
    const c: SearchCriteria = { route: "investor", groups: [], provinces: [], amount: null, filters: {} };
    traits.filter((t) => !off.includes(t.key)).forEach((t) => t.apply(c));
    return c;
  }, [traits, off]);
  const fit = useMemo(() => (done ? rank(listings, criteria).filter((r) => r.score >= 50) : []), [done, criteria]);
  const restart = () => { setPicks([]); setOff([]); };
  const go = () => { const s = useStore.getState(); s.setCriteria(criteria); s.setStarted(true); router.push("/opportunities"); };

  return (
    <div className="rounded-[2rem] border border-border bg-[linear-gradient(180deg,#fff,#f7f9fc)] p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" aria-label={`دور ${faNumber(Math.min(step + 1, pairs.length))} از ${faNumber(pairs.length)}`}>
          {pairs.map((_, i) => <span key={i} className={cn("grid size-7 place-items-center rounded-full border-2 text-[11px] font-black transition-colors", i < step ? "border-cobalt bg-cobalt text-white" : i === step ? "border-cobalt text-cobalt-deep" : "border-ink/15 text-ink/30")}>{faNumber(i + 1)}</span>)}
        </div>
        {step > 0 && <Button type="button" variant="ghost" onClick={restart} className="h-9 gap-1.5 rounded-full text-[13px] font-bold"><Refresh2 size={16} />از اول</Button>}
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
            <h3 className="text-center text-[1.6rem] font-black text-ink">{rounds[step].q}</h3>
            <p className="mt-1 text-center text-[13.5px] font-semibold text-muted-foreground">دو پروژه در «{facts(pairs[step][0]).find((f) => f.dim === rounds[step].dim)!.label}» فرق دارند؛ بقیه‌ی ویژگی‌ها نزدیک به هم است.</p>
            <div className="relative mt-6 grid grid-cols-2 gap-10">
              <DuelCard l={pairs[step][0]} focus={rounds[step].dim} side="a" onPick={() => setPicks([...picks, pairs[step][0]])} />
              <span className="absolute left-1/2 top-1/2 z-10 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-[#f7f9fc] bg-white text-[15px] font-black text-ink shadow-[0_10px_30px_-14px_rgb(22_32_48/0.5)]">یا</span>
              <DuelCard l={pairs[step][1]} focus={rounds[step].dim} side="b" onPick={() => setPicks([...picks, pairs[step][1]])} />
            </div>
            <div className="mt-5 text-center"><Button type="button" variant="ghost" onClick={() => setPicks([...picks, null])} className="h-10 rounded-full px-5 text-[13.5px] font-bold text-muted-foreground">فرقی نمی‌کند</Button></div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid grid-cols-[1fr_1.1fr] gap-8">
            <div>
              <h3 className="text-[1.6rem] font-black leading-[1.6] text-ink">از انتخاب‌هایتان این را فهمیدیم</h3>
              <p className="mt-1 text-[13.5px] font-semibold leading-7 text-muted-foreground">هر مورد را که درست نیست بردارید؛ نتیجه‌ها همان لحظه عوض می‌شود.</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {traits.length === 0 && <li className="text-[14px] font-semibold text-muted-foreground">ترجیح مشخصی پیدا نشد؛ همه‌ی پروژه‌ها را می‌بینید.</li>}
                {traits.map((t) => { const isOff = off.includes(t.key); return (
                  <li key={t.key}>
                    <Button type="button" variant="plain" size="auto" onClick={() => setOff(isOff ? off.filter((k) => k !== t.key) : [...off, t.key])} aria-pressed={!isOff}
                      className={cn("h-10 gap-2 rounded-full border px-4 text-[13.5px] font-bold transition-colors", isOff ? "border-dashed border-ink/20 text-ink/40 line-through" : "border-cobalt bg-cobalt text-white")}>
                      {t.label}{!isOff && <CloseCircle size={16} />}
                    </Button>
                  </li>); })}
              </ul>
              <p className="mt-7 text-[3rem] font-black leading-none text-ink">{faNumber(fit.length)}</p>
              <p className="mt-1 text-[14px] font-bold text-muted-foreground">پروژه با این سلیقه</p>
              <Button type="button" onClick={go} className="mt-5 h-12 gap-2 rounded-full px-6 font-extrabold">دیدن همه نتیجه‌ها<ArrowLeft size={18} /></Button>
            </div>
            <div className="space-y-2.5">{fit.slice(0, 4).map((r) => <MiniResult key={r.listing.id} l={r.listing} score={r.score} />)}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
