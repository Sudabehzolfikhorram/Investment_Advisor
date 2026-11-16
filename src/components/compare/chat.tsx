"use client";
// گفت‌وگو با دستیار درباره پروژه‌های همین مقایسه. پاسخ‌ها از داده‌های همین پروژه‌ها ساخته می‌شوند (نمایشی)،
// به پروژه‌ای که به نفعش است اشاره می‌کنند و ردیف‌هایی از جدول را که پاسخ به آن‌ها تکیه دارد برجسته می‌کنند.
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Eye, Send2 } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Orb } from "@/components/assistant/assistant";
import { answer, starterQuestions, type Answer } from "@/lib/compare";
import type { Listing } from "@/types";
import { cn } from "@/lib/utils";
import { SeriesDot } from "./timeline";

interface Turn { id: number; q: string; a: Answer; set: string }

/** متن پاسخ کلمه‌به‌کلمه؛ پس از پایان، بقیه پاسخ (اشاره‌ها و پرسش‌های بعدی) نمایش داده می‌شود */
function Stream({ text, onDone }: { text: string; onDone: () => void }) {
  const reduce = useReducedMotion();
  const words = useMemo(() => text.split(" "), [text]);
  const [n, setN] = useState(reduce ? words.length : 0);
  const done = useRef(false);
  useEffect(() => {
    if (n >= words.length) { if (!done.current) { done.current = true; onDone(); } return; }
    const t = setTimeout(() => setN((x) => x + 1), 38);
    return () => clearTimeout(t);
  }, [n, words.length, onDone]);
  return <p className="text-[13.5px] font-semibold leading-7 text-ink">{words.slice(0, n).join(" ")}{n < words.length && <span aria-hidden className="ms-1 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse rounded-full bg-cobalt" />}</p>;
}

