import Image from "next/image";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { cn } from "@/lib/utils";

/**
 * امضای تصویری ثابت روی همه عکس‌ها: عکس با رنگ طبیعی، سایه خنثی در پایین برای خوانایی،
 * تکه‌ای کم‌رنگ از پترن نود–خط–نقطه در گوشه و نشان الگونت در بالا.
 */
// srcs: چند عکس روی هم؛ عکسِ شماره active با محو شدن نرم نمایش داده می‌شود (حالت چندعکسی)
export function SignaturePhoto({ src, srcs, active = 0, alt, className, priority, sizes = "33vw", mark = true, children }: { src: string; mark?: boolean; srcs?: string[]; active?: number; alt: string; className?: string; priority?: boolean; sizes?: string; children?: React.ReactNode }) {
  const layers = srcs?.length ? srcs : [src];
  return (
    <div className={cn("group/photo relative isolate overflow-hidden bg-muted", className)}>
      {layers.map((s, i) => (i === 0 || i <= Math.max(active, 0) + 1) && (
        <Image key={s} src={s} alt={i === active ? alt : ""} fill sizes={sizes} priority={priority && i === 0}
          className={cn("object-cover transition-[opacity,transform] duration-[900ms,700ms] ease-out group-hover/photo:scale-[1.04]", i === active ? "opacity-100" : "opacity-0")} />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.82)_0%,rgb(0_0_0/0.45)_28%,rgb(0_0_0/0)_58%,rgb(0_0_0/0.28)_100%)]" />
      <AlgoPattern className="-bottom-6 -left-6 h-[70%] w-[60%] text-white/15 blur-[1px]" fade="radial" scale={0.55} />
      {mark && <NodeMark className="absolute left-4 top-4 text-white/90" />}
      {children}
    </div>
  );
}
