"use client";
// صفحه مقایسه: دو تا چهار پروژه کنار هم. بهترین مقدار هر ردیف با آبی مشخص می‌شود، «فقط تفاوت‌ها» ردیف‌های یکسان را پنهان می‌کند،
// نمودار زمانی نشان می‌دهد سرمایه هر پروژه کی برمی‌گردد و در پایان می‌توان درباره همین پروژه‌ها از دستیار پرسید.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { AddCircle, ArchiveTick, Award, Chart, CloseCircle, Convertshape2, InfoCircle, Location, MagicStar, Trash } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Header, Footer } from "@/components/site/header";
import { MatchRing } from "@/components/brand/reveal";
import { bestOf, COMPARE_MAX, COMPARE_MIN, compareListings, completeness, differs, groups, oppOf, rows, SERIES, strengths } from "@/lib/compare";
import { hasAnyCriteria } from "@/lib/criteria";
import { listingById } from "@/lib/listings";
import { matchListing, rank } from "@/lib/match";
import { useHydrated, useStore } from "@/lib/store";
import type { Listing } from "@/types";
import { cn, faNumber } from "@/lib/utils";
import { ComparePicker, ProjectPicker } from "./picker";
import { MetricCharts } from "./metric-charts";
import { ReturnTimeline, SeriesDot } from "./timeline";
import { CompareChat } from "./chat";

/** نمونه آماده: سه پروژه با داده کامل از سه گروه مختلف، برای کسی که فقط می‌خواهد ببیند مقایسه چطور است */
function sampleSet() {
  const full = compareListings.filter((l) => { const o = oppOf(l); return o.minCapital != null && o.paybackYears != null && o.firstIncomeMonths != null; });
  const out: Listing[] = [];
  for (const l of full) if (!out.some((x) => x.group === l.group) && out.length < 3) out.push(l);
  return out.map((l) => l.id);
}

