"use client";
// افزودن جست‌وجوی تازه از صفحه علاقه‌مندی‌ها: مسیر، حوزه، استان و بودجه در یک پنجره؛ فیلترهای صفحه پروژه‌ها دست نمی‌خورد.
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Add } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MultiCombobox } from "@/components/search/controls";
import { BudgetField } from "@/components/search/budget-field";
import { routeIcons } from "@/components/icons";
import { projectGroups } from "@/data/taxonomy";
import { provinces } from "@/data/provinces";
import { routes } from "@/data/routes";
import { listings } from "@/lib/listings";
import { forRoute } from "@/lib/match";
import { useStore } from "@/lib/store";
import type { RouteId, SearchCriteria } from "@/types";
import { cn } from "@/lib/utils";

export function AddSearchButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" variant="plain" size="auto" onClick={() => setOpen(true)} aria-label="افزودن جست‌وجوی تازه" title="افزودن جست‌وجوی تازه"
        className="h-11 gap-2 rounded-full bg-ink pl-5 pr-3 text-[13px] font-extrabold text-white hover:bg-ink/90">
        <span className="grid size-7 place-items-center rounded-full bg-white/15"><Add size={18} /></span>جست‌وجوی تازه
      </Button>
      <AddSearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function AddSearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const addProfile = useStore((s) => s.addProfile);
  const [name, setName] = useState("");
  const [c, setC] = useState<SearchCriteria>({ route: "investor", groups: [], provinces: [], amount: null, filters: {} });
  const route = routes.find((r) => r.id === c.route)!;
  const amounts = useMemo(() => forRoute(listings, c.route).filter((l) => (!c.provinces.length || c.provinces.includes(l.province ?? "")) && (!c.groups.length || c.groups.includes(l.group ?? ""))).map((l) => l.amount).filter((x): x is number => x != null), [c]);
  const basis = useMemo(() => forRoute(listings, c.route).map((l) => l.amount).filter((x): x is number => x != null), [c.route]);
  const auto = [route.name, c.provinces.length === 1 ? `در ${c.provinces[0]}` : ""].filter(Boolean).join(" ");
  const save = () => {
    addProfile(name.trim() || auto, c);
    onOpenChange(false); setName(""); setC({ route: "investor", groups: [], provinces: [], amount: null, filters: {} });
    toast.success("جست‌وجو ذخیره شد؛ پروژه‌های تازه‌ی آن همین‌جا نشان داده می‌شود.");
  };
  const setRoute = (id: RouteId) => setC({ route: id, groups: [], provinces: c.provinces, amount: null, filters: {} });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="thin-scroll max-h-[92dvh] overflow-y-auto rounded-3xl bg-white sm:max-w-2xl">
        <DialogHeader className="pr-7 text-right">
          <DialogTitle className="text-xl font-extrabold">جست‌وجوی تازه</DialogTitle>
          <DialogDescription>شرایط را مشخص کنید تا هر بار پروژه‌های تازه‌ی متناسب با آن را ببینید.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-6">
          <div className="space-y-2.5">
            <p className="text-[13px] font-bold text-ink">مسیر</p>
            <div className="grid grid-cols-4 gap-2">
              {routes.map((r) => { const I = routeIcons[r.id]; const on = r.id === c.route;
                return (
                  <button key={r.id} type="button" onClick={() => setRoute(r.id)} aria-pressed={on}
                    className={cn("flex min-h-[4.5rem] flex-col items-start justify-between gap-1.5 rounded-2xl border p-2.5 text-right transition-colors", on ? "border-ink bg-ink text-white" : "border-border bg-white text-ink hover:border-ink/30")}>
                    <I size={17} variant="Bulk" className={on ? "text-white" : "text-ink/60"} />
                    <span className="text-[12px] font-extrabold leading-5">{r.name}</span>
                  </button>
                ); })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {route.usesProjectGroups && (
              <div className="space-y-2"><p className="text-[13px] font-bold text-ink">حوزه</p>
                <MultiCombobox options={projectGroups.map((g) => ({ value: g.id, label: g.name }))} value={c.groups} onChange={(v) => setC({ ...c, groups: v })} placeholder="همه حوزه‌ها" label="حوزه" /></div>
            )}
            {c.route !== "fund" && (
              <div className={cn("space-y-2", !route.usesProjectGroups && "col-span-2")}><p className="text-[13px] font-bold text-ink">استان</p>
                <MultiCombobox options={provinces.map((p) => ({ value: p, label: p }))} value={c.provinces} onChange={(v) => setC({ ...c, provinces: v })} placeholder="همه ایران" label="استان" search="جست‌وجوی استان…" /></div>
            )}
          </div>
          {route.amount && (
            <div className="space-y-2"><p className="text-[13px] font-bold text-ink">{route.amount.label}</p>
              <BudgetField key={c.route} compact min={route.amount.min} max={route.amount.max} step={route.amount.step} unit={route.amount.unit} value={c.amount} onChange={(v) => setC({ ...c, amount: v })} amounts={amounts} basis={basis} /></div>
          )}
          <div className="space-y-2"><Label htmlFor="new-search-name" className="text-[13px] font-bold">نام</Label>
            <Input id="new-search-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={auto} maxLength={40} className="h-12 rounded-2xl font-semibold" /></div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="submit" className="h-12 rounded-full px-7 font-extrabold">ذخیره جست‌وجو</Button>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-12 rounded-full px-5 font-bold">انصراف</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
