import type { RouteId } from "@/types";

export interface RouteDef {
  id: RouteId;
  /** نام کوتاه نمایشی */
  name: string;
  /** نام کامل در نسخه مرجع */
  fullName: string;
  description: string;
  /** برچسب و واحد فیلد «مبلغ» در این مسیر */
  amount: { label: string; unit: string; min: number; max: number; step: number } | null;
  /** آیا این مسیر از ۱۱ گروه پروژه استفاده می‌کند */
  usesProjectGroups: boolean;
}

export const routes: RouteDef[] = [
  { id: "investor", name: "سرمایه‌گذاری و مشارکت", fullName: "مشارکت در توسعه و سرمایه‌گذاری",
    description: "با سرمایه و توان خود در توسعه پروژه‌ها شریک شوید.",
    amount: { label: "سرمایه نقدی قابل تعهد", unit: "میلیارد تومان", min: 1, max: 500, step: 1 }, usesProjectGroups: true },
  { id: "fund", name: "صندوق‌ها و سرمایه‌گذاری جمعی", fullName: "سرمایه‌گذاری در صندوق‌ها و طرح‌های جمعی",
    description: "با مبالغ کوچک‌تر در صندوق یا طرح جمعی سهیم شوید.",
    amount: { label: "مبلغ سرمایه‌گذاری", unit: "میلیون تومان", min: 1, max: 10000, step: 1 }, usesProjectGroups: false },
  { id: "contractor", name: "پیمانکاری", fullName: "حضور حرفه‌ای در اجرای پروژه‌ها",
    description: "توان اجرایی خود را در پروژه‌های پیمانکاری به‌کار بگیرید.",
    amount: { label: "نقدینگی قابل تخصیص به پیمان", unit: "میلیارد تومان", min: 1, max: 500, step: 1 }, usesProjectGroups: true },
  { id: "buyer", name: "خرید ملک و دارایی", fullName: "فروش اراضی، املاک و کالای اسقاطی",
    description: "اراضی، املاک و کالای اسقاطی عرضه‌شده را بررسی کنید.",
    amount: { label: "محدوده قیمت خرید", unit: "میلیارد تومان", min: 0, max: 500, step: 1 }, usesProjectGroups: false },
  { id: "lessee", name: "اجاره ملک", fullName: "اجاره ملک برای فعالیت و بهره‌برداری",
    description: "ملک مناسب فعالیت خود را اجاره کنید.",
    amount: { label: "بودجه ودیعه", unit: "میلیارد تومان", min: 0, max: 100, step: 0.5 }, usesProjectGroups: false },
  { id: "heritage", name: "مرمت و احیای میراث", fullName: "اثرگذاری در حفظ میراث تاریخی ایران",
    description: "در مرمت و احیای بناهای تاریخی سرمایه‌گذاری کنید.",
    amount: { label: "سرمایه نقدی قابل تعهد", unit: "میلیارد تومان", min: 1, max: 200, step: 1 }, usesProjectGroups: false },
  { id: "charity", name: "مشارکت اجتماعی و خیریه", fullName: "همراهی در ساختن آینده‌ای بهتر",
    description: "در پروژه‌های آموزشی، درمانی و خدمات محله سهیم شوید.",
    amount: { label: "مبلغ همراهی", unit: "میلیون تومان", min: 1, max: 100000, step: 1 }, usesProjectGroups: false },
  { id: "operator", name: "بهره‌برداری", fullName: "بهره‌برداری و نگهداری",
    description: "بهره‌برداری و نگهداری پروژه‌های آماده را بر عهده بگیرید.",
    amount: null, usesProjectGroups: true },
];

/** مسیرهای مستقل با فرم چندمرحله‌ای خودشان (خارج از فلوی «شرایط ← نتایج») */
export const standaloneFlows = [
  { id: "land-preparation", name: "آماده‌سازی زمین", fullName: "آماده‌سازی و توسعه زمین", steps: 3 },
  { id: "foreign-investment", name: "سرمایه‌گذاری خارجی", fullName: "سرمایه‌گذاری، تأمین مالی و همکاری بین‌المللی", steps: 3 },
  { id: "proposal", name: "معرفی طرح", fullName: "معرفی طرح و نیاز مالی / ایده‌های نو", steps: 2 },
] as const;

/** زیردسته‌های مسیرهایی که از گروه پروژه استفاده نمی‌کنند */
export const routeSubcategories: Partial<Record<RouteId, { id: string; name: string; children?: { id: string; name: string }[] }[]>> = {
  fund: [
    { id: "fixed", name: "درآمد ثابت" }, { id: "mixed", name: "مختلط" }, { id: "equity", name: "سهامی" },
    { id: "gold", name: "طلا و کالا" }, { id: "realestate", name: "املاک و مستغلات" },
    { id: "landbuilding", name: "زمین و ساختمان" }, { id: "project", name: "پروژه" }, { id: "crowd", name: "تأمین مالی جمعی" },
  ],
  buyer: [
    { id: "land", name: "اراضی" },
    { id: "property", name: "املاک", children: [
      { id: "villa", name: "ویلایی" }, { id: "apartment", name: "آپارتمان" }, { id: "tower", name: "برج" }, { id: "complex", name: "مجتمع" } ] },
    { id: "scrap", name: "کالای اسقاطی", children: [
      { id: "metal", name: "فلزات" }, { id: "equipment", name: "تجهیزات و ماشین‌آلات" }, { id: "electronics", name: "الکترونیکی" }, { id: "mixed", name: "ترکیبی" } ] },
  ],
  charity: [
    { id: "education", name: "آموزش و مهارت", children: [
      { id: "school", name: "مدرسه" }, { id: "skills", name: "مرکز فنی‌وحرفه‌ای" }, { id: "library", name: "کتابخانه" } ] },
    { id: "health", name: "درمان و اورژانس", children: [
      { id: "emergency", name: "اورژانس" }, { id: "specialtyclinic", name: "درمانگاه تخصصی" }, { id: "specialtyhospital", name: "بیمارستان تخصصی" }, { id: "rehab", name: "توان‌بخشی" } ] },
    { id: "social", name: "خدمات اجتماعی و محله", children: [
      { id: "welfare", name: "مرکز بهزیستی" }, { id: "community", name: "خانه محله" } ] },
    { id: "water", name: "آب سالم", children: [ { id: "water", name: "تصفیه و تأمین آب محله" } ] },
  ],
};

