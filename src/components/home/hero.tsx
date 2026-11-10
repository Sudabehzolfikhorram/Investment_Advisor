"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, MagicStar, Setting4 } from "@/components/iconsax";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/site/header";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { IranMap } from "@/components/brand/iran-map";
import { MatchRing } from "@/components/brand/reveal";
import { SearchBar } from "@/components/search/search-bar";
import { listings } from "@/lib/listings";
import { samplePrompts } from "@/lib/assistant";

export function cityPoints() {
  const m = new Map<string, { city: string; province: string; count: number }>();
  for (const l of listings) if (l.city && l.province) { const k = l.city; m.set(k, { city: k, province: l.province, count: (m.get(k)?.count ?? 0) + 1 }); }
  return [...m.values()];
}

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const router = useRouter();
  const [mode, setMode] = useState<"form" | "assistant">("form");
  const [prompt, setPrompt] = useState("");
  const points = useMemo(cityPoints, []);
  const sample = listings[0];
  const go = (q: string) => router.push(`/assistant?q=${encodeURIComponent(q)}`);

  return (
    <section className="relative px-2 pt-2 sm:px-3 sm:pt-3">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-deep sm:rounded-[2.75rem]">
        <Image src="/images/hero/tehran.webp" alt="" fill priority sizes="100vw" className="object-cover object-[center_70%] opacity-70 saturate-[0.7]" />
        <div className="absolute inset-0 bg-primary mix-blend-soft-light opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-l from-deep/95 via-deep/70 to-deep/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-deep/40" />
        <AlgoPattern className="-top-10 left-0 h-[70%] w-[55%] text-white/[0.16]" fade="radial" />
        <Header overlay />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-40 pt-32 sm:px-8 md:pb-44 md:pt-40 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <motion.span initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}
              className="glass-dark inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] font-bold text-white">
              <NodeMark className="text-sand" /> مشاور هوشمند فرصت‌های سرمایه‌گذاری
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease }}
              className="mt-6 text-[2.5rem] font-black leading-[1.25] tracking-tight text-white text-balance sm:text-6xl sm:leading-[1.3] lg:text-[4.25rem]">
              شرایطتان را بگویید؛ <span className="relative whitespace-nowrap text-sand">پروژه مناسب<svg aria-hidden viewBox="0 0 200 12" className="absolute -bottom-1 right-0 h-2.5 w-full" fill="none" stroke="currentColor" strokeWidth="2"><motion.path d="M2 8C50 2 150 2 198 8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.9 }} /></svg></span> را نشانتان می‌دهیم.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease }}
              className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
              مسیر همکاری و مبلغ سرمایه را انتخاب کنید. پروژه‌ها را با درصد تطابق می‌بینید و بقیه شرایط را کنار همان نتایج دقیق‌تر می‌کنید.
            </motion.p>
          </div>

          {/* نقشه نقطه‌ای ایران + کارت نمونه */}
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.3, ease }} className="relative hidden lg:block">
            <IranMap points={points} tone="dark" labels={false} className="mx-auto max-w-[520px]" />
            <Link href={`/opportunities/${sample.id}`} className="glass absolute -bottom-4 right-0 flex w-72 items-center gap-3 rounded-3xl p-2.5 pl-4 transition-transform hover:-translate-y-1" style={{ animation: "floaty 6s ease-in-out infinite" }}>
              <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl"><Image src={sample.image} alt="" fill sizes="64px" className="object-cover" /><span className="absolute inset-0 bg-primary/30 mix-blend-soft-light" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold text-primary">نمونه پیشنهاد</span>
                <span className="block truncate text-sm font-extrabold text-ink">{sample.title}</span>
                <span className="block text-xs text-muted-foreground">{sample.province}، {sample.city}</span>
              </span>
              <MatchRing score={92} size={46} />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* فرم پایه یا دستیار؛ روی لبه پایین هیرو می‌نشیند */}
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.45, ease }} className="relative z-10 mx-auto -mt-32 max-w-6xl px-3 sm:px-6 md:-mt-28">
        <Tabs dir="rtl" value={mode} onValueChange={(v) => setMode(v as "form" | "assistant")} className="mb-3 items-center md:items-start">
          <TabsList className="glass-dark h-auto rounded-full p-1 group-data-[orientation=horizontal]/tabs:h-auto">
            {([["form", "شرایط من", Setting4], ["assistant", "از دستیار بپرس", MagicStar]] as const).map(([k, label, I]) => (
              <TabsTrigger key={k} value={k} className="h-auto gap-1.5 rounded-full border-0 px-4 py-2 text-sm font-bold text-white/85 hover:text-white data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-none">
                <I size={17} variant="Bulk" />{label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <AnimatePresence mode="wait">
          {mode === "form" ? (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><SearchBar /></motion.div>
          ) : (
            <motion.form key="assistant" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} onSubmit={(e) => { e.preventDefault(); if (prompt.trim()) go(prompt); }} className="glass-strong rounded-[2rem] p-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <span className="hidden size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary md:grid"><MagicStar size={24} variant="Bulk" /></span>
                <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="شرایط خود را بنویسید؛ مثلاً: ۳۰ میلیارد دارم، پروژه مسکونی در تهران، بازگشت تا ۸ سال…" className="h-14 min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] font-semibold text-ink shadow-none focus-visible:ring-0 placeholder:font-normal md:text-[15px]" aria-label="توضیح شرایط برای دستیار" />
                <Button variant="plain" size="auto" type="submit" className="group flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 font-extrabold text-white shadow-[0_14px_30px_-12px_var(--primary)] transition-all hover:bg-deep">پیشنهاد بده <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" /></Button>
              </div>
              <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
                {samplePrompts.map((p) => <Button variant="plain" size="auto" key={p} type="button" onClick={() => go(p)} className="shrink-0 rounded-full border border-border bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-ink/70 hover:border-primary/40 hover:text-primary">{p.length > 58 ? p.slice(0, 58) + "…" : p}</Button>)}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
