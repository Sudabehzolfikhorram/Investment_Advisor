"use client";
// دستیار: متن کاربر را می‌خواند، برداشتش را نشان می‌دهد و حداکثر ۱۰ پروژه با درصد تطابق پیشنهاد می‌کند.
// چیدمان مثل یک چت است: گفت‌وگو از بالا به پایین می‌آید و جای نوشتن همیشه پایین صفحه ثابت است؛
// نمونه‌ها هم کنار همان جای نوشتن‌اند تا انتخاب هر نمونه، درست بالای آن به‌عنوان پیام شما دیده شود.
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArchiveTick, Building, Edit2, Home2, Location, MagicStar, MessageQuestion, Save2, Send2, Setting4, Sun1, TickCircle, WalletMoney } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/site/header";
import { NodeMark } from "@/components/brand/algo-pattern";
import { MatchRing } from "@/components/brand/reveal";
import { SaveButton } from "@/components/listing/listing-card";
import { SaveCriteriaDialog, useProfileStats } from "@/components/search/save-criteria";
import { routes } from "@/data/routes";
import { samplePrompts, suggest } from "@/lib/assistant";
import { describeCriteria } from "@/lib/criteria";
import { listings } from "@/lib/listings";
import { rank } from "@/lib/match";
import { useHydrated, useStore } from "@/lib/store";
import type { MatchResult, SearchCriteria } from "@/types";
import { cn, faNumber } from "@/lib/utils";

const phases = ["خواندن شرایط شما", "تطبیق با پروژه‌ها", "مرتب‌سازی بر اساس درصد تطابق"];

function Avatar() {
  return <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-[0_12px_26px_-12px_var(--primary)]"><MagicStar size={20} variant="Bold" /></span>;
}

const metOf = (r: MatchResult) => r.reasons.filter((x) => x.status === "met").slice(0, 3);

function TopCard({ r, i }: { r: MatchResult; i: number }) {
  const l = r.listing;
  return (
    <motion.article initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-border bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_-32px_rgb(11_31_29/0.4)]">
      <Link href={`/opportunities/${l.id}`} className="absolute inset-0 z-10" aria-label={l.title} />
      <span className="relative m-2 block aspect-[16/10] overflow-hidden rounded-[1.35rem]">
        <Image src={l.image} alt="" fill sizes="30vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <span className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.65),transparent_55%)]" />
        <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-black text-ink">پیشنهاد {faNumber(i + 1)}</span>
        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 p-0.5"><MatchRing score={r.score} light /></span>
        {l.city && <span className="absolute bottom-3.5 right-3 flex items-center gap-1 text-xs font-bold text-white"><Location size={14} variant="Bold" />{l.province}، {l.city}</span>}
      </span>
      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-1.5">
        <h3 className="line-clamp-2 min-h-12 text-[15px] font-extrabold leading-6 text-ink">{l.title}</h3>
        <p className="text-xs font-semibold text-muted-foreground">{l.stats[0].label}: <b className="text-ink">{l.stats[0].value}</b></p>
        {metOf(r).length > 0 && <div className="mt-auto flex flex-wrap gap-1.5">{metOf(r).map((m) => <span key={m.label} className="flex items-center gap-1 rounded-full bg-primary/[0.07] px-2 py-0.5 text-[11px] font-bold text-primary"><TickCircle size={12} variant="Bold" />{m.label}</span>)}</div>}
      </div>
    </motion.article>
  );
}

function Row({ r, i }: { r: MatchResult; i: number }) {
  const l = r.listing;
  return (
    <motion.li initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.06, duration: 0.45 }}
      className="group relative flex items-center gap-4 rounded-[1.5rem] border border-border bg-white p-2 pl-4 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_22px_44px_-32px_rgb(11_31_29/0.4)]">
      <Link href={`/opportunities/${l.id}`} className="absolute inset-0 z-10 rounded-[1.5rem]" aria-label={l.title} />
      <span className="w-6 shrink-0 text-center text-sm font-black text-ink/35">{faNumber(i + 4)}</span>
      <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl"><Image src={l.image} alt="" fill sizes="96px" className="object-cover" /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-extrabold text-ink">{l.title}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted-foreground">
          {l.city && <span className="flex items-center gap-1"><Location size={13} variant="Bold" />{l.province}</span>}
          <span>{l.stats[0].label}: <b className="text-ink/80">{l.stats[0].value}</b></span>
          {metOf(r)[0] && <span className="flex items-center gap-1 text-primary"><TickCircle size={12} variant="Bold" />{metOf(r)[0].label}</span>}
        </span>
      </span>
      <span className="relative z-20"><SaveButton id={l.id} className="!bg-muted !text-ink aria-pressed:!bg-primary aria-pressed:!text-white" /></span>
      <MatchRing score={r.score} size={54} />
    </motion.li>
  );
}

