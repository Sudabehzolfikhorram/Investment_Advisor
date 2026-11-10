"use client";
// صفحه راهنمای اقدام: پیش‌نمایش همان فایل HTML که دانلود می‌شود.
// مطابق نسخه مرجع، فایل با اطلاعات خود کاربر پر می‌شود: شرایط جست‌وجو، پاسخ پرسش‌های تخصصی، نوع پیگیری و تیک گام‌ها.
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowRight, DocumentDownload, Edit2, Printer, TickCircle } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Header, Footer } from "@/components/site/header";
import { NodeMark } from "@/components/brand/algo-pattern";
import { Dropdown } from "@/components/search/controls";
import { routes } from "@/data/routes";
import { describeCriteria } from "@/lib/criteria";
import { followUpKinds, guideHtml, type GuideContext } from "@/lib/guide";
import { listingById } from "@/lib/listings";
import { useHydrated, useStore } from "@/lib/store";
import type { Opportunity } from "@/types";
import { faNumber } from "@/lib/utils";

export function GuideView({ id }: { id: string }) {
  const l = listingById(id)!;
  const o = l.kind === "project" ? (l.raw as Opportunity) : null;
  const hydrated = useHydrated();
  const criteria = useStore((s) => s.criteria);
  const [kind, setKind] = useState<string | undefined>();
  const [checked, setChecked] = useState<string[]>([]);
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(1400);

  const ctx = useMemo<GuideContext>(() => {
    if (!hydrated) return {};
    const mine: [string, string][] = [];
    const answers: Record<string, string> = {};
    const mineOk = l.routes.includes(criteria.route);
    if (mineOk) {
      const chips = describeCriteria(criteria).filter((c) => !c.key.startsWith("adv:"));
      if (chips.length) mine.push(["مسیر ورود", routes.find((r) => r.id === criteria.route)!.name]);
      const provs = chips.filter((c) => c.kind === "province").map((c) => c.label), groups = chips.filter((c) => c.kind === "group").map((c) => c.label);
      if (provs.length) mine.push(["محدوده", provs.join("، ")]);
      if (groups.length) mine.push(["حوزه", groups.join("، ")]);
      for (const c of chips) {
        if (c.kind === "amount") mine.push(["بودجه", c.label]);
        if (c.kind === "filter") { const i = c.label.indexOf(": "); mine.push(i > 0 ? [c.label.slice(0, i), c.label.slice(i + 2)] : [c.label, "بله"]); }
      }
    }
    if (o) for (const [k, v] of Object.entries(criteria.filters)) { const [a, st, qid] = k.split(":"); if (a === "adv" && st === o.subtype) answers[qid] = String(v); }
    return { mine, answers, kind, checked };
  }, [hydrated, criteria, kind, checked, l, o]);

  const html = useMemo(() => guideHtml(l, ctx), [l, ctx]);
  // تیک‌ها داخل خود سند زده می‌شوند؛ پیش از هر بازسازی یا دانلود از سند خوانده می‌شوند تا از بین نروند
  const ticks = () => Array.from(frame.current?.contentDocument?.querySelectorAll<HTMLInputElement>("input[data-k]:checked") ?? []).map((i) => i.dataset.k!);
  const changeKind = (v: string | undefined) => { setChecked(ticks()); setKind(v); };
  const download = () => {
    const url = URL.createObjectURL(new Blob([guideHtml(l, { ...ctx, checked: ticks() })], { type: "text/html;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `guide-${l.id}.html`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const filled = (ctx.mine?.length ?? 0) + Object.keys(ctx.answers ?? {}).length;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-6">
        <Link href={`/opportunities/${l.id}`} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-primary"><ArrowRight size={18} />بازگشت به پروژه</Link>
        <div className="grid grid-cols-[minmax(0,1fr)_21rem] items-start gap-5">
          <iframe ref={frame} title="راهنمای اقدام" srcDoc={html} onLoad={() => { const d = frame.current?.contentDocument; if (d) setHeight(d.documentElement.scrollHeight + 8); }}
            className="w-full rounded-[2rem] border border-border bg-muted" style={{ height }} />

          <aside className="sticky top-24 space-y-4">
            <div className="surface rounded-[1.75rem] p-5">
              <p className="flex items-center gap-2 text-[13px] font-extrabold text-primary"><NodeMark />راهنمای اقدام</p>
              <h1 className="mt-2 text-lg font-black leading-8 text-ink">{l.title}</h1>
              <div className="mt-4 space-y-2">
                <Button onClick={download} className="h-12 w-full gap-2 rounded-full font-extrabold"><DocumentDownload size={18} variant="Bold" />دانلود فایل راهنما</Button>
                <Button variant="outline" onClick={() => frame.current?.contentWindow?.print()} className="h-11 w-full gap-2 rounded-full bg-white font-bold shadow-none"><Printer size={18} />چاپ یا PDF</Button>
              </div>
            </div>

            <div className="surface space-y-5 rounded-[1.75rem] p-5">
              <div>
                <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-ink"><Edit2 size={18} variant="Bulk" className="text-primary" />راهنما را با اطلاعات خودتان کامل کنید</h2>
                <p className="mt-1.5 text-xs leading-6 text-muted-foreground">هرچه این‌جا مشخص کنید همان لحظه در فایل می‌آید.</p>
              </div>
              <div>
                <p className="mb-2 text-[13px] font-bold text-ink/80">نوع پیگیری</p>
                <Dropdown options={followUpKinds} value={kind} onChange={changeKind} />
              </div>
              <p className="flex items-start gap-2 rounded-2xl bg-primary/[0.07] p-3.5 text-xs font-semibold leading-6 text-ink/80"><TickCircle size={17} variant="Bold" className="mt-0.5 shrink-0 text-primary" />موارد «پیش از اقدام» و «گام‌های اقدام» را در خود راهنما تیک بزنید؛ تیک‌ها در فایل دانلودی و چاپ می‌مانند.</p>
              <div className="rounded-2xl bg-muted p-3.5 text-xs font-semibold leading-6 text-ink/75">
                {filled > 0
                  ? <>{faNumber(filled)} مورد از شرایط و پاسخ‌های شما در بخش «شرایط شما» و پرسش‌ها آمده است.</>
                  : <>شرایط جست‌وجو و پاسخ پرسش‌های تخصصی شما، اگر در صفحه پروژه‌ها وارد کرده باشید، خودکار در فایل می‌آید.</>}
                <Link href="/opportunities" className="mt-1 block font-extrabold text-primary hover:underline">ویرایش شرایط در صفحه پروژه‌ها</Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
