"use client";
// پروفایل حرفه‌ای (فرم «اطلاعات حرفه‌ای من» در علاقه‌مندی‌ها) در جست‌وجو:
// نقش، استان و سرمایه‌ی ثبت‌شده با یک کلیک روی فیلترها می‌نشیند. داده همان است که فرم نسخه مرجع روی دستگاه ذخیره می‌کند.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TickCircle, UserEdit } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { routes } from "@/data/routes";
import { useStore } from "@/lib/store";
import type { RouteId, SearchCriteria } from "@/types";
import { cn, faNumber } from "@/lib/utils";

const KEY = "algonet-professional-tools-v1";
export interface ProProfile { name?: string; entity?: string; roles?: string[]; province?: string; specialty?: string; capacity?: string; capital?: number | string }

const roleLabel: Record<string, string> = { investor: "سرمایه‌گذار", builder: "سازنده / توسعه‌گر", contractor: "پیمانکار", manager: "مدیر املاک استیجاری", consultant: "مشاور / تسهیل‌گر" };
/** نقش حرفه‌ای → مسیر جست‌وجو (مشاور مسیر جداگانه‌ای ندارد) */
const roleRoute: Record<string, RouteId | undefined> = { investor: "investor", builder: "investor", contractor: "contractor", manager: "operator" };

export function readProProfile(): ProProfile | null {
  try { const p = JSON.parse(localStorage.getItem(KEY) || "{}")?.profile?.profile; return p && (p.roles?.length || p.province) ? p : null; } catch { return null; }
}

export function useProProfile() {
  const [p, setP] = useState<ProProfile | null>(null);
  useEffect(() => {
    const read = () => setP(readProProfile());
    read(); window.addEventListener("storage", read); window.addEventListener("focus", read);
    const t = window.setInterval(read, 2000);
    return () => { window.removeEventListener("storage", read); window.removeEventListener("focus", read); window.clearInterval(t); };
  }, []);
  return p;
}

/** شرایط جست‌وجو از روی پروفایل؛ سرمایه فقط در مسیر سرمایه‌گذاری جای بودجه می‌نشیند (مثل نسخه مرجع) */
export function profileCriteria(p: ProProfile, current: SearchCriteria): Partial<SearchCriteria> {
  const mapped = (p.roles ?? []).map((r) => roleRoute[r]).filter(Boolean) as RouteId[];
  const route = mapped.includes(current.route) ? current.route : mapped[0] ?? current.route;
  // مسیر عوض شود، حوزه و فیلترهای مسیر قبلی معنا ندارند
  const out: Partial<SearchCriteria> = route === current.route ? { route } : { route, groups: [], filters: {}, amount: null };
  if (p.province && p.province !== "all") out.provinces = [p.province];
  const cap = Number(p.capital);
  const r = routes.find((x) => x.id === route);
  if (route === "investor" && cap > 0 && r?.amount) out.amount = [r.amount.min, Math.min(r.amount.max, Math.max(r.amount.min, cap))];
  return out;
}

export function profileSummary(p: ProProfile) {
  const parts = (p.roles ?? []).map((r) => roleLabel[r]).filter(Boolean);
  if (p.province) parts.push(p.province === "all" ? "سراسر کشور" : p.province);
  if (Number(p.capital) > 0) parts.push(`${faNumber(Number(p.capital))} میلیارد تومان`);
  return parts;
}

export const openProfileTab = (push: (u: string) => void) => { try { sessionStorage.setItem("hs-saved-tab", "profile"); } catch {} push("/saved"); window.dispatchEvent(new Event("hs-saved-tab")); };

/** کارت پروفایل حرفه‌ای در فیلترها و فرم شروع */
export function ProProfileCard({ className, onApplied }: { className?: string; onApplied?: () => void }) {
  const p = useProProfile();
  const router = useRouter();
  const { criteria, setCriteria } = useStore();
  const [done, setDone] = useState(false);
  if (!p) return (
    <div className={cn("flex items-center gap-3 rounded-2xl border border-dashed border-border bg-white/70 p-3.5", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-ink/60"><UserEdit size={18} variant="Bulk" /></span>
      <p className="min-w-0 flex-1 text-[12px] leading-6 text-muted-foreground"><b className="font-extrabold text-ink">پروفایل حرفه‌ای</b> را یک‌بار ثبت کنید تا نقش و استانتان با یک کلیک روی فیلترها بنشیند.</p>
      <Button type="button" variant="ghost" size="xs" onClick={() => openProfileTab(router.push)} className="shrink-0 font-extrabold text-primary hover:text-primary">ثبت<ArrowLeft size={14} /></Button>
    </div>
  );
  const parts = profileSummary(p);
  const next = profileCriteria(p, criteria);
  const applied = next.route === criteria.route && !next.filters && (!next.provinces || next.provinces.join() === criteria.provinces.join()) && (!next.amount || next.amount.join() === criteria.amount?.join());
  return (
    <div className={cn("rounded-2xl border border-border bg-white p-3.5", className)}>
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink text-white"><UserEdit size={18} variant="Bulk" /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-extrabold text-ink">{p.name || "پروفایل حرفه‌ای من"}</span>
          <span className="block truncate text-[11.5px] font-semibold text-muted-foreground">{parts.join(" · ")}</span>
        </span>
      </div>
      <Button type="button" variant="plain" size="auto" disabled={applied} onClick={() => { setCriteria(next); setDone(true); onApplied?.(); }}
        className={cn("mt-3 h-9 w-full gap-1.5 rounded-full text-[12px] font-extrabold transition-colors", applied ? "bg-muted text-ink/60" : "bg-ink text-white hover:bg-ink/90")}>
        {applied ? <><TickCircle size={15} variant="Bold" className={done ? "text-primary" : ""} />روی فیلترها اعمال شده</> : "اعمال نقش و استان روی فیلترها"}
      </Button>
    </div>
  );
}