type Turn = { id: number; q: string; criteria?: SearchCriteria };
const promptIcons = [Building, WalletMoney, Sun1, Home2];
const same = (a: SearchCriteria, b: SearchCriteria) => JSON.stringify(a) === JSON.stringify(b);

/** پاسخ یک نوبت: یا از متن کاربر خوانده می‌شود، یا از شرایط ذخیره‌شده‌ای که کاربر انتخاب کرده */
function answerOf(t: Turn) {
  if (!t.criteria) return suggest(t.q);
  const c = t.criteria;
  const understood = [{ label: "مسیر", value: routes.find((r) => r.id === c.route)?.name ?? "" }, ...describeCriteria(c).map((x) => ({ label: "", value: x.label }))];
  return { criteria: c, understood, results: rank(listings, c, 10).filter((r) => r.score > 0) };
}

/** پیشنهاد گام بعد: اگر بودجه یا محل گفته نشده، با یک ضربه اضافه شود */
function nextAsk(c: SearchCriteria) {
  if (!c.amount) return { title: "با چه بودجه‌ای؟", chips: c.route === "fund" ? ["تا ۵۰ میلیون", "تا ۵۰۰ میلیون", "تا ۵ میلیارد"] : ["تا ۵ میلیارد", "تا ۲۰ میلیارد", "تا ۱۰۰ میلیارد"] };
  if (!c.provinces.length && c.route !== "fund") {
    const count = new Map<string, number>();
    for (const l of listings) if (l.province && l.routes.includes(c.route)) count.set(l.province, (count.get(l.province) ?? 0) + 1);
    const top = [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([p]) => `در ${p}`);
    if (top.length) return { title: "کدام استان برایتان مهم‌تر است؟", chips: top };
  }
  return null;
}

function Bubble({ children }: { children: React.ReactNode }) {
  // پیام کاربر سمت چپ، پاسخ دستیار سمت راست
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
      <p className="max-w-xl rounded-[1.5rem] rounded-tl-md bg-coral px-5 py-3 text-[15px] font-bold leading-8 text-white">{children}</p>
    </motion.div>
  );
}

