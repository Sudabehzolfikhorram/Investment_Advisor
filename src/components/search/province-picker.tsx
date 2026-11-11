"use client";
// انتخاب محدوده روی نقشه ایران با مرز استان‌ها.
// یک یا چند استان انتخاب می‌شود؛ کنار نقشه کارت هر استان با همه شهرهایش می‌آید (شهرهای دارای پروژه اول، با تعداد)
// و با «روی نقشه» همان استان زوم می‌شود تا شهرها روی مرز شهرستان‌ها هم انتخاب شوند.
import { useEffect, useMemo, useState } from "react";
import { Add, ArrowDown2, ArrowLeft, ArrowRight, CloseCircle, Map1, Maximize4, TickCircle } from "@/components/iconsax";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { provinceArea, provinceBox, provinceLabel, provincePaths } from "@/data/iran-map";
import { provincePhotos } from "@/data/province-photos";
import { countiesOf, loadCounties, useCounties } from "@/lib/use-counties";
import { provinces } from "@/data/provinces";
import { withBase } from "@/lib/image-loader";
import { listings } from "@/lib/listings";
import { forRoute } from "@/lib/match";
import { useStore } from "@/lib/store";
import type { RouteId } from "@/types";
import { cn, faNumber } from "@/lib/utils";
import { Chip, ComboList, MultiCombobox, type ComboOption } from "./controls";

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
  // شهری می‌ماند که در یکی از استان‌های انتخاب‌شده باشد (شهر دارای پروژه یا هر شهرستان آن استان)
  const prune = (provs: string[]) => { if (value.length) set(value.filter((c) => provs.some((p) => geo.cities[p]?.[c] || countiesOf(p).some((k) => k.name === c || k.cities.includes(c))))); };
  return { ...geo, value, set, toggle: (c: string) => set(value.includes(c) ? value.filter((x) => x !== c) : [...value, c]), prune };
}

