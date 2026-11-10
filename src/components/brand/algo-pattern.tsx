import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * پترن هویت بصری الگونت (نود، خط، نقطه). همیشه کم‌رنگ و تکه‌تکه استفاده می‌شود:
 * با mask محو می‌شود تا فقط گوشه‌ای از آن دیده شود.
 */
export function AlgoPattern({ className, fade = "radial", scale = 1 }: { className?: string; fade?: "radial" | "left" | "right" | "bottom" | "none"; scale?: number }) {
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
            <circle cx="160" cy="40" r="4" /><circle cx="30" cy="95" r="4" /><circle cx="245" cy="95" r="4" />
            <circle cx="160" cy="180" r="4" /><circle cx="295" cy="180" r="4" /><circle cx="80" cy="235" r="4" />
            <circle cx="80" cy="95" r="2" /><circle cx="160" cy="95" r="2" /><circle cx="30" cy="180" r="2" />
            <circle cx="80" cy="180" r="2" /><circle cx="30" cy="235" r="2" /><circle cx="245" cy="235" r="2" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** نشان کوچک نود–خط–نقطه؛ امضای ثابت روی عکس‌ها و کنار عنوان‌ها */
export function NodeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 16" aria-hidden className={cn("h-4 w-11", className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 8H18A6 6 0 0 0 24 2V2M24 14A6 6 0 0 1 30 8H38" opacity=".9" />
      <circle cx="4" cy="8" r="3" fill="currentColor" stroke="none" />
      <circle cx="24" cy="8" r="2" fill="currentColor" stroke="none" />
      <circle cx="40" cy="8" r="3" />
    </svg>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-extrabold tracking-tight", light ? "text-white" : "text-ink", className)}>
      <span className={cn("grid size-9 place-items-center rounded-xl", light ? "bg-white/15 text-white" : "bg-primary text-white")}>
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M5 18V9a5 5 0 0 1 10 0v2a4 4 0 0 0 4 4" />
          <circle cx="5" cy="19" r="2" fill="currentColor" stroke="none" /><circle cx="19" cy="15" r="2" fill="currentColor" stroke="none" /><circle cx="10" cy="4.6" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="text-lg">سرمایه‌نما</span>
    </span>
  );
}
