"use client";
// ابزارهای مشترک صفحه آزمایشگاه ایده‌ها (دور ۱۹). این صفحه موقت است و به هیچ صفحه‌ای از سایت دست نمی‌زند.
import Image from "next/image";
import Link from "next/link";
import { MatchRing } from "@/components/brand/reveal";
import { listings } from "@/lib/listings";
import type { Listing, Opportunity } from "@/types";
import { cn, faNumber } from "@/lib/utils";

export const projectListings = listings.filter((l) => l.kind === "project");
export const opp = (l: Listing) => l.raw as Opportunity;

/** پروژه‌هایی که مبلغ ورود، دوره بازگشت و زمان اولین دریافتشان اعلام شده است */
export const fullData = projectListings.filter((l) => { const o = opp(l); return o.minCapital != null && o.paybackYears != null && o.firstIncomeMonths != null; });

export const billion = (n: number) => `${faNumber(Math.round(n * 10) / 10)} میلیارد`;

/** کارت فشرده نتیجه: عکس کوچک، عنوان، محل و درصد تطابق */
export function MiniResult({ l, score, className }: { l: Listing; score?: number; className?: string }) {
  return (
    <Link href={`/opportunities/${l.id}`} target="_blank"
      className={cn("group flex items-center gap-3.5 rounded-2xl border border-border bg-white p-2.5 pl-3.5 transition-[border-color,box-shadow] hover:border-ink/20 hover:shadow-[0_14px_30px_-24px_rgb(22_32_48/0.5)]", className)}>
      <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image src={l.image} alt="" fill sizes="64px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 text-[14.5px] font-extrabold text-ink">{l.title}</span>
        <span className="mt-1 block truncate text-[12.5px] font-semibold text-muted-foreground">{l.province ? `${l.province}، ${l.city}` : l.tags.join(" · ")}{l.amount != null && ` · ${faNumber(l.amount)} ${l.amountUnit}`}</span>
      </span>
      {score != null && <MatchRing score={score} size={46} />}
    </Link>
  );
}

/** یادداشت هر ایده: همان قالبی که دستورالعمل شروع کار خواسته است */
export interface IdeaNote { idea: string; analogy: string; meets: string; bends: string; risk: string; test: string }

export function IdeaNotes({ note }: { note: IdeaNote }) {
  const rows: [string, string][] = [
    ["ایده در یک جمله", note.idea],
    ["از کجا آمده", note.analogy],
    ["کدام نیاز را برآورده می‌کند", note.meets],
    ["کدام قاعده را خم می‌کند", note.bends],
    ["ریسک و بهایش", note.risk],
    ["برای سنجیدنش چه تست کنیم", note.test],
  ];
  return (
    <dl className="space-y-4 rounded-[1.75rem] border border-border bg-white/70 p-6 backdrop-blur-sm">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="text-[12px] font-bold text-muted-foreground">{k}</dt>
          <dd className="mt-1 text-[14px] font-semibold leading-7 text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** جایگاه ایده روی طیف «مطمئن تا جسورانه» */
export function Spectrum({ at, total = 4 }: { at: number; total?: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] font-bold text-muted-foreground" aria-label={`جایگاه ${faNumber(at + 1)} از ${faNumber(total)} روی طیف مطمئن تا جسورانه`}>
      مطمئن
      <span className="flex gap-1">{Array.from({ length: total }, (_, i) => <span key={i} className={cn("h-1.5 w-6 rounded-full", i === at ? "bg-coral" : i < at ? "bg-ink/25" : "bg-ink/10")} />)}</span>
      جسورانه
    </span>
  );
}
