// «برگه داده» هر پروژه برای صفحه جزئیات کانسپت‌ها.
// پایه: شمارش فیلدهای ۲۵۴ پروژه، ۹ صندوق و ۱۰ آگهی فروش نسخه مرجع (دور ۲۱).
// همیشه هست: نوع، محل، مرحله، مدل قرارداد، نوع درآمد، ریسک، وضعیت حقوقی، تامین مالی، نکته احتیاط.
// بیشتر وقت‌ها هست: مدت اجرا (۸۹٪)، کارشناس (۸۵٪)، شاخص اصلی مثل زیربنا (۷۱٪)، نیاز مالی طرح (۶۵٪)، صاحب پروژه (۶۵٪)، موارد بررسی (۶۵٪).
// گاهی هست: حداقل ورود (۳۳٪)، مراحل (۳۲٪)، مدت قرارداد، اولین درآمد، قفل سرمایه، دوره بازگشت پایه و بدبینانه (۲۷ تا ۳۱٪).
// قاعده: عددی که اعلام نشده صفر فرض نمی‌شود، روی نمودار نمی‌آید و جدا با «اعلام نشده» نام برده می‌شود.
import { listings, payoutLabel } from "@/lib/listings";
import { projectGroups } from "@/data/taxonomy";
import type { Fund, Listing, Opportunity, SaleItem } from "@/types";
import { incomeLabel, legalLabel, riskLabel } from "@/lib/utils";

export interface Peer { id: string; title: string; v: number }
export interface PeerSet { label: string; unit: string; me: number; values: Peer[]; scope: string; below: number }
export interface TimeLane { id: string; label: string; from: number; to: number | null; point?: boolean; tone: "exec" | "lock" | "income" | "pay" | "term" }
export interface Ladder { id: string; label: string; steps: string[]; at: number | null; note?: string; warn?: boolean }
export interface Known { label: string; ok: boolean }

export interface Sheet {
  kind: Listing["kind"];
  group: string;
  money: { label: string; value: number; unit: string } | null;
  moneyPeers: PeerSet | null;
  metric: { label: string; unit: string; value: number } | null;
  metricPeers: PeerSet | null;
  lanes: TimeLane[];
  missingTime: string[];
  horizon: number;
  ladders: Ladder[];
  income: { id: string; label: string; first: number | null; term: number | null };
  steps: string[];
  checks: string[];
  known: Known[];
  fund?: { minimum: number; forecast: number | null; forecastPeers: PeerSet | null; payout: string; payoutLabel: string; payoutMonths: number[]; duration: number | null; guarantees: { label: string; state: "yes" | "no" | "unknown" }[] };
  sale?: { price: number | null; area: number | null; ppm: number | null; ppmPeers: PeerSet | null; unit: string };
}

const groupName = (id: string | null) => projectGroups.find((g) => g.id === id)?.name ?? "";

function peersOf(me: Listing, pick: (o: Opportunity) => number | null | undefined, sameGroup: boolean, label: string, unit: string): PeerSet | null {
  const o = me.raw as Opportunity; const v = pick(o);
  if (v == null) return null;
  const pool = listings.filter((l) => l.kind === "project" && pick(l.raw as Opportunity) != null);
  let scope = `گروه «${groupName(me.group)}»`;
  let set = sameGroup ? pool.filter((l) => l.group === me.group) : pool;
  if (set.length < 5) { set = pool; scope = "همه پروژه‌ها"; }
  const values = set.map((l) => ({ id: l.id, title: l.title, v: pick(l.raw as Opportunity)! }));
  return { label, unit, me: v, values, scope, below: values.filter((x) => x.v < v).length };
}

