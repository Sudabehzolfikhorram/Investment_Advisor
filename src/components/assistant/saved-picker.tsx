"use client";
// شرایط ذخیره‌شده در دستیار: مثل افزودن ابزار در یک چت، از دکمه کنار جای نوشتن انتخاب می‌شود
// و به‌صورت یک برچسب داخل همان قاب می‌نشیند؛ ویرایش و حذف هر شرط هم همین‌جا انجام می‌شود.
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArchiveTick, CloseCircle, Edit2, Setting4 } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProfileStats } from "@/components/search/save-criteria";
import { routes } from "@/data/routes";
import { describeCriteria, type CriteriaChip } from "@/lib/criteria";
import { useStore } from "@/lib/store";
import type { SavedProfile, SearchCriteria } from "@/types";
import { cn, faNumber } from "@/lib/utils";

const routeName = (c: SearchCriteria) => routes.find((r) => r.id === c.route)?.name ?? "";

/** حذف یک شرط از مجموعه شرایط */
export function withoutChip(c: SearchCriteria, chip: CriteriaChip): SearchCriteria {
  if (chip.kind === "group") return { ...c, groups: c.groups.filter((g) => g !== chip.value) };
  if (chip.kind === "province") return { ...c, provinces: c.provinces.filter((p) => p !== chip.value) };
  if (chip.kind === "amount") return { ...c, amount: null };
  const filters = { ...c.filters }; delete filters[chip.value!]; return { ...c, filters };
}

/** دکمه کنار جای نوشتن و فهرست کوتاه شرایط ذخیره‌شده */
export function SavedPicker({ onPick, onEdit, activeId }: { onPick: (p: SavedProfile) => void; onEdit: (p: SavedProfile) => void; activeId?: string }) {
  const profiles = useStore((s) => s.profiles);
  const stats = useProfileStats();
  const [open, setOpen] = useState(false);
  const fresh = profiles.reduce((n, p) => n + (stats[p.id]?.fresh ?? 0), 0);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="plain" size="auto" aria-label="شرایط ذخیره‌شده من"
          className={cn("relative h-12 shrink-0 gap-2 rounded-full border border-border bg-white px-4 text-[13px] font-extrabold text-ink/75 transition-colors hover:border-primary/40 hover:text-primary", open && "border-primary/40 text-primary")}>
          <ArchiveTick size={18} variant="Bulk" className="text-primary" />شرایط من
          <span className="grid min-w-5 place-items-center rounded-full bg-muted px-1.5 text-[11px] tabular-nums">{faNumber(profiles.length)}</span>
          {fresh > 0 && <span className="absolute -top-0.5 left-1 size-2.5 rounded-full bg-primary ring-2 ring-white" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" sideOffset={12} className="w-[24rem] overflow-hidden rounded-3xl p-0 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-extrabold text-ink">شرایط ذخیره‌شده</p>
          <Link href="/saved?tab=criteria" className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"><Setting4 size={14} />مدیریت</Link>
        </div>
        <ul className="thin-scroll max-h-80 overflow-y-auto p-1.5">
          {profiles.map((p) => { const chips = describeCriteria(p.criteria); const n = stats[p.id]?.fresh ?? 0; const on = p.id === activeId;
            return (
              <li key={p.id} className={cn("group/row flex items-center gap-1 rounded-2xl transition-colors", on ? "bg-primary/[0.07]" : "hover:bg-muted/70")}>
                <button type="button" onClick={() => { onPick(p); setOpen(false); }} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-right">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", on ? "bg-primary text-white" : "bg-primary/10 text-primary")}><ArchiveTick size={17} variant="Bulk" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2"><span className="truncate text-[13px] font-extrabold text-ink">{p.name}</span>{n > 0 && <span className="shrink-0 rounded-full bg-primary px-1.5 text-[10px] font-extrabold text-white">{faNumber(n)} تازه</span>}</span>
                    <span className="block truncate text-[11px] font-semibold text-muted-foreground">{[routeName(p.criteria), ...chips.map((c) => c.label)].join(" · ")}</span>
                  </span>
                </button>
                <button type="button" onClick={() => { setOpen(false); onEdit(p); }} aria-label={`ویرایش ${p.name}`} title="ویرایش"
                  className="ml-2 grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-white hover:text-primary focus-visible:opacity-100 group-hover/row:opacity-100"><Edit2 size={15} /></button>
              </li>
            ); })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/** برچسب شرایط انتخاب‌شده داخل قاب نوشتن */
export function AttachedProfile({ profile, onEdit, onRemove }: { profile: SavedProfile; onEdit: () => void; onRemove: () => void }) {
  const chips = describeCriteria(profile.criteria);
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-primary/25 bg-primary/[0.06] py-1.5 pl-1.5 pr-2.5">
      <ArchiveTick size={16} variant="Bulk" className="shrink-0 text-primary" />
      <span className="min-w-0 text-right">
        <span className="block truncate text-[12px] font-extrabold text-primary">{profile.name}</span>
        <span className="block max-w-[26rem] truncate text-[11px] font-semibold text-ink/60">{[routeName(profile.criteria), ...chips.map((c) => c.label)].join(" · ")}</span>
      </span>
      <button type="button" onClick={onEdit} aria-label="ویرایش شرایط" title="ویرایش" className="grid size-7 shrink-0 place-items-center rounded-full text-primary/70 hover:bg-white hover:text-primary"><Edit2 size={14} /></button>
      <button type="button" onClick={onRemove} aria-label="برداشتن شرایط" title="برداشتن" className="grid size-7 shrink-0 place-items-center rounded-full text-primary/60 hover:bg-white hover:text-primary"><CloseCircle size={16} variant="Bulk" /></button>
    </span>
  );
}

