// امتیاز تطابق (۰ تا ۱۰۰) — یک منطق مشترک برای نتایج فرم و پیشنهادهای دستیار.
// شرطی که داده‌اش نامعلوم است نصف امتیاز می‌گیرد و «نیازمند بررسی» علامت می‌خورد.
import type { Fund, Listing, MatchReason, MatchResult, Opportunity, SaleItem, SearchCriteria } from "@/types";

export const WEIGHTS = { amount: 30, category: 20, location: 15, return: 20, risk: 15 } as const;
export const ASSISTANT_MAX_RESULTS = 10;
type Bucket = keyof typeof WEIGHTS;
type Status = MatchReason["status"];
const riskRank: Record<string, number> = { low: 1, medium: 2, high: 3 };
const tri = (known: boolean, ok: boolean): Status => (!known ? "unknown" : ok ? "met" : "unmet");

export function matchListing(l: Listing, c: SearchCriteria): MatchResult {
  const checks: { bucket: Bucket; label: string; status: Status }[] = [];
  const add = (bucket: Bucket, label: string, status: Status) => checks.push({ bucket, label, status });
  const f = c.filters;
  const arr = (k: string) => (Array.isArray(f[k]) ? (f[k] as string[]) : []);
  const num = (k: string) => (typeof f[k] === "number" ? (f[k] as number) : undefined);
  const str = (k: string) => (typeof f[k] === "string" && f[k] !== "any" ? (f[k] as string) : undefined);

  if (c.amount) add("amount", "مبلغ در بازه شما", tri(l.amount != null, l.amount != null && l.amount >= c.amount[0] && l.amount <= c.amount[1]));

  if (l.kind === "project") {
    const o = l.raw as Opportunity;
    if (c.groups.length) add("category", "گروه پروژه", tri(true, c.groups.includes(o.group)));
    if (arr("subtypes").length) add("category", "نوع پروژه", tri(true, arr("subtypes").includes(o.subtype)));
    if (arr("phase").length) add("category", "مرحله پروژه", tri(true, arr("phase").includes(o.phase)));
    const owner = str("owner");
    if (owner) add("category", "صاحب پروژه", tri(!!o.owner, o.owner === owner));
    const horizon = num("horizon"), lockup = num("lockup"), first = num("firstIncome"), income = str("income"), irr = num("irrMin");
    if (horizon != null) add("return", "دوره بازگشت در افق شما", tri(o.paybackYears != null, (o.paybackYears ?? 0) <= horizon));
    if (irr != null && irr > 0) add("return", "حداقل بازده سالانه", "unknown");
    if (lockup != null) add("return", "قفل سرمایه", tri(o.lockupMonths != null, (o.lockupMonths ?? 0) <= lockup));
    if (first != null) add("return", "زمان اولین دریافت", tri(o.firstIncomeMonths != null, (o.firstIncomeMonths ?? 0) <= first));
    if (income) add("return", "نوع دریافت درآمد", tri(o.income !== "any", o.income === income));
  }
  if (l.kind === "fund") {
    const fund = l.raw as Fund;
    if (arr("fundType").length) add("category", "نوع صندوق", tri(true, arr("fundType").includes(fund.type)));
    const ret = num("fundReturnMin"), payout = str("payout"), g = str("bankGuarantee");
    if (ret != null && ret > 0) add("return", "حداقل بازده سالانه", tri(fund.forecast != null, (fund.forecast ?? 0) >= ret));
    if (payout) add("return", "دوره دریافت سود", tri(true, fund.payout === payout));
    if (g === "principal" || g === "both") add("risk", "تضمین بانکی", tri(fund.bank.exists != null, !!fund.bank.principal && (g === "principal" || !!fund.bank.profit)));
  }
  if (l.kind === "sale") {
    const s = l.raw as SaleItem;
    if (arr("saleCategory").length) add("category", "دسته", tri(true, arr("saleCategory").includes(s.category)));
    if (arr("usage").length) add("category", "کاربری", tri(!!s.usage, arr("usage").includes(s.usage ?? "")));
    const area = f.area as [number, number] | undefined;
    if (Array.isArray(area)) add("category", "مساحت", tri(s.area != null, (s.area ?? 0) >= area[0] && (s.area ?? 0) <= area[1]));
  }

  if (c.provinces.length) add("location", "استان", tri(l.province != null, c.provinces.includes(l.province ?? "")));
  if (arr("cities").length) add("location", "شهر", tri(l.city != null, arr("cities").includes(l.city ?? "")));

  const risk = str("risk");
  if (risk) add("risk", "سطح ریسک", tri(!!riskRank[l.risk], riskRank[l.risk] <= riskRank[risk]));

  let total = 0, earned = 0;
  for (const bucket of Object.keys(WEIGHTS) as Bucket[]) {
    const group = checks.filter((x) => x.bucket === bucket);
    if (!group.length) continue;
    total += WEIGHTS[bucket];
    earned += (WEIGHTS[bucket] * group.reduce((s, x) => s + (x.status === "met" ? 1 : x.status === "unknown" ? 0.5 : 0), 0)) / group.length;
  }
  return { listing: l, score: total ? Math.round((earned / total) * 100) : 100, reasons: checks.map(({ label, status }) => ({ label, status })) };
}

export function forRoute(list: Listing[], route: string) {
  return list.filter((l) => l.routes.includes(route));
}

export function rank(list: Listing[], c: SearchCriteria, limit?: number): MatchResult[] {
  const strict = c.filters.strictLocation === true;
  const out = forRoute(list, c.route)
    .filter((l) => !strict || !c.provinces.length || c.provinces.includes(l.province ?? ""))
    .map((l) => matchListing(l, c))
    .sort((a, b) => b.score - a.score || (a.listing.amount ?? 1e9) - (b.listing.amount ?? 1e9));
  return limit ? out.slice(0, limit) : out;
}
