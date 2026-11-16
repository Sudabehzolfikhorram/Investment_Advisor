"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArchiveAdd, ArchiveTick, Convertshape2, TickCircle } from "@/components/iconsax";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignaturePhoto } from "./signature-photo";
import { useHoverGallery } from "./gallery";
import { useHydrated, useStore } from "@/lib/store";
import { isNew } from "@/lib/listings";
import type { Listing, MatchReason } from "@/types";
import { cn, faNumber } from "@/lib/utils";

export function SaveButton({ id, className, label }: { id: string; className?: string; label?: boolean }) {
  const { user, saved, toggleSaved, openLogin } = useStore();
  const hydrated = useHydrated();
  const on = hydrated && saved.includes(id);
  return (
    <Button variant="plain" size="auto" type="button" aria-pressed={on} aria-label={on ? "حذف از ذخیره‌شده‌ها" : "ذخیره پروژه"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation();
        if (!user) return openLogin({ type: "save-listing", id });
        toggleSaved(id); toast(on ? "از ذخیره‌شده‌ها حذف شد." : "پروژه ذخیره شد."); }}
      className={cn("inline-flex items-center justify-center gap-2 rounded-full transition-all active:scale-95", label ? "h-12 px-5 font-bold" : "size-10", on ? "bg-primary text-white" : label ? "border border-border bg-white text-ink hover:border-ink/25 hover:text-ink" : "bg-teal-900/50 text-white hover:bg-teal-800/75", className)}>
      {on ? <ArchiveTick size={20} variant="Bold" /> : <ArchiveAdd size={20} />}
      {label && <span>{on ? "ذخیره شد" : "ذخیره پروژه"}</span>}
    </Button>
  );
}

function CompareButton({ id }: { id: string }) {
  const router = useRouter();
  const { compare, toggleCompare } = useStore();
  const hydrated = useHydrated();
  const on = hydrated && compare.includes(id), full = !on && compare.length >= 4;
  return (
    <Button variant="plain" size="auto" type="button" aria-pressed={on} title={full ? "حداکثر چهار پروژه" : undefined}
      onClick={(e) => { e.preventDefault(); e.stopPropagation();
        if (full) return toast("حداکثر چهار پروژه را می‌توانید مقایسه کنید.", { action: { label: "دیدن مقایسه", onClick: () => router.push("/compare") } });
        toggleCompare(id);
        const count = compare.length + (on ? -1 : 1);
        if (!on && count >= 2) toast(`${count === 4 ? "چهار" : count === 3 ? "سه" : "دو"} پروژه برای مقایسه آماده است.`, { action: { label: "مقایسه کنید", onClick: () => router.push("/compare") } }); }}
      aria-label={on ? "حذف از مقایسه" : "افزودن به مقایسه"}
      className={cn("inline-flex h-10 items-center justify-center gap-1.5 rounded-full text-[12.5px] font-extrabold text-white transition-all active:scale-95", on ? "bg-cobalt px-3.5 shadow-[0_8px_18px_-8px_var(--cobalt)]" : "w-10 bg-teal-900/50 backdrop-blur-sm hover:bg-teal-800/75")}>
      {/* پیش از انتخاب فقط آیکون، بعد از افزودن کلمه «در مقایسه» دیده می‌شود */}
      {on ? <><TickCircle size={17} variant="Bold" />در مقایسه</> : <Convertshape2 size={18} />}
    </Button>
  );
}

/** بج درصد تطابق: هم‌قد دکمه ذخیره، در همان ردیف بالای کارت */
function MatchBadge({ score }: { score: number }) {
  return (
    <span title="تطابق با شرایط شما" className="inline-flex h-10 shrink-0 items-center rounded-full bg-teal-900/50 px-3.5 text-[12.5px] font-extrabold tabular-nums text-white backdrop-blur-sm">
      {faNumber(score)}٪ تطابق
    </span>
  );
}

/** کارت پروژه: قابِ کارت خودِ عکس است، از پایین به بالا لایه‌ی مشکی و بلر می‌نشیند.
 *  بالای کارت: ذخیره، مقایسه و درصد تطابق در یک ردیف. پایین: عنوان و چهار داده (موقعیت یکی از آن‌هاست)، برچسب نوع حذف شده. */
export function ListingCard({ listing: l, score, index = 0, comparable = false }: { listing: Listing; score?: number; reasons?: MatchReason[]; index?: number; comparable?: boolean }) {
  const gallery = useHoverGallery(l);
  // موقعیت جای «محدوده» (یا آخرین داده) می‌نشیند تا مکان هم یکی از چهار داده‌ی پایین کارت باشد
  const place = l.city ? `${l.province}، ${l.city}` : null;
  const base = l.stats.filter((s) => s.value && !(place && s.label === "محدوده"));
  const stats = (place ? [...base.slice(0, 3), { label: "موقعیت", value: place }] : base.slice(0, 4));
  return (
    <motion.article className="h-full" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.04 }}>
      <Card {...gallery.bind} className="group relative isolate h-full min-h-[23.5rem] gap-0 overflow-hidden rounded-[1.75rem] border-0 bg-[#16181a] py-0 text-white shadow-[0_18px_44px_-30px_rgb(10_12_16/0.55)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(10_12_16/0.7)]">
        <Link href={`/opportunities/${l.id}`} className="absolute inset-0 z-10" aria-label={l.title} />
        <SignaturePhoto src={l.image} srcs={gallery.srcs} active={gallery.active} alt={l.title} mark={false} className="absolute inset-0 -z-10 rounded-none transition-transform duration-700 group-hover:scale-[1.04]">
          {gallery.dots}
        </SignaturePhoto>
        {/* بلر و لایه‌ی مشکی از پایین به بالا */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[58%] backdrop-blur-md [mask-image:linear-gradient(to_top,#000_50%,transparent)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[82%] bg-[linear-gradient(to_top,rgb(18_20_23/0.8)_0%,rgb(18_20_23/0.62)_45%,rgb(18_20_23/0.25)_68%,rgb(18_20_23/0)_100%)]" />
        <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex items-center gap-2 [&>*]:pointer-events-auto">
          {score != null && <MatchBadge score={score} />}
          {isNew(l) && <Badge className="h-7 bg-white px-2.5 text-[11px] font-extrabold text-primary-ink">جدید</Badge>}
          <span className="pointer-events-none mr-auto flex items-center gap-2 [&>*]:pointer-events-auto">
            {comparable && l.kind === "project" && <CompareButton id={l.id} />}
            <SaveButton id={l.id} />
          </span>
        </div>
        <div className="mt-auto flex flex-col p-5 pt-0">
          <h3 className="line-clamp-2 text-[17px] font-extrabold leading-7 text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.45)]">{l.title}</h3>
          {stats.length > 0 && (
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/15 pt-3.5">
              {stats.map((s) => (
                <div key={s.label} className="min-w-0"><dt className="text-[11px] font-semibold text-white/60">{s.label}</dt><dd className="truncate text-[14px] font-medium text-white">{s.value}</dd></div>
              ))}
            </dl>
          )}
        </div>
      </Card>
    </motion.article>
  );
}
