// منطق صفحه مقایسه: ردیف‌های مقایسه، بهترین مقدار هر ردیف و پاسخ‌های دستیار مقایسه.
// پاسخ‌ها فقط از داده‌های همین پروژه‌ها ساخته می‌شوند؛ چیزی که در داده نیست، «اعلام نشده» گفته می‌شود.
import { routes } from "@/data/routes";
import { listings } from "@/lib/listings";
import { legalLabel, faNumber, riskLabel } from "@/lib/utils";
import { ownerLabel, phaseLabel } from "@/lib/criteria";
import type { Listing, Opportunity } from "@/types";

export const COMPARE_MAX = 4;
export const COMPARE_MIN = 2;

/** رنگ هویت هر پروژه در صفحه مقایسه (به ترتیب ثابت؛ با ابزار سنجش رنگ برای کوررنگی بررسی شده) */
export const SERIES = ["#2152e0", "#0d9488", "#7c3aed", "#db2777"] as const;

export const compareListings = listings.filter((l) => l.kind === "project");
export const oppOf = (l: Listing) => l.raw as Opportunity;

const riskRank: Record<string, number> = { low: 1, medium: 2, high: 3 };
const incomeText: Record<string, string> = { periodic: "دوره‌ای", end: "یک‌جا در پایان طرح", any: "اعلام نشده" };

export type Better = "low" | "high" | null;
export interface Row {
  id: string;
  group: "money" | "time" | "risk" | "project";
  label: string;
  hint?: string;
  better: Better;
  /** مقدار عددی برای پیدا کردن بهترین و کشیدن نوار */
  num: (o: Opportunity) => number | null;
  text: (o: Opportunity, l: Listing) => string | null;
  /** واحد نوار */
  unit?: string;
}

const routeName = (id: string) => routes.find((r) => r.id === id)?.name ?? id;
const months = (m: number | null) => (m == null ? null : m >= 12 && m % 12 === 0 ? `${faNumber(m / 12)} سال` : `${faNumber(m)} ماه`);

export const groups: { id: Row["group"]; title: string; note: string }[] = [
  { id: "money", title: "پول", note: "چقدر لازم است و درآمد چطور می‌رسد" },
  { id: "time", title: "زمان", note: "کی درآمد شروع می‌شود و کی سرمایه برمی‌گردد" },
  { id: "risk", title: "ریسک و حقوق", note: "چه چیزی هنوز باید بررسی شود" },
  { id: "project", title: "پروژه و محل", note: "پروژه چیست و کجاست" },
];

