"use client";
// صفحه خدمات و صفحه هر خدمت. هر خدمت عکس و امضای تصویری خودش را دارد و راهنمای مرتبط از
// «راهنمای همکاری و مستندات» نسخه مرجع کنار فرم می‌آید.
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Book1, Buildings, Global, LampOn, Lifebuoy, MessageQuestion, type Icon } from "@/components/iconsax";
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

const groupLead: Record<ToolDef["group"], string> = {
  plan: "طرح یا ایده‌ای دارید و دنبال سرمایه یا همکار هستید.",
  land: "زمین یا ملکی دارید، یا با سرمایه بین‌المللی وارد می‌شوید.",
  more: "خدمات تکمیلی برای فراخوان، نوسازی، اجاره‌داری، معاوضه و کار خیر.",
  docs: "پیش از تصمیم، پرسش‌های مهم هر همکاری را مرور کنید.",
};

/** هر دسته به زبان نیاز کاربر: «چه چیزی دارید؟» */
const intents: Record<ToolDef["group"], { title: string; lead: string; icon: Icon }> = {
  plan: { title: "طرح یا ایده دارم", lead: "دنبال سرمایه یا همکار برای اجرای آن هستم.", icon: LampOn },
  land: { title: "زمین یا سرمایه بین‌المللی دارم", lead: "زمین و ملک را آماده‌ی توسعه می‌کنم، یا از خارج سرمایه می‌آورم.", icon: Global },
  more: { title: "ملک برای نوسازی، اجاره یا معاوضه", lead: "پرونده فرصت، نوسازی، اجاره‌داری، معاوضه و کار خیر.", icon: Buildings },
  docs: { title: "اول می‌خواهم بیشتر بدانم", lead: "پرسش‌های مهم هر همکاری را پیش از شروع مرور می‌کنم.", icon: Book1 },
};
const howSteps = [
  { t: "خدمت متناسب را انتخاب کنید", d: "بر اساس آنچه دارید: طرح، زمین، ملک یا سرمایه." },
  { t: "فرم کوتاه چندمرحله‌ای را پر کنید", d: "پیشرفت و پرسش‌های بی‌پاسخ همان‌جا دیده می‌شود." },
  { t: "گزارش و پیش‌نیازها را بگیرید", d: "خلاصه‌ی اطلاعات و کارهای بعدی را دریافت می‌کنید." },
];

function ServiceRow({ t, i }: { t: ToolDef; i: number }) {
  const I = toolIcons[t.id];
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
      <Link href={`/tools/${t.id}`} className="group flex h-full items-stretch gap-4 rounded-[1.5rem] border border-border bg-white p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_24px_50px_-34px_rgb(20_30_45/0.35)]">
        <SignaturePhoto src={t.image ?? "/images/hero/office.jpg"} alt="" mark={false} sizes="12rem" className="w-40 shrink-0 rounded-[1.1rem] [&_img]:grayscale-[0.6] [&_img]:transition-[filter] group-hover:[&_img]:grayscale-0">
          <span className="absolute bottom-2.5 right-2.5 grid size-9 place-items-center rounded-xl bg-white/95 text-ink"><I size={18} variant="Bulk" /></span>
        </SignaturePhoto>
        <div className="flex min-w-0 flex-1 flex-col py-2 pl-2">
          <h3 className="text-[15.5px] font-extrabold leading-7 text-ink">{t.name}</h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-muted-foreground">{t.description}</p>
          <span className="mt-auto flex items-center gap-1.5 pt-3 text-[12.5px] font-extrabold text-ink/70 transition-colors group-hover:text-primary">شروع<ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" /></span>
        </div>
      </Link>
    </motion.div>
  );
}