function Reply({ turn, items, stale, onAsk, onShowRows }: { turn: Turn; items: Listing[]; stale: boolean; onAsk: (q: string) => void; onShowRows: (rows: string[]) => void }) {
  const [phase, setPhase] = useState<"think" | "write" | "done">("think");
  useEffect(() => { const t = setTimeout(() => setPhase("write"), 650); return () => clearTimeout(t); }, []);
  const a = turn.a;
  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <p className="max-w-[88%] rounded-[1.3rem] rounded-tl-md bg-ink px-4 py-2 text-[13px] font-bold leading-6 text-white">{turn.q}</p>
      </motion.div>
      <div className="flex items-start gap-3">
        <Orb size={28} busy={phase !== "done"} />
        <div className="min-w-0 flex-1 pt-0.5">
          {stale && <p className="mb-1 text-[11.5px] font-bold text-muted-foreground">این پاسخ برای پروژه‌هایی بود که قبلاً انتخاب کرده بودید.</p>}
          {phase === "think" ? (
            <p className="text-[13.5px] font-bold text-muted-foreground"><span className="animate-pulse">در حال خواندن داده‌های پروژه‌ها…</span></p>
          ) : (
            <Stream text={a.text} onDone={() => setPhase("done")} />
          )}
          <AnimatePresence>
            {phase === "done" && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-3">
                {(a.cites.length > 0 || a.rows.length > 0) && !stale && (
                  <div className="flex flex-wrap items-center gap-2">
                    {a.cites.map((c) => items[c.i] && (
                      <span key={c.i} className="inline-flex items-center gap-1.5 rounded-full bg-cobalt-soft py-1 pl-3 pr-1 text-[12px] font-extrabold text-cobalt-deep"><SeriesDot i={c.i} small />{items[c.i].title}</span>
                    ))}
                    {a.rows.length > 0 && (
                      <Button type="button" variant="plain" size="auto" onClick={() => onShowRows(a.rows)} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-[12px] font-bold text-ink/75 hover:border-cobalt/40 hover:text-cobalt-deep">
                        <Eye size={15} />دیدن در جدول
                      </Button>
                    )}
                  </div>
                )}
                {a.choices && a.choices.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {a.choices.map((c) => (
                      <Button key={c} type="button" variant="plain" size="auto" onClick={() => onAsk(c)} className="h-9 rounded-full border border-cobalt/30 bg-white px-4 text-[13px] font-extrabold text-cobalt-deep hover:bg-cobalt hover:text-white">{c}</Button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function CompareChat({ items, onShowRows, className }: { items: Listing[]; onShowRows: (rows: string[]) => void; className?: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const set = items.map((l) => l.id).join(",");
  const log = useRef<HTMLDivElement>(null);
  const asked = new Set(turns.map((t) => t.q));
  const last = turns.at(-1);
  const ready = items.length >= 2;
  const suggestions = (last && last.set === set && last.a.next.length ? last.a.next : starterQuestions).filter((q) => !asked.has(q)).slice(0, 3);
  const ask = (q: string) => {
    const v = q.trim(); if (!v || !ready) return;
    setTurns((x) => [...x, { id: (x.at(-1)?.id ?? 0) + 1, q: v, a: answer(v, items), set }]);
    setText("");
  };
  useEffect(() => { const el = log.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }, [turns.length]);
  const howMany = items.length === 4 ? "چهار" : items.length === 3 ? "سه" : "دو";

  // ستون کناری صفحه مقایسه: هنگام پیمایش ثابت می‌ماند؛ گفت‌وگو وسط و نوشتن پایین
  return (
    <div className={cn("surface flex flex-col overflow-hidden rounded-[1.75rem]", className)}>
      <div className="border-b border-border px-5 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <Orb size={40} busy={false} />
          <div className="min-w-0">
            <h2 className="text-[1.05rem] font-black text-ink">دستیار مقایسه</h2>
            <p className="truncate text-[12px] font-semibold text-muted-foreground">{ready ? `درباره همین ${howMany} پروژه، با تکیه بر داده‌هایشان` : "با انتخاب دو پروژه فعال می‌شود"}</p>
          </div>
        </div>
        {items.length > 0 && (
          <ul className="mt-3.5 flex flex-wrap gap-1.5">
            {items.map((l, i) => <li key={l.id} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted py-1 pl-2.5 pr-1 text-[11.5px] font-bold text-ink/80"><SeriesDot i={i} small /><span className="max-w-[9.5rem] truncate">{l.title}</span></li>)}
          </ul>
        )}
      </div>

      <div ref={log} className="thin-scroll min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5" aria-live="polite">
        {!ready ? (
          <div className="flex h-full flex-col">
            <div className="rounded-2xl bg-[#f3f6fa] p-4 text-[13px] font-semibold leading-7 text-ink/75">
              {items.length === 1 ? "یک پروژه دیگر انتخاب کنید" : "دست‌کم دو پروژه انتخاب کنید"} تا بتوانم آن‌ها را با هم مقایسه کنم؛ مثلاً بگویم کدام زودتر سرمایه را برمی‌گرداند یا با بودجه شما جور است.
            </div>
            <p className="mb-2 mt-5 text-[11.5px] font-bold text-muted-foreground">بعد از انتخاب می‌توانید بپرسید:</p>
            <ul className="space-y-1.5">{starterQuestions.slice(0, 4).map((q) => <li key={q} className="rounded-xl border border-dashed border-border px-3.5 py-2.5 text-[12.5px] font-bold leading-6 text-ink/45">{q}</li>)}</ul>
          </div>
        ) : turns.length === 0 ? (
          <div className="space-y-2">
            <p className="mb-1 text-[11.5px] font-bold text-muted-foreground">یکی از این‌ها را بپرسید یا پایین بنویسید:</p>
            {starterQuestions.slice(0, 6).map((q) => (
              <Button key={q} type="button" variant="plain" size="auto" onClick={() => ask(q)}
                className="group h-auto w-full justify-between gap-3 whitespace-normal rounded-2xl border border-border bg-white px-4 py-3 text-right text-[13px] font-bold leading-6 text-ink/80 transition-[border-color,color,box-shadow] hover:border-cobalt/35 hover:text-ink hover:shadow-[0_14px_28px_-24px_var(--cobalt)]">
                {q}<ArrowLeft size={15} className="shrink-0 text-cobalt opacity-0 transition-[opacity,transform] group-hover:-translate-x-0.5 group-hover:opacity-100" />
              </Button>
            ))}
          </div>
        ) : (
          turns.map((t) => <Reply key={t.id} turn={t} items={items} stale={t.set !== set} onAsk={ask} onShowRows={onShowRows} />)
        )}
      </div>

      <div className="border-t border-border bg-[#f6f8fb] px-4 pb-3.5 pt-3">
        {ready && turns.length > 0 && suggestions.length > 0 && (
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {suggestions.map((q) => <Button key={q} type="button" variant="plain" size="auto" onClick={() => ask(q)} className="h-auto min-h-7 whitespace-normal rounded-full border border-border bg-white px-3 py-1 text-right text-[11.5px] font-bold leading-5 text-ink/75 hover:border-cobalt/35 hover:text-ink">{q}</Button>)}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className={cn("flex items-end gap-2 rounded-[1.4rem] border border-border bg-white p-1.5 pr-4 transition-[border-color,box-shadow] focus-within:border-cobalt/45 focus-within:shadow-[0_0_0_4px_rgb(30_58_138/0.1)]", !ready && "opacity-60")}>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} aria-label="پرسش شما درباره این پروژه‌ها" disabled={!ready}
            placeholder={ready ? "مثلاً: با ۲۰ میلیارد کدام را شروع کنم؟" : "اول دو پروژه انتخاب کنید"}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(text); } }}
            className="field-sizing-content max-h-28 min-h-10 flex-1 resize-none rounded-none border-0 !bg-transparent px-0 py-2 text-[13.5px] font-semibold leading-6 text-ink shadow-none focus-visible:ring-0 disabled:cursor-not-allowed placeholder:font-normal md:text-[13.5px]" />
          <Button type="submit" variant="plain" size="auto" disabled={!ready || !text.trim()} aria-label="بفرست"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-white transition-[background-color,transform] hover:bg-deep active:scale-95 disabled:bg-pine/15"><Send2 size={18} variant="Bold" className="-scale-x-100" /></Button>
        </form>
        <p className="mt-2 text-center text-[10.5px] font-semibold leading-5 text-muted-foreground">پاسخ‌ها از داده‌های همین پروژه‌هاست و توصیه قطعی نیست.</p>
      </div>
    </div>
  );
}