export const rows: Row[] = [
  { id: "min", group: "money", label: "حداقل مبلغ ورود", better: "low", unit: "میلیارد", num: (o) => o.minCapital, text: (o) => (o.minCapital != null ? `${faNumber(o.minCapital)} میلیارد تومان` : null) },
  { id: "budget", group: "money", label: "نیاز مالی کل طرح", hint: "کل پولی که طرح لازم دارد، نه سهم شما", better: null, num: (o) => o.budget ?? null, text: (o) => (o.budget != null ? `${faNumber(o.budget)} میلیارد تومان` : null) },
  { id: "irr", group: "money", label: "بازده داخلی پیش‌بینی‌شده", better: "high", num: (o) => o.terms?.irr ?? null, text: (o) => (o.terms?.irr != null ? `${faNumber(o.terms.irr)}٪ سالانه` : null) },
  { id: "income", group: "money", label: "نوع دریافت درآمد", better: null, num: () => null, text: (o) => (o.income !== "any" ? incomeText[o.income] : null) },
  { id: "repay", group: "money", label: "منبع بازگشت پول", better: null, num: () => null, text: (o) => o.repay || null },
  { id: "first", group: "time", label: "اولین درآمد", better: "low", unit: "ماه", num: (o) => o.firstIncomeMonths, text: (o) => (o.firstIncomeMonths != null ? `${months(o.firstIncomeMonths)} پس از ورود` : null) },
  { id: "lock", group: "time", label: "قفل سرمایه", hint: "مدتی که نمی‌توانید سرمایه را بیرون بکشید", better: "low", unit: "ماه", num: (o) => o.lockupMonths, text: (o) => months(o.lockupMonths) },
  { id: "payback", group: "time", label: "بازگشت کامل سرمایه", better: "low", unit: "سال", num: (o) => o.paybackYears, text: (o) => (o.paybackYears != null ? `${faNumber(o.paybackYears)} سال` : null) },
  { id: "downside", group: "time", label: "بازگشت در حالت بدبینانه", better: "low", unit: "سال", num: (o) => o.paybackDownsideYears, text: (o) => (o.paybackDownsideYears != null ? `${faNumber(o.paybackDownsideYears)} سال` : null) },
  { id: "exec", group: "time", label: "مدت اجرا", better: "low", unit: "ماه", num: (o) => o.executionMonths ?? null, text: (o) => months(o.executionMonths ?? null) },
  { id: "duration", group: "time", label: "مدت قرارداد", better: null, num: (o) => o.durationYears, text: (o) => (o.durationYears != null ? `${faNumber(o.durationYears)} سال` : null) },
  { id: "risk", group: "risk", label: "سطح ریسک", better: "low", num: (o) => riskRank[o.risk] ?? null, text: (o) => (o.risk === "unknown" ? null : riskLabel[o.risk]) },
  { id: "legal", group: "risk", label: "وضعیت حقوقی", better: null, num: () => null, text: (o) => legalLabel[o.legalStatus] ?? o.legalStatus },
  { id: "ownership", group: "risk", label: "مالکیت و انتقال", better: null, num: () => null, text: (o) => o.ownership },
  { id: "owner", group: "risk", label: "صاحب پروژه", better: null, num: () => null, text: (o) => (o.owner ? ownerLabel[o.owner] : null) },
  { id: "caution", group: "risk", label: "نکته احتیاط", better: null, num: () => null, text: (o) => o.caution || null },
  { id: "type", group: "project", label: "دسته و نوع", better: null, num: () => null, text: (_, l) => l.tags.join("، ") || null },
  { id: "phase", group: "project", label: "مرحله", better: null, num: () => null, text: (o) => phaseLabel[o.phase] ?? o.stage },
  { id: "model", group: "project", label: "مدل همکاری", better: null, num: () => null, text: (o) => o.model || null },
  { id: "routes", group: "project", label: "راه‌های ورود", better: null, num: () => null, text: (o) => o.routes.map(routeName).join("، ") || null },
  { id: "place", group: "project", label: "استان و شهر", better: null, num: () => null, text: (o) => `${o.province}، ${o.city}` },
  { id: "expert", group: "project", label: "کارشناس", better: null, num: () => null, text: (o) => (o.expert ? o.expert.name : o.guideFileUrl ? "فایل راهنما" : null) },
];

/** اندیس پروژه‌هایی که در یک ردیف بهترین‌اند؛ اگر همه برابر باشند یا کمتر از دو مقدار باشد، هیچ */
export function bestOf(row: Row, items: Listing[]): number[] {
  if (!row.better) return [];
  const vals = items.map((l) => row.num(oppOf(l)));
  const known = vals.filter((v): v is number => v != null);
  if (known.length < 2) return [];
  const target = row.better === "low" ? Math.min(...known) : Math.max(...known);
  if (known.every((v) => v === target)) return [];
  return vals.flatMap((v, i) => (v === target ? [i] : []));
}

/** آیا مقدارهای یک ردیف با هم فرق دارند */
export function differs(row: Row, items: Listing[]) {
  const t = items.map((l) => row.text(oppOf(l), l) ?? "—");
  return new Set(t).size > 1;
}

/** برچسب‌های «در یک نگاه» برای هر پروژه */
const badgeOf: Record<string, string> = { min: "کمترین مبلغ ورود", first: "زودترین درآمد", lock: "کوتاه‌ترین قفل", payback: "زودترین بازگشت", downside: "مقاوم‌تر در حالت بد", irr: "بیشترین بازده", risk: "ریسک کمتر", exec: "اجرای کوتاه‌تر" };
export function strengths(items: Listing[]): string[][] {
  const out = items.map(() => [] as string[]);
  for (const r of rows) for (const i of bestOf(r, items)) if (badgeOf[r.id]) out[i].push(badgeOf[r.id]);
  return out;
}

/** چند ردیف اطلاعات پروژه اعلام شده است (برای «کامل بودن داده») */
export function completeness(l: Listing) {
  const o = oppOf(l);
  const keys = ["min", "first", "lock", "payback", "downside", "risk"] as const;
  const done = keys.filter((k) => rows.find((r) => r.id === k)!.num(o) != null).length;
  return { done, total: keys.length };
}

/* ——— دستیار مقایسه ——— */

export type Cite = { i: number; note?: string };
export interface Answer {
  text: string;
  /** ردیف‌هایی از جدول که پاسخ به آن‌ها تکیه دارد؛ با کلیک در جدول برجسته می‌شوند */
  rows: string[];
  /** پروژه‌هایی که پاسخ به نفعشان است یا به آن‌ها اشاره می‌کند */
  cites: Cite[];
  /** پرسش‌های بعدی پیشنهادی */
  next: string[];
  /** یک گزینه انتخابی برای ادامه (مثلاً اولویت شما) */
  choices?: string[];
}

