// همه متن و داده لندینگ نسخه مرجع («ALGONET_Investment_Advisor_Demo 13.html») در یک جا.
// هر سه کانسپت از همین فایل می‌خوانند تا هیچ داده‌ای جا نیفتد، فقط شکل نمایش فرق می‌کند.
// متن‌ها عیناً از نسخه مرجع است، مگر جایی که نام سایت یا مسیر صفحه لازم بود.
import type { RouteId } from "@/types";
import { routes, routeSteps, routeSubcategories, standaloneFlows } from "@/data/routes";
import { projectGroups } from "@/data/taxonomy";
import { libraryTopics } from "@/data/library";
import { tools } from "@/data/tools";
import { listings, isNew } from "@/lib/listings";
import { forRoute } from "@/lib/match";

export const brandLine = "سرمایه‌گذاری، مشارکت و توسعه دارایی";

export const hero = {
  kicker: "سرمایه، تخصص و دارایی، در مسیر خلق ارزش",
  title: ["در ساختن آینده،", "شریک شوید."],
  sub: "فرصت‌های سرمایه‌گذاری، اجرای پروژه و توسعه دارایی را کشف کنید.",
  primary: { label: "کشف فرصت‌های همکاری", href: "#goals" },
  secondary: { label: "جست‌وجوی مستقیم فرصت‌ها", href: "/opportunities" },
  imageNote: "تصویر مفهومی و الهام‌بخش، معرف پروژه قابل عرضه نیست.",
};

export const heroStories = {
  title: "فرصت را از زاویه‌ای تازه ببینید",
  items: [
    { n: 1, name: "سرمایه و مشارکت", image: "/images/hero/towers.jpg", routes: ["investor", "fund", "contractor", "operator"] as RouteId[] },
    { n: 2, name: "زمین و دارایی", image: "/images/hero/field.jpg", routes: ["buyer", "lessee"] as RouteId[] },
    { n: 3, name: "میراث و اثر اجتماعی", image: "/images/hero/heritage.webp", routes: ["heritage", "charity"] as RouteId[] },
  ],
};

export const intro = {
  kicker: "از هدف شما شروع می‌کنیم",
  title: ["یک نقطه شروع.", "چند مسیر برای خلق ارزش."],
  text: "سرمایه‌گذار، پیمانکار، متقاضی ملک یا همراه یک طرح اجتماعی هستید؟ مسیر خود را انتخاب کنید تا فقط پرسش‌های مرتبط با آن را ببینید.",
};

/** میان‌برهای نسخه مرجع (نوار زیر معرفی) */
export const quickNav = [
  { label: "پرونده فرصت و خدمات تکمیلی", href: "/tools/ma-notice" },
  { label: "سرمایه‌گذاری و تامین مالی خارجی", href: "/tools/foreign-investment" },
  { label: "جست‌وجوی مستقیم فرصت‌ها", href: "/opportunities" },
  { label: "راهنمای انتخاب", href: "/assistant" },
  { label: "معرفی طرح", href: "/tools/proposal" },
  { label: "آماده‌سازی و توسعه زمین", href: "/tools/land-preparation" },
  { label: "منتخب‌های من", href: "/saved", saved: true },
  { label: "راهنما و مستندات", href: "/tools/library" },
];

/** سه نیت ورود: جست‌وجو، راهنمایی، معرفی طرح */
export const intents = [
  { id: "explore", en: "EXPLORE", title: "فرصت موردنظرم را جست‌وجو می‌کنم", text: "مستقیم به نمونه فرصت‌ها، فیلترها و شناسنامه‌ها بروید.", cta: "مشاهده فرصت‌ها", href: "/opportunities" },
  { id: "advise", en: "ADVISE", title: "برای انتخاب مسیر، راهنمایی می‌خواهم", text: "با پاسخ به پرسش‌های مرتبط، مسیر مناسب خود را بررسی کنید.", cta: "شروع راهنما", href: "/assistant" },
  { id: "introduce", en: "INTRODUCE", title: "برای توسعه طرحم همراه می‌خواهم", text: "طرح خود را معرفی کنید و پیش‌نیازهای تامین مالی یا همکاری را بشناسید.", cta: "معرفی طرح و نیاز مالی", href: "/tools/proposal" },
];

