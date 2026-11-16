"use client";
// صفحه خدمات و صفحه هر خدمت. هر خدمت عکس و امضای تصویری خودش را دارد و راهنمای مرتبط از
// «راهنمای همکاری و مستندات» نسخه مرجع کنار فرم می‌آید.
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Book1, Buildings, DocumentText, Flash, Global, LampOn, Lifebuoy, MessageQuestion, People, TaskSquare, type Icon } from "@/components/iconsax";
import { CountUp } from "@/components/brand/reveal";
import { routes } from "@/data/routes";
import { listings } from "@/lib/listings";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { Header, Footer } from "@/components/site/header";
import { SignaturePhoto } from "@/components/listing/signature-photo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toolIcons } from "@/components/icons";
import { TopicList } from "@/components/guide/library";
import { libraryIntro, libraryTopics, topicsFor } from "@/data/library";
import { toolById, toolGroups, visibleTools, type ToolDef } from "@/data/tools";
import { cn, faNumber } from "@/lib/utils";
import { LegacyTool } from "./engine";

/** هر دسته به زبان نیاز صاحب پروژه: «چه چیزی دارید؟» */
const intents: Record<ToolDef["group"], { title: string; short: string; lead: string; icon: Icon }> = {
  plan: { title: "طرح یا ایده دارم", short: "طرح یا ایده", lead: "برای اجرای طرحم سرمایه‌گذار یا شریک می‌خواهم.", icon: LampOn },
  land: { title: "زمین یا سرمایه خارجی دارم", short: "زمین یا سرمایه خارجی", lead: "زمینم را آماده‌ی توسعه می‌کنم یا از خارج سرمایه می‌آورم.", icon: Global },
  more: { title: "ملک دارم", short: "ملک", lead: "برای نوسازی، اجاره‌داری، معاوضه یا کار خیر.", icon: Buildings },
  docs: { title: "هنوز مطمئن نیستم", short: "هنوز مطمئن نیستم", lead: "اول پرسش‌های مهم هر همکاری را مرور می‌کنم.", icon: Book1 },
};
const needBands = ["تا ۱۰ میلیارد", "۱۰ تا ۱۰۰ میلیارد", "بیش از ۱۰۰ میلیارد", "هنوز نمی‌دانم"];
const readiness = ["فقط ایده", "طرح یا نقشه دارم", "زمین و مجوز دارم"];
/** پیشنهاد خدمت از روی سه پاسخ، ساده و قابل پیش‌بینی */
function recommend(group: ToolDef["group"], ready: number): ToolDef {
  if (group === "plan") return toolById(ready === 0 ? "ideas" : "proposal")!;
  if (group === "land") return toolById("land-preparation")!;
  if (group === "more") return toolById("ma-notice")!;
  return toolById("library")!;
}
// مراحل از الگوی مشترک سکوهای جذب سرمایه: ارزیابی کوتاه، پرونده کامل، بازبینی، معرفی به سرمایه‌گذار
const process = [
  { t: "ارزیابی سریع", d: "سه پرسش، خدمت مناسب شما پیشنهاد می‌شود.", time: "۳۰ ثانیه", icon: Flash },
  { t: "تکمیل پرونده", d: "فرم چندمرحله‌ای با نوار پیشرفت، روی همین دستگاه ذخیره می‌شود.", time: "حدود ۱۰ دقیقه", icon: DocumentText },
  { t: "گزارش و پیش‌نیازها", d: "خلاصه‌ی پرونده و کارهای مانده را همان لحظه می‌گیرید.", time: "همان لحظه", icon: TaskSquare },
  { t: "معرفی به سرمایه‌گذار", d: "پرونده‌ی کامل در مسیر سرمایه‌گذاران متناسب دیده می‌شود.", time: "پس از بازبینی", icon: People },
];
// آنچه سرمایه‌گذار پیش از اولین تماس می‌پرسد، پرونده‌ی هر خدمت به همین‌ها جواب می‌دهد
const investorAsks = [
  { t: "آورده‌ی شما چیست؟", d: "طرح، زمین، ملک، مجوز یا توان اجرایی، و سهم هر طرف از آن." },
  { t: "چقدر پول و تا کی؟", d: "نیاز مالی، زمان‌بندی تزریق و دوره‌ی بازگشت سرمایه." },
  { t: "وضعیت حقوقی روشن است؟", d: "سند، کاربری، مجوزها و هر مانعی که پیش از شروع باید رفع شود." },
  { t: "سود از کجا می‌آید؟", d: "فروش، اجاره یا درآمد بهره‌برداری، و ریسک‌هایی که می‌شناسید." },
];

