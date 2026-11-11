"use client";
import { usePathname } from "next/navigation";
import { AlgoPattern } from "./algo-pattern";

/** پس‌زمینه ثابت همه صفحه‌ها: همان پترن محو صفحه اصلی با نودهای آرام و متحرک */
export function SiteBackdrop() {
  // صفحه اصلی پترن متحرک خودش را در هیرو و بخش‌ها دارد
  const path = usePathname();
  if (path === "/" || path === "") return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <AlgoPattern animated className="-left-24 -top-16 h-[30rem] w-[44rem] text-ink/[0.07]" fade="radial" />
      <AlgoPattern animated className="-bottom-24 -right-20 h-[26rem] w-[38rem] text-primary/[0.09]" fade="radial" scale={0.8} />
    </div>
  );
}
