// داده‌های هر پروژه به شکل گروه‌بندی‌شده؛ هم صفحه جزئیات و هم فایل راهنما از همین استفاده می‌کنند.
// هر مورد خالی با «ثبت نشده» نشان داده می‌شود تا هیچ فیلدی از نسخه مرجع پنهان نماند.
import { projectGroups } from "@/data/taxonomy";
import { routes, routeSubcategories } from "@/data/routes";
import { usages } from "@/data/provinces";
import { ownerLabel, phaseLabel, revenueLabel } from "./criteria";
import { payoutLabel } from "./listings";
import type { Fund, Listing, Opportunity, SaleItem } from "@/types";
import { faDigits, faNumber, incomeLabel, legalLabel, riskLabel } from "./utils";
import * as T from "@/data/source-terms";

type Val = string | null | undefined;
export interface FactGroup { id: "project" | "money" | "status"; title: string; items: [string, string][] }
const num = (v: number | null | undefined, unit: string): Val => (v != null ? `${faNumber(v)} ${unit}` : null);
const yn = (v: boolean | null | undefined): Val => (v == null ? null : v ? "دارد" : "ندارد");
export const NA = "ثبت نشده";
/** مقدارهایی که هنوز سندی برایشان نیست */
export const isPending = (v: string) => v === NA || v.startsWith(NA) || v.startsWith("نیازمند") || v.startsWith("احراز نشده");
/** ردیف‌های ثبت‌شده جدا، و نام ردیف‌های ثبت‌نشده در یک فهرست کوتاه */
export const splitPending = (rows: [string, string][]) => ({ known: rows.filter(([, v]) => !isPending(v)), pending: rows.filter(([, v]) => isPending(v)).map(([k]) => k) });
const clean = (items: [string, Val][]) => items.map(([k, v]): [string, string] => [k, v || NA]);

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
  return groups.map((g) => ({ ...g, items: clean(g.items) }));
}

/** پرونده کامل هر مورد: همان بخش‌های جزئیات نسخه مرجع (مشخصات عمومی، شرایط اختصاصی هر مسیر، ترتیبات مرمت،
 * حقوق مالکیت و منافع، اعتبار اطلاعات) با همان متن جایگزین برای داده‌های ثبت‌نشده. */
export interface DossierSection { id: string; title: string; note?: string; rows: [string, string][]; notes?: [string, string][] }
const tr = (v: string[] | undefined, map: Record<string, string>) => v?.length ? v.map((x) => map[x] ?? x).join("، ") : null;
const PENDING = "ثبت نشده؛ نیازمند بررسی اسناد";
const fill = (rows: [string, Val][], fb = PENDING): [string, string][] => rows.map(([k, v]) => [k, v || fb]);

