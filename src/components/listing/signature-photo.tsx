import Image from "next/image";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { cn } from "@/lib/utils";

/**
 * امضای تصویری ثابت روی همه عکس‌ها: عکس با رنگ طبیعی، سایه خنثی در پایین برای خوانایی،
 * تکه‌ای کم‌رنگ از پترن نود–خط–نقطه در گوشه و نشان الگونت در بالا.
 */
export function SignaturePhoto({ src, alt, className, priority, sizes = "33vw", children }: { src: string; alt: string; className?: string; priority?: boolean; sizes?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("group/photo relative isolate overflow-hidden bg-muted", className)}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover transition-transform duration-700 ease-out group-hover/photo:scale-[1.04]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.82)_0%,rgb(0_0_0/0.45)_28%,rgb(0_0_0/0)_58%,rgb(0_0_0/0.28)_100%)]" />
      <AlgoPattern className="-bottom-6 -left-6 h-[70%] w-[60%] text-white/30" fade="radial" scale={0.55} />
      <NodeMark className="absolute left-4 top-4 text-white/90" />
      {children}
    </div>
  );
}
