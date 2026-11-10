// داده‌های هر پروژه به شکل گروه‌بندی‌شده؛ هم صفحه جزئیات و هم فایل راهنما از همین استفاده می‌کنند.
// موارد خالی برگردانده نمی‌شوند.
import { projectGroups } from "@/data/taxonomy";
import { routes, routeSubcategories } from "@/data/routes";
import { usages } from "@/data/provinces";
import { ownerLabel, phaseLabel, revenueLabel } from "./criteria";
import { payoutLabel } from "./listings";
import type { Fund, Listing, Opportunity, SaleItem } from "@/types";
import { faDigits, faNumber, incomeLabel, legalLabel, riskLabel } from "./utils";

type Val = string | null | undefined;
export interface FactGroup { id: "project" | "money" | "status"; title: string; items: [string, string][] }
const num = (v: number | null | undefined, unit: string): Val => (v != null ? `${faNumber(v)} ${unit}` : null);
const yn = (v: boolean | null | undefined): Val => (v == null ? null : v ? "دارد" : "ندارد");
const clean = (items: [string, Val][]) => items.filter((x): x is [string, string] => !!x[1]);

export function factGroups(l: Listing): FactGroup[] {
  const routeNames = l.routes.map((r) => routes.find((x) => x.id === r)?.name).filter(Boolean).join("، ");
  let groups: { id: FactGroup["id"]; title: string; items: [string, Val][] }[] = [];
  if (l.kind === "project") {
    const o = l.raw as Opportunity;
    const group = projectGroups.find((g) => g.id === o.group);
    const subtype = group?.subtypes.find((s) => s.id === o.subtype);
    groups = [
      { id: "project", title: "پروژه", items: [
        ["حوزه", group?.name], ["نوع", subtype?.name], ["مرحله", phaseLabel[o.phase] ?? o.phase], ["وضعیت", o.stage],
        ["مدل همکاری", o.model], ["صاحب پروژه", o.owner ? ownerLabel[o.owner] ?? o.owner : null],
        ["منابع درآمد", o.revenues?.length ? o.revenues.map((r) => revenueLabel[r] ?? r).join("، ") : null], ["مسیر ورود", routeNames],
      ] },
      { id: "money", title: "پول و زمان", items: [
        ["حداقل سرمایه ورود", num(o.minCapital, "میلیارد تومان")], ["نیاز مالی طرح", num(o.budget, "میلیارد تومان")], ["مدت اجرا", num(o.executionMonths, "ماه")],
        ["دوره بازگشت", num(o.paybackYears, "سال")], ["بازگشت در حالت بدبینانه", num(o.paybackDownsideYears, "سال")], ["قفل سرمایه", num(o.lockupMonths, "ماه")],
        ["اولین دریافت", num(o.firstIncomeMonths, "ماه")], ["نوع درآمد", incomeLabel[o.income] ?? o.income], ["مدت کل طرح", num(o.durationYears, "سال")],
      ] },
      { id: "status", title: "وضعیت و مشخصات", items: [
        ["سطح ریسک", riskLabel[o.risk] ?? o.risk], ["وضعیت حقوقی", legalLabel[o.legalStatus] ?? o.legalStatus],
        [o.metric?.label ?? "ظرفیت", o.metric ? `${faNumber(o.metric.value)} ${o.metric.unit}` : null],
        ["محل", `${o.province}، ${o.city}`], ["تاریخ ثبت", faDigits(o.publishedAt.replaceAll("-", "/"))], ["شناسه", o.id], ["کارشناس", o.expert?.name],
      ] },
    ];
  } else if (l.kind === "fund") {
    const f = l.raw as Fund;
    groups = [
      { id: "project", title: "صندوق", items: [["نوع", f.kind === "fund" ? "صندوق" : "طرح جمعی"], ["دسته", routeSubcategories.fund?.find((x) => x.id === f.type)?.name ?? f.type], ["حوزه دارایی", f.assetSector], ["شناسه", f.id]] },
      { id: "money", title: "پول و زمان", items: [["حداقل ورود", num(f.minimumMillion, "میلیون تومان")], ["بازده پیش‌بینی", f.forecast != null ? `${faNumber(f.forecast)}٪ سالانه` : null], ["پرداخت سود", payoutLabel[f.payout] ?? f.payout], ["مدت", num(f.durationMonths, "ماه")]] },
      { id: "status", title: "ریسک و تضمین", items: [["سطح ریسک", riskLabel[f.risk] ?? f.risk], ["تضمین بانکی", yn(f.bank.exists)], ["تضمین اصل سرمایه", yn(f.bank.principal)], ["تضمین سود", yn(f.bank.profit)]] },
    ];
  } else {
    const s = l.raw as SaleItem;
    const cat = routeSubcategories.buyer?.find((x) => x.id === s.category);
    groups = [
      { id: "project", title: "مشخصات", items: [["دسته", cat?.name ?? s.category], ["نوع", cat?.children?.find((c) => c.id === (s.buildingType ?? s.scrapType))?.name], ["کاربری", usages.find((u) => u.value === s.usage)?.label], ["موضوع", s.subject], ["شناسه", s.id]] },
      { id: "money", title: "قیمت و اندازه", items: [["قیمت", num(s.price, s.category === "scrap" ? "میلیون تومان" : "میلیارد تومان")], ["مساحت", num(s.area, "مترمربع")], ["مساحت عرصه", num(s.landArea, "مترمربع")], ["مقدار", s.quantity]] },
      { id: "status", title: "محل", items: [["استان", s.province], ["شهر", s.city], ["محله یا محدوده", s.neighborhood]] },
    ];
  }
  return groups.map((g) => ({ ...g, items: clean(g.items) })).filter((g) => g.items.length > 0);
}