/** گام ۱ نسخه مرجع: «هدف ورود» با شرح اول‌شخص هر هدف */
const goalText: Record<string, string> = {
  investor: "می‌خواهم با سرمایه و توان خود در توسعه پروژه‌ها مشارکت کنم.",
  contractor: "پیمانکار هستم و می‌خواهم توان اجرایی خود را در پروژه‌های پیمانکاری به‌کار بگیرم.",
  buyer: "اراضی، املاک و کالای اسقاطی عرضه‌شده را براساس قیمت و موقعیت بررسی می‌کنم.",
  lessee: "می‌خواهم ملک مناسب فعالیت یا بهره‌برداری موردنظر خود را اجاره کنم.",
  fund: "می‌خواهم با سرمایه خود در صندوق یا طرح جمعیِ متناسب با هدفم سهیم شوم.",
  heritage: "می‌خواهم در حفظ میراث تاریخی ایران و احیای خانه‌های ارزشمند اثرگذار باشم.",
  charity: "می‌خواهم در فرصت تحصیل، دسترسی به درمان و بهبود زندگی مردم سهمی ماندگار داشته باشم.",
  operator: "بهره‌برداری و نگهداری پروژه‌های آماده را بر عهده بگیرید.",
  "land-preparation": "خدمات اجرایی، مالکیتی، حقوقی و حفاظت موردنیاز زمین یا ملک را انتخاب می‌کنم.",
  "foreign-investment": "می‌خواهم با سرمایه، اعتبار یا توان تخصصی بین‌المللی در توسعه پروژه‌ها نقش داشته باشم.",
};

export interface Goal { id: string; route?: RouteId; name: string; fullName: string; text: string; href?: string; cta?: string; count: number; subs: string[]; steps: string[]; brings: Bring[] }
export type Bring = "cash" | "skill" | "space" | "plan" | "care";

/** «آورده شما چیست؟»: هر هدف با کدام آورده جور است (برای برجسته کردن، نه حذف) */
const bringOf: Record<string, Bring[]> = {
  investor: ["cash"], fund: ["cash"], contractor: ["skill"], operator: ["skill"], buyer: ["cash", "space"], lessee: ["space"],
  heritage: ["cash", "skill"], charity: ["care", "cash"], "land-preparation": ["space", "skill", "cash"], "foreign-investment": ["cash", "skill"],
};
export const brings: { id: Bring; label: string; short: string }[] = [
  { id: "cash", label: "سرمایه نقدی دارم", short: "سرمایه" },
  { id: "skill", label: "توان اجرایی یا تخصص دارم", short: "تخصص" },
  { id: "space", label: "دنبال ملک یا فضا هستم", short: "ملک" },
  { id: "care", label: "می‌خواهم اثر اجتماعی بگذارم", short: "اثر" },
  { id: "plan", label: "طرحی برای معرفی دارم", short: "طرح" },
];

const subsOf = (id: RouteId) => {
  const r = routes.find((x) => x.id === id)!;
  return r.usesProjectGroups ? projectGroups.map((g) => g.name) : (routeSubcategories[id] ?? []).map((x) => x.name);
};

export const goals: Goal[] = [
  ...routes.map((r) => ({
    id: r.id, route: r.id, name: r.name, fullName: r.fullName, text: goalText[r.id] ?? r.description, count: forRoute(listings, r.id).length,
    subs: subsOf(r.id), steps: routeSteps[r.id] ?? [], brings: bringOf[r.id] ?? [],
  })),
  ...standaloneFlows.filter((f) => f.id !== "proposal").map((f) => ({
    id: f.id, name: f.name, fullName: f.id === "foreign-investment" ? "سرمایه‌گذاری و تامین مالی خارجی" : f.fullName, text: goalText[f.id], href: `/tools/${f.id}`,
    cta: f.id === "land-preparation" ? "ورود به بخش آماده‌سازی" : "شناخت مسیر و شرایط ورود", count: 0, subs: [], steps: [], brings: bringOf[f.id] ?? [],
  })),
];

export const goalsHead = { title: "فرصت‌های سرمایه‌گذاری و همکاری", text: "سرمایه و تخصص شما، نقطه آغاز یک همکاری ارزش‌آفرین.", label: "هدف اصلی ورود" };
export const proposalCta = { text: "طرح یا پروژه‌ای برای معرفی دارید؟ مسیر تامین مالی و پیش‌نیازهای همکاری را بررسی کنید.", cta: "معرفی طرح", href: "/tools/proposal" };
export const noSignup = "بدون ثبت‌نام و اطلاعات تماس";
/** چهار گام فلوی نسخه مرجع */
export const flowSteps = ["هدف ورود", "پروژه و محل", "شرایط شما", "بررسی نتیجه"];

