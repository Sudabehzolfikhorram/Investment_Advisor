"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArchiveAdd, ArchiveTick, ArrowLeft, Location, TickCircle, CloseCircle, InfoCircle } from "@/components/iconsax";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignaturePhoto } from "./signature-photo";
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
        toggleSaved(id); toast(on ? "از ذخیره‌شده‌ها حذف شد." : "در ذخیره‌شده‌ها قرار گرفت."); }}
      className={cn("inline-flex items-center justify-center gap-2 rounded-full transition-all active:scale-95", label ? "h-12 px-5 font-bold" : "size-10", on ? "bg-primary text-white" : label ? "border border-border bg-white text-ink hover:border-primary hover:text-primary" : "bg-black/30 text-white hover:bg-black/45", className)}>
      {on ? <ArchiveTick size={20} variant="Bold" /> : <ArchiveAdd size={20} />}
      {label && <span>{on ? "ذخیره شد" : "ذخیره پروژه"}</span>}
    </Button>
  );
}

const reasonIcon = { met: TickCircle, unmet: CloseCircle, unknown: InfoCircle } as const;
export function Reasons({ reasons, className }: { reasons: MatchReason[]; className?: string }) {
  if (!reasons.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-x-3 gap-y-1 text-[12px]", className)}>
      {reasons.map((r) => { const I = reasonIcon[r.status];
        return <li key={r.label} className={cn("inline-flex items-center gap-1 font-semibold", r.status === "met" ? "text-primary" : r.status === "unmet" ? "text-destructive" : "text-muted-foreground")}><I size={14} variant="Bold" />{r.label}{r.status === "unknown" && " (نیازمند بررسی)"}</li>; })}
    </ul>
  );
}

export function ListingCard({ listing: l, score, reasons, index = 0 }: { listing: Listing; score?: number; reasons?: MatchReason[]; index?: number }) {
  return (
    <motion.article className="h-full" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.04 }}>
      <Card className="group relative h-full gap-0 overflow-hidden rounded-[1.75rem] border border-border bg-white py-0 shadow-[0_16px_40px_-32px_rgb(11_31_29/0.25)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_-32px_rgb(11_31_29/0.4)]">
      <Link href={`/opportunities/${l.id}`} className="absolute inset-0 z-10" aria-label={l.title} />
      <SignaturePhoto src={l.image} alt={l.title} className="m-2 aspect-[16/10] rounded-[1.35rem]">
        <div className="absolute inset-x-3 top-3 z-20 flex flex-row-reverse items-start justify-end gap-2">
          {isNew(l) && <Badge className="bg-white px-2.5 py-1 text-[11px] font-extrabold text-primary">جدید</Badge>}
          <SaveButton id={l.id} />
        </div>
        <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3 text-white">
          <div className="min-w-0">
            {l.city && <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-white/85"><Location size={14} variant="Bold" />{l.province}، {l.city}</p>}
            <div className="flex flex-wrap gap-1.5">{l.tags.map((t) => <Badge key={t} variant="outline" className="border-white/30 bg-black/25 px-2.5 text-[11px] font-bold text-white">{t}</Badge>)}</div>
          </div>
          {score != null && <span className="rounded-full bg-black/45 p-0.5"><MatchRing score={score} light /></span>}
        </div>
      </SignaturePhoto>
      <div className="flex flex-1 flex-col gap-4 p-5 pt-3">
        <h3 className="text-[17px] font-extrabold leading-7 text-ink text-balance">{l.title}</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-dashed border-border pt-4">
          {l.stats.map((s) => (
            <div key={s.label} className="min-w-0"><dt className="text-[11px] font-semibold text-muted-foreground">{s.label}</dt><dd className="truncate text-sm font-extrabold text-ink">{s.value}</dd></div>
          ))}
        </dl>
        {reasons && <Reasons reasons={reasons} />}
        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-primary">مشاهده جزئیات <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /></span>
      </div>
      </Card>
    </motion.article>
  );
}
