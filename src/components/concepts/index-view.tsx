"use client";
// صفحه مقایسه سه کانسپت: مطالعه رنگ (سبز اصلی + آبی کبالت)، جدول مقایسه و پیوند به لندینگ‌ها و نمونه جزئیات.
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AlgoPattern, Logo } from "@/components/brand/algo-pattern";
import { ArrowLeft } from "@/components/iconsax";
import { MarkTitle, concepts, projectHref, type ConceptId } from "@/components/concepts/shared";
import { cn, faNumber } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;
const teal = [["50", "#e9f8f5"], ["100", "#d0f1ec"], ["200", "#a7e0d8"], ["300", "#5cc4b8"], ["400", "#2a9f95"], ["500", "#158a80"], ["600", "#0f766e"], ["700", "#0d5f59"], ["800", "#0a4a45"], ["900", "#063632"], ["950", "#03211e"]];
const cobalt = [["50", "#f1f5fd"], ["100", "#e6eefc"], ["200", "#c9dcfb"], ["300", "#9dbff9"], ["400", "#669af5"], ["500", "#2871f2"], ["600", "#0e53c8"], ["700", "#0d429f"], ["800", "#08337d"], ["900", "#042560"], ["950", "#021844"]];

const samples = [
  { id: "DEMO-02", label: "پروژه" },
  { id: "FUND-01", label: "صندوق" },
  { id: "SALE-L01", label: "آگهی فروش" },
];

/** تصویرک هر کانسپت با همان زبان بصری خودش */
function Thumb({ id }: { id: ConceptId }) {
  const reduce = useReducedMotion();
  if (id === "girih") {
    const pts = Array.from({ length: 16 }, (_, k) => { const a = ((-90 + k * 22.5) * Math.PI) / 180, r = k % 2 ? 46 : 80; return `${100 + r * Math.cos(a)},${80 + r * Math.sin(a)}`; }).join(" ");
    return (
      <svg viewBox="0 0 200 160" className="size-full bg-[#08337d]" aria-hidden>
        <motion.polygon points={pts} fill="none" stroke="#9dbff9" strokeWidth="2" initial={reduce ? false : { rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 1.4, ease }} style={{ transformOrigin: "100px 80px" }} />
        {Array.from({ length: 8 }, (_, k) => { const a = ((-90 + k * 45) * Math.PI) / 180; return <line key={k} x1={100} y1={80} x2={100 + 80 * Math.cos(a)} y2={80 + 80 * Math.sin(a)} stroke={k === 1 ? "#5cc4b8" : "#2871f2"} strokeWidth={k === 1 ? 3 : 1.5} />; })}
        <circle cx="100" cy="80" r="18" fill="#08337d" stroke="white" strokeWidth="2" />
      </svg>
    );
  }
  if (id === "metro") {
    return (
      <svg viewBox="0 0 200 160" className="size-full bg-[#f6f8fb]" aria-hidden>
        {[30, 58, 86, 114, 140].map((y, i) => (
          <motion.path key={y} d={`M180,85 H168 L${168 - Math.abs(y - 85)},${y} H20`} fill="none" stroke={i === 1 || i === 3 ? "#0e53c8" : "#c5cfdc"} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: i * 0.1, ease }} />
        ))}
        <circle cx="180" cy="85" r="8" fill="white" stroke="#0f766e" strokeWidth="4" />
      </svg>
    );
  }
  return (
    <div className="relative size-full overflow-hidden bg-[#f5f7fb] p-5">
      <div className="h-full rounded-md bg-white p-3 ring-1 ring-[#d7dee9]">
        <div className="h-3 rounded-sm bg-[#e6eefc]" />
        {[0, 1, 2].map((k) => <div key={k} className="mt-3 flex items-center gap-2"><span className="size-3 rounded-sm bg-[#e6eefc]" /><span className="h-1.5 flex-1 rounded bg-[#2f3533]/15" /></div>)}
        <span className="mt-3 block h-4 w-14 rounded bg-[#0f766e]" />
      </div>
      <motion.div initial={reduce ? false : { scale: 1.8, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: -12, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.4 }}
        className="absolute bottom-5 left-5 grid size-14 place-items-center rounded-full border-[2.5px] border-[#0e53c8] text-[11px] font-black text-[#0e53c8]">۲۴۸</motion.div>
    </div>
  );
}

