"use client";
// دستیار: متن کاربر را می‌خواند، برداشتش را نشان می‌دهد و حداکثر ۱۰ پروژه با درصد تطابق پیشنهاد می‌کند.
// چیدمان مثل یک چت است: گفت‌وگو از بالا به پایین می‌آید و جای نوشتن همیشه پایین صفحه ثابت است؛
// نمونه‌ها هم کنار همان جای نوشتن‌اند تا انتخاب هر نمونه، درست بالای آن به‌عنوان پیام شما دیده شود.
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArchiveTick, ArrowLeft, Building, Chart, Cpu, DocumentText, Edit2, Home2, Location, MagicStar, MessageQuestion, Save2, Send2, Setting4, Sun1, TickCircle, WalletMoney } from "@/components/iconsax";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/site/header";
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

const phases = [
  { title: "خواندن شرایط شما", icon: DocumentText },
  { title: "تطبیق با پروژه‌ها", icon: Cpu },
  { title: "مرتب‌سازی بر اساس درصد تطابق", icon: Chart },
];

/** نشانه دستیار: گوی زنده با حلقه چرخان؛ هنگام فکر کردن تندتر می‌چرخد. */
function Orb({ size = 40, busy = false }: { size?: number; busy?: boolean }) {
  return (
    <span className="relative grid shrink-0 place-items-center rounded-full shadow-[0_14px_30px_-14px_var(--primary)]" style={{ width: size, height: size }}>
      <span className={cn("absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_0deg,var(--primary),#7cc4bb,var(--pine-soft),var(--primary))]", busy ? "[animation-duration:1.4s]" : "[animation-duration:9s]")} />
      <span className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle_at_35%_28%,#3aa597,var(--primary)_52%,var(--pine)_100%)]" />
      <MagicStar size={Math.round(size * 0.44)} variant="Bold" className={cn("relative text-white", busy && "animate-pulse")} />
    </span>
  );
}

/** متن پاسخ کلمه‌به‌کلمه نوشته می‌شود؛ با «کاهش حرکت» یک‌باره نمایش داده می‌شود. */
function Typed({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const words = useMemo(() => text.split(" "), [text]);
  const [n, setN] = useState(reduce ? words.length : 0);
  useEffect(() => { if (n >= words.length) return; const t = setTimeout(() => setN((x) => x + 1), 55); return () => clearTimeout(t); }, [n, words.length]);
  return <p className={className}>{words.slice(0, n).join(" ")}{n < words.length && <span aria-hidden className="ms-1 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse rounded-full bg-primary" />}</p>;
}

const shimmer = "bg-[linear-gradient(90deg,var(--muted)_25%,#eef6f5_50%,var(--muted)_75%)] bg-[length:200%_100%] animate-[sheen_1.6s_linear_infinite]";

const metOf = (r: MatchResult) => r.reasons.filter((x) => x.status === "met").slice(0, 3);

function TopCard({ r, i }: { r: MatchResult; i: number }) {
  const l = r.listing;
  return (
    <motion.article initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-border bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_-32px_rgb(8_59_55/0.4)]">
      <Link href={`/opportunities/${l.id}`} className="absolute inset-0 z-10" aria-label={l.title} />
      <span className="relative m-2 block aspect-[16/10] overflow-hidden rounded-[1.35rem]">
        <Image src={l.image} alt="" fill sizes="30vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <span className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.65),transparent_55%)]" />
        <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-black text-ink">پیشنهاد {faNumber(i + 1)}</span>
        <span className="absolute bottom-3 left-3 rounded-full bg-pine/55 p-0.5"><MatchRing score={r.score} light /></span>
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
      className="group relative flex items-center gap-4 rounded-[1.5rem] border border-border bg-white p-2 pl-4 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_22px_44px_-32px_rgb(8_59_55/0.4)]">
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
      <p className="max-w-xl rounded-[1.5rem] rounded-tl-md bg-pine px-5 py-3 text-[15px] font-bold leading-8 text-white shadow-[0_18px_36px_-24px_var(--pine)]">{children}</p>
    </motion.div>
  );
}

