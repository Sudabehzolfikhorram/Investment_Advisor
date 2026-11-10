"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ArchiveAdd, CloseCircle, FilterSearch, SearchNormal1, Sort, TickCircle, Notification } from "@/components/iconsax";
import { Header, Footer } from "@/components/site/header";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { ListingCard } from "@/components/listing/listing-card";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { sortOptions } from "@/data/fields";
import { routes } from "@/data/routes";
import { listings } from "@/lib/listings";
import { rank } from "@/lib/match";
import { useHydrated, useStore } from "@/lib/store";
import type { MatchResult, Opportunity } from "@/types";
import { faNumber } from "@/lib/utils";
import { SearchBar } from "./search-bar";
import { AdvancedFilter } from "./advanced-filter";

const PAGE = 12;
const SUITABLE = 50;

function SaveCriteriaBar({ hasCriteria }: { hasCriteria: boolean }) {
  const { user, openLogin, saveProfile, profiles, criteria } = useStore();
  const saved = profiles.some((p) => JSON.stringify(p.criteria) === JSON.stringify(criteria));
  const save = () => {
    if (!user) return openLogin({ type: "save-criteria" });
    saveProfile(`شرایط ${faNumber(profiles.length + 1)}`);
    toast.success("شرایط شما ذخیره شد.");
  };
  if (!hasCriteria) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative isolate mb-5 flex flex-col gap-3 overflow-hidden rounded-3xl bg-deep p-4 pr-5 text-white sm:flex-row sm:items-center sm:justify-between">
      <AlgoPattern className="inset-y-0 left-0 h-full w-1/2 text-white/[0.12]" fade="right" scale={0.5} />
      <p className="relative flex items-center gap-3 text-sm font-bold leading-6"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-sand"><Notification size={20} variant="Bulk" /></span>
        {saved ? "این شرایط ذخیره شده است. دفعه بعد پروژه‌های تازه را همین‌جا می‌بینید." : "این شرایط را ذخیره کنید تا دفعه بعد دوباره وارد نکنید و پروژه‌های تازه را ببینید."}</p>
      {saved ? <span className="relative inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-extrabold text-sand"><TickCircle size={18} variant="Bold" />ذخیره شد</span>
        : <Button variant="plain" size="auto" type="button" onClick={save} className="relative inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-ink transition-colors hover:bg-sand"><ArchiveAdd size={18} />ذخیره شرایط</Button>}
    </motion.div>
  );
}

