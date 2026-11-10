"use client";
// انتخاب محدوده روی نقشه نقطه‌ای ایران.
// نمای اول استان‌ها را نشان می‌دهد. با انتخاب فقط یک استان، نقشه روی همان استان زوم می‌کند تا شهرهایش انتخاب شوند.
// با بیش از یک استان، نقشه در نمای کل می‌ماند و شهرها از فهرست دومرحله‌ای (CityPicker) انتخاب می‌شوند.
import { useMemo, useState } from "react";
import { ArrowDown2, ArrowLeft, ArrowRight, Maximize4, TickCircle } from "@/components/iconsax";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { iranDots, iranPath, project } from "@/data/iran-map";
import { cityCoords } from "@/data/opportunities";
import { provinceCoords, provinces } from "@/data/provinces";
import { listings } from "@/lib/listings";
import { forRoute } from "@/lib/match";
import { useStore } from "@/lib/store";
import type { RouteId } from "@/types";
import { cn, faNumber } from "@/lib/utils";
import { ComboList } from "./controls";

const dotsPath = iranDots.map(([x, y]) => `M${x - 1.05} ${y}a1.05 1.05 0 1 0 2.1 0a1.05 1.05 0 1 0 -2.1 0`).join("");
const W = 360, H = 330, ZOOM = 3.4;

/** شهرهای دارای پروژه در هر استان برای یک مسیر */
export function useRouteGeo(route: RouteId) {
  return useMemo(() => {
    const counts: Record<string, number> = {}; const cities: Record<string, Record<string, number>> = {};
    for (const l of forRoute(listings, route)) if (l.city && l.province) {
      counts[l.province] = (counts[l.province] ?? 0) + 1;
      (cities[l.province] ??= {})[l.city] = (cities[l.province][l.city] ?? 0) + 1;
    }
    return { counts, cities };
  }, [route]);
}

/** انتخاب شهرها در فیلترها نگه داشته می‌شود؛ با حذف یک استان، شهرهایش هم حذف می‌شوند */
function useCities(route: RouteId) {
  const { criteria, setFilter } = useStore();
  const geo = useRouteGeo(route);
  const value = (criteria.filters.cities as string[] | undefined) ?? [];
  const set = (v: string[]) => setFilter("cities", v.length ? v : undefined);
  const prune = (provs: string[]) => { if (provs.length && value.length) set(value.filter((c) => provs.some((p) => geo.cities[p]?.[c]))); };
  return { ...geo, value, set, toggle: (c: string) => set(value.includes(c) ? value.filter((x) => x !== c) : [...value, c]), prune };
}

