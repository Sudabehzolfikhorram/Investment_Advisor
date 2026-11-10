"use client";
// ذخیره شرایط واردشده و انتخاب دوباره آن‌ها، تا کاربر هر بار اطلاعات را از نو وارد نکند.
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Add, ArchiveTick, ArrowDown2, Save2, Setting4, TickCircle } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { routes } from "@/data/routes";
import { describeCriteria } from "@/lib/criteria";
import { listings } from "@/lib/listings";
import { rank } from "@/lib/match";
import { useHydrated, useStore } from "@/lib/store";
import { faNumber } from "@/lib/utils";

export function SaveCriteriaDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { user, criteria, openLogin, saveProfile } = useStore();
  const route = routes.find((r) => r.id === criteria.route)!;
  const chips = describeCriteria(criteria);
  const [name, setName] = useState("");
  useEffect(() => { if (open) setName(`${route.name}${criteria.provinces[0] ? `، ${criteria.provinces[0]}` : ""}`); }, [open, route.name, criteria.provinces]);
  const save = () => {
    const n = name.trim() || "جست‌وجوی من";
    onOpenChange(false);
    if (!user) return openLogin({ type: "save-criteria", name: n });
    saveProfile(n); toast.success("جست‌وجو ذخیره شد.", { description: "دفعه بعد از «جست‌وجوهای من» با یک کلیک برگردید." });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-white sm:max-w-lg">
        <DialogHeader className="pr-7 text-right">
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold"><Save2 size={22} variant="Bulk" className="text-primary" />ذخیره این جست‌وجو</DialogTitle>
          <DialogDescription>دفعه بعد لازم نیست چیزی را دوباره وارد کنید؛ با یک کلیک به همین نتایج برمی‌گردید و پروژه‌های تازه را می‌بینید.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="criteria-name" className="text-[13px] font-bold">یک نام برایش بگذارید</Label>
            <Input id="criteria-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className="h-12 rounded-2xl font-semibold" /></div>
          <div className="rounded-2xl bg-muted p-4">
            <p className="mb-2.5 text-xs font-bold text-muted-foreground">این موارد ذخیره می‌شود</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge className="px-3 py-1 font-bold">{route.name}</Badge>
              {chips.map((c) => <Badge key={c.key} variant="outline" className="bg-white px-3 py-1 font-semibold text-ink/80">{c.label}</Badge>)}
              {!chips.length && <span className="text-xs text-muted-foreground">بدون فیلتر دیگر</span>}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="submit" className="h-12 rounded-full px-7 font-extrabold">{user ? "ذخیره" : "ورود و ذخیره"}</Button>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-12 rounded-full px-5 font-bold">انصراف</Button>
          </DialogFooter>
          {!user && <p className="text-xs text-muted-foreground">فقط شماره موبایل لازم است.</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** تعداد پروژه‌های متناسب و تازه برای هر شرایط ذخیره‌شده */
export function useProfileStats() {
  const profiles = useStore((s) => s.profiles);
  return useMemo(() => Object.fromEntries(profiles.map((p) => {
    const m = rank(listings, p.criteria).filter((r) => r.score >= 50);
    return [p.id, { total: m.length, fresh: m.filter((r) => r.listing.publishedAt > p.lastSeenAt).length }];
  })), [profiles]);
}

export function SavedCriteriaMenu({ onSave, saved }: { onSave: () => void; saved?: boolean }) {
  const hydrated = useHydrated();
  const { profiles, applyProfile } = useStore();
  const stats = useProfileStats();
  const list = hydrated ? profiles : [];
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-11 gap-2 rounded-full bg-white px-4 text-sm font-bold text-ink shadow-none">
          <ArchiveTick size={18} variant="Bulk" className="text-primary" />جست‌وجوهای من
          {list.length > 0 && <Badge className="h-5 min-w-5 px-1 text-[11px]">{faNumber(list.length)}</Badge>}
          <ArrowDown2 size={14} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl p-1.5">
        <DropdownMenuLabel className="text-xs text-muted-foreground">برگردید به جست‌وجوهایی که ذخیره کرده‌اید</DropdownMenuLabel>
        {list.map((p) => (
          <DropdownMenuItem key={p.id} onSelect={() => { applyProfile(p.id); toast(`«${p.name}» باز شد.`); }} className="flex items-center justify-between gap-3 rounded-xl py-2.5">
            <span className="min-w-0"><span className="block truncate text-sm font-bold text-ink">{p.name}</span><span className="block truncate text-[11px] text-muted-foreground">{routes.find((r) => r.id === p.criteria.route)?.name} · {faNumber(stats[p.id]?.total ?? 0)} پروژه</span></span>
            {(stats[p.id]?.fresh ?? 0) > 0 && <Badge className="shrink-0 px-2 text-[11px] font-extrabold">{faNumber(stats[p.id].fresh)} تازه</Badge>}
          </DropdownMenuItem>
        ))}
        {!list.length && <p className="px-2 py-3 text-[13px] leading-6 text-muted-foreground">هنوز چیزی ذخیره نکرده‌اید. جست‌وجوی فعلی را ذخیره کنید تا دفعه بعد از همین‌جا ادامه دهید.</p>}
        <DropdownMenuSeparator />
        {saved ? <p className="flex items-center gap-2 px-2 py-2 text-[13px] font-bold text-primary"><TickCircle size={17} variant="Bold" />جست‌وجوی فعلی ذخیره شده است</p> : <DropdownMenuItem onSelect={onSave} className="rounded-xl font-bold text-primary focus:text-primary"><Add size={18} />ذخیره جست‌وجوی فعلی</DropdownMenuItem>}
        {list.length > 0 && <DropdownMenuItem asChild className="rounded-xl"><Link href="/saved"><Setting4 size={17} />مدیریت جست‌وجوها</Link></DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