function projectSheet(l: Listing): Sheet {
  const o = l.raw as Opportunity;
  const exec = o.executionMonths ?? o.terms?.executionMonths ?? null;
  const term = o.durationYears != null ? o.durationYears * 12 : null;
  const pay = o.paybackYears != null ? o.paybackYears * 12 : null;
  const down = o.paybackDownsideYears != null ? o.paybackDownsideYears * 12 : null;
  const lanes: TimeLane[] = [];
  const missing: string[] = [];
  if (exec != null) lanes.push({ id: "exec", label: "اجرا", from: 0, to: exec, tone: "exec" }); else missing.push("مدت اجرا");
  if (o.lockupMonths != null) lanes.push({ id: "lock", label: "قفل سرمایه", from: 0, to: o.lockupMonths, tone: "lock" }); else missing.push("قفل سرمایه");
  if (o.firstIncomeMonths != null) lanes.push({ id: "first", label: "اولین درآمد", from: o.firstIncomeMonths, to: null, point: true, tone: "income" }); else missing.push("اولین درآمد");
  if (pay != null) lanes.push({ id: "pay", label: "بازگشت سرمایه", from: pay, to: down != null && down > pay ? down : null, tone: "pay" }); else missing.push("دوره بازگشت");
  if (term != null) lanes.push({ id: "term", label: "مدت قرارداد", from: 0, to: term, tone: "term" }); else missing.push("مدت قرارداد");
  const max = Math.max(12, ...lanes.map((x) => Math.max(x.from, x.to ?? 0)));
  const horizon = Math.ceil((max * 1.08) / 12) * 12;

  const money = o.minCapital != null ? { label: "حداقل ورود", value: o.minCapital, unit: "میلیارد تومان" } : o.budget != null ? { label: "نیاز مالی طرح", value: o.budget, unit: "میلیارد تومان" } : null;
  const moneyPeers = o.minCapital != null
    ? peersOf(l, (x) => x.minCapital, true, "حداقل ورود", "میلیارد تومان")
    : peersOf(l, (x) => x.budget, true, "نیاز مالی طرح", "میلیارد تومان");
  const metricPeers = o.metric ? peersOf(l, (x) => (x.metric && x.metric.label === o.metric!.label && x.metric.unit === o.metric!.unit ? x.metric.value : null), false, o.metric.label, o.metric.unit) : null;

  const riskAt = o.risk === "unknown" ? null : ["low", "medium", "high"].indexOf(o.risk);
  const ladders: Ladder[] = [
    { id: "risk", label: "سطح ریسک", steps: ["کم", "متوسط", "زیاد"], at: riskAt, note: o.risk === "unknown" ? "ارزیابی‌نشده" : undefined, warn: o.risk === "high" },
    { id: "legal", label: "وضعیت حقوقی", steps: ["مستندات احراز نشده", "نیازمند بررسی حقوقی", "احراز شده"], at: o.legalStatus === "sample" ? 0 : o.legalStatus === "review" ? 1 : null, note: o.legalStatus in legalLabel ? undefined : o.legalStatus },
    { id: "phase", label: "مرحله پروژه", steps: ["احداث جدید", "نیمه‌تمام", "موجود"], at: ["new", "unfinished", "existing"].indexOf(o.phase) },
  ];
  if (o.owner) ladders.push({ id: "owner", label: "صاحب پروژه", steps: ["عمومی یا دولتی", "خصوصی"], at: o.owner === "public" ? 0 : 1 });

  const known: Known[] = [
    [money?.label ?? "مبلغ ورود", money != null], ["مدت اجرا", exec != null], ["اولین درآمد", o.firstIncomeMonths != null], ["قفل سرمایه", o.lockupMonths != null],
    ["دوره بازگشت", pay != null], ["حالت بدبینانه", down != null], ["مدت قرارداد", term != null], [o.metric?.label ?? "شاخص اصلی", o.metric != null],
    ["صاحب پروژه", !!o.owner], ["شیوه بازپرداخت", !!o.repay], ["مالکیت و سهم", !!o.ownership], ["کارشناس", !!o.expert],
  ].map(([label, ok]) => ({ label: label as string, ok: ok as boolean }));

  return {
    kind: "project", group: groupName(l.group), money, moneyPeers, metric: o.metric, metricPeers, lanes, missingTime: missing, horizon, ladders,
    income: { id: o.income, label: incomeLabel[o.income] ?? o.income, first: o.firstIncomeMonths, term },
    steps: o.steps ?? [], checks: o.checks ?? [], known,
  };
}

const payoutEvery: Record<string, number> = { "1": 1, "3": 3, "6": 6, "12": 12 };

