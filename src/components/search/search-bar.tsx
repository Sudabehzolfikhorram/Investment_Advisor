"use client";
// فرم پایه: مسیر، گروه پروژه، استان، مبلغ. فقط همین چهار مورد قبل از نتایج پرسیده می‌شود.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Category2, Location, Routing2, SearchNormal1, WalletMoney, TickCircle } from "@/components/iconsax";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { routes, routeSubcategories } from "@/data/routes";
import { projectGroups } from "@/data/taxonomy";
import { provinces } from "@/data/provinces";
import { groupIcons, routeIcons } from "@/components/icons";
import { useStore } from "@/lib/store";
import { cn, faNumber } from "@/lib/utils";
import { Chip, ComboList, RangeField } from "./controls";

const subKey: Record<string, string> = { fund: "fundType", buyer: "saleCategory", charity: "charityType" };
export const amountPresets = (min: number, max: number): [number, number][] => {
  const a = Math.round(max * 0.04) || 1, b = Math.round(max * 0.1), c = Math.round(max * 0.3);
  return [[min, a], [a, b], [b, c], [c, max]];
};

function Segment({ icon, label, value, children, open, onOpenChange, wide }: { icon: React.ReactNode; label: string; value: string; children: React.ReactNode; open: boolean; onOpenChange: (o: boolean) => void; wide?: boolean }) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("group flex min-w-0 flex-1 items-center gap-3 rounded-full px-4 py-2.5 text-right transition-colors hover:bg-primary/5", open && "bg-primary/[0.07]")}>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">{icon}</span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold text-muted-foreground">{label}</span>
            <span className="block truncate text-sm font-extrabold text-ink">{value}</span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={14} className={cn("rounded-3xl border-white/70 bg-white/95 p-4 shadow-2xl backdrop-blur-2xl", wide ? "w-[min(92vw,30rem)]" : "w-[min(92vw,22rem)]")}>{children}</PopoverContent>
    </Popover>
  );
}

export function SearchBar({ compact, onSubmit }: { compact?: boolean; onSubmit?: () => void }) {
  const router = useRouter();
  const { criteria, setCriteria, setFilter } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const route = routes.find((r) => r.id === criteria.route)!;
  const RouteIcon = routeIcons[route.id];
  const subs = routeSubcategories[route.id];
  const sKey = subKey[route.id];
  const subValue = (criteria.filters[sKey] as string[]) ?? [];
  const o = (k: string) => ({ open: open === k, onOpenChange: (x: boolean) => setOpen(x ? k : null) });

  const groupText = route.usesProjectGroups
    ? criteria.groups.length ? criteria.groups.map((g) => projectGroups.find((x) => x.id === g)?.name).join("، ") : "همه گروه‌ها"
    : subs ? (subValue.length ? subValue.map((s) => subs.find((x) => x.id === s)?.name).join("، ") : "همه") : "—";

  return (
    <div className={cn("flex flex-col gap-1 rounded-[2rem] p-2 md:flex-row md:items-center md:rounded-full", compact ? "glass" : "glass-strong")}>
      <Segment {...o("route")} icon={<RouteIcon size={20} variant="Bulk" />} label="مسیر همکاری" value={route.name} wide>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {routes.map((r) => {
            const I = routeIcons[r.id]; const on = r.id === criteria.route;
            return (
              <button key={r.id} type="button" onClick={() => { setCriteria({ route: r.id, groups: [], amount: null, filters: {} }); setOpen(null); }}
                className={cn("flex items-center gap-3 rounded-2xl border p-3 text-right transition-all", on ? "border-primary bg-primary/[0.07]" : "border-transparent hover:bg-muted")}>
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", on ? "bg-primary text-white" : "bg-primary/10 text-primary")}><I size={18} variant="Bulk" /></span>
                <span className="text-[13px] font-bold leading-5 text-ink">{r.name}</span>
                {on && <TickCircle size={18} variant="Bold" className="mr-auto shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      </Segment>
      <span className="hidden h-8 w-px bg-border md:block" />
      {(route.usesProjectGroups || subs) && (
        <>
          <Segment {...o("group")} icon={<Category2 size={20} variant="Bulk" />} label={route.usesProjectGroups ? "گروه پروژه" : "دسته"} value={groupText} wide>
            <p className="mb-3 text-xs text-muted-foreground">چند مورد را می‌توانید با هم انتخاب کنید.</p>
            <div className="flex flex-wrap gap-2">
              {route.usesProjectGroups
                ? projectGroups.map((g) => { const I = groupIcons[g.id]; const on = criteria.groups.includes(g.id);
                    return <Chip key={g.id} active={on} onClick={() => setCriteria({ groups: on ? criteria.groups.filter((x) => x !== g.id) : [...criteria.groups, g.id] })}><I size={15} variant="Bulk" />{g.name}</Chip>; })
                : subs!.map((s) => { const on = subValue.includes(s.id);
                    return <Chip key={s.id} active={on} onClick={() => setFilter(sKey, on ? subValue.filter((x) => x !== s.id) : [...subValue, s.id])}>{s.name}</Chip>; })}
            </div>
          </Segment>
          <span className="hidden h-8 w-px bg-border md:block" />
        </>
      )}
      {route.id !== "fund" && (
        <>
          <Segment {...o("province")} icon={<Location size={20} variant="Bulk" />} label="استان" value={criteria.provinces.length ? criteria.provinces.join("، ") : "همه ایران"}>
            <ComboList options={provinces.map((p) => ({ value: p, label: p }))} value={criteria.provinces} onChange={(v) => setCriteria({ provinces: v })} placeholder="جست‌وجوی استان…" empty="استانی پیدا نشد" />
          </Segment>
          <span className="hidden h-8 w-px bg-border md:block" />
        </>
      )}
      {route.amount && (
        <Segment {...o("amount")} icon={<WalletMoney size={20} variant="Bulk" />} label={route.amount.label} value={criteria.amount ? `${faNumber(criteria.amount[0])} تا ${faNumber(criteria.amount[1])} ${route.amount.unit}` : "مبلغ را انتخاب کنید"}>
          <RangeField min={route.amount.min} max={route.amount.max} step={route.amount.step} unit={route.amount.unit} value={criteria.amount ?? undefined} onChange={(v) => setCriteria({ amount: v })} presets={amountPresets(route.amount.min, route.amount.max)} />
        </Segment>
      )}
      <button type="button" onClick={() => { setOpen(null); onSubmit?.(); router.push("/opportunities"); }}
        className="group flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 font-extrabold text-white shadow-[0_14px_30px_-12px_var(--primary)] transition-all hover:bg-deep md:h-[3.75rem]">
        {compact ? <SearchNormal1 size={20} /> : <><span>نمایش پروژه‌ها</span><ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" /></>}
      </button>
    </div>
  );
}
export { Routing2 };
