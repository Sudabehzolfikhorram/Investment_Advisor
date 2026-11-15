"use client";
// قطعه‌های مشترک سه کانسپت: رفتن به نتایج، نشان پیش از تیتر، پیوند جزئیات، جابه‌جایی بین کانسپت‌ها، نقشه استان‌ها
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { NodeMark } from "@/components/brand/algo-pattern";
import { provincePaths } from "@/data/iran-map";
import { listingById } from "@/lib/listings";
import { useStore } from "@/lib/store";
import type { Listing, RouteId } from "@/types";
import { cn } from "@/lib/utils";

export type ConceptId = "girih" | "metro" | "dossier";
export const concepts: { id: ConceptId; n: number; name: string; line: string }[] = [
  { id: "girih", n: 1, name: "کاشی و گره", line: "آورده شما، تکه‌ای که در ستاره مسیرها جا می‌افتد" },
  { id: "metro", n: 2, name: "نقشه مسیر", line: "یک ایستگاه شروع، چند خط تا پروژه‌های متناسب" },
  { id: "dossier", n: 3, name: "شناسنامه", line: "پرونده‌ای که با پاسخ‌های شما نوشته می‌شود" },
];

export const projectHref = (c: ConceptId, id: string) => `/concepts/${c}/project?id=${encodeURIComponent(id)}`;

/** رفتن به نتایج با شرایط انتخاب‌شده (همان رفتار لندینگ فعلی) */
export function useGo() {
  const router = useRouter();
  const begin = useStore((s) => s.begin);
  return {
    route: (route: RouteId, extra: Record<string, unknown> = {}) => { begin({ route, ...extra }); router.push("/opportunities"); },
    group: (group: string, subtype?: string) => { begin({ route: "investor", groups: [group], filters: subtype ? { subtypes: [subtype] } : {} }); router.push("/opportunities"); },
    href: (h: string) => (h.startsWith("#") ? document.querySelector(h)?.scrollIntoView({ behavior: "smooth", block: "start" }) : router.push(h)),
  };
}

/** تیتر با نشان الگونت پیش از آن (درخواست صاحب پروژه: همان موج و A پیش از تیترها) */
export function MarkTitle({ children, as: Tag = "h2", className, markClass }: { children: ReactNode; as?: "h1" | "h2" | "h3"; className?: string; markClass?: string }) {
  return (
    <Tag className={cn("text-balance", className)}>
      <NodeMark className={cn("!ml-3 inline-block align-middle", markClass)} />
      {children}
    </Tag>
  );
}

/** جابه‌جایی سریع بین سه کانسپت برای مقایسه */
export function ConceptSwitch({ current, tone = "light" }: { current: ConceptId; tone?: "light" | "dark" }) {
  return (
    <nav aria-label="کانسپت‌ها" className={cn("fixed bottom-5 left-1/2 z-50 -translate-x-1/2 flex items-center gap-1 rounded-full p-1.5 text-[12.5px] font-bold shadow-[0_18px_40px_-18px_rgb(10_20_40/0.5)] backdrop-blur-md", tone === "dark" ? "bg-[#0b1530]/85 text-white" : "bg-white/90 text-[#2f3533] ring-1 ring-black/5")}>
      <Link href="/concepts" className="rounded-full px-3 py-1.5 opacity-70 hover:opacity-100">مقایسه</Link>
      {concepts.map((c) => (
        <Link key={c.id} href={`/concepts/${c.id}`} aria-current={c.id === current ? "page" : undefined}
          className={cn("rounded-full px-3 py-1.5 transition-colors", c.id === current ? "bg-[var(--cobalt)] text-white" : "hover:bg-black/5")}>{c.n.toLocaleString("fa")}. {c.name}</Link>
      ))}
    </nav>
  );
}

/** تقسیم n کاشی در شبکه ۱۲ستونی بدون خانه خالی: ردیف‌های سه‌تایی، و انتهای دوتایی */
export function spans12(n: number) {
  const r: number[] = []; let left = n;
  while (left > 0) {
    if (left === 1) { r.push(12); break; }
    if (left === 2 || left === 4) { r.push(...Array(left).fill(6)); break; }
    r.push(4, 4, 4); left -= 3;
  }
  return r;
}
export const spanClass: Record<number, string> = { 4: "col-span-4", 6: "col-span-6", 8: "col-span-8", 12: "col-span-12" };

/** خواندن شناسه پروژه از نشانی (صفحه جزئیات ایستا) */
export function WithProject({ children }: { children: (l: Listing | undefined) => ReactNode }) {
  return <Suspense fallback={null}><ProjectReader>{children}</ProjectReader></Suspense>;
}
function ProjectReader({ children }: { children: (l: Listing | undefined) => ReactNode }) {
  const q = useSearchParams();
  const l = listingById(q.get("id") ?? "DEMO-01") ?? listingById("DEMO-01");
  return <>{children(l)}</>;
}

