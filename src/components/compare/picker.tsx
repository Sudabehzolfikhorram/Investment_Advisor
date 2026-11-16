"use client";
// انتخاب پروژه برای مقایسه: جست‌وجو در همه پروژه‌ها، با علاقه‌مندی‌ها و پیشنهادهای متناسب با شرایط شما در بالای فهرست
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Add, CloseCircle, Location, Refresh2, SearchNormal1, TickCircle } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { COMPARE_MAX, compareListings, oppOf, SERIES } from "@/lib/compare";
import { hasAnyCriteria } from "@/lib/criteria";
import { rank } from "@/lib/match";
import { useStore } from "@/lib/store";
import type { Listing } from "@/types";
import { cn, faNumber } from "@/lib/utils";

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
          {fit.length > 0 && <CommandGroup heading="از جست‌وجوی اخیر شما">{fit.filter((l) => !saved.includes(l.id)).map((l) => <Item key={l.id} l={l} on={compare.includes(l.id)} full={full} onPick={pick} />)}</CommandGroup>}
          <CommandGroup heading="همه پروژه‌ها">{rest.map((l) => <Item key={l.id} l={l} on={compare.includes(l.id)} full={full} onPick={pick} />)}</CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  );
}

/** چیدمان تصادفی ثابت با یک دانه (برای «نمونه‌های دیگر») */
function shuffle<T>(xs: T[], seed: number) {
  const a = [...xs]; let t = Math.floor(seed * 2 ** 31) || 1;
  const rnd = () => { t = (t * 1103515245 + 12345) % 2 ** 31; return t / 2 ** 31; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function PickCard({ l, idx, full, onPick }: { l: Listing; idx: number; full: boolean; onPick: (id: string) => void }) {
  const o = oppOf(l); const on = idx >= 0; const blocked = !on && full;
  const color = on ? SERIES[idx] : undefined;
  return (
    <button type="button" aria-pressed={on} aria-disabled={blocked} onClick={() => onPick(l.id)} title={blocked ? "حداکثر چهار پروژه؛ برای افزودن یکی را بردارید" : undefined}
      className={cn("group relative flex items-center gap-3 rounded-2xl border bg-white p-2.5 pl-3 text-right transition-all duration-200", on ? "shadow-[0_14px_30px_-22px_rgb(20_30_45/0.5)]" : "border-border hover:-translate-y-0.5 hover:border-ink/25", blocked && "cursor-not-allowed opacity-45 hover:translate-y-0 hover:border-border")}
      style={on ? { borderColor: color, boxShadow: `0 0 0 3px ${color}22` } : undefined}>
      <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted"><Image src={l.image} alt="" fill sizes="64px" className="object-cover" /></span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-[13px] font-extrabold leading-6 text-ink">{l.title}</span>
        <span className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] font-semibold text-muted-foreground"><Location size={12} variant="Bold" className="shrink-0" />{l.province}، {l.city}</span>
        {(o.minCapital != null || o.paybackYears != null) && (
          <span className="mt-1 block truncate text-[11px] font-bold text-ink/55">{o.minCapital != null && `ورود از ${faNumber(o.minCapital)} میلیارد`}{o.minCapital != null && o.paybackYears != null && " · "}{o.paybackYears != null && `بازگشت ${faNumber(o.paybackYears)} سال`}</span>
        )}
      </span>
      {on
        ? <span className="grid size-7 shrink-0 place-items-center self-start rounded-full text-[12px] font-black text-white" style={{ background: color }}>{faNumber(idx + 1)}</span>
        : <span className="grid size-7 shrink-0 place-items-center self-start rounded-full border-[1.5px] border-ink/15 text-ink/40 transition-colors group-hover:border-ink/40 group-hover:text-ink"><Add size={15} /></span>}
    </button>
  );
}

/**
 * انتخاب پروژه روی خود صفحه مقایسه (حالت خالی): نمونه‌ای تصادفی از نتایج آخرین جست‌وجوی کاربر،
 * علاقه‌مندی‌ها و فهرست همه پروژه‌ها با جست‌وجو. حداکثر چهار پروژه.
 */
export function ComparePicker({ className }: { className?: string }) {
  const { compare: stored, toggleCompare, saved, criteria } = useStore();
  // شناسه‌های کهنه (پروژه‌ای که دیگر نیست) شمرده نمی‌شوند
  const compare = useMemo(() => stored.filter((id) => compareListings.some((l) => l.id === id)), [stored]);
  const [tab, setTab] = useState<"recent" | "fav" | "all">("recent");
  const [q, setQ] = useState("");
  const [seed, setSeed] = useState(() => Math.random());
  const [limit, setLimit] = useState(12);
  const full = compare.length >= COMPARE_MAX;
  const searched = hasAnyCriteria(criteria);
  const pool = useMemo(() => {
    const ranked = searched ? rank(compareListings, criteria).filter((r) => r.score >= 50).map((r) => r.listing) : [];
    return ranked.length >= 4 ? ranked.slice(0, 24) : [...compareListings].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 24);
  }, [criteria, searched]);
  const recent = useMemo(() => shuffle(pool, seed).slice(0, 9), [pool, seed]);
  const fav = compareListings.filter((l) => saved.includes(l.id));
  const query = q.trim();
  const found = useMemo(() => (query ? compareListings.filter((l) => `${l.title} ${l.province} ${l.city} ${l.tags.join(" ")}`.includes(query)) : []), [query]);
  const list = query ? found : tab === "recent" ? recent : tab === "fav" ? fav : compareListings;
  const pick = (id: string) => {
    if (!compare.includes(id) && full) { toast("حداکثر چهار پروژه را می‌توانید مقایسه کنید.", { description: "برای افزودن، یکی از انتخاب‌ها را بردارید." }); return; }
    toggleCompare(id);
  };
  const tabs = [
    ["recent", searched ? "از جست‌وجوی اخیر شما" : "تازه‌ترین پروژه‌ها", null],
    ["fav", "علاقه‌مندی‌ها", fav.length],
    ["all", "همه پروژه‌ها", compareListings.length],
  ] as const;
  return (
    <section className={cn("surface rounded-[1.75rem] p-6", className)}>
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-[1.1rem] font-black text-ink">پروژه‌ها را انتخاب کنید</h2>
          <p className="mt-0.5 text-[12.5px] font-semibold text-muted-foreground">روی هر کارت بزنید؛ حداکثر چهار پروژه کنار هم می‌آید.</p>
        </div>
        <div className="mr-auto flex items-center gap-2.5 rounded-full bg-[#f3f6fa] py-1.5 pl-1.5 pr-3.5">
          <span className="text-[12.5px] font-extrabold text-ink">{faNumber(compare.length)} از {faNumber(COMPARE_MAX)}</span>
          <span className="flex gap-1">{Array.from({ length: COMPARE_MAX }, (_, i) => <span key={i} className="h-2 w-5 rounded-full" style={{ background: i < compare.length ? SERIES[i] : "rgb(47 53 51 / 0.1)" }} />)}</span>
        </div>
      </div>
      {full && <p className="mt-3 rounded-xl bg-cobalt-soft/70 px-3.5 py-2 text-[12.5px] font-bold text-cobalt-deep">چهار پروژه انتخاب شده؛ بیشتر از این نمی‌شود. برای افزودن، یکی را بردارید.</p>}

      <div className="mt-5 flex items-center gap-3">
        <ToggleGroup type="single" spacing={2} value={query ? "" : tab} onValueChange={(v) => { if (v) { setTab(v as typeof tab); setQ(""); setLimit(12); } }} className="flex">
          {tabs.map(([id, label, n]) => (
            <ToggleGroupItem key={id} value={id} className="h-9 gap-1.5 rounded-full border border-border bg-white px-3.5 text-[12.5px] font-bold text-ink/70 shadow-none hover:border-ink/25 hover:bg-white hover:text-ink data-[state=on]:border-ink data-[state=on]:bg-ink data-[state=on]:text-white">
              {label}{n != null && <span className="text-[11px] font-semibold opacity-70">{faNumber(n)}</span>}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {tab === "recent" && !query && (
          <Button type="button" variant="ghost" size="xs" onClick={() => setSeed(Math.random())} className="gap-1 text-[12px] font-bold text-muted-foreground"><Refresh2 size={14} />نمونه‌های دیگر</Button>
        )}
        <div className="mr-auto flex h-10 w-72 items-center gap-2 rounded-full border border-border bg-white px-3.5 focus-within:border-ink/25">
          <SearchNormal1 size={16} className="shrink-0 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جست‌وجو در همه پروژه‌ها" aria-label="جست‌وجو در همه پروژه‌ها" className="h-8 border-0 !bg-transparent px-0 text-[13px] font-semibold shadow-none focus-visible:ring-0 placeholder:font-normal" />
          {q && <button type="button" onClick={() => setQ("")} aria-label="پاک کردن" className="text-muted-foreground hover:text-ink"><CloseCircle size={16} /></button>}
        </div>
      </div>

      {query && <p className="mt-4 text-[12px] font-bold text-muted-foreground">{faNumber(found.length)} پروژه برای «{query}»</p>}
      {list.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border py-12 text-center text-[13px] font-semibold text-muted-foreground">{query ? "پروژه‌ای با این نام پیدا نشد." : tab === "fav" ? "هنوز پروژه‌ای ذخیره نکرده‌اید." : "پروژه‌ای نیست."}</p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {list.slice(0, query || tab !== "all" ? 60 : limit).map((l) => <PickCard key={l.id} l={l} idx={compare.indexOf(l.id)} full={full} onPick={pick} />)}
        </div>
      )}
      {!query && tab === "all" && list.length > limit && (
        <div className="mt-4 flex justify-center"><Button type="button" variant="outline" onClick={() => setLimit((n) => n + 12)} className="h-10 rounded-full bg-white px-5 text-[13px] font-bold shadow-none">نمایش بیشتر <span className="text-muted-foreground">({faNumber(list.length - limit)})</span></Button></div>
      )}
    </section>
  );
}