export function ToolsIndex() {
  const [group, setGroup] = useState<ToolDef["group"]>("plan");
  const list = visibleTools.filter((t) => t.group === group);
  const pick = (g: ToolDef["group"]) => { setGroup(g); requestAnimationFrame(() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" })); };
  return (
    <>
      <Header />
      <main className="relative mx-auto max-w-7xl px-6 pt-10">
        <AlgoPattern className="-left-24 top-0 -z-10 h-[26rem] w-[40rem] text-ink/[0.07]" fade="radial" />
        {/* بالای صفحه: پیام اصلی و انتخاب بر اساس نیاز؛ کنارش سه گام کار */}
        <section className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-stretch gap-8">
          <div>
            <span className="inline-flex items-center gap-2 text-[13px] font-extrabold text-ink/55"><NodeMark className="text-primary" />جذب سرمایه</span>
            <h1 className="mt-3 text-[2.4rem] font-black leading-[1.45] text-ink">طرح، زمین یا ملکتان را<br />برای سرمایه‌گذار آماده کنید.</h1>
            <p className="mt-3 max-w-xl text-[15px] leading-8 text-muted-foreground">هر خدمت یک فرم کوتاه چندمرحله‌ای است که اطلاعات لازم برای همکاری و تأمین مالی را مرتب می‌کند. راهنمای همان خدمت کنار فرم است.</p>
            <p className="mt-8 text-[13px] font-extrabold text-ink">چه چیزی دارید؟</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {toolGroups.map((g) => { const x = intents[g.id]; const I = x.icon; const n = visibleTools.filter((t) => t.group === g.id).length; const on = group === g.id;
                return (
                  <button key={g.id} type="button" onClick={() => pick(g.id)} aria-pressed={on}
                    className={cn("group flex items-start gap-3 rounded-[1.4rem] border p-4 text-right transition-all duration-300", on ? "border-ink bg-ink text-white shadow-[0_22px_44px_-28px_rgb(20_30_45/0.6)]" : "border-border bg-white hover:-translate-y-0.5 hover:border-ink/25")}>
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl transition-colors", on ? "bg-white/15 text-white" : "bg-muted text-ink/70")}><I size={20} variant="Bulk" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-extrabold leading-6">{x.title}</span>
                      <span className={cn("mt-0.5 block text-[12px] leading-6", on ? "text-white/70" : "text-muted-foreground")}>{x.lead}</span>
                    </span>
                    <span className={cn("shrink-0 text-[11px] font-bold", on ? "text-white/60" : "text-muted-foreground")}>{faNumber(n)} خدمت</span>
                  </button>
                ); })}
            </div>
          </div>
          <SignaturePhoto src="/images/hero/construction.jpg" alt="" priority sizes="40vw" className="min-h-[30rem] rounded-[2rem]">
            <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] bg-white/92 p-5 backdrop-blur-xl">
              <p className="text-[12px] font-extrabold text-muted-foreground">سه گام تا آماده شدن پرونده</p>
              <ol className="mt-3 space-y-3">
                {howSteps.map((s, i) => (
                  <motion.li key={s.t} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }} className="flex gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-[12px] font-black text-white">{faNumber(i + 1)}</span>
                    <span><span className="block text-[13.5px] font-extrabold text-ink">{s.t}</span><span className="block text-[12px] leading-6 text-muted-foreground">{s.d}</span></span>
                  </motion.li>
                ))}
              </ol>
            </div>
          </SignaturePhoto>
        </section>

        {/* فهرست خدمات همان نیاز */}
        <section id="services" className="mt-16 scroll-mt-28">
          <div className="flex items-end justify-between gap-6 border-b border-border pb-4">
            <div>
              <h2 className="text-[1.5rem] font-black text-ink">{intents[group].title}</h2>
              <p className="mt-1 text-[13.5px] text-muted-foreground">{groupLead[group]}</p>
            </div>
            <nav className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-white p-1" aria-label="دسته‌های خدمات">
              {toolGroups.map((g) => (
                <button key={g.id} type="button" onClick={() => setGroup(g.id)} aria-pressed={group === g.id} className={cn("relative h-9 rounded-full px-4 text-[12.5px] font-extrabold transition-colors", group === g.id ? "text-white" : "text-ink/60 hover:text-ink")}>
                  {group === g.id && <motion.span layoutId="svc-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 320, damping: 30 }} />}
                  <span className="relative">{g.name}</span>
                </button>
              ))}
            </nav>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={group} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-6">
              {group === "docs" ? (
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-5">
                  <div className="space-y-4">{list.map((t, i) => <ServiceRow key={t.id} t={t} i={i} />)}</div>
                  <Card className="surface gap-0 rounded-[1.5rem] px-6 py-2 shadow-none"><TopicList topics={libraryTopics.slice(0, 5)} numbered open={false} /></Card>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">{list.map((t, i) => <ServiceRow key={t.id} t={t} i={i} />)}</div>
              )}
            </motion.div>
          </AnimatePresence>
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
          <Button asChild variant="outline" className="mt-6 h-11 w-full rounded-full bg-white font-bold shadow-none hover:border-primary hover:text-primary"><Link href="/tools/library">منابع مرجع و شفافیت اطلاعات</Link></Button>
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
      <main className="relative mx-auto max-w-7xl px-6 pt-8">
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
                    <Link key={t.id} href={`/tools/${t.id}`} className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-[13px] font-bold text-ink/70 transition-colors hover:bg-primary/5 hover:text-primary">
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
