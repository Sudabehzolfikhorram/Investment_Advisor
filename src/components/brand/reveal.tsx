"use client";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { faNumber } from "@/lib/utils";

export function Reveal({ children, delay = 0, className, y = 24 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1400, bounce: 0 });
  const text = useTransform(spring, (v) => faNumber(Math.round(v)));
  useEffect(() => { if (inView) mv.set(value); }, [inView, value, mv]);
  return <motion.span ref={ref} className={className}>{text}</motion.span>;
}

/** حلقه درصد تطابق */
export function MatchRing({ score, size = 52, light }: { score: number; size?: number; light?: boolean }) {
  const r = 20, c = 2 * Math.PI * r;
  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }} title={`${faNumber(score)}٪ تطابق`}>
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" strokeWidth="3.5" className={light ? "stroke-white/25" : "stroke-primary/15"} />
        <motion.circle cx="24" cy="24" r={r} fill="none" strokeWidth="3.5" strokeLinecap="round" className={light ? "stroke-white" : score >= 70 ? "stroke-primary" : "stroke-primary/45"}
          strokeDasharray={c} initial={{ strokeDashoffset: c }} whileInView={{ strokeDashoffset: c * (1 - score / 100) }} viewport={{ once: true }} transition={{ duration: 1.1, ease: "easeOut" }} />
      </svg>
      <span className={`text-[13px] font-extrabold ${light ? "text-white" : "text-ink"}`}>{faNumber(score)}<span className="text-[9px]">٪</span></span>
    </span>
  );
}