function Slot({ l, i, onRemove }: { l: Listing; i: number; onRemove: () => void }) {
  return (
    <div className="group relative flex items-center gap-2.5 rounded-2xl border border-border bg-white p-2 pl-2">
      <span className="absolute inset-x-3 -top-px h-[3px] rounded-b-full" style={{ background: SERIES[i] }} />
      <Link href={`/opportunities/${l.id}`} target="_blank" className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image src={l.image} alt="" fill sizes="44px" className="object-cover" />
        <SeriesDot i={i} className="absolute bottom-1 right-1 ring-2 ring-white" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/opportunities/${l.id}`} target="_blank" title={l.title} className="line-clamp-2 text-[12.5px] font-extrabold leading-[1.35rem] text-ink hover:text-cobalt-deep">{l.title}</Link>
        <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] font-semibold text-muted-foreground"><Location size={13} variant="Bold" />{l.province}، {l.city}</p>
      </div>
      <Button type="button" variant="plain" size="auto" onClick={onRemove} aria-label={`حذف ${l.title} از مقایسه`} className="grid size-6 shrink-0 place-items-center self-start rounded-full text-ink/35 transition-colors hover:bg-destructive/10 hover:text-destructive"><CloseCircle size={18} /></Button>
    </div>
  );
}

function AddSlot({ onClick, big }: { onClick: () => void; big?: boolean }) {
  return (
    <Button type="button" variant="plain" size="auto" onClick={onClick}
      className={cn("flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 bg-white/50 text-[13.5px] font-extrabold text-ink/60 transition-colors hover:border-cobalt/45 hover:bg-cobalt-soft/50 hover:text-cobalt-deep", big ? "h-full min-h-[11rem] flex-col" : "h-[4.6rem]")}>
      <AddCircle size={big ? 30 : 20} variant={big ? "Bulk" : "Linear"} />افزودن پروژه
    </Button>
  );
}

/** حالت خالی: بدون چهار کارت خالی؛ یک پیام کوتاه «تا چهار پروژه» با راه‌های سریع، و زیرش انتخاب پروژه روی همین صفحه */
function EmptyHero({ items }: { items: Listing[] }) {
  const { saved, criteria, setCompare, toggleCompare } = useStore();
  const fav = compareListings.filter((l) => saved.includes(l.id)).map((l) => l.id);
  const fit = hasAnyCriteria(criteria) ? rank(compareListings, criteria, 3).filter((r) => r.score >= 50).map((r) => r.listing.id) : [];
  const quick = [
    { title: "یک نمونه آماده", icon: MagicStar, ids: sampleSet() },
    fit.length >= 2 && { title: "سه پروژه نزدیک به جست‌وجویم", icon: Award, ids: fit },
    fav.length >= 2 && { title: "از علاقه‌مندی‌هایم", icon: ArchiveTick, ids: fav.slice(0, COMPARE_MAX) },
  ].filter(Boolean) as { title: string; icon: typeof Award; ids: string[] }[];
  return (
    <section className="surface relative isolate overflow-hidden rounded-[1.75rem] p-7">
      <div aria-hidden className="absolute -left-24 -top-24 -z-10 size-72 rounded-full bg-[radial-gradient(circle,rgb(30_58_138/0.08),transparent_65%)]" />
      <div className="flex items-center gap-7">
        {/* چهار حلقه: هر پروژه انتخاب‌شده حلقه‌ی رنگ خودش را پر می‌کند */}
        <div className="flex shrink-0 items-center" aria-hidden>
          {Array.from({ length: COMPARE_MAX }, (_, i) => { const l = items[i]; return (
            <span key={i} className={cn("relative grid size-[4.5rem] place-items-center overflow-hidden rounded-full border-[3px] bg-white", i && "-mr-4", !l && "border-dashed")} style={{ borderColor: l ? SERIES[i] : "rgb(47 53 51 / 0.14)", zIndex: COMPARE_MAX - i }}>
              {l ? <Image src={l.image} alt="" fill sizes="72px" className="object-cover" /> : <span className="text-[13px] font-black text-ink/25">{faNumber(i + 1)}</span>}
            </span>
          ); })}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[1.45rem] font-black leading-[1.6] text-ink">تا چهار پروژه را کنار هم مقایسه کنید</h2>
          <p className="mt-1 max-w-2xl text-[13.5px] font-semibold leading-7 text-muted-foreground">
            {items.length === 1 ? <>«{items[0].title}» انتخاب شده؛ یک پروژه دیگر کافی است تا مقایسه شروع شود.</> : "دست‌کم دو پروژه انتخاب کنید؛ مبلغ ورود، بازده، زمان بازگشت و ریسکشان روی نمودار کنار هم می‌آید و دستیار کنار صفحه به پرسش‌هایتان جواب می‌دهد."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="ml-1 text-[12.5px] font-bold text-ink/70">شروع سریع:</span>
            {quick.map((q) => (
              <Button key={q.title} type="button" variant="plain" size="auto" onClick={() => setCompare(q.ids)}
                className="h-9 gap-1.5 rounded-full border border-border bg-white px-3.5 text-[12.5px] font-extrabold text-ink transition-colors hover:border-cobalt/40 hover:bg-cobalt-soft/60 hover:text-cobalt-deep"><q.icon size={16} variant="Bulk" />{q.title}</Button>
            ))}
            {items.length === 1 && <Button type="button" variant="ghost" size="xs" onClick={() => toggleCompare(items[0].id)} className="font-bold text-muted-foreground hover:text-destructive">برداشتن انتخاب</Button>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Cell({ row, l, i, best, max }: { row: (typeof rows)[number]; l: Listing; i: number; best: boolean; max: number }) {
  const o = oppOf(l);
  const t = row.text(o, l);
  const v = row.num(o);
  const bar = row.unit && v != null && max > 0;
  return (
    <div className={cn("min-w-0 rounded-xl px-3 py-2.5 transition-colors", best && "bg-cobalt-soft/70")}>
      {t ? (
        <p title={t.length > 90 ? t : undefined} className={cn("leading-7", t.length > 40 ? "line-clamp-3 text-[13px] font-semibold leading-6 text-ink/80" : "text-[14.5px] font-extrabold text-ink", best && "text-cobalt-deep")}>
          {t}
        </p>
      ) : <p className="text-[13px] font-semibold text-ink/35">اعلام نشده</p>}
      {best && <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-black text-cobalt"><Award size={13} variant="Bold" />بهترین</span>}
      {bar && <span className="mt-2 block h-1 overflow-hidden rounded-full bg-ink/[0.06]"><motion.span className="block h-full rounded-full" style={{ background: SERIES[i] }} initial={{ width: 0 }} animate={{ width: `${(v! / max) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.06 }} /></span>}
    </div>
  );
}

