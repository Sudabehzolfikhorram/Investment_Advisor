"use client";
import { memo } from "react";
import { iranPath, project, provinceBox, provincePaths } from "@/data/iran-map";
import { useCounties } from "@/lib/use-counties";
import { cityCoords } from "@/data/opportunities";
import { cn, faNumber } from "@/lib/utils";

export interface MapPoint { city: string; province: string; count: number }

export const cityXY = (city: string) => (cityCoords[city] ? project(cityCoords[city][0], cityCoords[city][1]) : null);

/** نقشه ایران با مرز استان‌ها و نود شهرها. با onToggle انتخاب‌گر استان می‌شود. */
export const IranMap = memo(function IranMap({
  points, active = [], onToggle, className, labels = true, links = true, pulse = true, children,
}: { points: MapPoint[]; active?: string[]; onToggle?: (province: string) => void; className?: string; labels?: boolean; links?: boolean; pulse?: boolean; children?: React.ReactNode }) {
  const pts = points.filter((p) => cityCoords[p.city]).map((p) => ({ ...p, ...project(cityCoords[p.city][0], cityCoords[p.city][1]) }));
  const hub = pts.find((p) => p.city === "تهران") ?? pts[0];
  const max = Math.max(1, ...pts.map((p) => p.count));
  return (
    <svg viewBox="0 0 360 330" className={cn("h-auto w-full overflow-visible", className)} role="img" aria-label="نقشه ایران و شهرهای دارای پروژه">
      <path d={iranPath} className="fill-primary/[0.03] stroke-ink/20" strokeWidth="0.5" strokeLinejoin="round" />
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

/** نقشه محل پروژه: کل استان در قاب کوچک؛ شهرستانِ شهر پروژه با رنگ اصلیِ کم‌رنگ پر می‌شود. */
export function LocationMap({ city, province, className }: { city: string; province: string; className?: string }) {
  const b = provinceBox[province]; const all = useCounties(province);
  if (!b) return null;
  const county = all.find((c) => c.cities.includes(city)); const cc = county ? { x: county.c[0], y: county.c[1] } : cityXY(city);
  const pad = Math.max(b[2] - b[0], b[3] - b[1]) * 0.05, bw = b[2] - b[0] + pad * 2, bh = b[3] - b[1] + pad * 2;
  const w = Math.max(bw, bh * 2), h = w / 2; const mx = (b[0] + b[2]) / 2, my = (b[1] + b[3]) / 2; const u = w / 176;
  return (
    <svg viewBox={`${mx - w / 2} ${my - h / 2} ${w} ${h}`} preserveAspectRatio="xMidYMid meet" className={cn("block w-full bg-muted/40", className)} role="img" aria-label={`محل پروژه: ${city}، استان ${province}`}>
      <clipPath id={`loc-${b.join("-")}`}><path d={provincePaths[province]} /></clipPath>
      <path d={provincePaths[province]} className="fill-white" />
      <g clipPath={`url(#loc-${b.join("-")})`}>
        {all.map((c, i) => <path key={i} d={c.d} strokeWidth={0.45 * u} strokeLinejoin="round" className={c === county ? "fill-primary/30 stroke-primary" : "fill-white stroke-ink/20"} />)}
      </g>
      <path d={provincePaths[province]} fill="none" strokeWidth={0.9 * u} strokeLinejoin="round" className="stroke-primary" />
      {county && <path d={county.d} fill="none" strokeWidth={0.9 * u} strokeLinejoin="round" clipPath={`url(#loc-${b.join("-")})`} className="stroke-primary" />}
      {cc && <text x={cc.x} y={cc.y + 2 * u} textAnchor="middle" style={{ fontSize: 5.2 * u }} strokeWidth={1.8 * u} strokeLinejoin="round" className="fill-deep font-extrabold [paint-order:stroke] stroke-white">{city}</text>}
    </svg>
  );
}
