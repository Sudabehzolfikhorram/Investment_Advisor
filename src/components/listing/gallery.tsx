"use client";
// حالت چندعکسی پروژه: در کارت با حرکت نشانگر عکس عوض می‌شود؛ در صفحه جزئیات بندانگشتی‌ها و نمای بزرگ.
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft2, ArrowRight2, Gallery as GalleryIcon } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { galleryOf } from "@/lib/listings";
import type { Listing } from "@/types";
import { cn, faNumber } from "@/lib/utils";

/** عکس‌های کارت: با حرکت نشانگر روی عکس، هر بخش از عرض یک عکس را نشان می‌دهد */
export function useHoverGallery(l: Listing) {
  const pics = galleryOf(l);
  const [i, setI] = useState(0);
  const bind = {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => { const r = e.currentTarget.getBoundingClientRect(); const x = (r.right - e.clientX) / r.width; setI(Math.min(pics.length - 1, Math.max(0, Math.floor(x * pics.length)))); },
    onMouseLeave: () => setI(0),
  };
  const dots = pics.length > 1 ? (
    <span className="pointer-events-none absolute inset-x-0 top-2.5 z-10 flex justify-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      {pics.map((_, k) => <span key={k} className={cn("h-1 rounded-full bg-white transition-all duration-300", k === i ? "w-5" : "w-2.5 opacity-50")} />)}
    </span>
  ) : null;
  return { src: pics[i].src, bind, dots, count: pics.length };
}

/** بندانگشتی‌های روی عکس بزرگ صفحه جزئیات و نمای تمام‌صفحه */
export function HeroGallery({ l, index, onIndex }: { l: Listing; index: number; onIndex: (i: number) => void }) {
  const pics = galleryOf(l);
  const [open, setOpen] = useState(false);
  if (pics.length < 2) return null;
  const go = (d: number) => onIndex((index + d + pics.length) % pics.length);
  return (
    <>
      <div className="absolute bottom-9 left-8 z-10 flex items-center gap-2">
        {pics.map((p, k) => (
          <Button key={p.src} type="button" variant="plain" size="auto" aria-label={`عکس ${faNumber(k + 1)}: ${p.caption}`} aria-pressed={k === index} onClick={() => onIndex(k)}
            className={cn("relative size-14 overflow-hidden rounded-xl ring-2 transition-all duration-300", k === index ? "ring-white" : "opacity-70 ring-white/0 hover:opacity-100")}>
            <Image src={p.src} alt="" fill sizes="56px" className="object-cover" />
          </Button>
        ))}
        <Button type="button" variant="plain" size="auto" onClick={() => setOpen(true)} className="h-14 gap-2 rounded-xl bg-black/45 px-3.5 text-[13px] font-extrabold text-white backdrop-blur hover:bg-black/60"><GalleryIcon size={18} variant="Bulk" />{faNumber(pics.length)} عکس</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" aria-describedby={undefined} className="gap-4 rounded-[2rem] bg-ink p-5 text-white sm:max-w-5xl [&>button]:text-white">
          <DialogTitle className="text-base font-extrabold text-white">{l.title}</DialogTitle>
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-black">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={pics[index].src} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0">
                <Image src={pics[index].src} alt={pics[index].caption} fill sizes="80vw" className="object-cover" />
              </motion.div>
            </AnimatePresence>
            <Button type="button" variant="plain" size="auto" aria-label="عکس قبلی" onClick={() => go(-1)} className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink hover:bg-white"><ArrowRight2 size={20} /></Button>
            <Button type="button" variant="plain" size="auto" aria-label="عکس بعدی" onClick={() => go(1)} className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink hover:bg-white"><ArrowLeft2 size={20} /></Button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-white/75">{pics[index].caption}<span className="mr-2 text-white/45">{faNumber(index + 1)} از {faNumber(pics.length)}</span></p>
            <div className="flex gap-2">{pics.map((p, k) => (
              <Button key={p.src} type="button" variant="plain" size="auto" aria-label={p.caption} onClick={() => onIndex(k)} className={cn("relative h-12 w-16 overflow-hidden rounded-lg ring-2", k === index ? "ring-white" : "opacity-55 ring-transparent hover:opacity-100")}>
                <Image src={p.src} alt="" fill sizes="64px" className="object-cover" />
              </Button>))}</div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