export function Results() {
  const hydrated = useHydrated();
  const { criteria, user, openLogin } = useStore();
  const [sort, setSort] = useState("relevance");
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const route = routes.find((r) => r.id === criteria.route)!;
  const filterCount = Object.keys(criteria.filters).length;
  const hasCriteria = hydrated && (criteria.groups.length > 0 || criteria.provinces.length > 0 || criteria.amount != null || filterCount > 0);

  const all = useMemo(() => (hydrated ? rank(listings, criteria) : []), [hydrated, criteria]);
  const { shown, hidden } = useMemo(() => {
    let list = all;
    if (q.trim()) list = list.filter((r) => `${r.listing.title} ${r.listing.city ?? ""} ${r.listing.province ?? ""} ${r.listing.tags.join(" ")}`.includes(q.trim()));
    const ok = hasCriteria && !showAll ? list.filter((r) => r.score >= SUITABLE) : list;
    const by: Record<string, (a: MatchResult, b: MatchResult) => number> = {
      relevance: () => 0,
      capital: (a, b) => (a.listing.amount ?? 1e9) - (b.listing.amount ?? 1e9),
      payback: (a, b) => ((a.listing.raw as Opportunity).paybackYears ?? 99) - ((b.listing.raw as Opportunity).paybackYears ?? 99),
      newest: (a, b) => b.listing.publishedAt.localeCompare(a.listing.publishedAt),
    };
    return { shown: [...ok].sort(by[sort]), hidden: list.length - ok.length };
  }, [all, q, sort, showAll, hasCriteria]);

  useEffect(() => setLimit(PAGE), [criteria, q, sort, showAll]);

  // پیشنهاد ذخیره شرایط، یک‌بار پس از پر کردن
  const nudged = useRef(false);
  useEffect(() => {
    if (!hasCriteria || nudged.current || user) return;
    nudged.current = true;
    const t = setTimeout(() => toast("شرایطتان را ذخیره کنیم؟", { description: "دفعه بعد لازم نیست دوباره وارد کنید.", duration: 9000, action: { label: "ذخیره", onClick: () => openLogin({ type: "save-criteria" }) } }), 2500);
    return () => clearTimeout(t);
  }, [hasCriteria, user, openLogin]);

  return (
    <>
      <Header />
      <main className="relative mx-auto max-w-[92rem] px-3 pt-6 sm:px-6">
        <AlgoPattern className="-top-24 left-0 h-80 w-[36rem] text-primary/[0.08]" fade="radial" scale={0.8} />
        <div className="relative z-30"><SearchBar compact /></div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[22rem_1fr]">
          <aside className="hidden lg:block">
            <Card className="glass no-scrollbar sticky top-24 block max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-[2rem] p-5"><AdvancedFilter /></Card>
          </aside>

          <section className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 text-[13px] font-extrabold text-primary"><NodeMark />{route.name}</span>
                <h1 className="mt-1.5 text-2xl font-black text-ink sm:text-3xl">{hydrated ? faNumber(shown.length) : "…"} پروژه {hasCriteria ? "متناسب با شرایط شما" : "برای بررسی"}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="glass flex h-11 items-center gap-2 rounded-full px-4"><SearchNormal1 size={17} className="text-muted-foreground" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جست‌وجو در نتایج" aria-label="جست‌وجو در نتایج" className="h-9 w-36 border-0 bg-transparent px-0 text-sm font-semibold shadow-none focus-visible:ring-0 placeholder:font-normal" />
                  {q && <Button variant="plain" size="auto" type="button" onClick={() => setQ("")} aria-label="پاک کردن"><CloseCircle size={16} className="text-muted-foreground" /></Button>}</div>
                <Select dir="rtl" value={sort} onValueChange={setSort}>
                  <SelectTrigger aria-label="مرتب‌سازی" className="glass h-11 gap-2 rounded-full border-white/75 px-4 text-sm font-bold text-ink data-[size=default]:h-11"><Sort size={17} className="text-primary" /><SelectValue /></SelectTrigger>
                  <SelectContent align="end" className="rounded-2xl">
                    {sortOptions.map((o) => <SelectItem key={o.value} value={o.value} className="rounded-xl">{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Sheet>
                  <SheetTrigger asChild><Button variant="plain" size="auto" type="button" className="flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-white lg:hidden"><FilterSearch size={17} />فیلتر پیشرفته{filterCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-sand text-[11px] text-ink">{faNumber(filterCount)}</span>}</Button></SheetTrigger>
                  <SheetContent side="bottom" className="max-h-[88dvh] overflow-y-auto rounded-t-[2rem] p-5"><SheetTitle className="sr-only">فیلتر پیشرفته</SheetTitle><AdvancedFilter /></SheetContent>
                </Sheet>
              </div>
            </div>

            <SaveCriteriaBar hasCriteria={hasCriteria} />

            {hasCriteria && (hidden > 0 || showAll) && (
              <Label className="mb-5 flex w-fit items-center gap-3 text-sm font-semibold text-ink/75"><Switch dir="rtl" checked={showAll} onCheckedChange={setShowAll} />
                نمایش موارد کم‌تطابق{!showAll && ` (${faNumber(hidden)} مورد پنهان است)`}</Label>
            )}

            {hydrated && shown.length === 0 ? (
              <Card className="glass grid place-items-center gap-0 rounded-[2rem] px-6 py-20 text-center">
                <span className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary"><SearchNormal1 size={28} variant="Bulk" /></span>
                <h2 className="mt-5 text-xl font-extrabold text-ink">{all.length === 0 ? "برای این مسیر هنوز پروژه‌ای ثبت نشده است." : "با این شرایط پروژه‌ای پیدا نشد."}</h2>
                <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">{all.length === 0 ? "شرایطتان را ذخیره کنید تا با اضافه شدن پروژه تازه، آن را ببینید." : "چند فیلتر را بردارید یا موارد کم‌تطابق را هم نمایش دهید."}</p>
                {all.length > 0 && hidden > 0 && <Button variant="plain" size="auto" type="button" onClick={() => setShowAll(true)} className="mt-6 h-12 rounded-full bg-primary px-6 font-bold text-white">نمایش {faNumber(hidden)} مورد کم‌تطابق</Button>}
              </Card>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {shown.slice(0, limit).map((r, i) => <ListingCard key={r.listing.id} listing={r.listing} score={hasCriteria ? r.score : undefined} reasons={hasCriteria ? r.reasons : undefined} index={i % PAGE} />)}
                </AnimatePresence>
              </div>
            )}
            {shown.length > limit && (
              <div className="mt-10 flex flex-col items-center gap-2">
                <Button variant="plain" size="auto" type="button" onClick={() => setLimit(limit + PAGE)} className="h-13 rounded-full border border-ink/15 bg-white/70 px-8 py-3.5 font-extrabold text-ink transition-colors hover:border-primary hover:text-primary">نمایش بیشتر</Button>
                <span className="text-xs text-muted-foreground">{faNumber(Math.min(limit, shown.length))} از {faNumber(shown.length)}</span>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