export const starterQuestions = [
  "تفاوت اصلی این پروژه‌ها چیست؟",
  "کدام را پیشنهاد می‌کنی؟",
  "کدام زودتر سرمایه‌ام را برمی‌گرداند؟",
  "کدام ریسک کمتری دارد؟",
  "با ۳۰ میلیارد تومان کدام در دسترس است؟",
  "کدام زودتر درآمد می‌دهد؟",
  "اگر کار بد پیش برود چه می‌شود؟",
];

const priorities = ["بازگشت سریع سرمایه", "ریسک کمتر", "مبلغ ورود کمتر", "درآمد زودتر"];

const name = (items: Listing[], i: number) => `«${items[i].title}»`;
const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join("، ")} و ${xs.at(-1)}`);
const faToEn = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

/** ترتیب پروژه‌ها بر اساس یک ردیف عددی؛ نامعلوم‌ها آخر */
function order(items: Listing[], id: string, dir: "low" | "high" = "low") {
  const r = rows.find((x) => x.id === id)!;
  const known = items.map((l, i) => ({ i, v: r.num(oppOf(l)) })).filter((x) => x.v != null) as { i: number; v: number }[];
  known.sort((a, b) => (dir === "low" ? a.v - b.v : b.v - a.v));
  const unknown = items.map((_, i) => i).filter((i) => !known.some((k) => k.i === i));
  return { known, unknown, r };
}

function unknownNote(items: Listing[], unknown: number[], what: string) {
  if (!unknown.length) return "";
  return ` برای ${list(unknown.map((i) => name(items, i)))} ${what} اعلام نشده است؛ پیش از تصمیم از کارشناس پروژه بپرسید.`;
}

function byRow(items: Listing[], id: string, what: string, fmt: (v: number) => string, intro: (best: string) => string, next: string[]): Answer {
  const { known, unknown } = order(items, id);
  if (known.length === 0) return { text: `${what} هیچ‌کدام از این پروژه‌ها اعلام نشده است. این را از کارشناس هر پروژه بپرسید یا پروژه‌ای با داده کامل‌تر به مقایسه اضافه کنید.`, rows: [id], cites: [], next };
  const best = known[0];
  const ties = known.filter((k) => k.v === best.v);
  const rest = known.filter((k) => k.v !== best.v);
  let text = intro(list(ties.map((k) => name(items, k.i)))) + ` با ${fmt(best.v)}.`;
  if (rest.length) text += ` بعد از آن ${list(rest.map((k) => `${name(items, k.i)} با ${fmt(k.v)}`))}.`;
  text += unknownNote(items, unknown, what);
  return { text, rows: [id], cites: ties.map((k) => ({ i: k.i })), next };
}

function overview(items: Listing[]): Answer {
  const diff = rows.filter((r) => r.better && differs(r, items) && bestOf(r, items).length);
  const st = strengths(items);
  const parts = items.map((_, i) => (st[i].length ? `${name(items, i)}: ${st[i].slice(0, 2).join(" و ")}` : null)).filter(Boolean) as string[];
  const same = rows.filter((r) => !differs(r, items) && items.some((l) => r.text(oppOf(l), l))).map((r) => r.label);
  let text = parts.length ? `خلاصه‌اش این است: ${parts.join("؛ ")}.` : "در داده‌های اعلام‌شده، هیچ‌کدام در ردیف‌های عددی برتری روشنی ندارند.";
  if (diff.length) text += ` بیشترین تفاوت در ${list(diff.slice(0, 3).map((r) => `«${r.label}»`))} است.`;
  if (same.length) text += ` در ${list(same.slice(0, 2).map((x) => `«${x}»`))} همه یکسان‌اند، پس این‌ها در انتخاب شما نقشی ندارند.`;
  return { text, rows: diff.slice(0, 3).map((r) => r.id), cites: st.flatMap((s, i) => (s.length ? [{ i }] : [])), next: ["کدام را پیشنهاد می‌کنی؟", "اگر کار بد پیش برود چه می‌شود؟"] };
}

function afford(items: Listing[], cap: number): Answer {
  const ok: number[] = [], no: number[] = [], unk: number[] = [];
  items.forEach((l, i) => { const m = oppOf(l).minCapital; if (m == null) unk.push(i); else (m <= cap ? ok : no).push(i); });
  let text = ok.length
    ? `با ${faNumber(cap)} میلیارد تومان می‌توانید وارد ${list(ok.map((i) => name(items, i)))} شوید.`
    : `با ${faNumber(cap)} میلیارد تومان به حداقل مبلغ ورود هیچ‌کدام نمی‌رسید.`;
  if (no.length) text += ` ${list(no.map((i) => `${name(items, i)} دست‌کم ${faNumber(oppOf(items[i]).minCapital!)} میلیارد`))} لازم دارد.`;
  if (ok.length > 1) { const left = ok.map((i) => cap - oppOf(items[i]).minCapital!); text += ` اگر فقط یکی را انتخاب کنید، بیشترین پول اضافه با ${name(items, ok[left.indexOf(Math.max(...left))])} برایتان می‌ماند.`; }
  text += unknownNote(items, unk, "حداقل مبلغ ورود");
  return { text, rows: ["min"], cites: ok.map((i) => ({ i })), next: ["کدام زودتر سرمایه‌ام را برمی‌گرداند؟", "کدام ریسک کمتری دارد؟"] };
}

function risk(items: Listing[]): Answer {
  const { known, unknown } = order(items, "risk");
  const legal = new Set(items.map((l) => oppOf(l).legalStatus));
  let text = "";
  if (known.length) {
    const best = known.filter((k) => k.v === known[0].v);
    text = `از نظر سطح ریسک اعلام‌شده، ${list(best.map((k) => name(items, k.i)))} ریسک ${riskLabel[oppOf(items[best[0].i]).risk]} دارد.`;
    const rest = known.filter((k) => k.v !== known[0].v);
    if (rest.length) text += ` ریسک ${list(rest.map((k) => `${name(items, k.i)} ${riskLabel[oppOf(items[k.i]).risk]}`))} است.`;
  } else text = "سطح ریسک هیچ‌کدام از این پروژه‌ها هنوز ارزیابی نشده است.";
  if (unknown.length && known.length) text += ` ریسک ${list(unknown.map((i) => name(items, i)))} هنوز ارزیابی نشده است.`;
  if (legal.size === 1) text += ` وضعیت حقوقی همه «${legalLabel[[...legal][0]] ?? [...legal][0]}» است؛ یعنی پیش از هر تعهدی سند، مجوز و قرارداد باید بررسی شود.`;
  const d = order(items, "downside").known;
  if (d.length) text += ` در حالت بدبینانه، ${name(items, d[0].i)} با ${faNumber(d[0].v)} سال کمترین تأخیر را دارد.`;
  return { text, rows: ["risk", "legal", "downside"], cites: known.filter((k) => k.v === known[0]?.v).map((k) => ({ i: k.i })), next: ["اگر کار بد پیش برود چه می‌شود؟", "کدام را پیشنهاد می‌کنی؟"] };
}

function downside(items: Listing[]): Answer {
  const parts = items.map((l, i) => {
    const o = oppOf(l);
    if (o.paybackYears == null || o.paybackDownsideYears == null) return `${name(items, i)}: حالت بدبینانه اعلام نشده`;
    const gap = o.paybackDownsideYears - o.paybackYears;
    return `${name(items, i)} از ${faNumber(o.paybackYears)} به ${faNumber(o.paybackDownsideYears)} سال می‌رسد${gap > 0 ? ` (${faNumber(gap)} سال دیرتر)` : ""}`;
  });
  const cautions = [...new Set(items.map((l) => oppOf(l).caution).filter(Boolean))];
  let text = `اگر درآمد یا اجرا عقب بیفتد، بازگشت سرمایه این‌طور جابه‌جا می‌شود: ${parts.join("؛ ")}.`;
  if (cautions.length === 1) text += ` نکته احتیاطی که برای همه آمده: ${cautions[0]}`;
  const gaps = items.map((l) => { const o = oppOf(l); return o.paybackYears != null && o.paybackDownsideYears != null ? o.paybackDownsideYears - o.paybackYears : null; });
  const kg = gaps.filter((g): g is number => g != null);
  const cites = kg.length ? gaps.flatMap((g, i) => (g === Math.min(...kg) ? [{ i }] : [])) : [];
  return { text, rows: ["payback", "downside", "caution"], cites, next: ["کدام ریسک کمتری دارد؟", "کدام را پیشنهاد می‌کنی؟"] };
}

function recommend(items: Listing[], priority?: string): Answer {
  if (!priority) return { text: "پیشنهاد به اولویت شما بستگی دارد، چون این پروژه‌ها در چیزهای مختلفی بهترند. برای شما کدام مهم‌تر است؟", rows: [], cites: [], next: [], choices: priorities };
  const key = priority === "بازگشت سریع سرمایه" ? "payback" : priority === "ریسک کمتر" ? "risk" : priority === "مبلغ ورود کمتر" ? "min" : "first";
  const { known, unknown } = order(items, key);
  if (!known.length) return { text: `برای «${priority}» داده کافی در این پروژه‌ها نیست. اولویت دیگری را امتحان کنید یا از کارشناس بپرسید.`, rows: [key], cites: [], next: [], choices: priorities.filter((p) => p !== priority) };
  const top = known[0];
  const o = oppOf(items[top.i]);
  const st = strengths(items)[top.i].filter((s) => s !== { payback: "زودترین بازگشت", risk: "ریسک کمتر", min: "کمترین مبلغ ورود", first: "زودترین درآمد" }[key]);
  let text = `با اولویت «${priority}»، ${name(items, top.i)} جلوتر است.`;
  if (st.length) text += ` این پروژه در ${list(st.map((s) => `«${s}»`))} هم بهترین است.`;
  if (o.risk === "unknown") text += " اما ریسکش هنوز ارزیابی نشده؛ این را در اولین تماس با کارشناس بپرسید.";
  if (known.length > 1) text += ` گزینه دوم ${name(items, known[1].i)} است.`;
  text += unknownNote(items, unknown, rows.find((r) => r.id === key)!.label);
  return { text, rows: [key], cites: [{ i: top.i }], next: ["اگر کار بد پیش برود چه می‌شود؟", "کدام ریسک کمتری دارد؟"], choices: priorities.filter((p) => p !== priority) };
}

/** پرسش آزاد را به یکی از پاسخ‌ها وصل می‌کند */
export function answer(q: string, items: Listing[]): Answer {
  const t = faToEn(q).replace(/‌/g, " ");
  const fmtY = (v: number) => `${faNumber(v)} سال`;
  const fmtM = (v: number) => `${faNumber(v)} ماه`;
  if (priorities.includes(q)) return recommend(items, q);
  const cap = t.match(/(\d+(?:\.\d+)?)\s*میلیارد/);
  if (cap || /دارم|بودجه|پول(م| من)|در دسترس/.test(t)) {
    if (cap) return afford(items, +cap[1]);
    return byRow(items, "min", "حداقل مبلغ ورود", (v) => `${faNumber(v)} میلیارد تومان`, (b) => `کمترین مبلغ ورود را ${b} دارد،`, ["با ۳۰ میلیارد تومان کدام در دسترس است؟"]);
  }
  if (/بدبینان|بد پیش|ضرر|شکست|تاخیر|تأخیر|خطر بد/.test(t)) return downside(items);
  if (/ریسک|امن|مطمئن|خطر|حقوقی|مجوز|سند/.test(t)) return risk(items);
  if (/پیشنهاد|کدوم بهتر|کدام بهتر|بهترین|انتخاب کنم|توصیه/.test(t)) return recommend(items);
  if (/درآمد|سود|دریافت|ماهانه|اجاره/.test(t)) return byRow(items, "first", "زمان اولین درآمد", (v) => `${fmtM(v)} پس از ورود`, (b) => `زودترین درآمد را ${b} می‌دهد،`, ["کدام زودتر سرمایه‌ام را برمی‌گرداند؟", "کدام ریسک کمتری دارد؟"]);
  if (/قفل|بیرون بکشم|خارج|نقد/.test(t)) return byRow(items, "lock", "قفل سرمایه", (v) => months(v)!, (b) => `کوتاه‌ترین قفل سرمایه را ${b} دارد،`, ["کدام زودتر درآمد می‌دهد؟"]);
  if (/برمی ?گرد|بازگشت|زودتر|سریع/.test(t)) return byRow(items, "payback", "دوره بازگشت", fmtY, (b) => `زودتر از همه ${b} سرمایه را برمی‌گرداند،`, ["اگر کار بد پیش برود چه می‌شود؟", "کدام زودتر درآمد می‌دهد؟"]);
  if (/کجا|استان|شهر|محل/.test(t)) {
    const text = items.map((l, i) => `${name(items, i)} در ${oppOf(l).province}، ${oppOf(l).city}`).join("؛ ") + ".";
    return { text, rows: ["place"], cites: [], next: ["تفاوت اصلی این پروژه‌ها چیست؟"] };
  }
  if (/تفاوت|فرق|مقایسه|خلاصه/.test(t)) return overview(items);
  const o = overview(items);
  return { ...o, text: `این پرسش را دقیق نفهمیدم، اما این خلاصه شاید کمک کند: ${o.text}`, next: starterQuestions.slice(1, 4) };
}

export { faToEn };