function fundSheet(l: Listing): Sheet {
  const f = l.raw as Fund;
  const every = payoutEvery[f.payout];
  const months = every ? Array.from({ length: Math.floor(12 / every) }, (_, i) => (i + 1) * every) : f.payout === "maturity" && f.durationMonths ? [f.durationMonths] : [];
  const fundsWith = listings.filter((x) => x.kind === "fund" && (x.raw as Fund).forecast != null);
  const forecastPeers: PeerSet | null = f.forecast != null ? { label: "بازده پیش‌بینی سالانه", unit: "درصد", me: f.forecast, values: fundsWith.map((x) => ({ id: x.id, title: x.title, v: (x.raw as Fund).forecast! })), scope: "صندوق‌ها و طرح‌های جمعی", below: fundsWith.filter((x) => (x.raw as Fund).forecast! < f.forecast!).length } : null;
  const st = (v: boolean | null) => (v == null ? "unknown" : v ? "yes" : "no") as "yes" | "no" | "unknown";
  return {
    kind: "fund", group: "صندوق‌ها و طرح‌های جمعی", money: { label: "حداقل ورود", value: f.minimumMillion, unit: "میلیون تومان" }, moneyPeers: null, metric: null, metricPeers: null,
    lanes: f.durationMonths ? [{ id: "term", label: "مدت طرح", from: 0, to: f.durationMonths, tone: "term" }] : [], missingTime: f.durationMonths ? [] : ["مدت طرح"], horizon: Math.max(12, Math.ceil(((f.durationMonths ?? 12) * 1.08) / 12) * 12),
    ladders: [{ id: "risk", label: "سطح ریسک", steps: ["کم", "متوسط", "زیاد"], at: f.risk === "unknown" ? null : ["low", "medium", "high"].indexOf(f.risk), note: f.risk === "unknown" ? "ارزیابی‌نشده" : undefined, warn: f.risk === "high" }],
    income: { id: f.payout, label: payoutLabel[f.payout] ?? f.payout, first: every ?? null, term: f.durationMonths },
    steps: f.steps ?? [], checks: [], known: [
      { label: "حداقل ورود", ok: true }, { label: "بازده پیش‌بینی", ok: f.forecast != null }, { label: "زمان پرداخت سود", ok: !!f.payout }, { label: "مدت طرح", ok: f.durationMonths != null },
      { label: "تضمین بانکی", ok: f.bank.exists != null }, { label: "احراز سند تضمین", ok: f.bank.verified }, { label: "شرایط خروج", ok: !!f.exit },
    ],
    fund: {
      minimum: f.minimumMillion, forecast: f.forecast, forecastPeers, payout: f.payout, payoutLabel: payoutLabel[f.payout] ?? f.payout, payoutMonths: months, duration: f.durationMonths,
      guarantees: [{ label: "تضمین بانکی", state: st(f.bank.exists) }, { label: "سند تضمین احراز شده", state: f.bank.verified ? "yes" : "no" }, { label: "پوشش اصل سرمایه", state: st(f.bank.principal) }, { label: "پوشش سود", state: st(f.bank.profit) }],
    },
  };
}

function saleSheet(l: Listing): Sheet {
  const s = l.raw as SaleItem;
  const unit = s.category === "scrap" ? "میلیون تومان" : "میلیارد تومان";
  const ppmOf = (x: SaleItem) => (x.category !== "scrap" && x.price != null && x.area ? (x.price * 1000) / x.area : null);
  const ppm = ppmOf(s);
  const same = listings.filter((x) => x.kind === "sale" && ppmOf(x.raw as SaleItem) != null);
  return {
    kind: "sale", group: l.tags[0] ?? "", money: s.price != null ? { label: "قیمت پایه", value: s.price, unit } : null, moneyPeers: null, metric: s.area ? { label: "مساحت", unit: "مترمربع", value: s.area } : null, metricPeers: null,
    lanes: [], missingTime: [], horizon: 12,
    ladders: [], income: { id: "sale", label: "خرید قطعی", first: null, term: null }, steps: [], checks: [],
    known: [{ label: "قیمت پایه", ok: s.price != null }, { label: "مساحت", ok: !!s.area }, { label: "محدوده", ok: !!s.neighborhood }, { label: "موضوع عرضه", ok: !!s.subject || !!s.quantity }],
    sale: { price: s.price, area: s.area ?? null, ppm, unit, ppmPeers: ppm != null ? { label: "قیمت هر مترمربع", unit: "میلیون تومان", me: ppm, values: same.map((x) => ({ id: x.id, title: x.title, v: ppmOf(x.raw as SaleItem)! })), scope: "آگهی‌های فروش", below: same.filter((x) => ppmOf(x.raw as SaleItem)! < ppm).length } : null },
  };
}

export function sheetOf(l: Listing): Sheet {
  return l.kind === "fund" ? fundSheet(l) : l.kind === "sale" ? saleSheet(l) : projectSheet(l);
}

export const riskText = (r: string) => riskLabel[r] ?? r;