export function Compare() {
  const hydrated = useHydrated();
  const { compare, toggleCompare, clearCompare, criteria, started } = useStore();
  const items = useMemo(() => (hydrated ? compare.map((id) => listingById(id)).filter((l): l is Listing => !!l && l.kind === "project") : []), [compare, hydrated]);
  const [picker, setPicker] = useState(false);
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [flash, setFlash] = useState<string[]>([]);
  const n = items.length;
  const ready = n >= COMPARE_MIN;
  const cols = n + (n < COMPARE_MAX ? 1 : 0);
  const grid = { gridTemplateColumns: `10.5rem repeat(${cols}, minmax(0, 1fr))` };
  const st = useMemo(() => strengths(items), [items]);
  const fits = started && hasAnyCriteria(criteria);

  useEffect(() => { if (!flash.length) return; const t = setTimeout(() => setFlash([]), 2600); return () => clearTimeout(t); }, [flash]);
  const showRows = (ids: string[]) => {
    if (!ids.length) return;
    setOnlyDiff(false);
    setFlash(ids);
    requestAnimationFrame(() => ids.map((id) => document.getElementById(`row-${id}`)).find(Boolean)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  // ردیفی که برای هیچ‌کدام اعلام نشده فقط شلوغی می‌سازد؛ نامش پایین جدول می‌آید
  const known = rows.filter((r) => items.some((l) => r.text(oppOf(l), l)));
  const empty = rows.filter((r) => !known.includes(r));
  const visible = known.filter((r) => !onlyDiff || differs(r, items));
  const hiddenCount = known.length - visible.length;

  return (
    <TooltipProvider delayDuration={150}>
      <Header />
      <main className="mx-auto max-w-[90rem] px-6 pt-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-[13px] font-extrabold text-cobalt"><Convertshape2 size={17} variant="Bold" />مقایسه پروژه‌ها</p>
            <h1 className="mt-2 text-[2rem] font-black leading-[1.5] text-ink">پروژه‌ها را کنار هم ببینید</h1>
          </div>
          {ready && (
            <div className="flex shrink-0 items-center gap-2">
              <Label className="flex h-11 cursor-pointer items-center gap-2.5 rounded-full border border-border bg-white px-4 text-[13px] font-bold text-ink">
                <Switch checked={onlyDiff} onCheckedChange={setOnlyDiff} />فقط تفاوت‌ها
              </Label>
              <Button type="button" variant="plain" size="auto" onClick={clearCompare} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[13px] font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash size={17} />پاک کردن همه</Button>
            </div>
          )}
        </div>

        {/* دو ستون: دستیار سمت راست، ثابت هنگام پیمایش؛ مقایسه در ستون اصلی */}
        <div className="mt-7 grid grid-cols-[23rem_minmax(0,1fr)] items-start gap-7">
          <aside className="sticky top-24 h-[calc(100dvh-7.5rem)] min-h-[32rem]">
            {hydrated && <CompareChat items={items} onShowRows={showRows} className="h-full" />}
          </aside>

          <div className="min-w-0">
          {!hydrated ? <div className="h-72 animate-pulse rounded-[2rem] bg-muted" /> : !ready ? (
            <div className="space-y-5"><EmptyHero items={items} /><ComparePicker /></div>
          ) : (
            <>
              {/* سرستون‌ها: هنگام پیمایش جدول بالای صفحه می‌مانند */}
              <div className="sticky top-[5rem] z-30 -mx-3 rounded-b-[1.5rem] bg-background/95 px-3 pb-3 pt-1 backdrop-blur-md">
                <div className="grid gap-3" style={grid}>
                  <div className="flex flex-col justify-center pr-1">
                    <p className="text-[13px] font-extrabold text-ink">{faNumber(n)} از {faNumber(COMPARE_MAX)} پروژه</p>
                    <p className="mt-0.5 text-[12px] font-semibold text-muted-foreground">{onlyDiff && hiddenCount ? `${faNumber(hiddenCount)} ردیف یکسان پنهان شد` : n < COMPARE_MAX ? "حداکثر چهار پروژه" : "روی نام هر پروژه بزنید"}</p>
                  </div>
                  {items.map((l, i) => <Slot key={l.id} l={l} i={i} onRemove={() => toggleCompare(l.id)} />)}
                  {n < COMPARE_MAX && <AddSlot onClick={() => setPicker(true)} />}
                </div>
              </div>

              {/* در یک نگاه: نقطه قوت هر پروژه و اینکه چقدر از داده‌های کلیدی‌اش اعلام شده */}
              <section className="surface mt-4 rounded-[1.75rem] p-3">
                <div className="grid gap-3" style={grid}>
                  <div className="p-3">
                    <h2 className="text-[15px] font-black text-ink">در یک نگاه</h2>
                    <p className="mt-1 text-[12px] font-semibold leading-6 text-muted-foreground">جایی که هر پروژه از بقیه بهتر است</p>
                  </div>
                  {items.map((l, i) => { const c = completeness(l); const m = fits ? matchListing(l, criteria).score : null; return (
                    <div key={l.id} className="flex flex-col gap-3 rounded-2xl bg-muted/50 p-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {st[i].length ? st[i].map((s) => <span key={s} className="rounded-full bg-white px-2.5 py-1 text-[11.5px] font-extrabold text-cobalt-deep shadow-[inset_0_0_0_1px_rgb(30_58_138/0.18)]">{s}</span>)
                          : <span className="text-[12px] font-semibold leading-6 text-muted-foreground">در داده‌های اعلام‌شده برتری روشنی ندارد</span>}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-muted-foreground">داده‌های کلیدی</p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="flex gap-0.5">{Array.from({ length: c.total }, (_, k) => <span key={k} className={cn("h-1.5 w-2 rounded-full", k < c.done ? "bg-ink/70" : "bg-ink/10")} />)}</span>
                            <span className="whitespace-nowrap text-[11px] font-extrabold text-ink">{faNumber(c.done)}/{faNumber(c.total)}</span>
                          </div>
                        </div>
                        {m != null && <span className="shrink-0" title="تطابق با شرایط شما"><MatchRing score={m} size={36} /></span>}
                      </div>
                    </div>); })}
                  {n < COMPARE_MAX && <span />}
                </div>
              </section>

              {/* مقایسه روی نمودار: هر شاخص عددی یک نمودار کوچک */}
              <section className="surface mt-4 rounded-[1.75rem] p-6">
                <div className="mb-5">
                  <h2 className="flex items-center gap-2 text-[1.15rem] font-black text-ink"><Chart size={20} variant="Bulk" className="text-cobalt" />مقایسه روی نمودار</h2>
                  <p className="mt-1 text-[13px] font-semibold text-muted-foreground">هر رنگ یک پروژه است؛ نشان جایزه یعنی بهترین مقدار همان شاخص.</p>
                </div>
                <MetricCharts items={items} />
              </section>

              {/* نمودار بازگشت سرمایه */}
              <section className="surface mt-4 rounded-[1.75rem] p-6">
                <div className="mb-5">
                  <h2 className="flex items-center gap-2 text-[1.15rem] font-black text-ink"><Chart size={20} variant="Bulk" className="text-cobalt" />سرمایه شما کی برمی‌گردد؟</h2>
                  <p className="mt-1 text-[13px] font-semibold text-muted-foreground">درصد سرمایه‌ای که در هر زمان به شما برگشته است؛ نشانگر را روی نمودار نگه دارید.</p>
                </div>
                <ReturnTimeline items={items} />
              </section>

              {/* جدول کامل، گروه‌بندی‌شده */}
              <section className="mt-4 space-y-4 pb-6">
                {groups.map((g) => {
                  const gr = visible.filter((r) => r.group === g.id);
                  if (!gr.length) return null;
                  return (
                    <div key={g.id} className="surface overflow-hidden rounded-[1.75rem] p-3">
                      <div className="flex items-baseline gap-3 px-3 pb-2 pt-2">
                        <h2 className="text-[15px] font-black text-ink">{g.title}</h2>
                        <p className="text-[12.5px] font-semibold text-muted-foreground">{g.note}</p>
                      </div>
                      {gr.map((r) => {
                        const best = bestOf(r, items);
                        const max = Math.max(0, ...items.map((l) => r.num(oppOf(l)) ?? 0));
                        const on = flash.includes(r.id);
                        return (
                          <div key={r.id} id={`row-${r.id}`} className={cn("grid scroll-mt-48 items-start gap-3 rounded-2xl border-t border-border/70 py-1 transition-[background-color,box-shadow] duration-500 first-of-type:border-t-0", on && "bg-cobalt-soft shadow-[inset_0_0_0_2px_rgb(30_58_138/0.35)]")} style={grid}>
                            <div className="flex items-center gap-1.5 px-3 py-3">
                              <span className="text-[13px] font-bold text-ink/70">{r.label}</span>
                              {r.hint && (
                                <Tooltip>
                                  <TooltipTrigger asChild><span tabIndex={0} className="text-ink/35 hover:text-ink/70"><InfoCircle size={15} /></span></TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-56 text-[12px] font-semibold leading-6">{r.hint}</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            {items.map((l, i) => <Cell key={l.id} row={r} l={l} i={i} best={best.includes(i)} max={max} />)}
                            {n < COMPARE_MAX && <span />}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {empty.length > 0 && <p className="px-4 text-[12.5px] font-semibold leading-7 text-muted-foreground">برای هیچ‌کدام از این پروژه‌ها اعلام نشده و از جدول برداشته شد: {empty.map((r) => r.label).join("، ")}.</p>}
              </section>
            </>
          )}
          </div>
        </div>
      </main>
      <ProjectPicker open={picker} onOpenChange={setPicker} />
      <Footer />
    </TooltipProvider>
  );
}
