"use client";
// انتخاب پروژه برای مقایسه: جست‌وجو در همه پروژه‌ها، با علاقه‌مندی‌ها و پیشنهادهای متناسب با شرایط شما در بالای فهرست
import Image from "next/image";
import { useMemo } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { TickCircle } from "@/components/iconsax";
import { COMPARE_MAX, compareListings, oppOf } from "@/lib/compare";
import { hasAnyCriteria } from "@/lib/criteria";
import { rank } from "@/lib/match";
import { useStore } from "@/lib/store";
import type { Listing } from "@/types";
import { faNumber } from "@/lib/utils";

function Item({ l, on, full, onPick }: { l: Listing; on: boolean; full: boolean; onPick: (id: string) => void }) {
  const o = oppOf(l);
  return (
    <CommandItem value={`${l.title} ${l.province} ${l.city} ${l.tags.join(" ")} ${l.id}`} disabled={!on && full} onSelect={() => onPick(l.id)} className="gap-3 rounded-xl">
      <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted"><Image src={l.image} alt="" fill sizes="44px" className="object-cover" /></span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 text-[13.5px] font-extrabold text-ink">{l.title}</span>
        <span className="mt-0.5 block truncate text-[12px] font-semibold text-muted-foreground">{l.province}، {l.city}{o.minCapital != null && ` · ورود از ${faNumber(o.minCapital)} میلیارد`}{o.paybackYears != null && ` · بازگشت ${faNumber(o.paybackYears)} سال`}</span>
      </span>
      {on && <TickCircle size={20} variant="Bold" className="shrink-0 text-cobalt" />}
    </CommandItem>
  );
}

export function ProjectPicker({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { compare, toggleCompare, saved, criteria, started } = useStore();
  const full = compare.length >= COMPARE_MAX;
  const fav = compareListings.filter((l) => saved.includes(l.id));
  const fit = useMemo(() => (started && hasAnyCriteria(criteria) ? rank(compareListings, criteria, 6).filter((r) => r.score >= 50).map((r) => r.listing) : []), [criteria, started]);
  const shown = new Set([...fav, ...fit].map((l) => l.id));
  const rest = compareListings.filter((l) => !shown.has(l.id));
  const pick = (id: string) => { toggleCompare(id); if (!compare.includes(id) && compare.length + 1 >= COMPARE_MAX) onOpenChange(false); };
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="افزودن پروژه به مقایسه" description="نام پروژه، استان یا شهر را بنویسید" className="rounded-[1.75rem] sm:max-w-xl" showCloseButton={false}>
      <div dir="rtl">
        <CommandInput placeholder="نام پروژه، استان یا شهر…" className="text-[14px] font-semibold" />
        <p className="border-b border-border px-4 py-2 text-[12px] font-bold text-muted-foreground">{full ? "چهار پروژه انتخاب کرده‌اید؛ برای افزودن، یکی را بردارید." : `${faNumber(compare.length)} از ${faNumber(COMPARE_MAX)} پروژه انتخاب شده`}</p>
        <CommandList className="thin-scroll max-h-[26rem]">
          <CommandEmpty className="py-10 text-center text-sm font-semibold text-muted-foreground">پروژه‌ای با این نام پیدا نشد.</CommandEmpty>
          {fav.length > 0 && <CommandGroup heading="علاقه‌مندی‌های شما">{fav.map((l) => <Item key={l.id} l={l} on={compare.includes(l.id)} full={full} onPick={pick} />)}</CommandGroup>}
          {fit.length > 0 && <CommandGroup heading="متناسب با شرایط شما">{fit.filter((l) => !saved.includes(l.id)).map((l) => <Item key={l.id} l={l} on={compare.includes(l.id)} full={full} onPick={pick} />)}</CommandGroup>}
          <CommandGroup heading="همه پروژه‌ها">{rest.map((l) => <Item key={l.id} l={l} on={compare.includes(l.id)} full={full} onPick={pick} />)}</CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  );
}
