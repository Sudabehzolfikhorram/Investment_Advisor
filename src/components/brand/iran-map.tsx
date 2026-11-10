"use client";
import { memo } from "react";
import { iranDots, iranPath, project } from "@/data/iran-map";
import { cityCoords } from "@/data/opportunities";
import { provinceCoords } from "@/data/provinces";
import { cn, faNumber } from "@/lib/utils";

export interface MapPoint { city: string; province: string; count: number }

// همه نقطه‌های نقشه در یک path رسم می‌شوند (به‌جای حدود هزار دایره جدا) تا رندر سبک بماند.
const dotsPath = iranDots.map(([x, y]) => `M${x - 1.05} ${y}a1.05 1.05 0 1 0 2.1 0a1.05 1.05 0 1 0 -2.1 0`).join("");

export const cityXY = (city: string) => (cityCoords[city] ? project(cityCoords[city][0], cityCoords[city][1]) : null);

/** نقشه نقطه‌ای ایران با نود شهرها. با onToggle انتخاب‌گر استان می‌شود. */
export const IranMap = memo(function IranMap({
  points, active = [], onToggle, className, labels = true, links = true, pulse = true, children,
}: { points: MapPoint[]; active?: string[]; onToggle?: (province: string) => void; className?: string; labels?: boolean; links?: boolean; pulse?: boolean; children?: React.ReactNode }) {
  const pts = points.filter((p) => cityCoords[p.city]).map((p) => ({ ...p, ...project(cityCoords[p.city][0], cityCoords[p.city][1]) }));
  const hub = pts.find((p) => p.city === "تهران") ?? pts[0];
  const max = Math.max(1, ...pts.map((p) => p.count));
  return (
    <svg viewBox="0 0 360 330" className={cn("h-auto w-full overflow-visible", className)} role="img" aria-label="نقشه ایران و شهرهای دارای پروژه">
      <path d={iranPath} className="fill-primary/[0.025] stroke-ink/10" strokeWidth="0.6" />
      <path d={dotsPath} className="fill-ink/[0.13]" />
      {links && hub && pts.length > 1 && (
        <g fill="none" className="stroke-primary/25" strokeWidth="0.6">
          {pts.filter((p) => p !== hub).map((p) => {
            const mx = (p.x + hub.x) / 2, my = (p.y + hub.y) / 2 - Math.abs(p.x - hub.x) * 0.18;
            return <path key={p.city} d={`M${hub.x} ${hub.y}Q${mx} ${my} ${p.x} ${p.y}`} />;
          })}
        </g>
      )}
      {pts.map((p, i) => {
        const on = active.includes(p.province);
        const r = 2.4 + (p.count / max) * 3;
        return (
          <g key={p.city} onClick={onToggle ? () => onToggle(p.province) : undefined} className={cn(onToggle && "cursor-pointer")} role={onToggle ? "button" : undefined} aria-pressed={onToggle ? on : undefined} aria-label={`${p.province}، ${p.city}، ${p.count} پروژه`}>
            {pulse && i % 3 === 0 && <circle cx={p.x} cy={p.y} r={r} className="fill-primary" style={{ transformOrigin: `${p.x}px ${p.y}px`, animation: "pulse-node 3.2s ease-out infinite", animationDelay: `${(i % 5) * 0.6}s` }} />}
            {on && <circle cx={p.x} cy={p.y} r={r + 5} className="fill-primary/15 stroke-primary" strokeWidth="0.8" />}
            <circle cx={p.x} cy={p.y} r={r} className={cn("transition-colors", on ? "fill-primary" : onToggle ? "fill-ink/45 hover:fill-primary" : "fill-primary")} />
            <circle cx={p.x} cy={p.y} r={r + 8} fill="transparent" />
            {labels && !pts.some((q) => q !== p && q.count > p.count && Math.hypot(q.x - p.x, q.y - p.y) < 14) && (
              <text x={p.x} y={p.y - r - 4} textAnchor="middle" className={cn("text-[8px] font-bold", on ? "fill-primary" : "fill-ink/70")}>
                {p.city} · {faNumber(p.count)}
              </text>
            )}
          </g>
        );
      })}
      {children}
    </svg>
  );
});

const dotAt = ([x, y]: [number, number], r = 1.05) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

/** نقشه محل پروژه: نمای نزدیک روی استان؛ محدوده استان با نقطه‌های رنگی پر می‌شود و شهر با نود توپر مشخص است. */
export function LocationMap({ city, province, className }: { city: string; province: string; className?: string }) {
  const pc = provinceCoords[province] ? project(provinceCoords[province][0], provinceCoords[province][1]) : null;
  const cc = cityXY(city) ?? pc;
  if (!cc) return null;
  const center = pc ?? cc; const R = 19; const w = 176, h = 88;
  const mx = (center.x + cc.x) / 2, my = (center.y + cc.y) / 2;
  const inside = iranDots.filter(([x, y]) => Math.hypot(x - center.x, y - center.y) <= R);
  return (
    <svg viewBox={`${mx - w / 2} ${my - h / 2} ${w} ${h}`} preserveAspectRatio="xMidYMid slice" className={cn("block w-full bg-muted/60", className)} role="img" aria-label={`محل پروژه: ${city}، استان ${province}`}>
      <path d={iranPath} className="fill-white stroke-ink/15" strokeWidth="0.5" />
      <path d={dotsPath} className="fill-ink/[0.12]" />
      <circle cx={center.x} cy={center.y} r={R + 2} className="fill-primary/[0.12]" />
      <path d={inside.map((d) => dotAt(d, 1.5)).join("")} className="fill-primary/70" />
      <text x={center.x} y={center.y - R - 3} textAnchor="middle" className="fill-primary text-[5px] font-extrabold">استان {province}</text>
      <circle cx={cc.x} cy={cc.y} r="3.2" className="fill-primary" style={{ transformOrigin: `${cc.x}px ${cc.y}px`, animation: "pulse-node 2.8s ease-out infinite" }} />
      <circle cx={cc.x} cy={cc.y} r="3.4" className="fill-primary stroke-white" strokeWidth="1.2" />
      <rect x={cc.x - city.length * 1.9 - 4} y={cc.y + 5.5} width={city.length * 3.8 + 8} height="9" rx="4.5" className="fill-ink" />
      <text x={cc.x} y={cc.y + 12} textAnchor="middle" className="fill-white text-[5.5px] font-extrabold">{city}</text>
    </svg>
  );
}