export function ProvincePicker({ route, value, onChange, className }: { route: RouteId; value: string[]; onChange: (v: string[]) => void; className?: string }) {
  const city = useCities(route);
  const [wide, setWide] = useState(false);
  const change = (v: string[]) => { setWide(false); city.prune(v); onChange(v); };
  const toggle = (p: string) => change(value.includes(p) ? value.filter((x) => x !== p) : [...value, p]);
  const focus = value.length === 1 && !wide ? value[0] : null;
  const max = Math.max(1, ...Object.values(city.counts));
  const nodes = useMemo(() => provinces.map((p) => ({ p, ...project(provinceCoords[p][0], provinceCoords[p][1]) })), []);
  const focusCities = focus ? Object.entries(city.cities[focus] ?? {}).filter(([c]) => cityCoords[c]).map(([c, n]) => ({ c, n, ...project(cityCoords[c][0], cityCoords[c][1]) })) : [];
  const fp = focus ? nodes.find((n) => n.p === focus)! : null;
  const cx = fp ? (fp.x + focusCities.reduce((s, c) => s + c.x, 0)) / (focusCities.length + 1) : W / 2;
  const cy = fp ? (fp.y + focusCities.reduce((s, c) => s + c.y, 0)) / (focusCities.length + 1) : H / 2;
  const k = focus ? ZOOM : 1;
  const options = useMemo(() => [...provinces].sort((a, b) => (city.counts[b] ?? 0) - (city.counts[a] ?? 0)).map((p) => ({ value: p, label: city.counts[p] ? `${p} (${faNumber(city.counts[p])})` : p })), [city.counts]);

  return (
    <div className={cn("grid grid-cols-[1.25fr_1fr] items-center gap-5", className)}>
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-white">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="نقشه ایران برای انتخاب استان و شهر">
          <g style={{ transform: `translate(${W / 2 - cx * k}px, ${H / 2 - cy * k}px) scale(${k})`, transformOrigin: "0 0", transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)" }}>
            <path d={iranPath} className="fill-primary/[0.03] stroke-ink/15" strokeWidth={0.6 / k} />
            <path d={dotsPath} className={cn("transition-opacity duration-700", focus ? "fill-ink/[0.07]" : "fill-ink/[0.13]")} />
            {nodes.map((n) => {
              const on = value.includes(n.p), count = city.counts[n.p] ?? 0;
              const r = count ? 2.6 + (count / max) * 2.6 : 1.9;
              if (focus) return n.p === focus ? null : <circle key={n.p} cx={n.x} cy={n.y} r={1.2} className="fill-ink/25" />;
              const label = on || (count > 0 && !nodes.some((q) => q !== n && (city.counts[q.p] ?? 0) > count && Math.hypot(q.x - n.x, q.y - n.y) < 20));
              return (
                <g key={n.p} onClick={() => toggle(n.p)} className="group cursor-pointer" role="button" aria-pressed={on} aria-label={`استان ${n.p}${count ? `، ${count} پروژه` : ""}`}>
                  <title>{n.p}{count ? ` (${faNumber(count)} پروژه)` : ""}</title>
                  {on && <circle cx={n.x} cy={n.y} r={r + 4.5} className="fill-primary/15 stroke-primary" strokeWidth="0.8" />}
                  <circle cx={n.x} cy={n.y} r={r} className={cn("transition-colors group-hover:fill-primary", on ? "fill-primary" : count ? "fill-ink/50" : "fill-ink/25")} />
                  <circle cx={n.x} cy={n.y} r={r + 6} fill="transparent" />
                  {label && <text x={n.x} y={n.y - r - 4} textAnchor="middle" className={cn("pointer-events-none text-[8px] font-bold", on ? "fill-primary" : "fill-ink/70")}>{n.p}</text>}
                </g>
              );
            })}
            {focusCities.map((c) => {
              const on = city.value.includes(c.c);
              return (
                <g key={c.c} onClick={() => city.toggle(c.c)} className="group cursor-pointer" role="button" aria-pressed={on} aria-label={`${c.c}، ${c.n} پروژه`}>
                  {on && <circle cx={c.x} cy={c.y} r={10 / k} className="fill-primary/15 stroke-primary" strokeWidth={1 / k} />}
                  <circle cx={c.x} cy={c.y} r={5.5 / k} className={cn("transition-colors group-hover:fill-primary", on ? "fill-primary" : "fill-ink/55")} />
                  <circle cx={c.x} cy={c.y} r={16 / k} fill="transparent" />
                  <text x={c.x} y={c.y - 14 / k} textAnchor="middle" style={{ fontSize: 11 / k }} className={cn("pointer-events-none font-extrabold", on ? "fill-primary" : "fill-ink/80")}>{c.c} · {faNumber(c.n)}</text>
                </g>
              );
            })}
          </g>
        </svg>
        {focus && (
          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-deep px-3.5 py-1.5 text-xs font-extrabold text-white">{focusCities.length ? `شهرهای استان ${focus}` : `در استان ${focus} هنوز پروژه‌ای نیست`}</span>
            <Button type="button" variant="outline" size="xs" onClick={() => setWide(true)} className="rounded-full bg-white font-bold"><Maximize4 size={14} />نقشه کل ایران</Button>
          </div>
        )}
        {!focus && value.length === 1 && (
          <Button type="button" variant="outline" size="xs" onClick={() => setWide(false)} className="absolute left-3 top-3 rounded-full bg-white font-bold">شهرهای {value[0]}<ArrowLeft size={14} /></Button>
        )}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <ComboList options={options} value={value} onChange={change} placeholder="جست‌وجوی استان…" empty="استانی پیدا نشد" />
      </div>
    </div>
  );
}

/** انتخاب شهر: اگر چند استان انتخاب شده باشد، اول استان و بعد شهرهای همان استان */
export function CityPicker({ route, provinces: selected }: { route: RouteId; provinces: string[] }) {
  const city = useCities(route);
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<string | null>(null);
  const provs = (selected.length ? selected : Object.keys(city.cities)).filter((p) => city.cities[p]);
  const current = provs.length === 1 ? provs[0] : level && provs.includes(level) ? level : null;
  const optionsOf = (p: string) => Object.entries(city.cities[p] ?? {}).map(([c, n]) => ({ value: c, label: `${c} (${faNumber(n)})` }));
  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setLevel(null); }}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open} className="h-auto min-h-11 w-full justify-between gap-2 whitespace-normal rounded-2xl bg-white px-3.5 py-2 text-right font-normal shadow-none">
          <span className={cn("flex flex-wrap gap-1.5", !city.value.length && "text-muted-foreground")}>
            {city.value.length ? city.value.map((v) => <Badge key={v} variant="secondary" className="bg-primary/10 px-2.5 font-bold text-primary">{v}</Badge>) : "انتخاب کنید"}
          </span>
          <ArrowDown2 size={16} className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-64 rounded-2xl p-0">
        {!provs.length ? <p className="p-4 text-[13px] font-semibold text-muted-foreground">در استان‌های انتخاب‌شده شهری با پروژه نیست.</p>
          : current ? (
            <div>
              {provs.length > 1 && (
                <Button type="button" variant="ghost" onClick={() => setLevel(null)} className="h-11 w-full justify-start gap-2 rounded-none border-b border-border px-3.5 text-[13px] font-extrabold text-ink"><ArrowRight size={16} />{current}<span className="mr-auto text-xs font-semibold text-muted-foreground">بازگشت به استان‌ها</span></Button>
              )}
              <ComboList options={optionsOf(current)} value={city.value} onChange={city.set} placeholder={`جست‌وجوی شهر در ${current}…`} empty="شهری پیدا نشد" />
            </div>
          ) : (
            <div className="thin-scroll max-h-72 overflow-y-auto p-1.5">
              <p className="px-2.5 pb-1.5 pt-1 text-xs font-semibold text-muted-foreground">اول استان را انتخاب کنید</p>
              {provs.map((p) => { const n = city.value.filter((c) => city.cities[p][c]).length;
                return (
                  <Button key={p} type="button" variant="ghost" onClick={() => setLevel(p)} className="h-10 w-full justify-between rounded-xl px-2.5 text-[13px] font-bold text-ink">
                    <span className="flex items-center gap-2">{p}{n > 0 && <span className="flex items-center gap-1 text-xs font-bold text-primary"><TickCircle size={14} variant="Bold" />{faNumber(n)} شهر</span>}</span>
                    <ArrowLeft size={15} className="text-muted-foreground" />
                  </Button>
                ); })}
            </div>
          )}
      </PopoverContent>
    </Popover>
  );
}