/** گام‌های عمومی هر مسیر (نسخه مرجع)؛ وقتی پروژه گام اختصاصی ندارد همین‌ها نمایش داده می‌شود */
export const routeSteps: Record<RouteId, string[]> = {operator:['دریافت شرح خدمت، حدود تعمیرات و وضعیت تأسیسات','احراز صلاحیت فنی و هزینه نگهداری و نیروی انسانی','تعیین منبع پرداخت و شاخص‌های سطح خدمت','قرارداد بهره‌برداری، تحویل و پایش عملکرد'],
investor:['احراز اختیار دارایی، کاربری و مجوزهای طرح','ارزش‌گذاری آورده‌ها و بررسی جریان نقدی و ریسک‌ها','دریافت اسناد روش انتخاب شریک و احراز شرایط ورود','تنظیم تعهدات، تضمین‌ها و شیوه تقسیم و تسویه منافع'],
contractor:['دریافت اسناد رسمی مناقصه یا روش مجاز انتخاب پیمانکار','احراز صلاحیت، ظرفیت آزاد و توان تجهیز کارگاه','بررسی منبع پرداخت، صورت‌وضعیت‌ها و تضمین‌های لازم','ارائه پیشنهاد از مجرای مقرر در اسناد معتبر'],
buyer:['دریافت شناسنامه، سند و مشخصات دقیق موضوع فروش','بررسی تصرف، حقوق اشخاص ثالث و اختیار فروشنده','بازدید و بررسی قیمت، هزینه‌ها و شرایط پرداخت','ورود از مسیر عرضه رسمی و طی تشریفات انتقال'],
lessee:['تعیین دقیق منافع یا حقوق مورد اجاره و مدت آن','احراز اختیار واگذاری و امکان کاربری موردنظر','بررسی هزینه آماده‌سازی، پرداخت‌ها و شرایط تمدید یا خاتمه','بازدید و بررسی قرارداد و تعهدات تحویل'],
heritage:['بررسی پرونده بنا، اختیار واگذاری و الزامات مرجع میراث','بررسی طرح مرمت، کاربری مجاز، هزینه و برنامه تجهیز','تعیین پرداخت نقدی، احتساب هزینه در اجاره یا بهره‌برداری مدت‌دار','تعیین مسئول نگهداری، معیار تحویل و تسویه در پایان یا فسخ'],
fund:['احراز مجوز صندوق یا هویت عامل و سکوی طرح جمعی','بررسی اسناد انتشار، هزینه‌ها، نقدشوندگی و ریسک ابزار','بررسی مستقل سند هر تضمین و دامنه پوشش آن','ورود از مجرای رسمی و مجاز همان ابزار پس از بررسی شرایط'],
charity:['احراز نیاز محلی و مجری معتبر','بررسی زمین، مجوز، بودجه راه‌اندازی و هزینه جاری خدمت','توافق درباره مصرف کمک، گزارش پیشرفت و سنجش اثر','تعیین سازوکار تحویل، بهره‌برداری و پاسخ‌گویی']};

/** خدمات مرتبط با هر مسیر، مطابق پیوندهای نسخه مرجع */
export const routeTools: Partial<Record<RouteId, string[]>> = {
  investor: ["land-preparation", "foreign-investment", "proposal", "ma-renewal"],
  contractor: ["ma-notice", "ma-profile"],
  operator: ["ma-notice", "ma-profile"],
  lessee: ["ma-manager", "ma-exchange"],
  buyer: ["ma-exchange"],
  heritage: ["proposal"],
  charity: ["charity", "proposal", "ideas"],
};
const tomanOf = (unit: string) => (unit.includes("میلیارد") ? 1e9 : 1e6);
/** بودجه کاربر هنگام تغییر مسیر حفظ می‌شود: به واحد و بازه مسیر تازه تبدیل می‌شود */
export function convertAmount(amount: [number, number] | null, from: RouteId, to: RouteId): [number, number] | null {
  const a = routes.find((r) => r.id === from)?.amount, b = routes.find((r) => r.id === to)?.amount;
  if (!amount || !a || !b) return null;
  const k = tomanOf(a.unit) / tomanOf(b.unit);
  // سقف بودجه تعیین‌کننده است: هر پروژه‌ای تا این سقف، در توان کاربر است
  const hi = Math.min(b.max, Math.max(b.min, Math.round((amount[1] * k) / b.step) * b.step));
  return [b.min, hi];
}