const table: { k: string; v: Record<ConceptId, string> }[] = [
  { k: "ایده", v: { girih: "آورده شما تکه‌ای از ستاره هشت‌پر است و هر پره یک مسیر همکاری؛ با انتخاب آورده، پره‌های جور روشن می‌شوند.", metro: "نقشه خطوط شهری: یک ایستگاه «شما اینجا هستید» و هشت خط تا هشت مسیر؛ ایستگاه‌های هر خط همان گام‌های ورود است.", dossier: "شناسنامه رسمی که با پاسخ‌های شما پر می‌شود؛ هر بخش یک پیوست پرونده و مهر کبالت شمار فرصت‌های جور را نشان می‌دهد." } },
  { k: "اولین تعامل", v: { girih: "انتخاب آورده و روشن شدن پره‌ها", metro: "انتخاب آورده و حرکت قطار روی خط‌های جور", dossier: "پر کردن مسیر، استان، مبلغ و گروه در خود سند" } },
  { k: "قوت", v: { girih: "متمایزترین و ایرانی‌ترین؛ هیروی تیره و پرانرژی", metro: "خواناترین؛ گام‌های هر مسیر بدون کلیک دیده می‌شود", dossier: "سریع‌ترین راه تا نتیجه؛ حس اعتماد و رسمیت" } },
  { k: "ریسک", v: { girih: "هیروی تیره با قاعده «حالت روشن» فاصله دارد؛ ستاره برای بعضی تزئینی به نظر برسد", metro: "استعاره مترو برای سرمایه‌گذار جدی کمی بازیگوش است", dossier: "اگر کم‌جان اجرا شود به فرم اداری خشک نزدیک می‌شود" } },
  { k: "آزمون پیشنهادی", v: { girih: "پنج ثانیه: کاربر بگوید چند مسیر وجود دارد و کدام برای اوست", metro: "کاربر بدون کلیک گام سوم مسیر اجاره را پیدا کند", dossier: "زمان رسیدن به فهرست فرصت‌ها از ورود به صفحه" } },
];

