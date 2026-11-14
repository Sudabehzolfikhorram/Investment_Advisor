// دستیار نمایشی: متن آزاد کاربر را با قواعد ساده به همان فیلدهای فرم تبدیل می‌کند.
// در نسخه واقعی، یک مدل زبانی جای این تابع می‌نشیند؛ خروجی و امتیازدهی همان است.
import { projectGroups } from "@/data/taxonomy";
import { provinces } from "@/data/provinces";
import { routes, routeSubcategories } from "@/data/routes";
import { cityCoords } from "@/data/opportunities";
import { listings } from "./listings";
import { ASSISTANT_MAX_RESULTS, rank } from "./match";
import type { FilterValue, RouteId, SearchCriteria } from "@/types";

const toEn = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
const cityProvince: Record<string, string> = Object.fromEntries(listings.filter((l) => l.city && l.province).map((l) => [l.city!, l.province!]));

const groupWords: [RegExp, string, string?][] = [
  [/مسکونی|مسکن|آپارتمان/, "building", "residential"], [/اداری/, "building", "office"], [/تجاری|مرکز خرید/, "building", "commercial"],
  [/هتل|اقامتی|گردشگری/, "building", "hospitality"], [/درمان|بیمارستان/, "building", "medical"], [/آموزش|مدرسه/, "building", "education"],
  [/ورزش/, "building", "sports"], [/ساختمان/, "building"], [/خورشیدی|بادی|تجدیدپذیر/, "energy", "renewable"], [/نیروگاه|انرژی|برق/, "energy"],
  [/راه|بزرگراه|حمل|مترو|فرودگاه|بندر/, "transport"], [/آب|فاضلاب|سد/, "water"], [/صنعت|کارخانه|انبار|لجستیک|پالایشگاه/, "industry"],
  [/میراث|تاریخی|مرمت/, "heritage"], [/کشاورزی|گلخانه|دام/, "agriculture"], [/دیجیتال|مرکز داده|فیبر/, "digital"], [/شهری|بوستان|پسماند/, "urban"], [/زمین|شهرک/, "land"],
];

export interface AssistantReading { criteria: SearchCriteria; understood: { label: string; value: string }[] }

