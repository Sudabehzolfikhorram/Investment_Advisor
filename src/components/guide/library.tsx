"use client";
// راهنمای همکاری و مستندات (از بخش «راهنمای همکاری و مستندات» نسخه مرجع)، برای کنار صفحات خدمات و صفحه اصلی
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "@/components/iconsax";
import { libraryTopics, type LibraryTopic } from "@/data/library";
import { cn, faNumber } from "@/lib/utils";

export function TopicBody({ t }: { t: LibraryTopic }) {
  return (
    <div className="space-y-2.5 text-[13px] leading-7 text-ink/75">
      {t.body.map((b, i) => <p key={i}>{b.lead && <b className="font-extrabold text-ink">{b.lead} </b>}{b.text}</p>)}
      {t.links && (
        <div className="flex flex-wrap gap-2 pt-1">
          {t.links.map((l) => <Button key={l.tool} asChild variant="outline" size="xs" className="rounded-full bg-white font-bold shadow-none hover:border-primary hover:text-primary"><Link href={`/tools/${l.tool}`}>{l.label}</Link></Button>)}
        </div>
      )}
    </div>
  );
}

/** فهرست بازشوی پرسش‌های راهنما؛ اولی باز است */
export function TopicList({ topics, numbered, className, open = true, start = 0 }: { topics: LibraryTopic[]; numbered?: boolean; className?: string; open?: boolean; start?: number }) {
  return (
    <Accordion type="single" collapsible defaultValue={open ? topics[0]?.id : undefined} className={className}>
      {topics.map((t, i) => (
        <AccordionItem key={t.id} value={t.id} className="border-border">
          <AccordionTrigger className="items-start gap-3 py-3.5 text-right text-[13px] font-extrabold leading-6 text-ink hover:no-underline">
            <span className="flex items-start gap-2.5">{numbered && <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-black text-primary">{faNumber(start + i + 1)}</span>}{t.title}</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4"><TopicBody t={t} /></AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/** خلاصه راهنما در صفحه اصلی: برای وقتی که پیش از تصمیم به راهنمایی نیاز دارید */
export function HelpSummary({ className }: { className?: string }) {
  const featured = libraryTopics.filter((t) => t.id !== "services").slice(0, 6);
  return (
    <div className={cn("grid grid-cols-[19rem_1fr] gap-8", className)}>
      <div className="flex flex-col justify-between rounded-[2rem] bg-deep p-7 text-white">
        <div>
          <span className="text-[13px] font-extrabold text-white/70">شناخت فرصت، پیش از تصمیم</span>
          <h3 className="mt-2 text-2xl font-black leading-[1.5]">راهنمای همکاری و مستندات</h3>
          <p className="mt-3 text-sm leading-7 text-white/70">پرسش‌هایی که پیش از هر همکاری باید جوابشان روشن باشد؛ از مدل قرارداد تا تضمین و حقوق ملک.</p>
        </div>
        <Button asChild variant="plain" size="auto" className="group mt-8 h-12 w-fit gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-ink hover:bg-white/90">
          <Link href="/tools/library">همه راهنماها و منابع<ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /></Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-x-8">
        <TopicList topics={featured.slice(0, 3)} numbered />
        <TopicList topics={featured.slice(3)} numbered open={false} start={3} />
      </div>
    </div>
  );
}
