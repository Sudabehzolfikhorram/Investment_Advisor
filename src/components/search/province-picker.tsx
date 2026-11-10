"use client";
// انتخاب محدوده روی نقشه ایران با مرز استان‌ها.
// نمای اول استان‌ها را نشان می‌دهد. با انتخاب فقط یک استان، نقشه روی همان استان زوم می‌کند تا شهرهایش انتخاب شوند.
// با بیش از یک استان، نقشه در نمای کل می‌ماند و شهرها از فهرست دومرحله‌ای (CityPicker) انتخاب می‌شوند.
import { useEffect, useMemo, useState } from "react";
import { ArrowDown2, ArrowLeft, ArrowRight, Maximize4, TickCircle } from "@/components/iconsax";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { provinceBox, provincePaths } from "@/data/iran-map";
import { provincePhotos } from "@/data/province-photos";
import { loadCounties, useCounties } from "@/lib/use-counties";
import { provinces } from "@/data/provinces";
import { withBase } from "@/lib/image-loader";
import { listings } from "@/lib/listings";
import { forRoute } from "@/lib/match";
import { useStore } from "@/lib/store";
import type { RouteId } from "@/types";
import { cn, faNumber } from "@/lib/utils";
import { ComboList } from "./controls";

const W = 360, H = 330;