/** نقشه ایران بدون نقطه: استان پررنگ با مرز واقعی */
export function ProvinceMap({ hot, className, fill = "fill-[var(--cv-accent)]", base = "fill-[var(--cv-ink)]/[0.08]", stroke = "stroke-white", weights }: { hot?: string | null; className?: string; fill?: string; base?: string; stroke?: string; weights?: Record<string, number> }) {
  const max = weights ? Math.max(1, ...Object.values(weights)) : 1;
  return (
    <svg viewBox="8 8 344 316" className={cn("h-auto w-full", className)} role="img" aria-label={hot ? `نقشه ایران، استان ${hot}` : "نقشه ایران"}>
      {Object.entries(provincePaths).map(([name, d]) => (
        <path key={name} d={d} strokeWidth="0.8" strokeLinejoin="round" className={cn(stroke, "transition-[fill,opacity] duration-500", name === hot ? fill : base)}
          style={weights && name !== hot ? { opacity: 0.35 + 0.65 * ((weights[name] ?? 0) / max) } : undefined}><title>{name}</title></path>
      ))}
    </svg>
  );
}

/* ——— جست‌وجوی مستقیم بدون پرسش‌نامه (مسیر، استان، گروه، عنوان یا شناسه) ——— */
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { routes } from "@/data/routes";
import { projectGroups } from "@/data/taxonomy";
import { provinces } from "@/data/provinces";
import { directSearch } from "@/components/concepts/content";
import { SaveButton } from "@/components/listing/listing-card";
import { useHydrated } from "@/lib/store";
import { toast } from "sonner";
import { Convertshape2, SearchNormal1, TickCircle } from "@/components/iconsax";

export function DirectSearch({ dark, className, field, button }: { dark?: boolean; className?: string; field?: string; button?: string }) {
  const router = useRouter();
  const begin = useStore((s) => s.begin);
  const [route, setRoute] = useState<RouteId>("investor");
  const [province, setProvince] = useState("all");
  const [group, setGroup] = useState("all");
  const [q, setQ] = useState("");
  const usesGroups = routes.find((r) => r.id === route)?.usesProjectGroups;
  const f = cn("h-12 w-full rounded-xl border text-[13.5px] font-bold shadow-none", dark ? "border-white/15 bg-white/[0.07] text-white data-[placeholder]:text-white/60 [&_svg]:text-white/70" : "border-[var(--cv-grid)] bg-white text-[var(--cv-ink)]", field);
  const lab = cn("mb-1.5 block text-[12px] font-bold", dark ? "text-white/70" : "text-[var(--cv-ink)]/65");
  return (
    <form className={cn("grid grid-cols-[1.1fr_1fr_1.1fr_1.3fr_auto] items-end gap-3", className)}
      onSubmit={(e) => { e.preventDefault(); begin({ route, provinces: province === "all" ? [] : [province], groups: usesGroups && group !== "all" ? [group] : [], filters: q.trim() ? { keyword: q.trim() } : {} }); router.push("/opportunities"); }}>
      <label><span className={lab}>{directSearch.fields.route}</span>
        <Select value={route} onValueChange={(v) => setRoute(v as RouteId)} dir="rtl"><SelectTrigger className={f}><SelectValue /></SelectTrigger>
          <SelectContent>{routes.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select></label>
      <label><span className={lab}>{directSearch.fields.province}</span>
        <Select value={province} onValueChange={setProvince} dir="rtl"><SelectTrigger className={f}><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">همه استان‌ها</SelectItem>{provinces.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></label>
      <label><span className={lab}>{directSearch.fields.group}</span>
        <Select value={group} onValueChange={setGroup} dir="rtl" disabled={!usesGroups}><SelectTrigger className={f}><SelectValue placeholder="برای این مسیر لازم نیست" /></SelectTrigger>
          <SelectContent><SelectItem value="all">همه گروه‌های پروژه</SelectItem>{projectGroups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent></Select></label>
      <label><span className={lab}>{directSearch.fields.query}</span>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="مثلاً نیروگاه یا DEMO-02" className={f} /></label>
      <button type="submit" className={cn("inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-[14px] font-extrabold text-white transition-[transform,background-color] hover:bg-[#0d5f59] active:scale-[0.98]", button)}>
        <SearchNormal1 size={18} />{directSearch.submit}</button>
    </form>
  );
}

/* ——— دکمه‌های صفحه جزئیات: ذخیره و مقایسه ——— */
export function CompareToggle({ id, className, onClass = "bg-[var(--cobalt)] text-white" }: { id: string; className?: string; onClass?: string }) {
  const { compare, toggleCompare } = useStore();
  const router = useRouter();
  const hydrated = useHydrated();
  const on = hydrated && compare.includes(id);
  return (
    <button type="button" aria-pressed={on} onClick={() => { if (!on && compare.length >= 4) return toast("حداکثر چهار پروژه را می‌توانید مقایسه کنید."); toggleCompare(id); if (!on) toast("به مقایسه اضافه شد.", { action: { label: "دیدن مقایسه", onClick: () => router.push("/compare") } }); }}
      className={cn("inline-flex h-12 items-center gap-2 rounded-full px-5 text-[13.5px] font-extrabold transition-all active:scale-95", on ? onClass : "", className)}>
      {on ? <TickCircle size={18} variant="Bold" /> : <Convertshape2 size={18} />}{on ? "در مقایسه" : "افزودن به مقایسه"}
    </button>
  );
}
export { SaveButton };