/** ویرایش نام و شرط‌های یک جست‌وجوی ذخیره‌شده */
export function EditProfileDialog({ profile, onOpenChange }: { profile: SavedProfile | null; onOpenChange: (o: boolean) => void }) {
  const updateProfile = useStore((s) => s.updateProfile);
  const [name, setName] = useState("");
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);
  useEffect(() => { if (profile) { setName(profile.name); setCriteria(profile.criteria); } }, [profile]);
  const chips = criteria ? describeCriteria(criteria) : [];
  const save = () => {
    if (!profile || !criteria) return;
    updateProfile(profile.id, { name: name.trim() || profile.name, criteria });
    onOpenChange(false);
    toast.success("تغییرات ذخیره شد.");
  };
  return (
    <Dialog open={!!profile} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-white sm:max-w-lg">
        <DialogHeader className="pr-7 text-right">
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold"><Edit2 size={20} className="text-primary" />ویرایش شرایط</DialogTitle>
          <DialogDescription>نام را عوض کنید یا شرطی را که دیگر لازم نیست بردارید.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="profile-name" className="text-[13px] font-bold">نام</Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className="h-12 rounded-2xl font-semibold" /></div>
          <div className="space-y-2.5">
            <p className="text-[13px] font-bold text-ink">شرط‌ها</p>
            <div className="flex flex-wrap gap-1.5">
              {criteria && <span className="rounded-full bg-pine px-3 py-1.5 text-[12px] font-bold text-white">{routeName(criteria)}</span>}
              {chips.map((c) => (
                <span key={c.key} className="inline-flex items-center gap-1 rounded-full border border-border bg-white py-1 pl-1 pr-3 text-[12px] font-semibold text-ink/80">
                  {c.label}
                  <button type="button" onClick={() => criteria && setCriteria(withoutChip(criteria, c))} aria-label={`حذف ${c.label}`} className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"><CloseCircle size={15} variant="Bulk" /></button>
                </span>
              ))}
              {!chips.length && <span className="text-xs text-muted-foreground">شرط دیگری ندارد.</span>}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="submit" className="h-12 rounded-full px-7 font-extrabold">ذخیره تغییرات</Button>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-12 rounded-full px-5 font-bold">انصراف</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