function QuickCheck() {
  const [group, setGroup] = useState<ToolDef["group"] | null>(null);
  const [band, setBand] = useState<number | null>(null);
  const [ready, setReady] = useState<number | null>(null);
  const needsMoney = group === "plan" || group === "land";
  const done = group && (group === "docs" || group === "more" || (band != null && ready != null));
  const rec = done ? recommend(group!, ready ?? 1) : null;
  const R = rec ? toolIcons[rec.id] : null;
  const opt = (on: boolean) => cn("h-10 rounded-xl border px-3 text-[12.5px] font-bold transition-colors", on ? "border-cobalt bg-cobalt text-white" : "border-border bg-white text-ink hover:border-ink/30");
  return (
    <div id="check" className="relative scroll-mt-28 overflow-hidden rounded-[2rem] bg-white p-7 shadow-[0_30px_70px_-44px_rgb(20_30_45/0.45)] ring-1 ring-border">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[13px] font-extrabold text-ink"><Flash size={17} variant="Bold" className="text-cobalt" />ارزیابی ۳۰ ثانیه‌ای</p>
        <span className="text-[12px] font-bold tabular-nums text-muted-foreground">{faNumber([group, needsMoney ? band != null : group, needsMoney ? ready != null : group].filter(Boolean).length)} از ۳</span>
      </div>
      <div className="mt-5 space-y-5">
        <div>
          <p className="mb-2.5 text-[14px] font-extrabold text-ink">۱. چه چیزی دارید؟</p>
          <div className="grid grid-cols-2 gap-2">
            {toolGroups.map((g) => { const x = intents[g.id]; const I = x.icon; const on = group === g.id;
              return <button key={g.id} type="button" aria-pressed={on} onClick={() => setGroup(g.id)} className={cn(opt(on), "flex h-12 items-center gap-2.5 text-right")}><I size={18} variant="Bulk" className={on ? "text-white" : "text-ink/55"} />{x.short}</button>; })}
          </div>
        </div>
        <AnimatePresence initial={false}>
          {needsMoney && (
            <motion.div key="q2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5 overflow-hidden">
              <div>
                <p className="mb-2.5 text-[14px] font-extrabold text-ink">۲. چقدر سرمایه لازم دارید؟ <span className="text-[12px] font-semibold text-muted-foreground">(تومان)</span></p>
                <div className="grid grid-cols-4 gap-2">{needBands.map((b, i) => <button key={b} type="button" aria-pressed={band === i} onClick={() => setBand(i)} className={opt(band === i)}>{b}</button>)}</div>
              </div>
              <div>
                <p className="mb-2.5 text-[14px] font-extrabold text-ink">۳. کار تا کجا پیش رفته؟</p>
                <div className="grid grid-cols-3 gap-2">{readiness.map((b, i) => <button key={b} type="button" aria-pressed={ready === i} onClick={() => setReady(i)} className={opt(ready === i)}>{b}</button>)}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {rec && R ? (
          <motion.div key={rec.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="mt-6 flex items-center gap-4 rounded-2xl bg-[#f3f6fa] p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-white"><R size={22} variant="Bulk" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11.5px] font-bold text-muted-foreground">پیشنهاد برای شما</span>
              <span className="block truncate text-[15px] font-extrabold text-ink">{rec.name}</span>
            </span>
            <Link href={`/tools/${rec.id}`} className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-[13.5px] font-extrabold text-white hover:bg-primary/90">شروع<ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /></Link>
          </motion.div>
        ) : (
          <motion.p key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 rounded-2xl border border-dashed border-border px-4 py-4 text-center text-[12.5px] font-semibold text-muted-foreground">پاسخ‌ها را بدهید تا خدمت مناسب پرونده‌تان پیشنهاد شود.</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** فهرست خدمات: هر خدمت یک کارت افقی با عکس، برای چه کسی است، توضیح کامل و دکمه‌ی شروع.
 *  با دکمه‌های بالا فهرست به «آنچه دارید» محدود می‌شود، ستون نیمه‌خالی و متن بریده ندارد. */
function ServiceCatalog() {
  const [tab, setTab] = useState<"all" | ToolDef["group"]>("all");
  const list = visibleTools.filter((t) => tab === "all" || t.group === tab);
  const tabs: ["all" | ToolDef["group"], string, Icon, number][] = [
    ["all", "همه خدمات", TaskSquare, visibleTools.length],
    ...toolGroups.map((g) => [g.id, intents[g.id].title, intents[g.id].icon, visibleTools.filter((t) => t.group === g.id).length] as ["all" | ToolDef["group"], string, Icon, number]),
  ];
  return (
    <section id="services" className="mt-24 scroll-mt-28">
      <h2 className="text-[1.6rem] font-black text-ink">همه خدمات، بر اساس آنچه دارید</h2>
      <p className="mt-1.5 text-[14px] text-muted-foreground">هر خدمت یک فرم کوتاه است که پرونده‌ی شما را برای همان نوع همکاری مرتب می‌کند.</p>
      <div role="tablist" aria-label="آنچه دارید" className="mt-6 flex flex-wrap gap-2">
        {tabs.map(([id, label, I, n]) => { const on = tab === id;
          return (
            <button key={id} type="button" role="tab" aria-selected={on} onClick={() => setTab(id)}
              className={cn("inline-flex h-11 items-center gap-2 rounded-full border pl-2 pr-4 text-[13.5px] font-extrabold transition-colors", on ? "border-cobalt bg-cobalt text-white" : "border-border bg-white text-ink/75 hover:border-ink/25 hover:text-ink")}>
              <I size={17} variant="Bulk" />{label}
              <span className={cn("grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[11.5px] tabular-nums", on ? "bg-white/20" : "bg-muted text-ink/60")}>{faNumber(n)}</span>
            </button>
          ); })}
      </div>
      <motion.ul layout className="mt-6 grid grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((t) => { const T = toolIcons[t.id]; const it = intents[t.group]; const Ii = it.icon;
            return (
              <motion.li key={t.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }}>
                <Link href={`/tools/${t.id}`} className="group grid h-full grid-cols-[9rem_minmax(0,1fr)] gap-5 rounded-[1.75rem] bg-white p-2.5 pl-6 ring-1 ring-border transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-32px_rgb(20_30_45/0.45)] hover:ring-ink/15">
                  <SignaturePhoto src={t.image ?? "/images/hero/office.jpg"} alt="" mark={false} sizes="9rem" className="h-full min-h-[9.5rem] rounded-[1.35rem]">
                    <span className="absolute bottom-2.5 right-2.5 grid size-9 place-items-center rounded-xl bg-white text-ink shadow-sm"><T size={18} variant="Bulk" /></span>
                  </SignaturePhoto>
                  <span className="flex min-w-0 flex-col py-2">
                    <span className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground"><Ii size={14} variant="Bulk" />{it.title}</span>
                    <span className="mt-1.5 text-[16.5px] font-extrabold leading-7 text-ink">{t.name}</span>
                    <span className="mt-1 text-[13.5px] leading-7 text-ink/65">{t.description}</span>
                    <span className="mt-auto flex items-center gap-1.5 pt-3 text-[13px] font-extrabold text-primary">{t.id === "library" ? "مطالعه راهنما" : "شروع خدمت"}<ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" /></span>
                  </span>
                </Link>
              </motion.li>
            ); })}
        </AnimatePresence>
      </motion.ul>
    </section>
  );
}

export function ToolsIndex() {
  const investorRoutes = routes.length;
  const live = listings.length;
  const provincesN = new Set(listings.map((l) => l.province).filter(Boolean)).size;
  return (
    <>
      <Header />
      <main className="focus-blur relative mx-auto max-w-7xl px-6 pt-10">
        <AlgoPattern className="-right-24 top-0 -z-10 h-[30rem] w-[44rem] text-ink/[0.06]" fade="radial" />
        {/* بالای صفحه: پیام، اعداد و ارزیابی سریع کنار هم */}
        <section className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-14">
          <div>
            <span className="inline-flex items-center gap-2 text-[13px] font-extrabold text-ink/55"><NodeMark className="text-primary" />جذب سرمایه · برای صاحبان طرح، زمین و ملک</span>
            <h1 className="mt-4 text-[2.75rem] font-black leading-[1.45] tracking-tight text-ink">پروژه‌تان را جلوی چشم<br /><span className="relative inline-block">سرمایه‌گذار<svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-3.5 w-full"><motion.path d="M4 14 C 80 4, 200 4, 296 12" fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-cobalt/70" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5 }} /></svg></span> بگذارید.</h1>
            <p className="mt-5 max-w-xl text-[16px] leading-8 text-muted-foreground">سرمایه‌گذار پیش از هر تماسی چند چیز را می‌پرسد: آورده، نیاز مالی، وضعیت حقوقی و بازگشت سرمایه. پرونده‌ای که به همین‌ها جواب بدهد، اینجا در چند پرسش کوتاه آماده می‌شود.</p>
            <div className="mt-8 flex items-center gap-3">
              <a href="#check" className="group inline-flex h-13 items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-extrabold text-white shadow-[0_18px_36px_-20px_var(--primary)] hover:bg-primary/90">شروع ارزیابی<ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /></a>
              <Link href="/tools/library" className="inline-flex h-13 items-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-bold text-ink/70 hover:text-ink">اول راهنما را می‌خوانم</Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-x-reverse divide-border border-t border-border pt-6">
              {[[live, "پروژه در دید سرمایه‌گذاران"], [investorRoutes, "مسیر ورود سرمایه‌گذار"], [provincesN, "استان با پروژه فعال"]].map(([n, l], i) => (
                <div key={l as string} className={cn(i ? "pr-5" : "pl-5")}>
                  <dt className="sr-only">{l as string}</dt>
                  <dd className="text-[1.9rem] font-black leading-none text-ink"><CountUp value={n as number} /></dd>
                  <dd className="mt-2 text-[12px] font-semibold leading-5 text-muted-foreground">{l as string}</dd>
                </div>
              ))}
            </dl>
          </div>
          <QuickCheck />
        </section>

        {/* فرایند: چهار گام با زمان هر گام */}
        <section className="mt-24">
          <h2 className="text-[1.6rem] font-black text-ink">از ایده تا سرمایه‌گذار، در چهار گام</h2>
          <ol className="relative mt-8 grid grid-cols-4 gap-5">
            <motion.span aria-hidden className="absolute right-6 left-6 top-6 h-px origin-right bg-ink/15" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
            {process.map((x, i) => { const I = x.icon;
              return (
                <motion.li key={x.t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }} className="relative">
                  <span className={cn("relative grid size-12 place-items-center rounded-2xl ring-4 ring-background", i === 0 ? "bg-ink text-white" : "bg-white text-ink shadow-[0_8px_20px_-14px_rgb(20_30_45/0.5)]")}><I size={21} variant="Bulk" /></span>
                  <p className="mt-5 flex items-center gap-2 text-[16px] font-extrabold text-ink">{x.t}<span className="rounded-full bg-cobalt-soft px-2.5 py-0.5 text-[11px] font-extrabold text-cobalt-deep">{x.time}</span></p>
                  <p className="mt-1.5 text-[13.5px] leading-7 text-muted-foreground">{x.d}</p>
                </motion.li>
              ); })}
          </ol>
        </section>

        {/* همه خدمات: فیلتر «چه چیزی دارید؟» و کارت‌های هم‌اندازه، دوتایی کنار هم */}
        <ServiceCatalog />

        {/* آنچه سرمایه‌گذار می‌پرسد */}
        <section className="mt-24 grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-start gap-14">
          <div className="sticky top-28">
            <h2 className="text-[1.6rem] font-black leading-[1.5] text-ink">سرمایه‌گذار پیش از اولین تماس<br />این چهار سؤال را می‌پرسد.</h2>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">پرونده‌ی هر خدمت دقیقاً برای جواب دادن به همین‌ها چیده شده، هرچه روشن‌تر، گفت‌وگو کوتاه‌تر.</p>
            <Link href="/tools/library" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white px-5 text-[13px] font-extrabold text-ink hover:border-ink/30">راهنمای کامل همکاری<ArrowLeft size={15} /></Link>
          </div>
          <ol className="grid grid-cols-2 gap-4">
            {investorAsks.map((q, i) => (
              <motion.li key={q.t} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-[1.5rem] bg-white p-6 ring-1 ring-border">
                <span className="text-[13px] font-black text-cobalt-deep">{faNumber(i + 1)}</span>
                <p className="mt-2 text-[16px] font-extrabold text-ink">{q.t}</p>
                <p className="mt-1.5 text-[13px] leading-7 text-muted-foreground">{q.d}</p>
              </motion.li>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}

/** راهنمای مرتبط با هر خدمت: کنار فرم، و کامل در پنل کناری */
function GuideSheet({ toolId }: { toolId: string }) {
  const related = topicsFor(toolId);
  const rest = libraryTopics.filter((t) => !related.includes(t));
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="plain" size="auto" className="h-11 gap-2 rounded-full bg-white/95 px-5 text-sm font-extrabold text-ink shadow-lg hover:bg-white"><Lifebuoy size={18} variant="Bulk" className="text-primary" />راهنمای این خدمت</Button>
      </SheetTrigger>
      <SheetContent side="left" className="thin-scroll w-[30rem] overflow-y-auto p-0 sm:max-w-[30rem]">
        <SheetHeader className="border-b border-border p-6 text-right">
          <span className="text-[13px] font-extrabold text-primary">شناخت فرصت، پیش از تصمیم</span>
          <SheetTitle className="text-xl font-black text-ink">راهنمای همکاری و مستندات</SheetTitle>
          <SheetDescription className="text-[13px] leading-6">{libraryIntro}</SheetDescription>
        </SheetHeader>
        <div className="px-6 pb-8">
          {related.length > 0 && <><p className="mt-5 text-xs font-extrabold text-muted-foreground">مرتبط با این خدمت</p><TopicList topics={related} /></>}
          <p className="mt-6 text-xs font-extrabold text-muted-foreground">سایر راهنماها</p>
          <TopicList topics={rest} open={false} />
          <Button asChild variant="outline" className="mt-6 h-11 w-full rounded-full bg-white font-bold shadow-none hover:border-ink/25 hover:text-ink"><Link href="/tools/library">منابع مرجع و شفافیت اطلاعات</Link></Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ToolView({ id }: { id: string }) {
  const tool = toolById(id)!;
  const group = toolGroups.find((g) => g.id === tool.group)!;
  const I = toolIcons[tool.id];
  const related = topicsFor(id);
  const others = visibleTools.filter((t) => t.id !== id);
  return (
    <>
      <Header />
      <main className="focus-blur relative mx-auto max-w-7xl px-6 pt-8">
        <SignaturePhoto src={tool.image ?? "/images/hero/office.jpg"} alt="" priority sizes="90vw" className="h-56 rounded-[2rem]">
          <div className="absolute inset-0 flex flex-col justify-between p-7">
            <nav className="flex items-center gap-2 self-start text-[13px] font-bold text-white/80" aria-label="مسیر">
              <Link href="/tools" className="inline-flex items-center gap-1.5 hover:text-white"><ArrowRight size={15} />جذب سرمایه</Link>
              <span className="text-white/40">/</span><span>{group.name}</span>
            </nav>
            <div className="flex items-end justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-primary shadow-xl"><I size={28} variant="Bulk" /></span>
                <div>
                  <h1 className="text-3xl font-black leading-[1.4] text-white">{tool.name}</h1>
                  <p className="mt-1 max-w-2xl text-sm leading-7 text-white/80">{tool.description}</p>
                </div>
              </div>
              {id !== "library" && <GuideSheet toolId={id} />}
            </div>
          </div>
        </SignaturePhoto>

        <div className={cn("mt-7 grid items-start gap-7", id === "library" ? "grid-cols-1" : "grid-cols-[1fr_19rem]")}>
          <Card className="surface relative block min-h-[60dvh] min-w-0 gap-0 overflow-clip rounded-[2rem] p-9 shadow-none">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-primary via-primary/60 to-transparent" />
            <LegacyTool key={id} opener={tool.opener} root={tool.root} />
          </Card>
          {id !== "library" && (
            <aside className="sticky top-24 space-y-5">
              {related.length > 0 && (
                <Card className="surface gap-0 rounded-[1.75rem] px-5 pb-2 pt-5 shadow-none">
                  <h2 className="flex items-center gap-2 text-[15px] font-black text-ink"><MessageQuestion size={19} variant="Bulk" className="text-primary" />پیش از شروع بدانید</h2>
                  <TopicList topics={related.slice(0, 3)} />
                </Card>
              )}
              <Card className="surface gap-0 rounded-[1.75rem] p-2.5 shadow-none">
                <p className="px-3 pb-1.5 pt-2 text-xs font-extrabold text-muted-foreground">خدمات دیگر</p>
                {others.map((t) => { const T = toolIcons[t.id];
                  return (
                    <Link key={t.id} href={`/tools/${t.id}`} className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-[13px] font-bold text-ink/70 transition-colors hover:bg-ink/[0.03] hover:text-ink">
                      <T size={17} variant="Bulk" className="shrink-0" /><span className="min-w-0 truncate">{t.name}</span>
                    </Link>
                  ); })}
              </Card>
            </aside>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
