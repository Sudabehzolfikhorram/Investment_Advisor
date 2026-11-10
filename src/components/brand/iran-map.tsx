"use client";
import { iranDots, iranPath, project } from "@/data/iran-map";
import { cityCoords } from "@/data/opportunities";
import { cn, faNumber } from "@/lib/utils";

export interface MapPoint { city: string; province: string; count: number }

/** نقشه نقطه‌ای ایران با نودها و خط‌های اتصال؛ هم پس‌زمینه است هم انتخاب‌گر استان */
export function IranMap({
  points, active = [], onToggle, className, tone = "light", labels = true,
}: { points: MapPoint[]; active?: string[]; onToggle?: (province: string) => void; className?: string; tone?: "light" | "dark"; labels?: boolean }) {
  const pts = points.filter((p) => cityCoords[p.city]).map((p) => ({ ...p, ...project(cityCoords[p.city][0], cityCoords[p.city][1]) }));
  const hub = pts.find((p) => p.city === "تهران") ?? pts[0];
  const max = Math.max(1, ...pts.map((p) => p.count));
  const dot = tone === "dark" ? "fill-white/25" : "fill-primary/25";
  return (
    <svg viewBox="0 0 360 330" className={cn("h-auto w-full overflow-visible", className)} role="img" aria-label="نقشه ایران و شهرهای دارای پروژه">
      <path d={iranPath} className={tone === "dark" ? "fill-white/[0.03] stroke-white/15" : "fill-primary/[0.03] stroke-primary/15"} strokeWidth="0.6" />
      <g className={dot}>{iranDots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.05" />)}</g>
      {hub && (
        <g fill="none" className={tone === "dark" ? "stroke-white/35" : "stroke-primary/40"} strokeWidth="0.7">
          {pts.filter((p) => p !== hub).map((p) => {
            const mx = (p.x + hub.x) / 2, my = (p.y + hub.y) / 2 - Math.abs(p.x - hub.x) * 0.18;
            return <path key={p.city} d={`M${hub.x} ${hub.y}Q${mx} ${my} ${p.x} ${p.y}`} strokeDasharray="300" strokeDashoffset="300" style={{ animation: "dash 2.2s ease-out forwards", animationDelay: `${0.3 + (p.x % 7) * 0.08}s` }} />;
          })}
        </g>
      )}
      {pts.map((p) => {
        const on = active.includes(p.province);
        const r = 2.6 + (p.count / max) * 3.4;
        return (
          <g key={p.city} onClick={onToggle ? () => onToggle(p.province) : undefined} className={cn(onToggle && "cursor-pointer")} role={onToggle ? "button" : undefined} aria-label={`${p.city}، ${p.count} پروژه`}>
            <circle cx={p.x} cy={p.y} r={r} className={on ? "fill-sand" : tone === "dark" ? "fill-white" : "fill-primary"} style={{ transformOrigin: `${p.x}px ${p.y}px`, animation: "pulse-node 2.6s ease-out infinite", animationDelay: `${(p.y % 9) * 0.25}s` }} />
            <circle cx={p.x} cy={p.y} r={r} className={cn(on ? "fill-sand" : tone === "dark" ? "fill-white" : "fill-primary", "transition-colors")} />
            <circle cx={p.x} cy={p.y} r={r + 7} fill="transparent" />
            {labels && !pts.some((q) => q !== p && q.count > p.count && Math.hypot(q.x - p.x, q.y - p.y) < 14) && (
              <text x={p.x} y={p.y - r - 4} textAnchor="middle" className={cn("text-[8px] font-bold", tone === "dark" ? "fill-white/85" : "fill-ink/75")}>
                {p.city} · {faNumber(p.count)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