/** شهرهای دارای پروژه در هر استان برای یک مسیر */
export function useRouteGeo(route: RouteId) {
  return useMemo(() => {
    const counts: Record<string, number> = {}; const cities: Record<string, Record<string, number>> = {}; const photo: Record<string, string> = {};
    for (const l of forRoute(listings, route)) if (l.city && l.province) {
      counts[l.province] = (counts[l.province] ?? 0) + 1; photo[l.province] ??= l.image;
      (cities[l.province] ??= {})[l.city] = (cities[l.province][l.city] ?? 0) + 1;
    }
    return { counts, cities, photo };
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
  const [hover, setHover] = useState<string | null>(null);
  const inRoute = focus ? city.cities[focus] ?? {} : {};
  const focusCounties = useCounties(focus);
  // زوم: استان انتخاب‌شده تقریباً همه قاب نقشه را پر می‌کند
  const box = focus ? provinceBox[focus] : null;
  const k = box ? Math.min(16, 0.86 * Math.min(W / (box[2] - box[0]), (H - 44) / (box[3] - box[1]))) : 1;
  const cx = box ? (box[0] + box[2]) / 2 : W / 2, cy = box ? (box[1] + box[3]) / 2 - 22 / k : H / 2;
  const options = useMemo(() => [...provinces].sort((a, b) => (city.counts[b] ?? 0) - (city.counts[a] ?? 0)).map((p) => ({ value: p, label: city.counts[p] ? `${p} (${faNumber(city.counts[p])})` : p })), [city.counts]);
  const tip = hover && !focus ? hover : null;
  // عکس استان‌ها و مرز شهرستان‌ها از قبل بارگذاری می‌شوند تا هنگام انتخاب یا هاور مکثی نباشد
  useEffect(() => {
    const t = window.setTimeout(() => { for (const p of Object.values(provincePhotos)) { const i = new window.Image(); i.src = withBase(p.src); } loadCounties(); }, 300);
    return () => window.clearTimeout(t);
  }, []);
  const hasCities = focusCounties.some((c) => c.cities.some((x) => inRoute[x]));

  return (
    <div className={cn("grid grid-cols-[1.25fr_1fr] items-center gap-5", className)}>
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-white">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="نقشه ایران برای انتخاب استان و شهر" onMouseLeave={() => setHover(null)}>
          <g style={{ transform: `translate(${W / 2 - cx * k}px, ${H / 2 - cy * k}px) scale(${k})`, transformOrigin: "0 0", transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)" }}>
            {provinces.map((p) => {
              const on = value.includes(p), count = city.counts[p] ?? 0, dim = !!focus && p !== focus;
              return (
                <path key={p} d={provincePaths[p]} role="button" aria-pressed={on} aria-label={`استان ${p}${count ? `، ${count} پروژه` : ""}`}
                  onClick={() => !focus && toggle(p)} onMouseEnter={() => setHover(p)}
                  strokeWidth={(on ? 1.1 : 0.55) / k} strokeLinejoin="round"
                  className={cn("transition-[fill,stroke,opacity] duration-500", !focus && "cursor-pointer", on ? (focus ? "fill-primary/10 stroke-primary" : "fill-primary/15 stroke-primary") : dim ? "pointer-events-none fill-muted/60 stroke-ink/15 opacity-0" : count ? "fill-white stroke-ink/30 hover:fill-primary/10 hover:stroke-primary" : "fill-white stroke-ink/30 hover:fill-primary/10 hover:stroke-primary")} />
              );
            })}
            {/* استان انتخاب‌شده یا زیر نشانگر با عکس شاخص همان استان پر می‌شود */}
            {!focus && [...new Set([...value, ...(hover ? [hover] : [])])].filter((p) => provincePhotos[p]).map((p) => { const b = provinceBox[p]; const id = `clip-${(provinces as readonly string[]).indexOf(p)}`;
              return (
                <g key={p} className="pointer-events-none" style={{ animation: "fade-in 0.35s ease-out both" }}>
                  <clipPath id={id}><path d={provincePaths[p]} /></clipPath>
                  <image href={withBase(provincePhotos[p].src)} x={b[0]} y={b[1]} width={b[2] - b[0]} height={b[3] - b[1]} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id})`} />
                </g>
              ); })}
            {value.map((p) => <path key={p} d={provincePaths[p]} fill="none" strokeWidth={1.2 / k} strokeLinejoin="round" className="pointer-events-none stroke-primary" />)}
            {!focus && provinces.filter((p) => value.includes(p) || (city.counts[p] ?? 0) > 0).map((p) => { const b = provinceBox[p]; const on = value.includes(p);
              return (b[2] - b[0] > 16 || on) && <text key={p} x={(b[0] + b[2]) / 2} y={(b[1] + b[3]) / 2 + 2} textAnchor="middle" strokeWidth="2.2" strokeLinejoin="round" className={cn("pointer-events-none text-[6.5px] font-extrabold [paint-order:stroke] stroke-white", on ? "fill-primary" : "fill-ink/70")}>{p}</text>; })}
            {/* نمای استان: شهرستان‌ها با خط از هم جدا شده‌اند؛ شهرهای دارای پروژه قابل انتخاب‌اند */}
            {focus && focusCounties.length > 0 && (
              <g style={{ animation: "fade-in 0.5s 0.35s ease-out both" }}>
                <clipPath id="clip-focus"><path d={provincePaths[focus]} /></clipPath>
                <g clipPath="url(#clip-focus)">
                  {focusCounties.map((c, i) => {
                    const names = c.cities.filter((x) => inRoute[x]); const on = names.some((x) => city.value.includes(x));
                    return names.length ? (
                      <path key={i} d={c.d} role="button" aria-pressed={on} aria-label={names.join("، ")} strokeWidth={(on ? 1.6 : 0.9) / k} strokeLinejoin="round"
                        onClick={() => city.set(on ? city.value.filter((x) => !names.includes(x)) : [...city.value, ...names.filter((x) => !city.value.includes(x))])}
                        className={cn("cursor-pointer transition-colors duration-300", on ? "fill-primary/45 stroke-primary" : "fill-white stroke-primary/60 hover:fill-primary/25")} />
                    ) : <path key={i} d={c.d} strokeWidth={0.7 / k} strokeLinejoin="round" className="fill-primary/[0.07] stroke-primary/35" />;
                  })}
                </g>
                <path d={provincePaths[focus]} fill="none" strokeWidth={1.6 / k} strokeLinejoin="round" className="pointer-events-none stroke-primary" />
                {focusCounties.map((c, i) => { const names = c.cities.filter((x) => inRoute[x]); if (!names.length) return null; const on = names.some((x) => city.value.includes(x));
                  return <text key={i} x={c.c[0]} y={c.c[1] + 3 / k} textAnchor="middle" style={{ fontSize: 9.5 / k }} strokeWidth={2.6 / k} strokeLinejoin="round" className={cn("pointer-events-none font-extrabold [paint-order:stroke] stroke-white", on ? "fill-deep" : "fill-ink")}>{names.map((x) => `${x} (${faNumber(inRoute[x])})`).join("، ")}</text>; })}
              </g>
            )}
          </g>
        </svg>
        {tip && (
          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2.5 rounded-2xl bg-ink p-1.5 pl-4 text-white shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {provincePhotos[tip] && <img src={withBase(provincePhotos[tip].src)} alt="" className="size-11 rounded-xl object-cover" />}
            <span className={cn("text-xs font-extrabold leading-5", !provincePhotos[tip] && "py-1.5 pr-2.5")}>{tip}<span className="block text-[11px] font-semibold text-white/65">{provincePhotos[tip] ? `${provincePhotos[tip].place} · ` : ""}{city.counts[tip] ? `${faNumber(city.counts[tip])} پروژه` : "بدون پروژه در این مسیر"}</span></span>
          </span>
        )}
        {focus && (
          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-deep px-3.5 py-1.5 text-xs font-extrabold text-white">{hasCities || !focusCounties.length ? `شهرهای استان ${focus}` : `در استان ${focus} در این مسیر پروژه‌ای نیست`}</span>
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
