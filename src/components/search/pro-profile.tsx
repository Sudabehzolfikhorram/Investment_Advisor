"use client";
// پروفایل حرفه‌ای (فرم «اطلاعات حرفه‌ای من» در علاقه‌مندی‌ها) در جست‌وجو:
// نقش، استان و سرمایه‌ی ثبت‌شده با یک کلیک روی فیلترها می‌نشیند. داده همان است که فرم نسخه مرجع روی دستگاه ذخیره می‌کند.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TickCircle, UserEdit } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dropdown } from "./controls";
import { provinces } from "@/data/provinces";
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

/** پروفایل کوتاه را در همان ساختاری می‌نویسد که فرم کامل «پروفایل حرفه‌ای» می‌خواند */
export function writeProProfile(patch: Partial<ProProfile>) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}") ?? {};
    all.profile = { ...(all.profile ?? {}), profile: { ...(all.profile?.profile ?? {}), ...patch } };
    localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("storage"));
  } catch {}
}

type Fact = { id: "route" | "province" | "amount"; label: string; value: string; on: boolean; patch: Partial<SearchCriteria> };
/** هر بخش پروفایل یک فیلتر جدا؛ کاربر می‌بیند کدام روی نتایج نشسته و هر کدام را جدا روشن یا خاموش می‌کند */
function profileFacts(p: ProProfile, c: SearchCriteria): Fact[] {
  const next = profileCriteria(p, c); const out: Fact[] = [];
  const roles = (p.roles ?? []).map((r) => roleLabel[r]).filter(Boolean);
  if (next.route) out.push({ id: "route", label: "نقش → مسیر", value: `${roles[0] ?? ""} · ${routes.find((r) => r.id === next.route)?.name}`, on: next.route === c.route, patch: next.route === c.route ? {} : { route: next.route, groups: [], filters: {}, amount: null } });
  if (next.provinces) out.push({ id: "province", label: "استان", value: next.provinces[0], on: c.provinces.includes(next.provinces[0]), patch: { provinces: c.provinces.includes(next.provinces[0]) ? c.provinces.filter((x) => x !== next.provinces![0]) : [...c.provinces, next.provinces[0]] } });
  if (next.amount) out.push({ id: "amount", label: "سرمایه → بودجه", value: `تا ${faNumber(next.amount[1])} میلیارد تومان`, on: c.amount?.join() === next.amount.join(), patch: { amount: c.amount?.join() === next.amount.join() ? null : next.amount } });
  return out;
}

const quickRoles = [["investor", "سرمایه‌گذار"], ["builder", "سازنده"], ["contractor", "پیمانکار"], ["manager", "بهره‌بردار"]] as const;

