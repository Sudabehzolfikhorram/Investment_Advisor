// طرح‌واره همه فیلدهای ورودی. هیچ فیلدی از نسخه مرجع حذف نشده؛
// فقط جای نمایش (placement) و نوع کامپوننت (control) بهتر شده است.
import type { FieldDef, FieldOption } from "@/types";
import { usages } from "./provinces";

const o = (...pairs: [string, string][]): FieldOption[] => pairs.map(([value, label]) => ({ value, label }));
const risk = o(["low", "کم"], ["medium", "متوسط"], ["high", "زیاد"]);
const ready = o(["unknown", "بررسی نشده"], ["ready", "مدارک آماده است"], ["partial", "نیازمند تکمیل"]);
const rights = o(["full", "عرصه و اعیان"], ["land", "عرصه"], ["building", "اعیان"], ["sarqofli", "سرقفلی"], ["business", "حق کسب و پیشه"], ["combined", "ترکیبی"], ["any", "فرقی ندارد"]);
const accept = o(["yes", "می‌پذیرم"], ["no", "نمی‌پذیرم"], ["any", "فرقی ندارد"]);

/** فیلدهای پایه — تنها چیزهایی که قبل از دیدن نتایج پرسیده می‌شود */
export const baseFields: FieldDef[] = [
  { id: "route", label: "مسیر همکاری", control: "cards", placement: "base", required: true },
  { id: "groups", label: "گروه پروژه", control: "multi-chips", placement: "base", routes: ["investor", "contractor", "operator"] },
  { id: "provinces", label: "استان", control: "multi-combobox", placement: "base" },
  { id: "amount", label: "مبلغ", control: "range", placement: "base", required: true, hint: "برچسب و واحد از مسیر انتخابی می‌آید (data/routes.ts)" },
];