export function dossier(l: Listing): DossierSection[] {
  const out: DossierSection[] = [];
  if (l.kind === "sale") {
    const s = l.raw as SaleItem;
    const cat = routeSubcategories.buyer?.find((x) => x.id === s.category);
    const type = cat?.children?.find((c) => c.id === (s.buildingType ?? s.scrapType))?.name;
    const unit = s.category === "scrap" ? "میلیون تومان" : "میلیارد تومان";
    const common: [string, Val][] = [["دسته دارایی", cat?.name], ["عنوان / شناسه", `${l.title} / ${s.id}`], ["موقعیت", [s.province, s.city, s.neighborhood].filter(Boolean).join("، ")],
      ["قیمت کل فروش", num(s.price, unit)], ["مبنای قیمت", "کل دارایی / محموله عرضه‌شده"], ["نشانی دقیق / مختصات", "ثبت نشده؛ موقعیت واقعی تأیید نشده است."]];
    const rows: [string, Val][] = s.category === "scrap"
      ? [...common, ["نوع کالا", type], ["مقدار و واحد محموله", s.quantity || "ثبت نشده؛ نیازمند فهرست و توزین"], ["فهرست اقلام و وضعیت فنی", "در شناسنامه تأییدشده و گزارش بازدید ثبت می‌شود."],
        ["شرایط بازدید، بارگیری و تحویل", "ثبت نشده؛ مسئولیت و هزینه حمل باید مشخص شود."], ["مالک و مجوز فروش / فراخوان", "احراز نشده؛ اسناد عرضه و شرایط فروش دریافت شود."]]
      : [...common, ...(s.category === "property" ? [["نوع ملک", type], ["موضوع عرضه", s.subject || "کل ملک یا واحد باید مشخص شود"]] as [string, Val][] : []),
        ["کاربری", usages.find((u) => u.value === s.usage)?.label], [`مساحت ${s.category === "land" ? "عرصه" : "بنا / واحد عرضه‌شده"}`, num(s.area, "مترمربع")],
        ...(s.category === "property" ? [["مساحت عرصه", num(s.landArea, "مترمربع")], ["طبقه، تعداد واحد، پارکینگ و انباری", "در شناسنامه تأییدشده تکمیل می‌شود."]] as [string, Val][] : []),
        ["پلاک ثبتی، سند و مالک / عرضه‌کننده", "احراز نشده؛ نیازمند اسناد معتبر"], ["حدود، دسترسی و انشعابات", "ثبت نشده؛ از پرونده و بازدید احراز شود."],
        ["وضعیت تصرف و حقوق اشخاص ثالث", "احراز نشده؛ عین، منافع و حقوق مرتبط جدا بررسی شوند."], ["شرایط پرداخت، هزینه‌ها و زمان تحویل", "در اسناد عرضه مشخص می‌شود؛ این صفحه فقط جست‌وجوست."]];
    out.push({ id: "record", title: "شناسنامه مورد فروش", rows: fill(rows, NA) });
  } else {
    const x = l.raw as Opportunity & Fund;
    out.push({ id: "record", title: "مشخصات عمومی و موقعیت", rows: fill([
      ["عنوان / شناسه", `${l.title} / ${l.id}`], ["استان / شهر", l.province ? `${l.province} / ${l.city}` : null], ["محله", null],
      ["کاربری", x.usageLabel || "نیازمند احراز"], ["شرح عمومی", x.description || "شرح رسمی و مشخصات فنی باید از پرونده فرصت دریافت شود."],
      ["مساحت عرصه / زیربنا", null], ["نشانی / مختصات", "نشانی و مختصات دقیق ثبت نشده؛ موقعیت نقشه‌ای تأیید نشده است."],
    ], NA) });
  }
  if (l.kind === "project") {
    const o = l.raw as Opportunity, t = o.terms ?? {};
    const pct = (v: number | null | undefined) => (v != null ? `${faNumber(v)}٪` : null);
    const has = (r: string) => o.routes.includes(r);
    if (has("investor") || (has("heritage") && !o.heritageTerms)) out.push({ id: "terms-investor", title: "شرایط اختصاصی مشارکت", rows: fill([
      ["نوع مداخله دولت", tr(t.interventions, T.interventionLabel)], ["سهم قابل ارائه به شریک", pct(t.partnerShare)], ["مدت اجرا", num(t.executionMonths ?? o.executionMonths, "ماه")],
      ["IRR و مبنا", t.irrCashflowsVerified && t.irr != null ? `${faNumber(t.irr)}٪ / ${t.irrBasis} / ${t.irrPrice}` : "مدل جریان نقدی قابل اتکا ثبت نشده"],
      ["نحوه تسویه سهم", tr(t.partnershipSettlements, T.settlementLabel)], ["شرایط عمومی شریک", t.generalConditions], ["شرایط تخصصی شریک", t.specialConditions],
    ]) });
    if (has("contractor")) out.push({ id: "terms-contractor", title: "شرایط اختصاصی پیمانکاری", rows: fill([
      ["سهم دولت از منابع تأمین", pct(t.governmentShare)], ["حداقل نقدینگی اجرای پیمان", num(t.workingCapitalMin, "میلیارد تومان")], ["مدت اجرا", num(t.executionMonths ?? o.executionMonths, "ماه")],
      ["تسویه صورت‌وضعیت", tr(t.contractorSettlements, T.contractorSettlementLabel)], ["تضمین‌های قابل پذیرش", tr(t.acceptedGuarantees, T.guaranteeLabel)],
      ["شرایط عمومی", t.generalConditions], ["شرایط تخصصی", t.specialConditions],
    ]) });
    if (has("buyer")) out.push({ id: "terms-buyer", title: "شرایط اختصاصی خرید", rows: fill([
      ["قیمت عرضه", num(o.minCapital, "میلیارد تومان")], ["شرایط پرداخت قابل بررسی", tr(t.salePayments, T.salePaymentLabel)], ["نوع حق قابل انتقال", tr(t.transferRights, T.transferRightLabel)], ["موضوع حق", o.rights?.subject],
    ]) });
    if (has("lessee")) out.push({ id: "terms-lessee", title: "شرایط اختصاصی اجاره", rows: fill([
      ["ودیعه", num(o.minCapital, "میلیارد تومان")], ["نوع اجاره", tr(t.leaseTypes, T.leaseTypeLabel)], ["نحوه پرداخت", tr(t.leasePayments, T.leasePaymentLabel)],
      ["اجاره ماهانه", num(o.monthlyRent, "میلیون تومان")], ["اجاره یکجای دوره", num(t.lumpRent, "میلیارد تومان")], ["مدت اجاره", num(o.durationYears, "سال")],
    ]) });
    if (has("heritage")) {
      const h = o.heritageTerms ?? {}, feeOnly = h.returns?.length === 1 && h.returns[0] === "fee";
      out.push({ id: "heritage", title: "ترتیبات مرمت و بهره‌برداری", rows: fill([
        ["جبران هزینه", tr(h.returns, T.heritageReturnLabel) ?? "نیازمند بررسی"], ["کاربری پس از مرمت", tr(h.uses, T.heritageUseLabel) ?? "احراز نشده"],
        [feeOnly ? "بهره‌بردار پس از تحویل" : "مدت بهره‌برداری", feeOnly ? "مالک / دولت" : num(h.years, "سال") ?? "نامعلوم"],
        ["زمان دریافت مبلغ قرارداد مرمت", tr(h.payments, T.heritagePaymentLabel)], ["مجوز و قرارداد", "نیازمند احراز"],
      ]) });
    }
    if (has("buyer") || has("lessee")) {
      const r = o.rights ?? {};
      out.push({ id: "rights", title: "حقوق مالکیت، منافع و وضعیت کسب", note: T.rightsNote, rows: fill([
        ["موضوع حق واگذارشدنی", r.subject], ["مالک عرصه / مالک اعیان", r.titleParties], ["دارنده منافع / سرقفلی / حق کسب", r.holder],
        ["تاریخ شروع رابطه اولیه و زنجیره انتقال", r.originalLease], ["قانون حاکم و مستند تشخیص", r.regime],
        ["وضعیت تصرف و زمان تحویل", r.occupancy === "vacant" ? "تخلیه‌شده فرض شده؛ نیازمند احراز" : r.occupancy === "occupied" ? "دارای متصرف؛ وضعیت تحویل نیازمند بررسی" : null],
        ["حق انتقال به غیر / رضایت یا مجوز", r.assignment], ["مبلغ و دلیل پرداخت سرقفلی", r.keyMoney], ["ارزش مستقل حقوق و نظر کارشناس", r.valuation],
        ["کاربری و شغل مجاز / تغییر شغل", r.permittedUse], ["شروط تمدید، افزایش اجاره و تخلیه", r.renewal], ["دعاوی، بازداشت، وثیقه و حقوق ثالث", r.claims],
        ["نوع سند، ثبت و شناسه قرارداد", r.registration], ["هزینه انتقال، بدهی و مسئول پرداخت", r.costs],
      ], "نیازمند دریافت سند و بررسی حقوقی") });
    }
  }
  out.push({ id: "evidence", title: "اعتبار اطلاعات و وضعیت عرضه", rows: T.evidenceRows,
    notes: [...(l.kind === "fund" ? [] : T.evidenceNotes), ["بررسی تضمین", T.guaranteeNote]] });
  return out;
}
