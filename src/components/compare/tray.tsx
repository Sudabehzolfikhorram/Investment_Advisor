"use client";
// سینی مقایسه: پایین صفحه‌های فهرست می‌ماند و پروژه‌های انتخاب‌شده را با چهار جای ثابت نشان می‌دهد.
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CloseCircle, Convertshape2 } from "@/components/iconsax";
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
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
          className="fixed inset-x-0 bottom-5 z-40 mx-auto flex w-fit items-center gap-4 rounded-full border border-white/10 bg-[#262c33]/95 p-2 pr-5 text-white shadow-[0_22px_50px_-18px_rgb(22_32_48/0.7)] backdrop-blur-md">
          <span className="flex items-center gap-2 text-[13.5px] font-extrabold"><Convertshape2 size={18} variant="Bold" className="text-[#9fb6f5]" />مقایسه</span>
          <ul className="flex items-center gap-1.5">
            {Array.from({ length: COMPARE_MAX }, (_, i) => {
              const l = items[i];
              return l ? (
                <li key={l.id} className="group relative">
                  <span className="relative block size-10 overflow-hidden rounded-xl ring-2" style={{ ["--tw-ring-color" as string]: SERIES[i] }} title={l.title}>
                    <Image src={l.image} alt={l.title} fill sizes="40px" className="object-cover" />
                  </span>
                  <Button type="button" variant="plain" size="auto" onClick={() => toggleCompare(l.id)} aria-label={`حذف ${l.title}`}
                    className="absolute -left-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-white text-ink opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"><CloseCircle size={14} variant="Bold" /></Button>
                </li>
              ) : <li key={`e-${i}`} className="size-10 rounded-xl border border-dashed border-white/25" aria-hidden />;
            })}
          </ul>
          <span className="text-[12.5px] font-semibold text-white/70">{ready ? `${faNumber(items.length)} از ${faNumber(COMPARE_MAX)}` : "یک پروژه دیگر انتخاب کنید"}</span>
          <Button asChild={ready} type="button" disabled={!ready} className={cn("h-11 gap-2 rounded-full px-5 font-extrabold", ready ? "bg-primary text-white hover:bg-deep" : "bg-white/10 text-white/50")}>
            {ready ? <Link href="/compare">مقایسه کنید<ArrowLeft size={16} /></Link> : <span>مقایسه کنید</span>}
          </Button>
          <Button type="button" variant="plain" size="auto" aria-label="پاک کردن مقایسه" onClick={clearCompare} className="grid size-10 place-items-center rounded-full text-white/55 hover:bg-white/10 hover:text-white"><CloseCircle size={20} /></Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