export function ProvincePicker({ route, value, onChange, className }: { route: RouteId; value: string[]; onChange: (v: string[]) => void; className?: string }) {
  const city = useCities(route);
  const [zoom, setZoom] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const multi = value.length > 0;
  const change = (v: string[]) => { v.forEach((p) => loadCounties(p)); city.prune(v); onChange(v); if (!v.length) setAdding(false); };
  const toggle = (p: string) => change(value.includes(p) ? value.filter((x) => x !== p) : [...value, p]);
  const focus = zoom && value.includes(zoom) ? zoom : null;
  const zoomTo = (p: string | null) => { setZoom(p); if (p) loadCounties(p); };
  const [hover, setHover] = useState<string | null>(null);
  const inRoute = focus ? city.cities[focus] ?? {} : {};
  const { counties: focusCounties, outline } = useCounties(focus);
  const focusPath = focus ? outline || provincePaths[focus] : "";
  // زوم: استان انتخاب‌شده تقریباً همه قاب نقشه را پر می‌کند
  const box = focus ? provinceBox[focus] : null;
  const k = box ? Math.min(16, 0.86 * Math.min(W / (box[2] - box[0]), (H - 44) / (box[3] - box[1]))) : 1;
  const cx = box ? (box[0] + box[2]) / 2 : W / 2, cy = box ? (box[1] + box[3]) / 2 - 22 / k : H / 2;
  const options = useMemo(() => [...provinces].sort((a, b) => (city.counts[b] ?? 0) - (city.counts[a] ?? 0)).map((p) => ({ value: p, label: city.counts[p] ? `${p} (${faNumber(city.counts[p])})` : p })), [city.counts]);
  const tip = hover && !focus ? hover : null;
  // عکس استان‌ها و مرز شهرستان‌ها از قبل بارگذاری می‌شوند تا هنگام انتخاب یا هاور مکثی نباشد
  useEffect(() => {
    const t = window.setTimeout(() => { for (const p of Object.values(provincePhotos)) { const i = new window.Image(); i.src = withBase(p.src); } for (const p of value) loadCounties(p); }, 300);
    return () => window.clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("grid grid-cols-[1.25fr_1fr] items-stretch gap-5", className)}>
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-white">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="نقشه ایران برای انتخاب استان و شهر" onMouseLeave={() => setHover(null)}>
          <g style={{ transform: `translate(${W / 2 - cx * k}px, ${H / 2 - cy * k}px) scale(${k})`, transformOrigin: "0 0", transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)" }}>
            {provinces.map((p) => {
              const on = value.includes(p), count = city.counts[p] ?? 0, dim = !!focus && p !== focus;
              return (
                <path key={p} d={provincePaths[p]} role="button" aria-pressed={on} aria-label={`استان ${p}${count ? `، ${count} پروژه` : ""}`}
                  onClick={() => !focus && toggle(p)} onMouseEnter={() => { setHover(p); loadCounties(p); }}
                  strokeWidth={(on ? 1.1 : 0.55) / k} strokeLinejoin="round"
                  className={cn("transition-[fill,stroke,opacity] duration-500", !focus && "cursor-pointer", on && !dim ? (focus ? "fill-primary/10 stroke-primary" : "fill-primary/15 stroke-primary") : dim ? "pointer-events-none fill-muted/60 stroke-ink/15 opacity-0" : count ? "fill-white stroke-ink/30 hover:fill-primary/10 hover:stroke-primary" : "fill-white stroke-ink/30 hover:fill-primary/10 hover:stroke-primary")} />
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
            {(focus ? [focus] : value).map((p) => <path key={p} d={provincePaths[p]} fill="none" strokeWidth={1.2 / k} strokeLinejoin="round" className="pointer-events-none stroke-primary" />)}
            {/* نام همه استان‌ها؛ اندازه نام با وسعت استان تنظیم می‌شود */}
            {!focus && provinces.map((p) => { const [x, y] = provinceLabel[p]; const on = value.includes(p); const fs = Math.max(3.6, Math.min(6.2, Math.sqrt(provinceArea[p]) * 0.2));
              return <text key={p} x={x} y={y + fs * 0.35} textAnchor="middle" style={{ fontSize: fs }} strokeWidth={fs * 0.32} strokeLinejoin="round" className={cn("pointer-events-none font-extrabold [paint-order:stroke] stroke-white", on ? "fill-deep" : "fill-ink/75")}>{p}</text>; })}
            {/* نمای استان: همه شهرستان‌ها با خط و نام؛ شهرستان‌هایی که پروژه دارند قابل انتخاب‌اند */}
            {focus && focusCounties.length > 0 && (
              <g style={{ animation: "fade-in 0.5s 0.35s ease-out both" }}>
                <clipPath id="clip-focus"><path d={focusPath} /></clipPath>
                <path d={focusPath} strokeWidth={0} className="fill-white" />
                <g clipPath="url(#clip-focus)">
                  {focusCounties.map((c) => {
                    const live = c.cities.some((x) => inRoute[x]); const names = [...new Set([c.name, ...c.cities])]; const on = names.some((x) => city.value.includes(x));
                    return (
                      <path key={c.name} d={c.d} role="button" aria-pressed={on} aria-label={`شهرستان ${c.name}`} strokeWidth={(on ? 1.6 : live ? 1 : 0.6) / k} strokeLinejoin="round"
                        onClick={() => city.set(on ? city.value.filter((x) => !names.includes(x)) : [...city.value, ...names.filter((x) => !city.value.includes(x))])}
                        className={cn("cursor-pointer transition-colors duration-300", on ? "fill-primary/40 stroke-primary" : live ? "fill-primary/[0.12] stroke-primary hover:fill-primary/25" : "fill-white stroke-ink/25 hover:fill-primary/10")} />
                    );
                  })}
                </g>
                <path d={focusPath} fill="none" strokeWidth={1.6 / k} strokeLinejoin="round" className="pointer-events-none stroke-primary" />
                {focusCounties.map((c) => { const names = c.cities.filter((x) => inRoute[x]); const on = [c.name, ...c.cities].some((x) => city.value.includes(x));
                  const px = Math.sqrt(c.a) * k; const fs = names.length ? Math.max(8, Math.min(11, px * 0.22)) : Math.max(5.5, Math.min(8.5, px * 0.2));
                  return <text key={c.name} x={c.c[0]} y={c.c[1] + (fs * 0.35) / k} textAnchor="middle" style={{ fontSize: fs / k }} strokeWidth={(fs * 0.3) / k} strokeLinejoin="round"
                    className={cn("pointer-events-none [paint-order:stroke] stroke-white", on ? "fill-deep font-black" : names.length ? "fill-ink font-extrabold" : "fill-ink/60 font-semibold")}>{names.length ? `${c.name} (${faNumber(names.reduce((n, x) => n + inRoute[x], 0))})` : c.name}</text>; })}
              </g>
            )}
          </g>
        </svg>
        {tip && (
          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2.5 rounded-2xl bg-pine p-1.5 pl-4 text-white shadow-[0_10px_24px_-10px_rgb(8_59_55/0.7)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {provincePhotos[tip] && <img src={withBase(provincePhotos[tip].src)} alt="" className="size-11 rounded-xl object-cover" />}
            <span className={cn("text-xs font-extrabold leading-5", !provincePhotos[tip] && "py-1.5 pr-2.5")}>{tip}<span className="block text-[11px] font-semibold text-white/85">{provincePhotos[tip]?.place}<span className="block text-white">{city.counts[tip] ? `${faNumber(city.counts[tip])} پروژه` : "بدون پروژه در این مسیر"}</span></span></span>
          </span>
        )}
        {multi && (
          <div className="absolute inset-x-3 top-3 flex flex-wrap items-center gap-1.5">
            <Button type="button" variant="outline" size="xs" onClick={() => zoomTo(null)} className={cn("rounded-full bg-white font-bold", !focus && "border-pine bg-pine text-white hover:bg-pine hover:text-white")}><Maximize4 size={14} />کل ایران</Button>
            {value.map((p) => <Button key={p} type="button" variant="outline" size="xs" onClick={() => zoomTo(p)} className={cn("rounded-full bg-white font-bold", focus === p && "border-primary bg-primary text-white hover:bg-primary hover:text-white")}>{focus === p ? `شهرهای ${p}` : p}</Button>)}
          </div>
        )}
      </div>
      <div className="relative min-h-80">
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-border bg-white">
          {multi && !adding ? (
            <>
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
                <span className="text-[13px] font-extrabold text-ink">{faNumber(value.length)} استان انتخاب شده</span>
                <Button type="button" variant="ghost" size="xs" onClick={() => setAdding(true)} className="font-bold text-primary hover:text-primary"><Add size={15} />افزودن استان</Button>
              </div>
              <div className="thin-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3 [overflow-anchor:none]">
                {value.map((p) => <ProvinceCities key={p} province={p} active={focus === p} city={city} onZoom={() => zoomTo(p)} onRemove={() => change(value.filter((x) => x !== p))} />)}
              </div>
            </>
          ) : (
            <>
              {multi && (
                <Button type="button" variant="ghost" onClick={() => setAdding(false)} className="h-11 w-full shrink-0 justify-start gap-2 rounded-none border-b border-border px-4 text-[13px] font-extrabold text-ink"><ArrowRight size={16} />بازگشت به شهرهای {value.length > 1 ? "استان‌ها" : value[0]}</Button>
              )}
              <ComboList options={options} value={value} onChange={change} placeholder="جست‌وجوی استان…" empty="استانی پیدا نشد" className="min-h-0 flex-1 [&_[data-slot=command-list]]:max-h-none" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** کارت یک استان در حالت چندانتخابی: عکس شاخص، تعداد پروژه و شهرهای دارای پروژه */
function ProvinceCities({ province: p, active, city, onZoom, onRemove }: { province: string; active: boolean; city: ReturnType<typeof useCities>; onZoom: () => void; onRemove: () => void }) {
  const { counties } = useCounties(p);
  const [all, setAll] = useState(false);
  const inRoute = city.cities[p] ?? {};
  // هر شهرستان یک گزینه است (به نام شهر مرکزش)؛ شهرهای دارای پروژه اول و با تعداد. اگر مرزها هنوز نیامده، شهرهای دارای پروژه
  const list = (counties.length
    ? counties.map((c) => ({ name: c.name, names: [...new Set([c.name, ...c.cities])], n: c.cities.reduce((s, x) => s + (inRoute[x] ?? 0), 0) }))
    : Object.entries(inRoute).map(([c, n]) => ({ name: c, names: [c], n }))).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, "fa"));
  const names = list.flatMap((x) => x.names);
  const picked = city.value.filter((c) => names.includes(c));
  const isOn = (x: { names: string[] }) => x.names.some((c) => city.value.includes(c));
  const LIMIT = 10;
  const shown = all ? list : list.filter((x, i) => i < LIMIT || isOn(x));
  const pickedCount = list.filter(isOn).length;
  const photo = provincePhotos[p];
  return (
    <div className={cn("rounded-2xl border p-3 transition-colors duration-300", active ? "border-primary bg-primary/[0.04]" : "border-border bg-white")}>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photo ? <img src={withBase(photo.src)} alt="" className="size-11 shrink-0 rounded-xl object-cover" /> : <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-ink/50"><Map1 size={18} variant="Bulk" /></span>}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-ink">{p}</span>
          <span className="block text-xs font-semibold text-muted-foreground">{city.counts[p] ? `${faNumber(city.counts[p])} پروژه` : "بدون پروژه در این مسیر"}{pickedCount > 0 && <span className="text-primary">، {faNumber(pickedCount)} شهر انتخاب شده</span>}</span>
        </span>
        {list.length > 0 && <Button type="button" variant="outline" size="xs" onClick={onZoom} className={cn("rounded-full bg-white font-bold", active && "border-primary text-primary")}><Map1 size={14} />روی نقشه</Button>}
        <Button type="button" variant="plain" size="auto" aria-label={`حذف ${p}`} onClick={onRemove} className="grid size-7 place-items-center rounded-full text-ink/40 hover:bg-destructive/10 hover:text-destructive"><CloseCircle size={18} variant="Bold" /></Button>
      </div>
      {list.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip active={!picked.length} onClick={() => city.set(city.value.filter((c) => !names.includes(c)))} className="px-3 py-1 text-xs">همه شهرها</Chip>
          {shown.map((x) => <Chip key={x.name} active={isOn(x)} onClick={() => city.set(isOn(x) ? city.value.filter((c) => !x.names.includes(c)) : [...city.value, ...x.names.filter((c) => !city.value.includes(c))])} className="px-3 py-1 text-xs">{x.name}{x.n > 0 && <span className="opacity-70"> ({faNumber(x.n)})</span>}</Chip>)}
          {list.length > shown.length && <Button type="button" variant="ghost" size="xs" onClick={() => setAll(true)} className="h-7 rounded-full px-3 text-xs font-extrabold text-primary hover:text-primary">{faNumber(list.length - shown.length)} شهر دیگر<ArrowDown2 size={13} /></Button>}
          {all && list.length > LIMIT && <Button type="button" variant="ghost" size="xs" onClick={() => setAll(false)} className="h-7 rounded-full px-3 text-xs font-bold text-muted-foreground">کمتر</Button>}
        </div>
      )}
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

/** محدوده بدون نقشه: دو فیلد چندانتخابی؛ استان‌ها و بعد شهرهای همان استان‌ها (همه شهرها، دارای پروژه اول و با تعداد) */
export function LocationFields({ route, value, onChange }: { route: RouteId; value: string[]; onChange: (v: string[]) => void }) {
  const city = useCities(route);
  const [, tick] = useState(0);
  useEffect(() => { let live = true; Promise.all(value.map((p) => loadCounties(p))).then(() => live && tick((n) => n + 1)); return () => { live = false; }; }, [value]);
  const provOptions = useMemo(() => [...provinces].sort((a, b) => (city.counts[b] ?? 0) - (city.counts[a] ?? 0)).map((p) => ({ value: p, label: city.counts[p] ? `${p} (${faNumber(city.counts[p])})` : p, short: p })), [city.counts]);
  const items = value.flatMap((p) => {
    const inRoute = city.cities[p] ?? {};
    const cs = countiesOf(p);
    const list = cs.length ? cs.map((c) => ({ name: c.name, names: [...new Set([c.name, ...c.cities])], n: c.cities.reduce((s, x) => s + (inRoute[x] ?? 0), 0) }))
      : Object.entries(inRoute).map(([c, n]) => ({ name: c, names: [c], n }));
    return list.sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, "fa")).map((x) => ({ ...x, key: `${p}/${x.name}`, group: p }));
  });
  const cityOptions: ComboOption[] = items.map((x) => ({ value: x.key, label: x.n ? `${x.name} (${faNumber(x.n)})` : x.name, short: x.name, group: x.group }));
  const cityValue = items.filter((x) => x.names.some((c) => city.value.includes(c))).map((x) => x.key);
  const setCities = (keys: string[]) => {
    const own = new Set(items.flatMap((x) => x.names));
    const keep = city.value.filter((c) => !own.has(c));
    city.set([...new Set([...keep, ...items.filter((x) => keys.includes(x.key)).flatMap((x) => x.names)])]);
  };
  const change = (v: string[]) => { v.forEach((p) => loadCounties(p)); city.prune(v); onChange(v); };
  return (
    <div className="space-y-5">
      <label className="block space-y-2">
        <span className="text-[13px] font-bold text-ink">استان</span>
        <MultiCombobox label="استان" options={provOptions} value={value} onChange={change} placeholder="همه ایران" search="جست‌وجوی استان…" empty="استانی پیدا نشد" />
      </label>
      <div className="space-y-2">
        <span className="block text-[13px] font-bold text-ink">شهر</span>
        <MultiCombobox label="شهر" options={cityOptions} value={cityValue} onChange={setCities} disabled={!value.length} placeholder={value.length ? "همه شهرها" : "هنوز گزینه‌ای ندارد"} search="جست‌وجوی شهر…" empty="شهری پیدا نشد" />
        {!value.length && <small className="block text-xs font-semibold text-primary">ابتدا «استان» را انتخاب کنید.</small>}
      </div>
    </div>
  );
}
