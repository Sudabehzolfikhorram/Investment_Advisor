"use client";
import { Button } from "@/components/ui/button";
// دستیار نمایشی: متن کاربر را می‌خواند، برداشتش را نشان می‌دهد و حداکثر ۱۰ پروژه با درصد تطابق پیشنهاد می‌کند.
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Location, MagicStar, Setting4, TickCircle } from "@/components/iconsax";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Header, Footer } from "@/components/site/header";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { MatchRing } from "@/components/brand/reveal";
import { Reasons, SaveButton } from "@/components/listing/listing-card";
import { samplePrompts, suggest } from "@/lib/assistant";
import { ASSISTANT_MAX_RESULTS } from "@/lib/match";
import { useStore } from "@/lib/store";
import { cn, faNumber } from "@/lib/utils";

const phases = ["خواندن شرایط شما", "تطبیق با پروژه‌ها", "مرتب‌سازی بر اساس درصد تطابق"];

export function Assistant() {
  const router = useRouter();
  const initial = useSearchParams().get("q") ?? "";
  const setCriteria = useStore((s) => s.setCriteria);
  const [text, setText] = useState(initial);
  const [asked, setAsked] = useState(initial);
  const [phase, setPhase] = useState(initial ? 0 : -1);
  const out = useMemo(() => (asked ? suggest(asked) : null), [asked]);
  const done = phase >= phases.length;

  useEffect(() => {
    if (phase < 0 || done) return;
    const t = setTimeout(() => setPhase((p) => p + 1), 750);
    return () => clearTimeout(t);
  }, [phase, done]);

  const ask = (q: string) => { if (!q.trim()) return; setText(q); setAsked(q); setPhase(0); };

  return (
    <>
      <Header />
      <main className="relative mx-auto min-h-[75dvh] max-w-4xl px-4 pt-10 sm:px-6">
        <AlgoPattern className="-top-24 left-1/2 h-96 w-[44rem] -translate-x-1/2 text-primary/[0.08]" fade="radial" scale={0.8} />
        <div className="relative text-center">
          <Badge variant="secondary" className="gap-2 bg-primary/10 px-4 py-1.5 text-[13px] font-extrabold text-primary"><MagicStar size={16} variant="Bold" />دستیار · نسخه نمایشی</Badge>
          <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-black leading-[1.4] text-ink text-balance sm:text-[2.6rem]">شرایطتان را بنویسید؛ تا {faNumber(ASSISTANT_MAX_RESULTS)} پروژه با درصد تطابق می‌گیرید.</h1>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className="glass relative mt-8 rounded-[2rem] p-3">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="مثلاً: ۳۰ میلیارد دارم، پروژه مسکونی در تهران، بازگشت تا ۸ سال…" aria-label="شرایط شما"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(text); } }}
            className="min-h-24 resize-none border-0 bg-transparent px-4 pt-3 text-base font-semibold leading-8 text-ink shadow-none focus-visible:ring-0 placeholder:font-normal md:text-base" />
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
              {samplePrompts.map((p, i) => <Button variant="plain" size="auto" key={p} type="button" onClick={() => ask(p)} className="shrink-0 rounded-full border border-border bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-ink/70 hover:border-primary/40 hover:text-primary">نمونه {faNumber(i + 1)}</Button>)}
            </div>
            <Button variant="plain" size="auto" type="submit" className="group flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-extrabold text-white shadow-[0_14px_30px_-12px_var(--primary)] hover:bg-deep">پیشنهاد بده<ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /></Button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {phase >= 0 && !done && (
            <motion.div key="thinking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-10 flex flex-col items-center gap-6">
              <svg viewBox="0 0 120 40" className="h-12 w-36 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5">
                <motion.path d="M10 20H40A10 10 0 0 0 50 10V10M50 30A10 10 0 0 1 60 20H110" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, repeat: Infinity, repeatType: "reverse" }} />
                {[10, 50, 110].map((x, i) => <motion.circle key={x} cx={x} cy="20" r="4" fill="currentColor" stroke="none" animate={{ scale: [1, 1.6, 1] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }} style={{ transformOrigin: `${x}px 20px` }} />)}
              </svg>
              <ul className="space-y-2">
                {phases.map((p, i) => <li key={p} className={cn("flex items-center gap-2 text-sm font-bold transition-colors", i < phase ? "text-primary" : i === phase ? "text-ink" : "text-muted-foreground/50")}><TickCircle size={17} variant={i < phase ? "Bold" : "Linear"} />{p}</li>)}
              </ul>
            </motion.div>
          )}

          {done && out && (
            <motion.div key={asked} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-primary"><NodeMark />برداشت دستیار</span>
                {out.understood.map((u, i) => <motion.span key={u.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink ring-1 ring-black/[0.06]"><span className="text-muted-foreground">{u.label}: </span>{u.value}</motion.span>)}
                <Button variant="plain" size="auto" type="button" onClick={() => { setCriteria(out.criteria); router.push("/opportunities"); }} className="mr-auto inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-1.5 text-xs font-extrabold text-ink hover:border-primary hover:text-primary"><Setting4 size={15} />دقیق‌تر کردن در فیلتر پیشرفته</Button>
              </div>
              <h2 className="mt-6 text-xl font-black text-ink">{out.results.length ? `${faNumber(out.results.length)} پیشنهاد برای شما` : "پروژه‌ای با این شرایط پیدا نشد."}</h2>
              <ol className="mt-4 space-y-3">
                {out.results.map((r, i) => (
                  <motion.li key={r.listing.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07, duration: 0.5 }}
                    className="group relative flex items-center gap-4 rounded-[1.75rem] bg-white p-2.5 pl-5 ring-1 ring-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgb(8_63_59/0.5)]">
                    <Link href={`/opportunities/${r.listing.id}`} className="absolute inset-0 z-10 rounded-[1.75rem]" aria-label={r.listing.title} />
                    <span className="relative size-20 shrink-0 overflow-hidden rounded-[1.25rem] sm:h-24 sm:w-32"><Image src={r.listing.image} alt="" fill sizes="128px" className="object-cover saturate-[0.8]" /><span className="absolute inset-0 bg-primary mix-blend-soft-light opacity-70" />
                      <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-white text-[11px] font-black text-ink">{faNumber(i + 1)}</span></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-extrabold text-ink">{r.listing.title}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs font-semibold text-muted-foreground">{r.listing.city && <span className="flex items-center gap-1"><Location size={13} variant="Bold" />{r.listing.province}</span>}<span>{r.listing.stats[0].label}: {r.listing.stats[0].value}</span><span>{r.listing.stats[1].label}: {r.listing.stats[1].value}</span></span>
                      <Reasons reasons={r.reasons} className="mt-2 hidden sm:flex" />
                    </span>
                    <span className="relative z-20 hidden sm:block"><SaveButton id={r.listing.id} className="!bg-none !bg-muted !text-ink aria-pressed:!bg-sand" /></span>
                    <MatchRing score={r.score} size={58} />
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