export function ConceptsIndex() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] pb-24 text-[#2f3533]">
      <header className="relative isolate overflow-hidden border-b border-[#d7dee9] bg-white">
        <AlgoPattern className="inset-0 -z-10 size-full text-[#0e53c8]/[0.07]" fade="left" />
        <div className="mx-auto max-w-[78rem] px-8 pb-12 pt-10">
          <Logo />
          <MarkTitle as="h1" className="mt-10 text-[2.8rem] font-black leading-[1.35]" markClass="text-[#0f766e]">سه لندینگ برای سرمایه‌نما</MarkTitle>
          <p className="mt-3 max-w-[48rem] text-[16px] leading-8 text-[#2f3533]/70">هر سه همه مسیرها، گروه‌ها، پرسش‌ها، خدمات و متن‌های نسخه مرجع را دارند و به همان صفحه‌های سایت می‌رسند. تفاوتشان در زبان بصری و شیوه اولین تعامل است. صفحه جزئیات هر کانسپت هم با نمودار ساخته شده است.</p>
        </div>
      </header>

      <section className="mx-auto mt-12 grid max-w-[78rem] grid-cols-3 gap-6 px-8">
        {concepts.map((c, i) => (
          <motion.article key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: i * 0.1, ease }} className="overflow-hidden rounded-[1.4rem] bg-white ring-1 ring-[#d7dee9]">
            <Link href={`/concepts/${c.id}`} className="block aspect-[5/4] overflow-hidden"><Thumb id={c.id} /></Link>
            <div className="p-6">
              <p className="text-[1.35rem] font-black">{faNumber(c.n)}. {c.name}</p>
              <p className="mt-1 text-[14px] leading-7 text-[#2f3533]/70">{c.line}</p>
              <Link href={`/concepts/${c.id}`} className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#0f766e] px-5 text-[14px] font-extrabold text-white">دیدن لندینگ<ArrowLeft size={17} /></Link>
              <p className="mt-5 text-[12.5px] font-bold text-[#2f3533]/55">نمونه صفحه جزئیات</p>
              <div className="mt-2 flex flex-wrap gap-1.5">{samples.map((s) => <Link key={s.id} href={projectHref(c.id, s.id)} className="rounded-full bg-[#f5f7fb] px-3 py-1.5 text-[12.5px] font-bold text-[#0e53c8] ring-1 ring-[#d7dee9] hover:ring-[#0e53c8]/40">{s.label}</Link>)}</div>
            </div>
          </motion.article>
        ))}
      </section>
      <p className="mx-auto mt-4 max-w-[78rem] px-8 text-[13px] font-semibold text-[#2f3533]/60">چهارمی، سایت فعلی است که همین نمودارها به صفحه جزئیاتش اضافه شد: <Link href="/opportunities/DEMO-02" className="font-extrabold text-[#0e53c8] underline underline-offset-4">نمونه جزئیات سایت فعلی</Link></p>

      <section className="mx-auto mt-16 max-w-[78rem] px-8">
        <MarkTitle className="text-[1.9rem] font-black" markClass="text-[#0e53c8]">مقایسه سه کانسپت</MarkTitle>
        <div className="mt-6 overflow-hidden rounded-[1.2rem] bg-white ring-1 ring-[#d7dee9]">
          <div className="grid grid-cols-[9rem_repeat(3,minmax(0,1fr))] border-b border-[#d7dee9] bg-[#f0f4fb] text-[13.5px] font-black"><span className="p-4" />{concepts.map((c) => <span key={c.id} className="p-4">{faNumber(c.n)}. {c.name}</span>)}</div>
          {table.map((r) => (
            <div key={r.k} className="grid grid-cols-[9rem_repeat(3,minmax(0,1fr))] border-b border-[#d7dee9] text-[13.5px] leading-7 last:border-0">
              <span className="p-4 font-extrabold text-[#2f3533]/70">{r.k}</span>{concepts.map((c) => <span key={c.id} className="border-r border-[#d7dee9] p-4">{r.v[c.id]}</span>)}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-[78rem] px-8">
        <MarkTitle className="text-[1.9rem] font-black" markClass="text-[#0e53c8]">آبی کبالت کنار سبز اصلی</MarkTitle>
        <p className="mt-2 max-w-[52rem] text-[15px] leading-8 text-[#2f3533]/70">سبز <span dir="ltr" className="font-mono text-[0.9em]">#0F766E</span> ثابت ماند. آبی کبالت <span dir="ltr" className="font-mono text-[0.9em]">#0E53C8</span> پیشنهاد شد چون روشنایی‌اش تقریباً هم‌وزن سبز است (در فضای رنگ OKLCH، روشنایی ۰٫۴۸ در برابر ۰٫۵۱)، پس هیچ‌کدام دیگری را نمی‌پوشاند. فاصله رنگ‌مایه‌شان حدود ۷۵ درجه است و هر دو در خانواده رنگ‌های سرد می‌مانند. کبالت اشباع بیشتری دارد (۰٫۱۹ در برابر ۰٫۰۹)، برای همین نقش «داده و انتخاب» را می‌گیرد و سبز آرام برای اقدام می‌ماند. نسبت به آبی قبلی <span dir="ltr" className="font-mono text-[0.9em]">#2152E0</span> کمی تیره‌تر و کمتر بنفش است.</p>
        <div className="mt-8 grid grid-cols-2 gap-6">
          {[["سبز اصلی، فقط دکمه‌های اقدام", teal, "#0f766e", "۵٫۴۷"], ["آبی کبالت، داده، انتخاب و فوکوس", cobalt, "#0e53c8", "۶٫۸۰"]].map(([title, ramp, base, ratio]) => (
            <div key={title as string} className="rounded-[1.2rem] bg-white p-6 ring-1 ring-[#d7dee9]">
              <div className="flex items-baseline justify-between"><p className="text-[15px] font-black">{title as string}</p><p className="text-[12.5px] font-bold text-[#2f3533]/60">متن سفید روی <span dir="ltr" className="font-mono text-[0.95em]">{(base as string).toUpperCase()}</span>: {ratio as string} به ۱</p></div>
              <div className="mt-4 grid grid-cols-11 overflow-hidden rounded-lg" dir="ltr">{(ramp as string[][]).map(([k, h]) => <div key={k} className={cn("h-16", h === base && "ring-2 ring-inset ring-white")} style={{ background: h }} title={h} />)}</div>
              <div className="mt-1.5 grid grid-cols-11 text-center text-[10.5px] font-bold tabular-nums text-[#2f3533]/50" dir="ltr">{(ramp as string[][]).map(([k]) => <span key={k}>{k}</span>)}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6">
          <div className="rounded-[1.2rem] bg-white p-6 ring-1 ring-[#d7dee9]">
            <p className="text-[15px] font-black">نقش‌ها در یک کارت نمونه</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex h-11 items-center rounded-full bg-[#0f766e] px-5 text-[14px] font-extrabold text-white">نمایش فرصت‌ها</span>
              <span className="inline-flex h-11 items-center rounded-full bg-[#0e53c8] px-4 text-[13.5px] font-bold text-white">سرمایه نقدی دارم</span>
              <span className="inline-flex h-11 items-center rounded-full px-4 text-[13.5px] font-bold ring-1 ring-[#d7dee9]">تخصص دارم</span>
              <span className="rounded-full bg-[#fcebe5] px-3 py-1.5 text-[12.5px] font-bold text-[#b8461f]">هشدار</span>
            </div>
            <div className="mt-5 flex items-end gap-1.5">{[38, 52, 30, 64, 46, 72, 58].map((v, i) => <span key={i} className="w-6 rounded-t-[4px]" style={{ height: v, background: i === 5 ? "#0e53c8" : "#c9dcfb" }} />)}<span className="mr-3 text-[12.5px] font-bold text-[#2f3533]/60">نمودارها با کبالت؛ متن هرگز به رنگ داده نیست</span></div>
          </div>
          <div className="rounded-[1.2rem] bg-white p-6 ring-1 ring-[#d7dee9]">
            <p className="text-[15px] font-black">ترکیب دو رنگ</p>
            <div className="mt-4 h-16 rounded-lg bg-[linear-gradient(90deg,#0e53c8,#0f766e)]" />
            <p className="mt-3 text-[13px] leading-7 text-[#2f3533]/65">گذار مستقیم دو رنگ کدر نمی‌شود چون روشنایی هر دو نزدیک است. با این حال در کانسپت‌ها گرادیان روی متن یا دکمه استفاده نشده و نقش‌ها جدا مانده‌اند. نارنجی فقط برای هشدار است.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