/** فیلتر پیشرفته — کنار نتایج، به تفکیک مسیر */
export const advancedFields: FieldDef[] = [
  // ——— مبلغ و بازده
  { id: "horizon", label: "حداکثر افق بازگشت سرمایه", control: "slider", unit: "سال", min: 1, max: 25, placement: "advanced", section: "amount", routes: ["investor", "heritage"] },
  { id: "irrMin", label: "حداقل بازده سالانه مورد انتظار (IRR)", control: "slider", unit: "درصد", min: 0, max: 80, placement: "advanced", section: "amount", routes: ["investor", "heritage"], hint: "با افق بازگشت جمله «تا X سال، حداقل Y درصد» را می‌سازد" },
  { id: "irrBasis", label: "مبنای IRR", control: "segmented", options: o(["equity", "بازده آورده شریک"], ["project", "بازده کل پروژه"]), placement: "advanced", section: "amount", routes: ["investor", "heritage"], showWhen: { field: "irrMin", filled: true } },
  { id: "irrPrice", label: "مبنای قیمت", control: "segmented", options: o(["nominal", "اسمی"], ["real", "واقعی"]), placement: "advanced", section: "amount", routes: ["investor", "heritage"], showWhen: { field: "irrMin", filled: true } },
  { id: "lockup", label: "حداکثر قفل سرمایه", control: "slider", unit: "ماه", min: 6, max: 120, step: 6, placement: "advanced", section: "amount", routes: ["investor", "heritage"] },
  { id: "income", label: "نوع دریافت درآمد", control: "segmented", options: o(["any", "فرقی ندارد"], ["periodic", "دوره‌ای"], ["end", "پایان طرح"]), placement: "advanced", section: "amount", routes: ["investor", "heritage"] },
  { id: "firstIncome", label: "حداکثر زمان تا اولین دریافت", control: "slider", unit: "ماه", min: 6, max: 72, step: 6, placement: "advanced", section: "amount", routes: ["investor", "heritage"] },
  { id: "funding", label: "آمادگی منابع نقدی", control: "chips", options: o(["own", "آماده تعهد"], ["bank", "وابسته به تسهیلات"], ["partner", "وابسته به شریک"], ["unknown", "نامشخص"]), placement: "advanced", section: "amount", routes: ["investor", "heritage"] },
  { id: "fundReturnMin", label: "حداقل بازده سالانه مورد انتظار", control: "slider", unit: "درصد", min: 0, max: 60, placement: "advanced", section: "amount", routes: ["fund"] },
  { id: "payout", label: "دوره دریافت سود", control: "chips", options: o(["any", "فرقی ندارد"], ["1", "ماهانه"], ["3", "سه‌ماهه"], ["6", "شش‌ماهه"], ["12", "سالانه"], ["maturity", "سررسید"], ["none", "رشد ارزش"]), placement: "advanced", section: "amount", routes: ["fund"] },
  { id: "leaseRent", label: "حداکثر اجاره ماهانه", control: "slider", unit: "میلیون تومان", min: 0, max: 2000, step: 10, placement: "advanced", section: "amount", routes: ["lessee"] },
  { id: "leaseYears", label: "حداقل مدت اجاره", control: "slider", unit: "سال", min: 1, max: 20, placement: "advanced", section: "amount", routes: ["lessee"] },
  { id: "payment", label: "شرایط پرداخت", control: "chips", options: o(["cash", "نقد"], ["installment", "اقساطی"], ["setoff", "تهاتر"], ["swap", "معاوضه"]), placement: "advanced", section: "amount", routes: ["buyer", "lessee"] },
  { id: "downPayment", label: "پیش‌پرداخت قابل پرداخت", control: "slider", unit: "میلیارد تومان", min: 0, max: 200, placement: "advanced", section: "amount", routes: ["buyer"], showWhen: { field: "payment", in: ["installment"] } },
  { id: "installmentMonths", label: "دوره اقساط", control: "slider", unit: "ماه", min: 3, max: 120, step: 3, placement: "advanced", section: "amount", routes: ["buyer"], showWhen: { field: "payment", in: ["installment"] } },
  { id: "lumpBudget", label: "حداکثر پرداخت یکجای اجاره", control: "slider", unit: "میلیارد تومان", min: 0, max: 100, placement: "advanced", section: "amount", routes: ["lessee"] },
  { id: "offsetValue", label: "ارزش عوض یا مطالبه قابل ارائه", control: "slider", unit: "میلیارد تومان", min: 0, max: 200, placement: "advanced", section: "amount", routes: ["lessee"], showWhen: { field: "payment", in: ["setoff", "swap"] } },
  { id: "offsetDescription", label: "شرح عوض یا مطالبه", control: "textarea", placement: "advanced", section: "amount", routes: ["lessee"], showWhen: { field: "payment", in: ["setoff", "swap"] } },

  // ——— ریسک
  { id: "risk", label: "ریسک‌پذیری", control: "segmented", options: risk, placement: "advanced", section: "risk", routes: ["investor", "heritage", "fund"] },
  { id: "bankGuarantee", label: "تضمین بانکی", control: "chips", options: o(["principal", "اصل سرمایه"], ["both", "اصل و سود"], ["no", "لازم نیست"], ["undecided", "نمی‌دانم"]), placement: "advanced", section: "risk", routes: ["fund"] },
  { id: "showExcluded", label: "نمایش گزینه‌های نامتناسب با دلیل", control: "switch", placement: "advanced", section: "risk" },

  // ——— پروژه
  { id: "subtypes", label: "نوع دقیق پروژه", control: "multi-chips", placement: "advanced", section: "project", hint: "زیردسته‌های گروه‌های انتخاب‌شده" },
  { id: "phase", label: "مرحله پروژه", control: "multi-chips", options: o(["new", "احداث جدید"], ["unfinished", "نیمه‌تمام"], ["existing", "موجود"]), placement: "advanced", section: "project", routes: ["investor", "heritage", "contractor", "operator"] },
  { id: "owner", label: "صاحب پروژه", control: "segmented", options: o(["any", "هر دو"], ["public", "عمومی یا دولتی"], ["private", "خصوصی"]), placement: "advanced", section: "project", routes: ["investor", "heritage"] },
  { id: "participation", label: "نقش شما در مشارکت", control: "chips", options: o(["finance", "فقط سرمایه"], ["develop", "با مدیریت ساخت"], ["operate", "با بهره‌برداری"]), placement: "advanced", section: "project", routes: ["investor", "heritage"] },
  { id: "rehab", label: "نیاز به بازسازی عمده", control: "segmented", options: o(["yes", "دارد"], ["no", "ندارد"], ["unknown", "نامشخص"]), placement: "advanced", section: "project", routes: ["investor"], showWhen: { field: "phase", in: ["existing"] } },
  { id: "usage", label: "کاربری", control: "multi-chips", options: usages, placement: "advanced", section: "project" },
  { id: "area", label: "مساحت عرصه", control: "range", unit: "مترمربع", min: 0, max: 100000, step: 100, placement: "advanced", section: "project" },
  { id: "fundType", label: "نوع صندوق", control: "multi-chips", placement: "advanced", section: "project", routes: ["fund"], hint: "گزینه‌ها از routeSubcategories.fund" },
  { id: "saleCategory", label: "دسته و نوع", control: "multi-chips", placement: "advanced", section: "project", routes: ["buyer"], hint: "گزینه‌ها از routeSubcategories.buyer" },
  { id: "right", label: "نوع حق مورد انتقال", control: "chips", options: rights, placement: "advanced", section: "project", routes: ["buyer", "lessee"] },
  { id: "occupied", label: "ملک دارای متصرف یا مستأجر", control: "segmented", options: accept, placement: "advanced", section: "project", routes: ["buyer", "lessee"] },
  { id: "thirdPartyRights", label: "وجود سرقفلی یا حق کسب شخص ثالث", control: "segmented", options: accept, placement: "advanced", section: "project", routes: ["buyer", "lessee"] },
  { id: "leaseType", label: "نوع اجاره", control: "chips", placement: "advanced", section: "project", routes: ["lessee"] },
  { id: "renewal", label: "شرط تمدید", control: "chips", placement: "advanced", section: "project", routes: ["lessee"] },
  { id: "heritageReturn", label: "مدل بازگشت هزینه مرمت", control: "chips", options: o(["lease", "اجاره مدت‌دار"], ["offset", "جبران از اجاره‌بها"], ["fee", "دریافت مبلغ قرارداد"], ["mixed", "ترکیبی"]), placement: "advanced", section: "project", routes: ["heritage"] },
  { id: "heritageUse", label: "کاربری پس از مرمت", control: "chips", options: o(["any", "فرقی ندارد"], ["boutique", "بوتیک‌هتل"], ["cafe", "کافه"], ["restaurant", "رستوران"], ["culture", "فرهنگی و هنری"], ["office", "اداری"]), placement: "advanced", section: "project", routes: ["heritage"] },
  { id: "charityType", label: "نوع پروژه", control: "multi-chips", placement: "advanced", section: "project", routes: ["charity"], hint: "گزینه‌ها از routeSubcategories.charity" },
  { id: "contribution", label: "نوع همراهی", control: "multi-chips", options: o(["cash", "نقدی"], ["materials", "تجهیزات و مصالح"], ["land", "زمین یا ساختمان"], ["expertise", "تخصص و زمان"], ["delivery", "ساخت یا تکمیل"]), placement: "advanced", section: "project", routes: ["charity"] },

  // ——— مکان
  { id: "cities", label: "شهر", control: "multi-combobox", placement: "advanced", section: "location", hint: "وابسته به استان‌های انتخاب‌شده" },
  { id: "neighborhood", label: "محله یا محدوده", control: "text", placement: "advanced", section: "location" },
  { id: "strictLocation", label: "فقط در همین محل", control: "switch", placement: "advanced", section: "location" },

  // ——— شرایط قرارداد (به‌طور پیش‌فرض بسته)
  { id: "intervention", label: "نوع آورده دولت", control: "chips", options: o(["land", "زمین یا ساختمان"], ["cash", "نقدی"], ["mixed", "نقدی و غیرنقدی"], ["concession", "حق بهره‌برداری"], ["purchase", "خرید خدمت"], ["infrastructure", "زیرساخت"], ["private", "بدون آورده دولت"]), placement: "advanced", section: "contract", routes: ["investor", "heritage"] },
  { id: "shareMin", label: "حداقل سهم شما از مشارکت", control: "slider", unit: "درصد", min: 0, max: 100, step: 5, placement: "advanced", section: "contract", routes: ["investor", "heritage"] },
  { id: "governmentMin", label: "حداقل سهم دولت در تأمین منابع", control: "slider", unit: "درصد", min: 0, max: 100, step: 5, placement: "advanced", section: "contract", routes: ["contractor"] },
  { id: "executionMin", label: "حداقل مدت اجرا", control: "slider", unit: "ماه", min: 0, max: 120, step: 6, placement: "advanced", section: "contract", routes: ["investor", "heritage", "contractor"] },
  { id: "settlement", label: "نحوه تسویه", control: "chips", options: o(["cash", "نقدی"], ["same", "از همین پروژه"], ["other", "از پروژه دیگر"], ["mixed", "ترکیبی"], ["setoff", "تهاتر"], ["swap", "معاوضه"]), placement: "advanced", section: "contract", routes: ["investor", "heritage", "contractor"] },
  { id: "settlePercent", label: "درصد مورد انتظار از پروژه بابت تسویه", control: "slider", unit: "درصد", min: 0, max: 100, step: 5, placement: "advanced", section: "contract", routes: ["investor", "heritage"], showWhen: { field: "settlement", in: ["same", "other", "mixed"] } },
  { id: "otherProject", label: "مشخصات پروژه دیگر برای تسویه", control: "text", placement: "advanced", section: "contract", routes: ["investor", "heritage"], showWhen: { field: "settlement", in: ["other", "mixed"] } },
  { id: "guaranteePurpose", label: "کارکرد تضمین", control: "chips", options: o(["unknown", "نامشخص"], ["bid", "ارجاع کار"], ["performance", "انجام تعهدات"], ["advance", "پیش‌پرداخت"], ["retention", "حسن اجرا"]), placement: "advanced", section: "contract", routes: ["contractor"] },
  { id: "guarantees", label: "انواع تضمین قابل ارائه", control: "multi-chips", options: o(["bank", "ضمانت‌نامه بانکی"], ["cash", "سپرده نقدی"], ["insurance", "ضمانت‌نامه بیمه"], ["fund", "ضمانت‌نامه صندوق"], ["receivable", "گواهی مطالبات"], ["note", "سفته"]), placement: "advanced", section: "contract", routes: ["contractor"] },
];

