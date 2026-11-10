import { useId } from "react";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

// نودهای متحرک: روی خط‌های پترن آرام جابه‌جا می‌شوند (فقط transform؛ سبک برای مرورگر)
const movers = [
  { x: 160, y: 40, dx: 60, dy: 0, d: 11 }, { x: 30, y: 95, dx: 0, dy: 55, d: 14 }, { x: 245, y: 95, dx: 0, dy: 60, d: 12 },
  { x: 160, y: 180, dx: -70, dy: 0, d: 16 }, { x: 295, y: 180, dx: -45, dy: 0, d: 13 }, { x: 80, y: 235, dx: 0, dy: -50, d: 15 },
];

/**
 * پترن هویت بصری الگونت (نود، خط، نقطه). همیشه کم‌رنگ و تکه‌تکه استفاده می‌شود:
 * با mask محو می‌شود تا فقط گوشه‌ای از آن دیده شود. با animated نودها آرام حرکت می‌کنند.
 */
export function AlgoPattern({ className, fade = "radial", scale = 1, animated }: { className?: string; fade?: "radial" | "left" | "right" | "bottom" | "none"; scale?: number; animated?: boolean }) {
  const id = useId();
  const mask =
    fade === "radial" ? "radial-gradient(ellipse at center, #000 0%, transparent 72%)"
    : fade === "left" ? "linear-gradient(to left, transparent 0%, #000 100%)"
    : fade === "right" ? "linear-gradient(to right, transparent 0%, #000 100%)"
    : fade === "bottom" ? "linear-gradient(to bottom, #000 0%, transparent 100%)" : undefined;
  return (
    <svg aria-hidden className={cn("pointer-events-none absolute", className)} style={{ maskImage: mask, WebkitMaskImage: mask }}>
      <defs>
        <pattern id={id} width={320 * scale} height={240 * scale} patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M0 40H320M0 95H160M0 180H295M0 235H320" />
            <path d="M30 40V235M80 0V240M160 0V240M245 40V240" />
            <path d="M80 235L200 115A45 45 0 0 1 277 147V180" />
            <path d="M30 180A50 50 0 0 0 115 215L245 85A42 42 0 0 1 320 110" />
            <path d="M40 0A45 45 0 0 0 130 0" />
          </g>
          <g fill="currentColor">
            {!animated && <><circle cx="160" cy="40" r="4" /><circle cx="30" cy="95" r="4" /><circle cx="245" cy="95" r="4" />
            <circle cx="160" cy="180" r="4" /><circle cx="295" cy="180" r="4" /><circle cx="80" cy="235" r="4" /></>}
            <circle cx="80" cy="95" r="2" /><circle cx="160" cy="95" r="2" /><circle cx="30" cy="180" r="2" />
            <circle cx="80" cy="180" r="2" /><circle cx="30" cy="235" r="2" /><circle cx="245" cy="235" r="2" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      {animated && (
        <g fill="currentColor" transform={`scale(${scale})`}>
          {[0, 1, 2].flatMap((tx) => [0, 1].flatMap((ty) => movers.map((m, i) => (
            <circle key={`${tx}-${ty}-${i}`} cx={m.x + tx * 320} cy={m.y + ty * 240} r="4"
              style={{ ["--dx" as string]: `${m.dx}px`, ["--dy" as string]: `${m.dy}px`, animation: `node-drift ${m.d + tx * 2 + ty}s ease-in-out ${-(i * 1.7 + tx)}s infinite alternate`, willChange: "transform" }} />
          ))))}
        </g>
      )}
    </svg>
  );
}

/** نشان نود — موج — A الگونت — خط — حلقه؛ امضای ثابت روی عکس‌ها و کنار عنوان‌ها */
export function NodeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 62 20" aria-hidden className={cn("icon-size-prop !h-[18px] !w-14 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 11H11.5Q14 5.5 16.5 11T21.5 11H52" />
      <path d="M26.5 17.5L33 3L39.5 17.5" strokeWidth="2" />
      <circle cx="4" cy="11" r="3" fill="currentColor" stroke="none" />
      <circle cx="55.5" cy="11" r="3.2" />
    </svg>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-extrabold tracking-tight", light ? "text-white" : "text-ink", className)}>
      <span className={cn("grid size-9 place-items-center rounded-xl", light ? "bg-white/15 text-white" : "bg-primary text-white")}>
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5.5 19L12 4.5L18.5 19M3 13.5H17.5" />
          <circle cx="20.5" cy="13.5" r="1.7" />
        </svg>
      </span>
      <span className="text-lg">{site.name}</span>
    </span>
  );
}
