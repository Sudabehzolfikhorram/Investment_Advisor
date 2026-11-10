"use client";
// صفحه راهنمای اقدام: پیش‌نمایش همان فایل HTML که دانلود می‌شود، با دکمه دانلود و چاپ.
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowRight, DocumentDownload, Printer } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Header, Footer } from "@/components/site/header";
import { NodeMark } from "@/components/brand/algo-pattern";
import { guideHtml } from "@/lib/guide";
import { listingById } from "@/lib/listings";

export function downloadGuide(id: string) {
  const l = listingById(id)!;
  const url = URL.createObjectURL(new Blob([guideHtml(l)], { type: "text/html;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = `guide-${l.id}.html`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function GuideView({ id }: { id: string }) {
  const l = listingById(id)!;
  const html = useMemo(() => guideHtml(l), [l]);
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(1400);
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-6">
        <Link href={`/opportunities/${l.id}`} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-primary"><ArrowRight size={18} />بازگشت به پروژه</Link>
        <div className="surface sticky top-24 z-20 flex items-center justify-between gap-4 rounded-full p-2 pr-6">
          <p className="flex min-w-0 items-center gap-3 text-sm font-extrabold text-ink"><NodeMark className="text-primary" /><span className="truncate">راهنمای اقدام · {l.title}</span></p>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={() => frame.current?.contentWindow?.print()} className="h-11 gap-2 rounded-full bg-white px-5 font-bold shadow-none"><Printer size={18} />چاپ یا PDF</Button>
            <Button onClick={() => downloadGuide(l.id)} className="h-11 gap-2 rounded-full px-5 font-extrabold"><DocumentDownload size={18} variant="Bold" />دانلود فایل راهنما</Button>
          </div>
        </div>
        <iframe ref={frame} title="راهنمای اقدام" srcDoc={html} onLoad={() => { const d = frame.current?.contentDocument; if (d) setHeight(d.documentElement.scrollHeight + 8); }}
          className="mt-4 w-full rounded-[2rem] border border-border bg-muted" style={{ height }} />
      </main>
      <Footer />
    </>
  );
}