export const groupsHead = { title: "چه پروژه‌ای، در کدام منطقه؟", text: "گروه اصلی و سپس نوع دقیق پروژه را انتخاب کنید. فهرست زیر متناسب با مسیر انتخابی شماست." };
export const groups = projectGroups.map((g) => ({ ...g, count: listings.filter((l) => l.group === g.id).length }));

/** جست‌وجوی مستقیم بدون پرسش‌نامه */
export const directSearch = {
  title: "فرصت‌ها را مستقیم بررسی کنید", label: "جست‌وجو بدون پرسش‌نامه",
  text: "برای بررسی اولیه، مسیر همکاری و محل را انتخاب کنید.",
  fields: { route: "مسیر همکاری", province: "استان", query: "عنوان یا شناسه فرصت", group: "گروه پروژه" },
  submit: "نمایش فرصت‌ها",
  fund: { text: "صندوق‌ها و طرح‌های جمعی، مسیر مستقل خود را دارند.", cta: "ورود به بخش صندوق‌ها" },
  charity: { cta: "همراهی در پروژه‌های عام‌المنفعه" },
};

export const stories = [
  { id: "dossier", kicker: "از شناخت فرصت تا تصمیم ورود", title: ["پشت هر دارایی،", "ظرفیتی برای ارزش‌آفرینی است."], text: "موقعیت، کاربری، شرایط همکاری و پیش‌نیازهای هر فرصت را کنار هم ببینید. شناسنامه پروژه به شما کمک می‌کند پرسش‌های درست را پیش از ورود مطرح کنید.", cta: "بررسی شناسنامه فرصت‌ها", href: "/opportunities", image: "/images/hero/construction.jpg" },
  { id: "heritage", kicker: "فرصتی برای ماندگاری", title: ["به یک بنای ارزشمند،", "فرصت زندگی دوباره بدهید."], text: "از مرمت و احیای خانه‌های تاریخی تا کاربری سازگار و بهره‌برداری مسئولانه، مسیر همکاری و شرایط موردنیاز خود را بررسی کنید.", cta: "آشنایی با مسیر مرمت و احیا", route: "heritage" as RouteId, image: "/images/hero/heritage.webp" },
];

export const knowledge = {
  title: "تصمیم بهتر، از پرسش درست شروع می‌شود.", text: "مدل‌های همکاری، مدارک موردنیاز و مراحل ورود را در راهنمای سامانه مرور کنید.", cta: "راهنما و مستندات", href: "/tools/library",
  next: { title: "برای تصمیم بعدی، اطلاعات روشن‌تری داشته باشید", text: "اسناد موردنیاز، مسیر همکاری و منتخب‌های خود را کنار هم ببینید.", saved: "منتخب‌ها و پیش‌نویس‌های من" },
  topics: libraryTopics,
};

export const method = [
  { en: "MATCH", title: "تطبیق با نیاز شما", text: "هدف، محل، سرمایه و نیاز زمانی با شرایط فرصت مقایسه می‌شود." },
  { en: "EXPLAIN", title: "توضیح نتیجه", text: "ناسازگاری‌ها و اطلاعات نامعلوم جدا دیده می‌شوند، عدد مجهول به صفر تبدیل نمی‌شود." },
  { en: "NEXT STEP", title: "مسیر ورود روشن", text: "مدل قرارداد، منبع پول و نحوه دریافت عایدی، همراه مراحل بعدی نمایش داده می‌شود." },
];

/** خدمات نسخه مرجع (فرم‌های مستقل) */
export const services = tools.filter((t) => !t.hidden);

export const footer = {
  line: "نمونه پیشنهادی سامانه مشاوره فرصت‌های سرمایه‌گذاری",
  note: "بدون ارسال اطلاعات، پرداخت یا ثبت درخواست واقعی",
  photo: "Photography: Ali Khoshnevisan & Vahid Moeini Jazani / Unsplash. Images are illustrative.",
};

/** پروژه‌های منتخب لندینگ */
export const featured = listings.filter((l) => l.id.startsWith("DEMO")).slice(0, 6);
export const freshCount = listings.filter((l) => isNew(l)).length;
export const totalCount = listings.length;

/** شمار پروژه‌های هر استان (برای نقشه) */
export const byProvince = listings.reduce<Record<string, number>>((m, l) => { if (l.province) m[l.province] = (m[l.province] ?? 0) + 1; return m; }, {});

export const navLinks = [
  { href: "/opportunities", label: "پروژه‌ها" },
  { href: "/tools", label: "جذب سرمایه" },
  { href: "/assistant", label: "دستیار" },
  { href: "/compare", label: "مقایسه" },
  { href: "/saved", label: "علاقه‌مندی‌ها" },
];
