// توصیف خوانای شرایط کاربر: برای چیپ‌های «فیلترهای فعال»، خلاصه ذخیره شرایط و کارت شرایط ذخیره‌شده.
import { advancedFields, profileFields } from "@/data/fields";
import { routes, routeSubcategories } from "@/data/routes";
import { projectGroups } from "@/data/taxonomy";
import { advisories } from "@/data/advisories";
import type { FilterValue, SearchCriteria } from "@/types";
import { faNumber } from "./utils";

export interface CriteriaChip { key: string; label: string; kind: "group" | "province" | "amount" | "filter"; value?: string }

const fieldById = Object.fromEntries([...advancedFields, ...profileFields].map((f) => [f.id, f]));
const subtypeName = (id: string) => projectGroups.flatMap((g) => g.subtypes).find((s) => s.id === id)?.name ?? id;
const dynamicLabel = (field: string, v: string) =>
  field === "subtypes" ? subtypeName(v)
  : field === "fundType" ? routeSubcategories.fund?.find((x) => x.id === v)?.name ?? v
  : field === "saleCategory" ? routeSubcategories.buyer?.find((x) => x.id === v)?.name ?? v
  : field === "charityType" ? routeSubcategories.charity?.find((x) => x.id === v)?.name ?? v : v;

function valueText(id: string, v: FilterValue): string {
  const f = fieldById[id];
  const opt = (x: string) => f?.options?.find((o) => o.value === x)?.label ?? dynamicLabel(id, x);
  if (v === true) return "";
  if (Array.isArray(v)) return typeof v[0] === "number" ? `${faNumber(v[0] as number)} تا ${faNumber(v[1] as number)}${f?.unit ? ` ${f.unit}` : ""}` : (v as string[]).map(opt).join("، ");
  if (typeof v === "number") return `${faNumber(v)}${f?.unit ? ` ${f.unit}` : ""}`;
  return opt(String(v));
}

export function describeCriteria(c: SearchCriteria): CriteriaChip[] {
  const route = routes.find((r) => r.id === c.route)!;
  const out: CriteriaChip[] = [];
  for (const g of c.groups) out.push({ key: `group:${g}`, kind: "group", value: g, label: projectGroups.find((x) => x.id === g)?.name ?? g });
  for (const p of c.provinces) out.push({ key: `province:${p}`, kind: "province", value: p, label: p });
  if (c.amount && route.amount) out.push({ key: "amount", kind: "amount", label: `${faNumber(c.amount[0])} تا ${faNumber(c.amount[1])} ${route.amount.unit}` });
  for (const [id, v] of Object.entries(c.filters)) {
    if (id.startsWith("adv:")) {
      const [, st, qid] = id.split(":");
      const q = advisories[st]?.questions.find((x) => x.id === qid);
      out.push({ key: id, kind: "filter", value: id, label: `${subtypeName(st)}: ${q?.options.find((o) => o.value === v)?.label ?? String(v)}` });
      continue;
    }
    const f = fieldById[id];
    const text = valueText(id, v);
    const label = f?.label ?? id;
    out.push({ key: id, kind: "filter", value: id, label: text ? (text.length > 34 ? `${label}: ${text.slice(0, 32)}…` : `${label}: ${text}`) : label });
  }
  return out;
}

export const hasAnyCriteria = (c: SearchCriteria) => c.groups.length > 0 || c.provinces.length > 0 || c.amount != null || Object.keys(c.filters).length > 0;

export const phaseLabel: Record<string, string> = { new: "احداث جدید", unfinished: "نیمه‌تمام", existing: "موجود" };
export const ownerLabel: Record<string, string> = { public: "عمومی یا دولتی", private: "خصوصی" };
export const revenueLabel: Record<string, string> = { sale: "فروش", rent: "اجاره", public: "پرداخت قراردادی دستگاه عمومی", mixed: "ترکیبی", service: "خدمات", product: "محصول", operate: "مدیریت بهره‌برداری" };
