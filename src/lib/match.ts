// امتیاز تطابق (۰ تا ۱۰۰) — یک منطق مشترک برای نتایج فرم و پیشنهادهای دستیار.
// شرطی که داده‌اش نامعلوم است نصف امتیاز می‌گیرد و «نیازمند بررسی» علامت می‌خورد.
import type { MatchReason, MatchResult, Opportunity, SearchCriteria } from "@/types";

export const WEIGHTS = { amount: 30, category: 20, location: 15, return: 20, risk: 15 } as const;
export const ASSISTANT_MAX_RESULTS = 10;

type Status = MatchReason["status"];
const riskRank: Record<string, number> = { low: 1, medium: 2, high: 3 };

export function matchOpportunity(o: Opportunity, c: SearchCriteria): MatchResult {
  const checks: { key: keyof typeof WEIGHTS; label: string; status: Status }[] = [];
  const add = (key: keyof typeof WEIGHTS, label: string, status: Status) => checks.push({ key, label, status });

  if (c.amount) add("amount", "مبلغ ورود در بازه شما", o.minCapital == null ? "unknown" : o.minCapital <= c.amount[1] ? "met" : "unmet");
  if (c.groups.length || c.subtypes.length) {
    const ok = (!c.groups.length || c.groups.includes(o.group)) && (!c.subtypes.length || (o.subtype != null && c.subtypes.includes(o.subtype)));
    add("category", "نوع پروژه", ok ? "met" : "unmet");
  }
  if (c.provinces.length) add("location", "استان", c.provinces.includes(o.province) ? "met" : "unmet");

  const horizon = c.horizon as number | undefined;
  const irrMin = c.irrMin as number | undefined;
  if (horizon != null) add("return", "دوره بازگشت در افق شما", o.paybackYears == null ? "unknown" : o.paybackYears <= horizon ? "met" : "unmet");
  if (irrMin != null) add("return", "بازده سالانه", o.irr == null ? "unknown" : o.irr >= irrMin ? "met" : "unmet");

  const risk = c.risk as string | undefined;
  if (risk) add("risk", "سطح ریسک", !riskRank[o.risk] ? "unknown" : riskRank[o.risk] <= riskRank[risk] ? "met" : "unmet");

  let total = 0, earned = 0;
  for (const key of Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]) {
    const group = checks.filter((x) => x.key === key);
    if (!group.length) continue;
    total += WEIGHTS[key];
    const share = group.reduce((s, x) => s + (x.status === "met" ? 1 : x.status === "unknown" ? 0.5 : 0), 0) / group.length;
    earned += WEIGHTS[key] * share;
  }
  return {
    opportunity: o,
    score: total ? Math.round((earned / total) * 100) : 100,
    reasons: checks.map(({ key, label, status }) => ({ field: key, label, status })),
  };
}

export function rank(list: Opportunity[], c: SearchCriteria, limit?: number): MatchResult[] {
  const out = list
    .filter((o) => o.routes.includes(c.route))
    .map((o) => matchOpportunity(o, c))
    .sort((a, b) => b.score - a.score);
  return limit ? out.slice(0, limit) : out;
}
