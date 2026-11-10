import Image from "next/image";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { cn } from "@/lib/utils";

/**
 * امضای تصویری ثابت روی همه عکس‌ها: لایه سبزآبی برند، سایه پایین،
 * تکه‌ای از پترن نود–خط–نقطه در گوشه و نشان کوچک در بالا.
 */
export function SignaturePhoto({ src, alt, className, priority, sizes = "(max-width: 768px) 100vw, 33vw", children }: { src: string; alt: string; className?: string; priority?: boolean; sizes?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("group/photo relative isolate overflow-hidden bg-deep", className)}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover saturate-[0.8] contrast-[1.06] transition-transform duration-[1200ms] ease-out group-hover/photo:scale-[1.06]" />
      <div className="absolute inset-0 bg-primary mix-blend-soft-light opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-deep/85 via-deep/10 to-deep/25" />
      <AlgoPattern className="-bottom-6 -left-6 h-[75%] w-[70%] text-white/45" fade="radial" scale={0.55} />
      <NodeMark className="absolute left-4 top-4 text-white/90" />
      {children}
    </div>
  );
}
