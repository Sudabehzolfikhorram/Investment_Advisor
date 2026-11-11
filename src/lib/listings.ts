import { opportunities, generatedOpportunities, funds, saleItems } from "@/data/opportunities";
import { projectGroups } from "@/data/taxonomy";
import { routeSubcategories } from "@/data/routes";
import { usages } from "@/data/provinces";
import { provincePhotos } from "@/data/province-photos";
import type { Fund, Listing, Opportunity, SaleItem } from "@/types";
import { faNumber, riskLabel } from "./utils";

const groupName = (id: string) => projectGroups.find((g) => g.id === id)?.name ?? "";
const subName = (g: string, s: string) => projectGroups.find((x) => x.id === g)?.subtypes.find((x) => x.id === s)?.name ?? "";
const usageName = (u?: string) => usages.find((x) => x.value === u)?.label ?? "";
const fundTypeName = (t: string) => routeSubcategories.fund?.find((x) => x.id === t)?.name ?? t;
export const payoutLabel: Record<string, string> = { "1": "ماهانه", "3": "سه‌ماهه", "6": "شش‌ماهه", "12": "سالانه", maturity: "در سررسید", none: "رشد ارزش" };

function fromProject(o: Opportunity): Listing {
  const amount = o.minCapital ?? o.budget ?? null;
  const amountLabel = o.minCapital != null ? "حداقل ورود" : "نیاز مالی طرح";
  const stats = [
    { label: amountLabel, value: amount != null ? `${faNumber(amount)} میلیارد تومان` : "اعلام نشده" },
    o.paybackYears != null
      ? { label: "دوره بازگشت", value: `${faNumber(o.paybackYears)} سال` }
      : o.executionMonths != null
        ? { label: "مدت اجرا", value: `${faNumber(o.executionMonths)} ماه` }
        : { label: "دوره بازگشت", value: "نامعلوم" },
    { label: "ریسک", value: riskLabel[o.risk] ?? o.risk },
    o.lockupMonths != null
      ? { label: "قفل سرمایه", value: `${faNumber(o.lockupMonths)} ماه` }
      : o.metric
        ? { label: o.metric.label, value: `${faNumber(o.metric.value)} ${o.metric.unit}` }
        : { label: "وضعیت", value: o.stage },
  ];
  return {
    id: o.id, kind: "project", title: o.title, image: o.image, province: o.province, city: o.city,
    routes: o.routes, group: o.group, subtype: o.subtype,
    tags: [groupName(o.group), subName(o.group, o.subtype)].filter(Boolean),
    amount, amountLabel, amountUnit: "میلیارد تومان", stats, risk: o.risk, publishedAt: o.publishedAt, raw: o,
  };
}

const fundImage: Record<string, string> = {
  fixed: "/images/hero/office.jpg", mixed: "/images/hero/towers.jpg", equity: "/images/hero/towers.jpg",
  gold: "/images/types/mineral.webp", realestate: "/images/types/office.webp", landbuilding: "/images/hero/construction.jpg",
  project: "/images/types/residential.webp", crowd: "/images/types/commercial.webp",
};

function fromFund(f: Fund, i: number): Listing {
  return {
    id: f.id, kind: "fund", title: f.title.replace("نمونه فرضی ", ""), image: fundImage[f.type] ?? "/images/hero/towers.jpg",
    province: null, city: null, routes: ["fund"], group: null, subtype: f.type,
    tags: [f.kind === "fund" ? "صندوق" : "طرح جمعی", fundTypeName(f.type)],
    amount: f.minimumMillion, amountLabel: "حداقل ورود", amountUnit: "میلیون تومان",
    stats: [
      { label: "حداقل ورود", value: `${faNumber(f.minimumMillion)} میلیون تومان` },
      { label: "بازده پیش‌بینی", value: f.forecast != null ? `${faNumber(f.forecast)}٪ سالانه` : "اعلام نشده" },
      { label: "ریسک", value: riskLabel[f.risk] ?? f.risk },
      { label: "پرداخت سود", value: payoutLabel[f.payout] ?? f.payout },
    ],
    risk: f.risk, publishedAt: `2026-10-${12 + i}`, raw: f,
  };
}