export function readPrompt(text: string): AssistantReading {
  const t = toEn(text);
  const understood: AssistantReading["understood"] = [];
  const filters: Record<string, FilterValue> = {};
  let route: RouteId = "investor";
  if (/صندوق|سرمایه‌گذاری جمعی|تأمین مالی جمعی/.test(t)) route = "fund";
  else if (/اجاره کنم|اجاره ملک|اجاره دفتر|اجاره فضا|مستأجر|اجاره‌ای برای/.test(t)) route = "lessee";
  else if (/بخرم|خرید|اسقاط/.test(t)) route = "buyer";
  else if (/پیمانکار/.test(t)) route = "contractor";
  else if (/مرمت|احیا|بنای تاریخی|خانه تاریخی/.test(t)) route = "heritage";
  else if (/خیریه|وقف|نیکوکاری|مشارکت اجتماعی/.test(t)) route = "charity";
  else if (/بهره‌بردار|بهره برداری|بهره‌برداری/.test(t)) route = "operator";
  understood.push({ label: "مسیر", value: routes.find((r) => r.id === route)!.name });
  if (route === "buyer") {
    const cat = [/اسقاط|ضایعات|فلزات/.test(t) && "scrap", /زمین|اراضی/.test(t) && "land", /ملک|خانه|آپارتمان|ویلا|مغازه|دفتر|واحد/.test(t) && "property"].filter(Boolean) as string[];
    if (cat.length) { filters.saleCategory = cat; understood.push({ label: "دسته", value: cat.map((c) => routeSubcategories.buyer?.find((x) => x.id === c)?.name ?? c).join("، ") }); }
  }

  const groups: string[] = [], subtypes: string[] = [];
  if (route === "investor" || route === "contractor" || route === "heritage" || route === "operator")
    for (const [re, g, s] of groupWords) if (re.test(t)) { if (!groups.includes(g)) groups.push(g); if (s && !subtypes.includes(s)) subtypes.push(s); }
  if (groups.length) understood.push({ label: "گروه پروژه", value: groups.map((g) => projectGroups.find((x) => x.id === g)!.name).join("، ") });
  if (subtypes.length) { filters.subtypes = subtypes; understood.push({ label: "نوع", value: subtypes.map((s) => projectGroups.flatMap((g) => g.subtypes).find((x) => x.id === s)!.name).join("، ") }); }

  const provs = new Set<string>();
  for (const p of provinces) if (t.includes(p)) provs.add(p);
  const cities = Object.keys(cityCoords).filter((c) => t.includes(c) && cityProvince[c]);
  for (const c of cities) provs.add(cityProvince[c]);
  if (provs.size) understood.push({ label: "استان", value: [...provs].join("، ") });
  // نام شهری که با نام استان یکی نیست، فیلتر شهر هم می‌شود (مثل شیراز یا کاشان)
  const onlyCities = cities.filter((c) => !(provinces as readonly string[]).includes(c));
  if (onlyCities.length) { filters.cities = onlyCities; understood.push({ label: "شهر", value: onlyCities.join("، ") }); }

  let amount: [number, number] | null = null;
  const m = /(\d+(?:\.\d+)?)\s*(میلیارد|میلیون)/.exec(t);
  if (m) {
    let n = parseFloat(m[1]);
    if (route === "fund") n = m[2] === "میلیارد" ? n * 1000 : n; else n = m[2] === "میلیون" ? n / 1000 : n;
    amount = [0, n];
    understood.push({ label: "مبلغ", value: `تا ${m[1].replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])} ${m[2]} تومان` });
  }
  const y = /(\d+)\s*سال/.exec(t);
  if (y && (route === "investor" || route === "heritage")) { filters.horizon = +y[1]; understood.push({ label: "افق بازگشت", value: `تا ${y[1].replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])} سال` }); }
  const pct = /(\d+)\s*(?:درصد|٪|%)/.exec(t);
  if (pct) { filters[route === "fund" ? "fundReturnMin" : "irrMin"] = +pct[1]; understood.push({ label: "حداقل بازده", value: `${pct[1].replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])}٪ سالانه` }); }
  const r = /ریسک\s*(کم|پایین|متوسط|زیاد|بالا)|(کم‌ریسک|کم ریسک)/.exec(t);
  if (r) { const v = r[2] || /کم|پایین/.test(r[1]) ? "low" : r[1] === "متوسط" ? "medium" : "high"; filters.risk = v; understood.push({ label: "ریسک", value: v === "low" ? "کم" : v === "medium" ? "متوسط" : "زیاد" }); }
  if (/ماهانه|دوره‌ای|درآمد ثابت/.test(t)) { if (route === "fund") filters.payout = "1"; else filters.income = "periodic"; understood.push({ label: "درآمد", value: "دوره‌ای" }); }

  return { criteria: { route, groups, provinces: [...provs], amount, filters }, understood };
}

export function suggest(text: string) {
  const reading = readPrompt(text);
  // پروژه‌ای که هیچ شرطی از درخواست را ندارد (تطابق صفر) پیشنهاد نمی‌شود
  return { ...reading, results: rank(listings, reading.criteria, ASSISTANT_MAX_RESULTS).filter((r) => r.score > 0) };
}

/** پیشنهادهای کوتاه دستیار */
export const samplePrompts = [
  "مسکونی در تهران تا ۳۰ میلیارد",
  "صندوق کم‌ریسک با سود ماهانه",
  "نیروگاه خورشیدی در یزد",
  "خرید ملک در شیراز",
  "اجاره دفتر در اصفهان",
  "مرمت خانه تاریخی در کاشان",
];
