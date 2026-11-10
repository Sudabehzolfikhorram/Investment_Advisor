// دستیار نمایشی: متن آزاد کاربر را با قواعد ساده به همان فیلدهای فرم تبدیل می‌کند.
// در نسخه واقعی، یک مدل زبانی جای این تابع می‌نشیند؛ خروجی و امتیازدهی همان است.
import { projectGroups } from "@/data/taxonomy";
import { provinces } from "@/data/provinces";
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
  else if (/بخرم|خرید ملک|خرید زمین|خرید یک/.test(t)) route = "buyer";
  else if (/پیمانکار/.test(t)) route = "contractor";
  understood.push({ label: "مسیر", value: route === "fund" ? "صندوق‌ها" : route === "buyer" ? "خرید ملک و دارایی" : route === "contractor" ? "پیمانکاری" : "سرمایه‌گذاری و مشارکت" });

  const groups: string[] = [], subtypes: string[] = [];
  if (route === "investor" || route === "contractor")
    for (const [re, g, s] of groupWords) if (re.test(t)) { if (!groups.includes(g)) groups.push(g); if (s && !subtypes.includes(s)) subtypes.push(s); }
  if (groups.length) understood.push({ label: "گروه پروژه", value: groups.map((g) => projectGroups.find((x) => x.id === g)!.name).join("، ") });
  if (subtypes.length) { filters.subtypes = subtypes; understood.push({ label: "نوع", value: subtypes.map((s) => projectGroups.flatMap((g) => g.subtypes).find((x) => x.id === s)!.name).join("، ") }); }

  const provs = new Set<string>();
  for (const p of provinces) if (t.includes(p)) provs.add(p);
  for (const c of Object.keys(cityCoords)) if (t.includes(c) && cityProvince[c]) provs.add(cityProvince[c]);
  if (provs.size) understood.push({ label: "استان", value: [...provs].join("، ") });

  let amount: [number, number] | null = null;
  const m = /(\d+(?:\.\d+)?)\s*(میلیارد|میلیون)/.exec(t);
  if (m) {
    let n = parseFloat(m[1]);
    if (route === "fund") n = m[2] === "میلیارد" ? n * 1000 : n; else n = m[2] === "میلیون" ? n / 1000 : n;
    amount = [0, n];
    understood.push({ label: "مبلغ", value: `تا ${m[1].replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])} ${m[2]} تومان` });
  }
  const y = /(\d+)\s*سال/.exec(t);
  if (y && route === "investor") { filters.horizon = +y[1]; understood.push({ label: "افق بازگشت", value: `تا ${y[1].replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])} سال` }); }
  const pct = /(\d+)\s*(?:درصد|٪|%)/.exec(t);
  if (pct) { filters[route === "fund" ? "fundReturnMin" : "irrMin"] = +pct[1]; understood.push({ label: "حداقل بازده", value: `${pct[1].replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])}٪ سالانه` }); }
  const r = /ریسک\s*(کم|پایین|متوسط|زیاد|بالا)|(کم‌ریسک|کم ریسک)/.exec(t);
  if (r) { const v = r[2] || /کم|پایین/.test(r[1]) ? "low" : r[1] === "متوسط" ? "medium" : "high"; filters.risk = v; understood.push({ label: "ریسک", value: v === "low" ? "کم" : v === "medium" ? "متوسط" : "زیاد" }); }
  if (/ماهانه|دوره‌ای|درآمد ثابت/.test(t)) { if (route === "fund") filters.payout = "1"; else filters.income = "periodic"; understood.push({ label: "درآمد", value: "دوره‌ای" }); }

  return { criteria: { route, groups, provinces: [...provs], amount, filters }, understood };
}

export function suggest(text: string) {
  const reading = readPrompt(text);
  return { ...reading, results: rank(listings, reading.criteria, ASSISTANT_MAX_RESULTS) };
}

export const samplePrompts = [
  "حدود ۳۰ میلیارد تومان دارم و دنبال پروژه مسکونی در تهران یا شیراز هستم که تا ۸ سال سرمایه‌ام برگردد و ریسک متوسط داشته باشد.",
  "می‌خواهم با ۵۰۰ میلیون تومان در یک صندوق کم‌ریسک با پرداخت ماهانه سرمایه‌گذاری کنم.",
  "پروژه نیروگاه خورشیدی در یزد یا کرمان با سرمایه تا ۴۰ میلیارد.",
];
