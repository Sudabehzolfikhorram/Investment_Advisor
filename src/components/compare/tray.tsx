"use client";
// سینی مقایسه: پایین صفحه‌های فهرست می‌ماند. شیشه‌ای و روشن، هر پروژه با عکس، شماره رنگی و نام کوتاه،
// جاهای خالی با خط‌چین «جای پروژه بعدی» و دکمه اصلی «مقایسه کنید» وقتی دست‌کم دو پروژه انتخاب شده باشد.
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Add, ArrowLeft, CloseCircle, Convertshape2 } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { COMPARE_MAX, SERIES } from "@/lib/compare";
import { listingById } from "@/lib/listings";
import { useHydrated, useStore } from "@/lib/store";
import { cn, faNumber } from "@/lib/utils";

export function CompareTray() {
  const hydrated = useHydrated();
  const { compare, toggleCompare, clearCompare } = useStore();
  const items = hydrated ? compare.map((id) => listingById(id)).filter((l) => l?.kind === "project") as NonNullable<ReturnType<typeof listingById>>[] : [];
  const ready = items.length >= 2;
  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-0 bottom-5 z-40 mx-auto flex w-fit items-center gap-3 rounded-[1.6rem] border border-white/80 bg-white/85 p-2 pr-4 shadow-[0_1px_0_#fff_inset,0_28px_60px_-24px_rgb(22_32_48/0.45)] ring-1 ring-ink/[0.06] backdrop-blur-xl">
          <div className="flex shrink-0 items-center gap-2.5 pl-1">
            <span className="grid size-10 place-items-center rounded-xl bg-cobalt-soft text-cobalt"><Convertshape2 size={20} variant="Bulk" /></span>
            <span>
              <span className="block text-[13.5px] font-black text-ink">مقایسه</span>
              <span className="block text-[11px] font-semibold text-muted-foreground">{faNumber(items.length)} از {faNumber(COMPARE_MAX)} پروژه</span>
            </span>
          </div>
          <span className="h-9 w-px bg-border" />
          <ul className="flex items-center gap-1.5">
            {Array.from({ length: COMPARE_MAX }, (_, i) => {
              const l = items[i];
              return (
                <AnimatePresence key={i} mode="popLayout" initial={false}>
                  {l ? (
                    <motion.li key={l.id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                      className="group relative flex h-12 w-44 items-center gap-2 rounded-xl border border-border bg-white p-1.5 pl-2">
                      <span className="relative size-9 shrink-0 overflow-hidden rounded-lg">
                        <Image src={l.image} alt="" fill sizes="36px" className="object-cover" />
                        <span className="absolute bottom-0.5 right-0.5 grid size-3.5 place-items-center rounded-full text-[8.5px] font-black text-white ring-1 ring-white" style={{ background: SERIES[i] }}>{faNumber(i + 1)}</span>
                      </span>
                      <span className="line-clamp-2 min-w-0 flex-1 text-[11.5px] font-bold leading-[1.15rem] text-ink" title={l.title}>{l.title}</span>
                      <Button type="button" variant="plain" size="auto" onClick={() => toggleCompare(l.id)} aria-label={`حذف ${l.title}`}
                        className="absolute -left-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-white text-ink/60 opacity-0 shadow ring-1 ring-border transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"><CloseCircle size={14} variant="Bold" /></Button>
                    </motion.li>
                  ) : (
                    <motion.li key={`e-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-12 w-28 items-center justify-center gap-1 rounded-xl border border-dashed border-ink/15 text-[11px] font-bold text-ink/35" aria-hidden>
                      <Add size={14} />پروژه {faNumber(i + 1)}
                    </motion.li>
                  )}
                </AnimatePresence>
              );
            })}
          </ul>
          <Button asChild={ready} type="button" disabled={!ready} className={cn("h-12 shrink-0 gap-2 rounded-[1.1rem] px-5 font-extrabold", ready ? "bg-primary text-white shadow-[0_14px_28px_-16px_var(--primary)] hover:bg-deep" : "bg-muted text-ink/40")}>
            {ready ? <Link href="/compare">مقایسه کنید<ArrowLeft size={16} /></Link> : <span>یکی دیگر انتخاب کنید</span>}
          </Button>
          <Button type="button" variant="plain" size="auto" aria-label="پاک کردن مقایسه" title="پاک کردن همه" onClick={clearCompare} className="grid size-10 shrink-0 place-items-center rounded-full text-ink/40 hover:bg-destructive/10 hover:text-destructive"><CloseCircle size={20} /></Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