const saleImage = (s: SaleItem) =>
  s.category === "scrap" ? "/images/types/factory.webp"
  : s.buildingType === "villa" ? "/images/hero/villa.jpg"
  : s.usage === "office" ? "/images/types/office.webp"
  : s.usage === "commercial" ? "/images/types/commercial.webp"
  : s.category === "land" ? "/images/hero/field.jpg" : "/images/types/residential.webp";

function fromSale(s: SaleItem, i: number): Listing {
  const cat = routeSubcategories.buyer?.find((x) => x.id === s.category);
  const type = cat?.children?.find((c) => c.id === (s.buildingType ?? s.scrapType))?.name;
  const unit = s.category === "scrap" ? "میلیون تومان" : "میلیارد تومان";
  return {
    id: s.id, kind: "sale", title: s.title.replace(" — نمونه فرضی", ""), image: saleImage(s),
    province: s.province, city: s.city, routes: ["buyer"], group: null, subtype: s.category,
    tags: [cat?.name ?? "", type ?? usageName(s.usage)].filter(Boolean),
    amount: s.price, amountLabel: "قیمت", amountUnit: unit,
    stats: [
      { label: "قیمت", value: s.price != null ? `${faNumber(s.price)} ${unit}` : "اعلام نشده" },
      s.area != null ? { label: "مساحت", value: `${faNumber(s.area)} مترمربع` } : { label: "مقدار", value: s.quantity ?? "اعلام نشده" },
      { label: "دسته", value: cat?.name ?? "" },
      { label: "محدوده", value: s.neighborhood ?? "اعلام نشده" },
    ],
    risk: "unknown", publishedAt: `2026-10-${20 + i}`, raw: s,
  };
}

export const listings: Listing[] = [
  ...opportunities.map(fromProject),
  ...generatedOpportunities.map(fromProject),
  ...funds.map(fromFund),
  ...saleItems.map(fromSale),
];

export const listingById = (id: string) => listings.find((l) => l.id === id);
export const isNew = (l: Listing, since = "2026-11-01") => l.publishedAt >= since;

/**
 * عکس‌های هر پروژه (حالت چندعکسی): عکس اصلی، عکس شاخص استان و عکس نوع‌های هم‌خانواده.
 * داده نمونه عکس اختصاصی ندارد؛ این عکس‌ها نماینده موقعیت و نوع پروژه‌اند.
 */
const allTypeImages = [...new Set(projectGroups.flatMap((g) => [g.image, ...g.subtypes.map((s) => s.image)]).filter(Boolean) as string[])];
const galleryCache = new Map<string, { src: string; caption: string }[]>();
export function galleryOf(l: Listing): { src: string; caption: string }[] {
  const hit = galleryCache.get(l.id); if (hit) return hit;
  const out: { src: string; caption: string }[] = [{ src: l.image, caption: l.title }];
  const add = (src: string | undefined, caption: string) => { if (src && !out.some((x) => x.src === src)) out.push({ src, caption }); };
  if (l.province && provincePhotos[l.province]) add(provincePhotos[l.province].src, `${provincePhotos[l.province].place}، ${l.province}`);
  const g = projectGroups.find((x) => x.id === l.group);
  const seed = [...l.id].reduce((n, c) => n + c.charCodeAt(0), 0);
  const pool = g ? g.subtypes.filter((s) => s.id !== l.subtype && s.image).map((s) => ({ src: s.image!, caption: `نمونه ${s.name}` })) : allTypeImages.map((src) => ({ src, caption: "نمونه پروژه مشابه" }));
  for (let i = 0; out.length < 4 && i < pool.length; i++) { const p = pool[(seed + i * 3) % pool.length]; add(p.src, p.caption); }
  galleryCache.set(l.id, out);
  return out;
}