/** فیلدهایی که یک‌بار در حساب کاربر ذخیره می‌شوند و فیلتر نیستند */
export const profileFields: FieldDef[] = [
  { id: "general", label: "آمادگی مدارک عمومی", control: "chips", options: ready, placement: "profile", routes: ["investor", "heritage", "contractor"] },
  { id: "special", label: "آمادگی مدارک تخصصی", control: "chips", options: ready, placement: "profile", routes: ["investor", "heritage", "contractor"] },
  { id: "experience", label: "سابقه کار مشابه", control: "segmented", options: o(["unknown", "نامشخص"], ["yes", "دارم"], ["no", "ندارم"]), placement: "profile", routes: ["contractor", "operator"] },
  { id: "discipline", label: "رشته، رتبه و ظرفیت آزاد", control: "textarea", placement: "profile", routes: ["contractor"] },
  { id: "notes", label: "ملاحظات تکمیلی", control: "textarea", placement: "profile" },
];

export const advancedSections = [
  { id: "amount", name: "مبلغ و بازده" },
  { id: "risk", name: "ریسک" },
  { id: "project", name: "پروژه" },
  { id: "location", name: "مکان" },
  { id: "contract", name: "شرایط قرارداد", collapsed: true },
] as const;

export const sortOptions = o(["relevance", "بیشترین تطابق"], ["capital", "کمترین سرمایه ورود"], ["payback", "کمترین دوره بازگشت"], ["newest", "جدیدترین"]);
