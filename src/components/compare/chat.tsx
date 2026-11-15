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
  return <p className="text-[15px] font-semibold leading-8 text-ink">{words.slice(0, n).join(" ")}{n < words.length && <span aria-hidden className="ms-1 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse rounded-full bg-cobalt" />}</p>;
}

function Reply({ turn, items, stale, onAsk, onShowRows }: { turn: Turn; items: Listing[]; stale: boolean; onAsk: (q: string) => void; onShowRows: (rows: string[]) => void }) {
  const [phase, setPhase] = useState<"think" | "write" | "done">("think");
  useEffect(() => { const t = setTimeout(() => setPhase("write"), 650); return () => clearTimeout(t); }, []);
  const a = turn.a;
  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <p className="max-w-xl rounded-[1.4rem] rounded-tl-md bg-ink px-5 py-2.5 text-[14.5px] font-bold leading-7 text-white">{turn.q}</p>
      </motion.div>
      <div className="flex items-start gap-3">
        <Orb size={34} busy={phase !== "done"} />
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

export function CompareChat({ items, onShowRows }: { items: Listing[]; onShowRows: (rows: string[]) => void }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const set = items.map((l) => l.id).join(",");
  const log = useRef<HTMLDivElement>(null);
  const asked = new Set(turns.map((t) => t.q));
  const last = turns.at(-1);
  const suggestions = (last && last.set === set && last.a.next.length ? last.a.next : starterQuestions).filter((q) => !asked.has(q)).slice(0, 4);
  const ask = (q: string) => {
    const v = q.trim(); if (!v || items.length < 2) return;
    setTurns((x) => [...x, { id: (x.at(-1)?.id ?? 0) + 1, q: v, a: answer(v, items), set }]);
    setText("");
  };
  useEffect(() => { const el = log.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }, [turns.length]);

  return (
    <div className="surface overflow-hidden rounded-[2rem]">
      <div className="flex items-center justify-between gap-4 border-b border-border px-7 py-5">
        <div className="flex items-center gap-3.5">
          <Orb size={44} />
          <div>
            <h2 className="text-[1.25rem] font-black text-ink">از دستیار بپرسید</h2>
            <p className="text-[13px] font-semibold text-muted-foreground">فقط درباره همین {items.length === 4 ? "چهار" : items.length === 3 ? "سه" : "دو"} پروژه، با تکیه بر داده‌های اعلام‌شده‌شان</p>
          </div>
        </div>
        <ul className="flex flex-wrap justify-end gap-1.5">
          {items.map((l, i) => <li key={l.id} className="inline-flex max-w-[12rem] items-center gap-1.5 rounded-full bg-muted py-1 pl-3 pr-1 text-[12px] font-bold text-ink/80"><SeriesDot i={i} small /><span className="truncate">{l.title}</span></li>)}
        </ul>
      </div>

      <div ref={log} className="thin-scroll max-h-[34rem] min-h-[12rem] space-y-8 overflow-y-auto px-7 py-6" aria-live="polite">
        {turns.length === 0 ? (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {starterQuestions.slice(0, 6).map((q) => (
              <Button key={q} type="button" variant="plain" size="auto" onClick={() => ask(q)}
                className="group h-auto justify-between gap-3 whitespace-normal rounded-2xl border border-border bg-white px-4 py-3.5 text-right text-[14px] font-bold leading-6 text-ink/80 transition-[border-color,color,box-shadow] hover:border-cobalt/35 hover:text-ink hover:shadow-[0_14px_28px_-24px_var(--cobalt)]">
                {q}<ArrowLeft size={16} className="shrink-0 text-cobalt opacity-0 transition-[opacity,transform] group-hover:-translate-x-0.5 group-hover:opacity-100" />
              </Button>
            ))}
          </div>
        ) : (
          turns.map((t) => <Reply key={t.id} turn={t} items={items} stale={t.set !== set} onAsk={ask} onShowRows={onShowRows} />)
        )}
      </div>

      <div className="border-t border-border bg-[#f6f8fb] px-7 pb-5 pt-4">
        {turns.length > 0 && suggestions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((q) => <Button key={q} type="button" variant="plain" size="auto" onClick={() => ask(q)} className="h-8 rounded-full border border-border bg-white px-3.5 text-[12.5px] font-bold text-ink/75 hover:border-cobalt/35 hover:text-ink">{q}</Button>)}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className="flex items-end gap-2 rounded-[1.5rem] border border-border bg-white p-1.5 pr-5 transition-[border-color,box-shadow] focus-within:border-cobalt/45 focus-within:shadow-[0_0_0_4px_rgb(33_82_224/0.1)]">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} aria-label="پرسش شما درباره این پروژه‌ها"
            placeholder="مثلاً: با ۲۰ میلیارد کدام را می‌توانم شروع کنم؟"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(text); } }}
            className="field-sizing-content max-h-32 min-h-11 flex-1 resize-none rounded-none border-0 !bg-transparent px-0 py-2.5 text-[15px] font-semibold leading-7 text-ink shadow-none focus-visible:ring-0 placeholder:font-normal md:text-[15px]" />
          <Button type="submit" variant="plain" size="auto" disabled={!text.trim()} aria-label="بفرست"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-white transition-[background-color,transform] hover:bg-deep active:scale-95 disabled:bg-pine/15"><Send2 size={19} variant="Bold" className="-scale-x-100" /></Button>
        </form>
        <p className={cn("mt-2 text-center text-[11.5px] font-semibold text-muted-foreground")}>پاسخ‌ها از داده‌های همین پروژه‌ها ساخته می‌شوند و توصیه قطعی سرمایه‌گذاری نیستند. پیش از تصمیم با کارشناس هر پروژه صحبت کنید.</p>
      </div>
    </div>
  );
}
