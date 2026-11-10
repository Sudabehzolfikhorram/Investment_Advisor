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
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/5 to-ink/20" />
      <div className="absolute inset-0 bg-primary/[0.08]" />
      <AlgoPattern className="-bottom-6 -left-6 h-[70%] w-[60%] text-white/30" fade="radial" scale={0.55} />
      <NodeMark className="absolute left-4 top-4 text-white/90" />
      {children}
    </div>
  );
}
