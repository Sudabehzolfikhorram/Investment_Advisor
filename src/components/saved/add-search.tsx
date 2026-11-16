"use client";
// افزودن جست‌وجوی تازه از صفحه علاقه‌مندی‌ها: مسیر، حوزه، استان و بودجه در یک پنجره، فیلترهای صفحه پروژه‌ها دست نمی‌خورد.
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Add, FilterAdd } from "@/components/iconsax";
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

/** افزودن فیلتر تازه: آیکون کنار تیتر علاقه‌مندی‌ها و کارت خالی اول فهرست جست‌وجوها. بدون ورود، اول ورود می‌خواهد. */
export function AddSearchButton({ variant = "icon" }: { variant?: "icon" | "tile" | "plus" }) {
  const [open, setOpen] = useState(false);
  const { user, openLogin } = useStore();
  const start = () => (user ? setOpen(true) : openLogin());
  return (
    <>
      {variant === "plus" ? (
        <Button type="button" variant="plain" size="auto" onClick={start} aria-label="افزودن فیلتر تازه" title="افزودن و ذخیره فیلتر تازه"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-cobalt text-white shadow-[0_8px_18px_-10px_var(--cobalt)] transition-transform duration-300 hover:rotate-90 hover:bg-cobalt-deep"><Add size={20} /></Button>
      ) : variant === "icon" ? (
        <Button type="button" variant="plain" size="auto" onClick={start} aria-label="افزودن فیلتر تازه" title="افزودن و ذخیره فیلتر تازه"
          className="group h-12 gap-2.5 rounded-full border border-border bg-white pl-5 pr-1.5 text-[13.5px] font-extrabold text-ink shadow-[0_10px_26px_-20px_rgb(20_30_45/0.5)] transition-colors hover:border-ink/30">
          <span className="grid size-9 place-items-center rounded-full bg-cobalt text-white transition-transform duration-300 group-hover:rotate-90"><Add size={20} /></span>فیلتر تازه
        </Button>
      ) : (
        <button type="button" onClick={start} className="group grid min-h-[15rem] place-items-center rounded-[2rem] border-2 border-dashed border-border bg-white/50 p-6 text-center transition-colors hover:border-ink/30 hover:bg-white">
          <span>
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-800 text-white transition-transform duration-300 group-hover:scale-105"><FilterAdd size={26} variant="Bulk" /></span>
            <span className="mt-4 block text-[15px] font-extrabold text-ink">فیلتر تازه بسازید</span>
            <span className="mt-1 block text-[12.5px] leading-6 text-muted-foreground">مسیر، حوزه، استان و بودجه را بگویید،<br />پروژه‌های تازه‌اش همین‌جا می‌آید.</span>
          </span>
        </button>
      )}
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
    toast.success("جست‌وجو ذخیره شد، پروژه‌های تازه‌ی آن همین‌جا نشان داده می‌شود.");
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
                    className={cn("flex min-h-[4.5rem] flex-col items-start justify-between gap-1.5 rounded-2xl border p-2.5 text-right transition-colors", on ? "border-cobalt bg-cobalt text-white" : "border-border bg-white text-ink hover:border-ink/30")}>
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