/** ساخت سریع پروفایل از داخل فیلترها: سه پرسش، بدون رفتن به صفحه دیگر */
function QuickProfile({ open, onOpenChange, initial, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; initial: ProProfile | null; onSaved: (p: ProProfile) => void }) {
  const [role, setRole] = useState(initial?.roles?.[0] ?? "investor");
  const [province, setProvince] = useState<string | undefined>(initial?.province && initial.province !== "all" ? initial.province : undefined);
  const [capital, setCapital] = useState(String(initial?.capital ?? ""));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md rounded-[1.75rem] p-7">
        <DialogHeader className="text-right">
          <DialogTitle className="text-lg font-black text-ink">پروفایل حرفه‌ای در سه پرسش</DialogTitle>
          <DialogDescription className="text-[13px] leading-6">همین سه مورد روی فیلترها می‌نشیند. سوابق و گواهی‌ها را بعداً در فرم کامل اضافه کنید.</DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-5">
          <div>
            <p className="mb-2 text-[13px] font-extrabold text-ink">با چه نقشی کار می‌کنید؟</p>
            <div className="grid grid-cols-4 gap-1.5">
              {quickRoles.map(([id, l]) => <Button key={id} type="button" variant="plain" size="auto" aria-pressed={role === id} onClick={() => setRole(id)}
                className={cn("h-10 rounded-xl border text-[12.5px] font-bold transition-colors", role === id ? "border-cobalt bg-cobalt text-white" : "border-border bg-white text-ink hover:border-ink/30")}>{l}</Button>)}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-extrabold text-ink">در کدام استان فعالید؟</p>
            <Dropdown options={provinces.map((x) => ({ value: x, label: x }))} value={province} onChange={setProvince} placeholder="سراسر کشور" />
          </div>
          {(role === "investor" || role === "builder") && (
            <div>
              <p className="mb-2 text-[13px] font-extrabold text-ink">سرمایه قابل تخصیص <span className="font-semibold text-muted-foreground">(میلیارد تومان)</span></p>
              <Input inputMode="numeric" value={capital} onChange={(e) => setCapital(e.target.value.replace(/[^\d۰-۹]/g, "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))))} placeholder="مثلاً ۵۰" className="h-11 rounded-2xl bg-white text-[14px] font-bold" />
            </div>
          )}
        </div>
        <Button type="button" onClick={() => { const p: ProProfile = { ...(initial ?? {}), roles: [role], province: province ?? "all", capital: capital ? Number(capital) : initial?.capital }; writeProProfile(p); onSaved(p); onOpenChange(false); }}
          className="mt-6 h-12 w-full rounded-full bg-primary text-[14px] font-extrabold text-white hover:bg-primary/90">ذخیره و اعمال روی فیلترها</Button>
      </DialogContent>
    </Dialog>
  );
}

/** کارت پروفایل حرفه‌ای در فیلترها و فرم شروع: هر بخش پروفایل یک فیلتر قابل روشن/خاموش */
export function ProProfileCard({ className, onApplied }: { className?: string; onApplied?: () => void }) {
  const p = useProProfile();
  const router = useRouter();
  const { criteria, setCriteria } = useStore();
  const [quick, setQuick] = useState(false);
  const applyAll = (prof: ProProfile) => { setCriteria(profileCriteria(prof, criteria)); onApplied?.(); };
  const dialog = <QuickProfile open={quick} onOpenChange={setQuick} initial={p} onSaved={applyAll} />;
  if (!p) return (
    <div className={cn("rounded-2xl bg-[#f3f6fa] p-4", className)}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-ink shadow-[0_6px_16px_-10px_rgb(20_30_45/0.4)]"><UserEdit size={19} variant="Bulk" /></span>
        <p className="min-w-0 flex-1 text-[12.5px] leading-6 text-muted-foreground"><b className="block text-[13.5px] font-extrabold text-ink">فیلترها را از پروفایلتان پر کنید</b>نقش، استان و سرمایه را یک‌بار بگویید؛ هر بار همین‌جا با یک کلیک روی نتایج می‌نشیند.</p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button type="button" variant="plain" size="auto" onClick={() => setQuick(true)} className="h-9 flex-1 rounded-full bg-ink text-[12.5px] font-extrabold text-white hover:bg-ink/90">ساخت سریع پروفایل</Button>
        <Button type="button" variant="ghost" size="xs" onClick={() => openProfileTab(router.push)} className="shrink-0 text-[12px] font-bold text-muted-foreground">فرم کامل</Button>
      </div>
      {dialog}
    </div>
  );
  const facts = profileFacts(p, criteria);
  const allOn = facts.every((f) => f.on);
  return (
    <div className={cn("rounded-2xl border border-border bg-white p-4", className)}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-white"><UserEdit size={19} variant="Bulk" /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-extrabold text-ink">{p.name || "پروفایل حرفه‌ای من"}</span>
          <span className="block text-[11.5px] font-semibold text-muted-foreground">{faNumber(facts.filter((f) => f.on).length)} از {faNumber(facts.length)} مورد روی نتایج</span>
        </span>
        <Button type="button" variant="ghost" size="xs" onClick={() => setQuick(true)} className="shrink-0 text-[12px] font-bold text-muted-foreground">ویرایش</Button>
      </div>
      <ul className="mt-3 space-y-1.5">
        {facts.map((f) => (
          <li key={f.id}>
            <button type="button" aria-pressed={f.on} onClick={() => setCriteria(f.patch)} disabled={f.id === "route" && f.on}
              className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-right transition-colors", f.on ? "bg-[#f3f6fa]" : "border border-dashed border-border hover:border-ink/30")}>
              {f.on ? <TickCircle size={18} variant="Bold" className="shrink-0 text-ink" /> : <span className="size-[18px] shrink-0 rounded-full border-[1.5px] border-ink/25" />}
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold text-muted-foreground">{f.label}</span>
                <span className="block truncate text-[12.5px] font-bold text-ink">{f.value}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {!allOn && <Button type="button" variant="plain" size="auto" onClick={() => applyAll(p)} className="mt-3 h-9 w-full rounded-full bg-ink text-[12.5px] font-extrabold text-white hover:bg-ink/90">اعمال همه روی فیلترها</Button>}
      {dialog}
    </div>
  );
}

/** نسخه یک‌خطی همان کارت برای بالای فرم شروع */
export function ProProfileBar({ className }: { className?: string }) {
  const p = useProProfile();
  const { criteria, setCriteria } = useStore();
  const [quick, setQuick] = useState(false);
  const dialog = <QuickProfile open={quick} onOpenChange={setQuick} initial={p} onSaved={(prof) => setCriteria(profileCriteria(prof, criteria))} />;
  const facts = p ? profileFacts(p, criteria) : [];
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl bg-white/70 p-2.5 pr-3 ring-1 ring-border", className)}>
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", p ? "bg-ink text-white" : "bg-muted text-ink")}><UserEdit size={18} variant="Bulk" /></span>
      {p ? <>
        <span className="shrink-0 text-[13px] font-extrabold text-ink">از پروفایل شما:</span>
        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {facts.map((f) => (
            <button key={f.id} type="button" aria-pressed={f.on} onClick={() => setCriteria(f.patch)} disabled={f.id === "route" && f.on}
              className={cn("inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold transition-colors", f.on ? "bg-cobalt text-white" : "border border-dashed border-ink/25 text-ink hover:border-ink/50")}>
              {f.on ? <TickCircle size={14} variant="Bold" /> : <span className="text-[14px] leading-none">+</span>}{f.value}
            </button>
          ))}
        </div>
        <Button type="button" variant="ghost" size="xs" onClick={() => setQuick(true)} className="shrink-0 text-[12px] font-bold text-muted-foreground">ویرایش</Button>
      </> : <>
        <p className="min-w-0 flex-1 text-[12.5px] text-muted-foreground"><b className="font-extrabold text-ink">پروفایل حرفه‌ای</b> بسازید تا نقش، استان و سرمایه‌تان خودکار روی همین پرسش‌ها بنشیند.</p>
        <Button type="button" variant="plain" size="auto" onClick={() => setQuick(true)} className="h-9 shrink-0 rounded-full bg-ink px-4 text-[12.5px] font-extrabold text-white hover:bg-ink/90">ساخت سریع</Button>
      </>}
      {dialog}
    </div>
  );
}