/** یک نوبت گفت‌وگو: پیام شما، مراحل بررسی، پاسخ و (در آخرین نوبت) گام بعد */
function TurnView({ turn, last, onAsk, onEdit, onRefine, onSave }: { turn: Turn; last: boolean; onAsk: (q: string) => void; onEdit: (q: string) => void; onRefine: (c: SearchCriteria) => void; onSave: (c: SearchCriteria) => void }) {
  const out = useMemo(() => answerOf(turn), [turn]);
  const [phase, setPhase] = useState(0);
  const done = phase >= phases.length;
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const profiles = useStore((s) => s.profiles);
  const saved = hydrated && profiles.some((p) => same(p.criteria, out.criteria));
  const ask = nextAsk(out.criteria);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, []);
  useEffect(() => { if (done) return; const t = setTimeout(() => setPhase((p) => p + 1), 750); return () => clearTimeout(t); }, [phase, done]);
  const top = out.results.slice(0, 3), rest = out.results.slice(3);
  return (
    <div ref={ref} className="scroll-mt-28 space-y-5">
      <Bubble>{turn.q}</Bubble>
      <div className="flex items-start gap-3">
        <Avatar />
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key="thinking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="surface inline-flex flex-col gap-2.5 rounded-[1.5rem] rounded-tr-md px-5 py-4">
                  {phases.map((p, i) => (
                    <span key={p} className={cn("flex items-center gap-2.5 text-sm font-bold transition-colors duration-300", i < phase ? "text-primary" : i === phase ? "text-ink" : "text-ink/30")}>
                      {i < phase ? <TickCircle size={18} variant="Bold" /> : i === phase ? <span className="grid size-[18px] place-items-center"><span className="size-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" /></span> : <span className="grid size-[18px] place-items-center"><span className="size-2 rounded-full bg-current" /></span>}
                      {p}
                    </span>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-4" aria-hidden>
                  {[0, 1, 2].map((k) => (
                    <div key={k} className="overflow-hidden rounded-[1.75rem] border border-border bg-white p-2">
                      <div className="aspect-[16/10] animate-pulse rounded-[1.35rem] bg-muted" style={{ animationDelay: `${k * 150}ms` }} />
                      <div className="space-y-2 p-3"><div className="h-3.5 w-4/5 animate-pulse rounded-full bg-muted" /><div className="h-3 w-1/2 animate-pulse rounded-full bg-muted" /></div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="answer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="surface rounded-[1.5rem] rounded-tr-md p-5">
                  <p className="flex items-center gap-2 text-[13px] font-extrabold text-primary"><NodeMark />برداشت من از درخواست شما</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {out.understood.length ? out.understood.map((u, i) => (
                      <motion.span key={u.label + u.value} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }} className="rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-[13px] font-extrabold text-ink">{u.label && <span className="ml-1 text-xs font-semibold text-muted-foreground">{u.label}</span>}{u.value}</motion.span>
                    )) : <span className="text-sm font-semibold text-muted-foreground">شرط مشخصی پیدا نکردم؛ پروژه‌های پرتطابق همه مسیرها را آورده‌ام.</span>}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-border pt-4">
                    <p className="text-base font-black text-ink">{out.results.length ? `${faNumber(out.results.length)} پروژه نزدیک به خواسته شما` : "فعلاً پروژه‌ای با این شرایط نداریم."}</p>
                    <div className="flex gap-2">
                      {!turn.criteria && <Button type="button" variant="ghost" onClick={() => onEdit(turn.q)} className="h-10 gap-1.5 rounded-full px-4 text-[13px] font-bold text-ink/70"><Edit2 size={16} />تغییر درخواست</Button>}
                      <Button type="button" variant="outline" onClick={() => onRefine(out.criteria)} className="h-10 gap-1.5 rounded-full bg-white px-4 text-[13px] font-extrabold shadow-none hover:border-primary hover:text-primary"><Setting4 size={16} />دقیق‌تر کردن با فیلترها</Button>
                    </div>
                  </div>
                </div>
                {top.length > 0 && <div className="mt-5 grid grid-cols-3 gap-4">{top.map((r, i) => <TopCard key={r.listing.id} r={r} i={i} />)}</div>}
                {rest.length > 0 && <ol className="mt-4 space-y-2.5">{rest.map((r, i) => <Row key={r.listing.id} r={r} i={i} />)}</ol>}

                {/* گام بعد: کامل‌تر کردن شرایط با یک ضربه و ذخیره آن برای دفعه بعد */}
                {last && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6 grid grid-cols-[1fr_1.1fr] gap-4">
                    {ask ? (
                      <div className="surface rounded-[1.5rem] p-5">
                        <p className="flex items-center gap-2 text-sm font-extrabold text-ink"><MessageQuestion size={18} variant="Bulk" className="text-primary" />{ask.title}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {ask.chips.map((c) => <Button key={c} type="button" variant="outline" onClick={() => onAsk(`${turn.q}، ${c}`)} className="h-9 rounded-full bg-white px-4 text-[13px] font-bold shadow-none hover:border-primary hover:text-primary">{c}</Button>)}
                        </div>
                      </div>
                    ) : <div className="surface flex items-center gap-3 rounded-[1.5rem] p-5 text-sm font-bold text-ink/75"><TickCircle size={20} variant="Bulk" className="shrink-0 text-primary" />شرایط اصلی را گفته‌اید؛ اگر شرط دیگری دارید، پایین بنویسید.</div>}
                    <div className={cn("relative overflow-hidden rounded-[1.5rem] p-5", saved ? "surface" : "bg-coral-soft text-ink")}>
                      {saved ? (
                        <p className="flex items-center gap-2.5 text-sm font-extrabold text-primary"><ArchiveTick size={20} variant="Bulk" />این شرایط ذخیره شده است؛ دفعه بعد از همین‌جا ادامه می‌دهید.</p>
                      ) : (
                        <>
                          <p className="text-[15px] font-black">این شرایط را برایتان نگه دارم؟</p>
                          <p className="mt-1 text-[13px] leading-6 text-ink/70">دفعه بعد لازم نیست دوباره بنویسید؛ با یک ضربه برمی‌گردید و پروژه‌های تازه را جدا می‌بینید.</p>
                          <Button type="button" onClick={() => onSave(out.criteria)} className="mt-3.5 h-10 gap-2 rounded-full bg-coral px-5 text-[13px] font-extrabold text-white hover:bg-coral-deep"><Save2 size={17} />ذخیره شرایط</Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function Assistant() {
  const router = useRouter();
  const initial = useSearchParams().get("q") ?? "";
  const setCriteria = useStore((s) => s.setCriteria);
  const hydrated = useHydrated();
  const profiles = useStore((s) => s.profiles);
  const stats = useProfileStats();
  const [text, setText] = useState("");
  const [turns, setTurns] = useState<Turn[]>(initial ? [{ id: 1, q: initial }] : []);
  const [saveOpen, setSaveOpen] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);
  const started = turns.length > 0;
  const asked = new Set(turns.map((t) => t.q));
  const left = samplePrompts.filter((p) => !asked.has(p));
  const mine = hydrated ? profiles.slice(0, 3) : [];

  const push = (t: Omit<Turn, "id">) => setTurns((x) => [...x, { id: (x.at(-1)?.id ?? 0) + 1, ...t }]);
  const ask = (q: string) => { const v = q.trim(); if (!v) return; push({ q: v }); setText(""); };
  const edit = (q: string) => { setText(q); requestAnimationFrame(() => { const el = box.current; if (el) { el.focus(); el.setSelectionRange(q.length, q.length); } }); };

  return (
    <>
      <Header />
      <main className="relative mx-auto flex min-h-[calc(100dvh-6rem)] max-w-5xl flex-col px-6 pt-8">
        <div className="flex-1">
          {!started ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[50dvh] flex-col items-center justify-center text-center">
              <span className="grid size-16 place-items-center rounded-[1.4rem] bg-primary text-white shadow-[0_20px_40px_-18px_var(--primary)]"><MagicStar size={30} variant="Bold" /></span>
              <h1 className="mx-auto mt-6 max-w-3xl text-[2.4rem] font-black leading-[1.45] text-ink text-balance">از سرمایه و هدفتان بگویید؛ پروژه مناسب را با هم پیدا می‌کنیم.</h1>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-8 text-muted-foreground">همان‌طور که با یک مشاور حرف می‌زنید بنویسید: چقدر سرمایه دارید، در کدام شهر و در چه کاری. شرایطتان را یک بار ذخیره کنید و دفعه بعد از همین‌جا ادامه دهید.</p>
              {mine.length > 0 && (
                <div className="mt-8 w-full max-w-2xl rounded-[1.75rem] border border-border bg-white/80 p-4 text-right">
                  <p className="px-1 text-[13px] font-extrabold text-ink">خوش برگشتید؛ از شرایط ذخیره‌شده ادامه دهید</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mine.map((p) => (
                      <Button key={p.id} type="button" variant="outline" onClick={() => push({ q: `ادامه با «${p.name}»`, criteria: p.criteria })} className="h-10 gap-2 rounded-full bg-white pl-2 pr-4 text-[13px] font-bold shadow-none hover:border-primary hover:text-primary">
                        <ArchiveTick size={16} variant="Bulk" className="text-primary" />{p.name}
                        {stats[p.id]?.fresh ? <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-extrabold text-white">{faNumber(stats[p.id].fresh)} تازه</span> : null}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="space-y-12 pb-6">
              {turns.map((t, i) => <TurnView key={t.id} turn={t} last={i === turns.length - 1} onAsk={ask} onEdit={edit}
                onRefine={(c) => { setCriteria(c); useStore.getState().setStarted(true); router.push("/opportunities"); }}
                onSave={(c) => { setCriteria(c); setSaveOpen(true); }} />)}
            </div>
          )}
        </div>

        {/* جای نوشتن: همیشه پایین صفحه؛ نمونه‌ها درست بالای آن */}
        <div className="sticky bottom-0 z-30 -mx-6 bg-gradient-to-t from-background via-background via-75% to-transparent px-6 pb-6 pt-10">
          <div className="mx-auto max-w-3xl">
            {left.length > 0 && (
              <div className="mb-3 flex flex-wrap justify-center gap-2 p-1">
                {left.map((p) => { const I = promptIcons[samplePrompts.indexOf(p) % promptIcons.length];
                  return (
                    <Button variant="plain" size="auto" key={p} type="button" onClick={() => ask(p)}
                      className="group gap-2 rounded-full border border-border bg-white py-2 pl-4 pr-2.5 text-[13px] font-bold text-ink/75 transition-colors hover:border-primary/40 hover:text-primary">
                      <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary"><I size={14} variant="Bold" /></span>{p}
                    </Button>); })}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); ask(text); }}
              className="surface flex items-end gap-2 rounded-[1.75rem] p-2 pr-5 transition-shadow focus-within:shadow-[0_0_0_4px_rgb(15_118_110/0.12),0_24px_50px_-30px_rgb(11_31_29/0.3)]">
              <Textarea ref={box} value={text} onChange={(e) => setText(e.target.value)} rows={1} aria-label="شرایط شما"
                placeholder={started ? "شرط تازه‌ای دارید؟ بنویسید…" : "مثلاً: ۳۰ میلیارد دارم و دنبال پروژه مسکونی در تهران هستم"}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(text); } }}
                className="field-sizing-content max-h-40 min-h-12 flex-1 resize-none border-0 bg-transparent px-0 py-3 text-base font-semibold leading-7 text-ink shadow-none focus-visible:ring-0 placeholder:font-normal md:text-base" />
              <Button variant="plain" size="auto" type="submit" disabled={!text.trim()} aria-label="بفرست"
                className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-white shadow-[0_14px_30px_-12px_var(--primary)] transition-colors hover:bg-deep disabled:bg-ink/15 disabled:shadow-none"><Send2 size={20} variant="Bold" className="-scale-x-100" /></Button>
            </form>
          </div>
        </div>
      </main>
      <SaveCriteriaDialog open={saveOpen} onOpenChange={setSaveOpen} />
    </>
  );
}
