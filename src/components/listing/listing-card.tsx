"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArchiveAdd, ArchiveTick, Convertshape2, Location, TickCircle } from "@/components/iconsax";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignaturePhoto } from "./signature-photo";
import { useHoverGallery } from "./gallery";
import { MatchRing } from "@/components/brand/reveal";
import { useHydrated, useStore } from "@/lib/store";
import { isNew } from "@/lib/listings";
import type { Listing, MatchReason } from "@/types";
import { cn } from "@/lib/utils";

export function SaveButton({ id, className, label }: { id: string; className?: string; label?: boolean }) {
  const { user, saved, toggleSaved, openLogin } = useStore();
  const hydrated = useHydrated();
  const on = hydrated && saved.includes(id);
  return (
    <Button variant="plain" size="auto" type="button" aria-pressed={on} aria-label={on ? "حذف از ذخیره‌شده‌ها" : "ذخیره پروژه"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation();
        if (!user) return openLogin({ type: "save-listing", id });
        toggleSaved(id); toast(on ? "از ذخیره‌شده‌ها حذف شد." : "پروژه ذخیره شد."); }}
      className={cn("inline-flex items-center justify-center gap-2 rounded-full transition-all active:scale-95", label ? "h-12 px-5 font-bold" : "size-10", on ? "bg-primary text-white" : label ? "border border-border bg-white text-ink hover:border-primary hover:text-primary" : "bg-pine/55 text-white hover:bg-pine/70", className)}>
      {on ? <ArchiveTick size={20} variant="Bold" /> : <ArchiveAdd size={20} />}
      {label && <span>{on ? "ذخیره شد" : "ذخیره پروژه"}</span>}
    </Button>
  );
}

function CompareButton({ id }: { id: string }) {
  const { compare, toggleCompare } = useStore();
  const on = compare.includes(id), full = !on && compare.length >= 3;
  return (
    <Button variant="plain" size="auto" type="button" aria-pressed={on} aria-label={on ? "حذف از مقایسه" : "افزودن به مقایسه"} title={full ? "حداکثر سه پروژه" : on ? "حذف از مقایسه" : "مقایسه"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (full) return toast("حداکثر سه پروژه را می‌توانید مقایسه کنید."); toggleCompare(id); }}
      className={cn("inline-flex size-10 items-center justify-center rounded-full transition-all active:scale-95", on ? "bg-primary text-white" : "bg-pine/55 text-white hover:bg-pine/70")}>
      <Convertshape2 size={19} variant={on ? "Bold" : "Linear"} />
    </Button>
  );
}

export function ListingCard({ listing: l, score, reasons, index = 0, comparable = false }: { listing: Listing; score?: number; reasons?: MatchReason[]; index?: number; comparable?: boolean }) {
  const tag = l.tags[l.tags.length - 1];
  const budget = reasons?.find((r) => r.label === "مبلغ در بازه شما")?.status;
  const gallery = useHoverGallery(l);
  return (
    <motion.article className="h-full" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.04 }}>
      <Card {...gallery.bind} className="group relative h-full gap-0 overflow-hidden rounded-[1.75rem] border border-border bg-white py-0 shadow-[0_16px_40px_-32px_rgb(8_59_55/0.25)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_-32px_rgb(8_59_55/0.4)]">
        <Link href={`/opportunities/${l.id}`} className="absolute inset-0 z-10" aria-label={l.title} />
        <SignaturePhoto src={l.image} srcs={gallery.srcs} active={gallery.active} alt={l.title} className="m-2 aspect-[16/9] rounded-[1.35rem]">
          {gallery.dots}
          <div className="absolute inset-x-4 bottom-3.5 flex items-end justify-between gap-3 text-white">
            <div className="min-w-0 space-y-1.5">
              {tag && <span className="inline-block max-w-full truncate rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-ink">{tag}</span>}
              {l.city && <p className="flex items-center gap-1 text-[13px] font-bold text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.7)]"><Location size={15} variant="Bold" />{l.province}، {l.city}</p>}
            </div>
            {score != null && <span className="shrink-0 rounded-full bg-pine/60 p-0.5"><MatchRing score={score} light /></span>}
          </div>
        </SignaturePhoto>
        <div className="pointer-events-none absolute inset-x-5 top-5 z-20 flex flex-row-reverse [&>*]:pointer-events-auto items-center justify-end gap-2">
          {isNew(l) && <Badge className="bg-white px-2.5 py-1 text-[11px] font-extrabold text-primary">جدید</Badge>}
          <SaveButton id={l.id} />
          {comparable && <CompareButton id={l.id} />}
        </div>
        <div className="flex flex-1 flex-col gap-3.5 p-5 pt-3">
          <h3 className="line-clamp-2 min-h-14 text-[17px] font-extrabold leading-7 text-ink">{l.title}</h3>
          {budget && budget !== "unknown" && (
            <p className={cn("-mt-1 flex items-center gap-1.5 text-[12px] font-extrabold", budget === "met" ? "text-primary" : "text-coral-deep")}>
              {budget === "met" && <TickCircle size={15} variant="Bold" />}{budget === "met" ? "در بودجه شما" : "بیرون از بودجه شما"}
            </p>
          )}
          <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3 border-t border-dashed border-border pt-3.5">
            {l.stats.slice(0, 4).filter((s) => s.value).map((s) => (
              <div key={s.label} className="min-w-0"><dt className="text-[11px] font-semibold text-muted-foreground">{s.label}</dt><dd className="truncate text-[15px] font-extrabold text-ink">{s.value}</dd></div>
            ))}
          </dl>
        </div>
      </Card>
    </motion.article>
  );
}
