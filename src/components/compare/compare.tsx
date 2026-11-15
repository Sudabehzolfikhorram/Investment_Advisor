"use client";
// صفحه مقایسه: دو تا چهار پروژه کنار هم. بهترین مقدار هر ردیف با آبی مشخص می‌شود، «فقط تفاوت‌ها» ردیف‌های یکسان را پنهان می‌کند،
// نمودار زمانی نشان می‌دهد سرمایه هر پروژه کی برمی‌گردد و در پایان می‌توان درباره همین پروژه‌ها از دستیار پرسید.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { AddCircle, ArchiveTick, Award, Chart, CloseCircle, Convertshape2, InfoCircle, Location, MagicStar, Messages2, Trash } from "@/components/iconsax";
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
import { ProjectPicker } from "./picker";
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
    <div className="group relative flex items-center gap-3 rounded-2xl border border-border bg-white p-2 pl-3">
      <span className="absolute inset-x-3 -top-px h-[3px] rounded-b-full" style={{ background: SERIES[i] }} />
      <Link href={`/opportunities/${l.id}`} target="_blank" className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image src={l.image} alt="" fill sizes="56px" className="object-cover" />
        <SeriesDot i={i} className="absolute bottom-1 right-1 ring-2 ring-white" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/opportunities/${l.id}`} target="_blank" className="line-clamp-2 text-[13.5px] font-extrabold leading-6 text-ink hover:text-cobalt-deep">{l.title}</Link>
        <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] font-semibold text-muted-foreground"><Location size={13} variant="Bold" />{l.province}، {l.city}</p>
      </div>
      <Button type="button" variant="plain" size="auto" onClick={onRemove} aria-label={`حذف ${l.title} از مقایسه`} className="grid size-8 shrink-0 place-items-center self-start rounded-full text-ink/35 transition-colors hover:bg-destructive/10 hover:text-destructive"><CloseCircle size={18} /></Button>
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

/** حالت خالی: کمتر از دو پروژه انتخاب شده. سه راه سریع برای شروع به‌جای فرستادن کاربر به صفحه دیگر */
function Empty({ items, onAdd }: { items: Listing[]; onAdd: () => void }) {
  const { saved, criteria, started, setCompare, toggleCompare } = useStore();
  const fav = compareListings.filter((l) => saved.includes(l.id)).map((l) => l.id);
  const fit = started && hasAnyCriteria(criteria) ? rank(compareListings, criteria, 3).filter((r) => r.score >= 50).map((r) => r.listing.id) : [];
  const quick = [
    fav.length >= 2 && { title: "علاقه‌مندی‌هایم", body: `${faNumber(Math.min(fav.length, 4))} پروژه‌ای که ذخیره کرده‌اید`, icon: ArchiveTick, ids: fav },
    fit.length >= 2 && { title: "متناسب با شرایطم", body: `${faNumber(fit.length)} پروژه با بیشترین تطابق`, icon: Award, ids: fit },
    { title: "یک نمونه آماده", body: "سه پروژه با داده کامل از سه حوزه", icon: MagicStar, ids: sampleSet() },
  ].filter(Boolean) as { title: string; body: string; icon: typeof Award; ids: string[] }[];
  return (
    <div className="surface rounded-[2rem] p-8">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: COMPARE_MAX }, (_, i) => items[i]
          ? <div key={items[i].id} className="h-full"><Slot l={items[i]} i={i} onRemove={() => toggleCompare(items[i].id)} /></div>
          : <AddSlot key={`add-${i}`} big onClick={onAdd} />)}
      </div>
      <div className="mt-8 flex items-center gap-4 border-t border-dashed border-border pt-7">
        <p className="shrink-0 text-[14px] font-extrabold text-ink">یا سریع شروع کنید:</p>
        <div className="flex flex-1 flex-wrap gap-3">
          {quick.map((q) => (
            <Button key={q.title} type="button" variant="plain" size="auto" onClick={() => setCompare(q.ids)}
              className="group flex h-auto items-center gap-3 rounded-2xl border border-border bg-white py-2.5 pl-5 pr-2.5 text-right transition-[border-color,box-shadow] hover:border-cobalt/40 hover:shadow-[0_14px_28px_-22px_var(--cobalt)]">
              <span className="grid size-10 place-items-center rounded-xl bg-cobalt-soft text-cobalt-deep"><q.icon size={20} variant="Bulk" /></span>
              <span><span className="block text-[14px] font-extrabold text-ink">{q.title}</span><span className="block text-[12px] font-semibold text-muted-foreground">{q.body}</span></span>
            </Button>
          ))}
        </div>
      </div>
    </div>
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
  const chatRef = useRef<HTMLDivElement>(null);
  const chatVisible = useInView(chatRef, { margin: "0px 0px -30% 0px" });
  const n = items.length;
  const ready = n >= COMPARE_MIN;
  const cols = n + (n < COMPARE_MAX ? 1 : 0);
  const grid = { gridTemplateColumns: `13rem repeat(${cols}, minmax(0, 1fr))` };
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
      <main className="mx-auto max-w-7xl px-6 pt-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-[13px] font-extrabold text-cobalt"><Convertshape2 size={17} variant="Bold" />مقایسه پروژه‌ها</p>
            <h1 className="mt-2 text-[2.1rem] font-black leading-[1.5] text-ink">پروژه‌ها را کنار هم ببینید</h1>
            <p className="mt-1 max-w-2xl text-[15px] font-semibold leading-8 text-muted-foreground">دو تا چهار پروژه انتخاب کنید. بهترین مقدار هر ردیف آبی می‌شود و در پایان صفحه می‌توانید درباره همین پروژه‌ها از دستیار بپرسید.</p>
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

        <div className="mt-8">
          {!hydrated ? <div className="h-72 animate-pulse rounded-[2rem] bg-muted" /> : !ready ? <Empty items={items} onAdd={() => setPicker(true)} /> : (
            <>
              {/* سرستون‌ها: هنگام پیمایش جدول بالای صفحه می‌مانند */}
              <div className="sticky top-[5rem] z-30 -mx-3 rounded-b-[1.5rem] bg-background/95 px-3 pb-3 pt-3 backdrop-blur-md">
                <div className="grid gap-3" style={grid}>
                  <div className="flex flex-col justify-center pr-1">
                    <p className="text-[13px] font-extrabold text-ink">{faNumber(n)} از {faNumber(COMPARE_MAX)} پروژه</p>
                    <p className="mt-0.5 text-[12px] font-semibold text-muted-foreground">{onlyDiff && hiddenCount ? `${faNumber(hiddenCount)} ردیف یکسان پنهان شد` : "روی نام هر پروژه بزنید تا جزئیاتش باز شود"}</p>
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
                        {st[i].length ? st[i].map((s) => <span key={s} className="rounded-full bg-white px-2.5 py-1 text-[11.5px] font-extrabold text-cobalt-deep shadow-[inset_0_0_0_1px_rgb(33_82_224/0.18)]">{s}</span>)
                          : <span className="text-[12px] font-semibold leading-6 text-muted-foreground">در داده‌های اعلام‌شده برتری روشنی ندارد</span>}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-muted-foreground">داده‌های کلیدی اعلام‌شده</p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="flex gap-0.5">{Array.from({ length: c.total }, (_, k) => <span key={k} className={cn("h-1.5 w-3.5 rounded-full", k < c.done ? "bg-ink/70" : "bg-ink/10")} />)}</span>
                            <span className="text-[11.5px] font-extrabold text-ink">{faNumber(c.done)} از {faNumber(c.total)}</span>
                          </div>
                        </div>
                        {m != null && <span className="shrink-0" title="تطابق با شرایط شما"><MatchRing score={m} size={42} /></span>}
                      </div>
                    </div>); })}
                  {n < COMPARE_MAX && <span />}
                </div>
              </section>

              {/* نمودار بازگشت سرمایه */}
              <section className="surface mt-4 rounded-[1.75rem] p-7">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-[1.2rem] font-black text-ink"><Chart size={20} variant="Bulk" className="text-cobalt" />سرمایه شما کی برمی‌گردد؟</h2>
                    <p className="mt-1 text-[13px] font-semibold text-muted-foreground">درصد سرمایه‌ای که در هر زمان به شما برگشته است؛ نشانگر را روی نمودار نگه دارید.</p>
                  </div>
                </div>
                <ReturnTimeline items={items} />
              </section>

              {/* جدول مقایسه، گروه‌بندی‌شده */}
              <section className="mt-4 space-y-4">
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
                          <div key={r.id} id={`row-${r.id}`} className={cn("grid scroll-mt-48 items-start gap-3 rounded-2xl border-t border-border/70 py-1 transition-[background-color,box-shadow] duration-500 first-of-type:border-t-0", on && "bg-cobalt-soft shadow-[inset_0_0_0_2px_rgb(33_82_224/0.35)]")} style={grid}>
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

              {/* گفت‌وگو با دستیار درباره همین پروژه‌ها */}
              <section ref={chatRef} id="ask" className="mt-10 scroll-mt-28">
                <CompareChat items={items} onShowRows={showRows} />
              </section>
            </>
          )}
        </div>
      </main>

      <AnimatePresence>
        {ready && !chatVisible && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="fixed bottom-6 left-6 z-40">
            <Button type="button" variant="plain" size="auto" onClick={() => document.getElementById("ask")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex h-12 items-center gap-2.5 rounded-full bg-ink pl-5 pr-2 text-[14px] font-extrabold text-white shadow-[0_18px_40px_-16px_rgb(22_32_48/0.6)] hover:bg-ink/90">
              <span className="grid size-8 place-items-center rounded-full bg-cobalt"><Messages2 size={17} variant="Bold" /></span>درباره این پروژه‌ها بپرسید
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <ProjectPicker open={picker} onOpenChange={setPicker} />
      <Footer />
    </TooltipProvider>
  );
}
