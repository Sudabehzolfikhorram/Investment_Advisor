"use client";
// صفحه خدمات و صفحه هر خدمت. هر خدمت عکس و امضای تصویری خودش را دارد و راهنمای مرتبط از
// «راهنمای همکاری و مستندات» نسخه مرجع کنار فرم می‌آید.
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Lifebuoy, MessageQuestion } from "@/components/iconsax";
import { NodeMark } from "@/components/brand/algo-pattern";
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

function ToolCard({ t, i, large }: { t: ToolDef; i: number; large?: boolean }) {
  const I = toolIcons[t.id];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}>
      <Link href={`/tools/${t.id}`} className="group block h-full">
        <Card className="surface h-full gap-0 overflow-hidden rounded-[1.75rem] p-0 shadow-none transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_60px_-34px_rgb(8_59_55/0.35)]">
          <SignaturePhoto src={t.image ?? "/images/hero/office.jpg"} alt="" className={large ? "aspect-[16/8]" : "aspect-[16/9]"} sizes="40vw">
            <span className="absolute bottom-4 right-4 flex items-center gap-2.5">
              <span className="grid size-11 place-items-center rounded-2xl bg-white/95 text-primary shadow-lg transition-colors group-hover:bg-primary group-hover:text-white"><I size={22} variant="Bulk" /></span>
              <span className={cn("font-extrabold text-white drop-shadow", large ? "text-xl" : "text-base")}>{t.name}</span>
            </span>
          </SignaturePhoto>
          <div className="flex items-end justify-between gap-4 p-5">
            <p className="text-[13px] leading-6 text-muted-foreground">{t.description}</p>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-ink/50 transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-white"><ArrowLeft size={17} className="transition-transform group-hover:-translate-x-0.5" /></span>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export function ToolsIndex() {
  return (
    <>
      <Header />
      <main className="relative mx-auto max-w-7xl px-6 pt-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-[13px] font-extrabold text-primary"><NodeMark />خدمات</span>
          <h1 className="mt-2 text-4xl font-black leading-[1.4] text-ink">هر کاری جز جست‌وجوی پروژه، از این‌جا شروع می‌شود.</h1>
          <p className="mt-3 text-[15px] leading-8 text-muted-foreground">{faNumber(visibleTools.length)} خدمت در {faNumber(toolGroups.length)} دسته؛ هر فرم چند مرحله کوتاه دارد و راهنمای همان خدمت کنارش است.</p>
        </div>
        <nav className="mt-6 flex gap-2" aria-label="دسته‌های خدمات">
          {toolGroups.map((g) => <Button key={g.id} asChild variant="outline" className="h-10 rounded-full bg-white px-4 text-[13px] font-bold shadow-none hover:border-primary hover:text-primary"><a href={`#g-${g.id}`}>{g.name}</a></Button>)}
        </nav>
        {toolGroups.map((g) => { const list = visibleTools.filter((t) => t.group === g.id); const large = list.length === 2;
          return (
            <section key={g.id} id={`g-${g.id}`} className="mt-14 scroll-mt-28">
              <div className="mb-5 flex items-baseline gap-3 border-b border-border pb-3">
                <h2 className="text-xl font-black text-ink">{g.name}</h2>
                <p className="text-[13px] text-muted-foreground">{groupLead[g.id]}</p>
              </div>
              {g.id === "docs" ? (
                <div className="grid grid-cols-[1fr_1.4fr] gap-5">
                  {list.map((t, i) => <ToolCard key={t.id} t={t} i={i} />)}
                  <Card className="surface gap-0 rounded-[1.75rem] px-6 py-2 shadow-none"><TopicList topics={libraryTopics.slice(0, 4)} numbered open={false} /></Card>
                </div>
              ) : (
                <div className={cn("grid gap-5", large ? "grid-cols-2" : "grid-cols-3")}>
                  {list.map((t, i) => <ToolCard key={t.id} t={t} i={i} large={large} />)}
                </div>
              )}
            </section>
          ); })}
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
              <Link href="/tools" className="inline-flex items-center gap-1.5 hover:text-white"><ArrowRight size={15} />همه خدمات</Link>
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
          <Card className="surface relative block min-h-[60dvh] min-w-0 gap-0 overflow-hidden rounded-[2rem] p-9 shadow-none">
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