/** گام‌های بررسی به‌صورت خط زمانی؛ هر گام پس از انجام، نتیجه کوتاه خودش را نشان می‌دهد. */
function Steps({ phase, notes }: { phase: number; notes: string[] }) {
  return (
    <ol className="relative space-y-3">
      {phases.map((p, i) => { const I = p.icon; const state = i < phase ? "done" : i === phase ? "now" : "next"; return (
        <li key={p.title} className="relative flex items-start gap-3">
          {i < phases.length - 1 && <span aria-hidden className={cn("absolute start-[13.5px] top-8 h-[calc(100%-1.25rem)] w-px", i < phase ? "bg-primary/40" : "bg-border")} />}
          <span className={cn("relative grid size-7 shrink-0 place-items-center rounded-full transition-colors duration-300", state === "done" ? "bg-primary text-white" : state === "now" ? "bg-primary/10 text-primary ring-1 ring-primary/30" : "bg-muted text-ink/30")}>
            {state === "done" ? <TickCircle size={16} variant="Bold" /> : <I size={15} variant="Bulk" />}
            {state === "now" && <span className="absolute inset-0 animate-ping rounded-full ring-1 ring-primary/40" />}
          </span>
          <span className="min-w-0 pt-0.5">
            <span className={cn("block text-sm font-extrabold", state === "next" ? "text-ink/35" : state === "now" ? "bg-[linear-gradient(90deg,var(--ink)_30%,var(--primary)_50%,var(--ink)_70%)] bg-[length:200%_100%] bg-clip-text text-transparent animate-[sheen_1.8s_linear_infinite]" : "text-ink")}>{p.title}</span>
            {state === "done" && notes[i] && <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-0.5 block text-xs font-semibold text-muted-foreground">{notes[i]}</motion.span>}
          </span>
        </li>); })}
    </ol>
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
  useEffect(() => { if (done) return; const t = setTimeout(() => setPhase((p) => p + 1), 800); return () => clearTimeout(t); }, [phase, done]);
  const top = out.results.slice(0, 3), rest = out.results.slice(3);
  const routeName = routes.find((r) => r.id === out.criteria.route)?.name;
  const notes = [
    turn.criteria ? "شرایط ذخیره‌شده شما بارگذاری شد" : out.understood.length ? `${faNumber(out.understood.length)} نکته از متن شما برداشت شد` : "شرط مشخصی در متن نبود",
    routeName ? `پروژه‌های مسیر «${routeName}» با شرایط شما سنجیده شد` : "پروژه‌های همه مسیرها سنجیده شد",
    out.results.length ? `${faNumber(out.results.length)} پیشنهاد به ترتیب تطابق چیده شد` : "پیشنهادی با تطابق کافی پیدا نشد",
  ];
  const best = out.results[0];
  return (
    <div ref={ref} className="scroll-mt-28 space-y-5">
      <Bubble>{turn.q}</Bubble>
      <div className="flex items-start gap-3">
        <Orb busy={!done} />
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key="thinking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="surface inline-flex min-w-80 flex-col rounded-[1.5rem] rounded-tr-md px-5 py-4">
                  <p className="mb-3 text-xs font-extrabold text-primary">در حال بررسی…</p>
                  <Steps phase={phase} notes={notes} />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-4" aria-hidden>
                  {[0, 1, 2].map((k) => (
                    <div key={k} className="overflow-hidden rounded-[1.75rem] border border-border bg-white p-2">
                      <div className={cn("aspect-[16/10] rounded-[1.35rem]", shimmer)} style={{ animationDelay: `${k * 150}ms` }} />
                      <div className="space-y-2 p-3"><div className={cn("h-3.5 w-4/5 rounded-full", shimmer)} /><div className={cn("h-3 w-1/2 rounded-full", shimmer)} /></div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="answer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="surface rounded-[1.5rem] rounded-tr-md p-5">
                  {/* گام‌های بررسی، جمع‌شده؛ با یک ضربه دیده می‌شود چطور به این پیشنهادها رسیدیم */}
                  <Accordion type="single" collapsible>
                    <AccordionItem value="steps" className="border-0">
                      <AccordionTrigger className="w-fit flex-none gap-2 rounded-full bg-primary/[0.07] px-3 py-1.5 text-xs font-extrabold text-primary hover:no-underline">
                        <span className="flex items-center gap-1.5"><TickCircle size={14} variant="Bold" />بررسی در {faNumber(phases.length)} گام انجام شد</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0 pt-4"><Steps phase={phases.length} notes={notes} /></AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <p className="mt-4 flex items-center gap-2 text-[13px] font-extrabold text-ink"><MagicStar size={16} variant="Bulk" className="text-primary" />برداشت من از درخواست شما</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {out.understood.length ? out.understood.map((u, i) => (
                      <motion.span key={u.label + u.value} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-1.5 rounded-xl border border-primary/15 bg-primary/[0.05] px-3 py-1.5 text-[13px] font-extrabold text-ink">
                        <span className="size-1.5 rounded-full bg-primary" />{u.label && <span className="text-xs font-semibold text-muted-foreground">{u.label}</span>}{u.value}</motion.span>
                    )) : <span className="text-sm font-semibold text-muted-foreground">شرط مشخصی پیدا نکردم؛ پروژه‌های پرتطابق همه مسیرها را آورده‌ام.</span>}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-border pt-4">
                    <div className="min-w-0">
                      <Typed className="text-base font-black text-ink" text={out.results.length ? `${faNumber(out.results.length)} پروژه نزدیک به خواسته شما پیدا کردم.` : "فعلاً پروژه‌ای با این شرایط نداریم."} />
                      {best && <p className="mt-1 truncate text-xs font-semibold text-muted-foreground">بیشترین تطابق: <b className="text-ink/80">{best.listing.title}</b> با {faNumber(Math.round(best.score))}٪</p>}
                    </div>
                    <div className="flex shrink-0 gap-2">
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
                        <p className="mt-1 text-xs font-semibold text-muted-foreground">با یک ضربه به درخواستتان اضافه می‌شود.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {ask.chips.map((c) => <Button key={c} type="button" variant="outline" onClick={() => onAsk(`${turn.q}، ${c}`)} className="h-9 gap-1.5 rounded-full bg-white px-4 text-[13px] font-bold shadow-none hover:border-primary hover:text-primary"><MagicStar size={14} variant="Bulk" className="text-primary" />{c}</Button>)}
                        </div>
                      </div>
                    ) : <div className="surface flex items-center gap-3 rounded-[1.5rem] p-5 text-sm font-bold text-ink/75"><TickCircle size={20} variant="Bulk" className="shrink-0 text-primary" />شرایط اصلی را گفته‌اید؛ اگر شرط دیگری دارید، پایین بنویسید.</div>}
                    <div className={cn("relative overflow-hidden rounded-[1.5rem] p-5", saved ? "surface" : "bg-pine text-white")}>
                      {saved ? (
                        <p className="flex items-center gap-2.5 text-sm font-extrabold text-primary"><ArchiveTick size={20} variant="Bulk" />این شرایط ذخیره شده است؛ دفعه بعد از همین‌جا ادامه می‌دهید.</p>
                      ) : (
                        <>
                          <span aria-hidden className="pointer-events-none absolute -left-10 -top-12 size-40 rounded-full bg-primary/40 blur-3xl" />
                          <p className="relative text-[15px] font-black">این شرایط را برایتان نگه دارم؟</p>
                          <p className="relative mt-1 text-[13px] leading-6 text-white/70">دفعه بعد لازم نیست دوباره بنویسید؛ با یک ضربه برمی‌گردید و پروژه‌های تازه را جدا می‌بینید.</p>
                          <Button type="button" onClick={() => onSave(out.criteria)} className="relative mt-3.5 h-10 gap-2 rounded-full bg-coral px-5 text-[13px] font-extrabold text-white shadow-[0_10px_22px_-10px_var(--coral)] hover:bg-coral-deep"><Save2 size={17} />ذخیره شرایط</Button>
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

  const abilities = [
    { icon: DocumentText, t: "شرایط را از متن خودتان می‌خوانم" },
    { icon: Cpu, t: "با پروژه‌های هر مسیر تطبیق می‌دهم" },
    { icon: Chart, t: "تا ۱۰ پیشنهاد با درصد تطابق می‌آورم" },
  ];

  return (
    <>
      <Header />
      <main className="relative mx-auto flex min-h-[calc(100dvh-6rem)] max-w-5xl flex-col px-6 pt-8">
        {/* هاله ملایم پشت صفحه: حس زنده بودن دستیار، بدون رقابت با محتوا */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] overflow-hidden">
          <motion.span animate={{ x: [0, 40, -20, 0], y: [0, 20, -10, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute right-[12%] top-6 size-80 rounded-full bg-primary/[0.13] blur-[90px]" />
          <motion.span animate={{ x: [0, -30, 20, 0], y: [0, -15, 25, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[14%] top-24 size-72 rounded-full bg-[#7cc4bb]/25 blur-[90px]" />
        </div>
        <div className="relative flex-1">
          {!started ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center pb-4 pt-2 text-center">
              <Orb size={60} />
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/70 px-3 py-1 text-xs font-extrabold text-primary backdrop-blur"><span className="size-1.5 animate-pulse rounded-full bg-primary" />دستیار هوشمند سرمایه‌گذاری</span>
              <h1 className="mx-auto mt-3 max-w-3xl text-[2.25rem] font-black leading-[1.45] text-ink text-balance">از سرمایه و هدفتان بگویید؛ پروژه مناسب را با هم پیدا می‌کنیم.</h1>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-8 text-muted-foreground">همان‌طور که با یک مشاور حرف می‌زنید بنویسید: چقدر سرمایه دارید، در کدام شهر و در چه کاری. شرایطتان را یک بار ذخیره کنید و دفعه بعد از همین‌جا ادامه دهید.</p>
              <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2">
                {abilities.map(({ icon: I, t }, i) => (
                  <motion.li key={t} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-center gap-2 text-[13px] font-bold text-ink/70">
                    <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary"><I size={15} variant="Bulk" /></span>{t}
                  </motion.li>
                ))}
              </ul>
              {mine.length > 0 && (
                <section className={cn("mt-8 w-full text-right", mine.length === 1 ? "max-w-md" : mine.length === 2 ? "max-w-2xl" : "max-w-4xl")}>
                  <div className="flex items-center justify-between px-1">
                    <p className="flex items-center gap-2 text-sm font-extrabold text-ink"><ArchiveTick size={18} variant="Bulk" className="text-primary" />خوش برگشتید؛ از جایی که بودید ادامه دهید</p>
                    <Link href="/saved" className="text-xs font-bold text-primary underline-offset-4 hover:underline">شرایط ذخیره‌شده من</Link>
                  </div>
                  <div className={cn("mt-3 grid gap-3", mine.length === 1 ? "grid-cols-1" : mine.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
                    {mine.map((p, i) => { const chips = describeCriteria(p.criteria); const fresh = stats[p.id]?.fresh ?? 0; return (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                        <Button variant="plain" size="auto" type="button" onClick={() => push({ q: `ادامه با «${p.name}»`, criteria: p.criteria })}
                          className="group flex h-full w-full flex-col items-stretch gap-0 whitespace-normal rounded-[1.5rem] border border-border bg-white/85 p-4 text-right backdrop-blur transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_22px_44px_-30px_rgb(8_59_55/0.45)]">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-[15px] font-extrabold text-ink">{p.name}</span>
                            {fresh > 0 && <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-extrabold text-white">{faNumber(fresh)} تازه</span>}
                          </span>
                          <span className="mt-0.5 block text-xs font-semibold text-muted-foreground">{routes.find((r) => r.id === p.criteria.route)?.name}</span>
                          {chips.length > 0 && <span className="mt-3 flex flex-wrap gap-1.5">{chips.slice(0, 3).map((c) => <span key={c.key} className="rounded-lg bg-muted px-2 py-0.5 text-[11px] font-bold text-ink/75">{c.label}</span>)}{chips.length > 3 && <span className="rounded-lg px-1 py-0.5 text-[11px] font-bold text-muted-foreground">+{faNumber(chips.length - 3)}</span>}</span>}
                          <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-extrabold text-primary">ادامه گفت‌وگو<ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /></span>
                        </Button>
                      </motion.div>); })}
                  </div>
                </section>
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

        {/* جای نوشتن: همیشه پایین صفحه؛ نمونه‌ها درست بالای آن و پس از استفاده حذف می‌شوند */}
        <div className="sticky bottom-0 z-30 -mx-6 bg-gradient-to-t from-background via-background via-75% to-transparent px-6 pb-6 pt-10">
          <div className="mx-auto max-w-3xl">
            {left.length > 0 && (
              <div className="mb-3 flex flex-wrap justify-center gap-2 p-1">
                {left.map((p) => { const I = promptIcons[samplePrompts.indexOf(p) % promptIcons.length];
                  return (
                    <Button variant="plain" size="auto" key={p} type="button" onClick={() => ask(p)}
                      className={cn("group gap-2 border border-border bg-white/90 text-[13px] font-bold text-ink/75 backdrop-blur transition-[color,border-color,box-shadow] hover:border-primary/40 hover:text-primary",
                        "rounded-full py-2 pl-4 pr-2.5 hover:shadow-[0_14px_28px_-24px_rgb(8_59_55/0.5)]")}>
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><I size={14} variant="Bold" /></span>{p}
                    </Button>); })}
              </div>
            )}
            {/* قاب نوشتن با حاشیه رنگی متحرک هنگام تمرکز */}
            <div className="group/composer rounded-[1.85rem] bg-border p-px transition-colors focus-within:bg-[linear-gradient(90deg,var(--primary),#7cc4bb,var(--pine-soft),#7cc4bb,var(--primary))] focus-within:bg-[length:200%_100%] focus-within:animate-[sheen_3s_linear_infinite] focus-within:shadow-[0_24px_50px_-30px_rgb(8_59_55/0.35)]">
              <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className="flex items-end gap-2 rounded-[1.8rem] bg-white p-2 pr-3">
                <span className="mb-2.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><MagicStar size={16} variant="Bulk" /></span>
                <Textarea ref={box} value={text} onChange={(e) => setText(e.target.value)} rows={1} aria-label="شرایط شما"
                  placeholder={started ? "شرط تازه‌ای دارید؟ بنویسید…" : "مثلاً: ۳۰ میلیارد دارم و دنبال پروژه مسکونی در تهران هستم"}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(text); } }}
                  className="field-sizing-content max-h-40 min-h-12 flex-1 resize-none border-0 bg-transparent px-0 py-3 text-base font-semibold leading-7 text-ink shadow-none focus-visible:ring-0 placeholder:font-normal md:text-base" />
                <Button variant="plain" size="auto" type="submit" disabled={!text.trim()} aria-label="بفرست"
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-white shadow-[0_14px_30px_-12px_var(--primary)] transition-[background-color,transform] hover:bg-deep active:scale-95 disabled:bg-pine/15 disabled:shadow-none"><Send2 size={20} variant="Bold" className="-scale-x-100" /></Button>
              </form>
            </div>
            <p className="mt-2 text-center text-[11px] font-semibold text-muted-foreground">برای فرستادن <kbd className="font-sans font-extrabold">Enter</kbd> و برای خط تازه <kbd className="font-sans font-extrabold">Shift+Enter</kbd></p>
          </div>
        </div>
      </main>
      <SaveCriteriaDialog open={saveOpen} onOpenChange={setSaveOpen} />
    </>
  );
}
