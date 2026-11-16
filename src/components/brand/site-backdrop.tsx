"use client";
import { usePathname } from "next/navigation";
import { AlgoField } from "./algo-field";

/** پس‌زمینه ثابت همه صفحه‌ها: همان پترن یکپارچه و بسیار کم‌رنگ صفحه اصلی */
export function SiteBackdrop() {
  // صفحه اصلی پترن متحرک خودش را در هیرو و بخش‌ها دارد
  const path = usePathname();
  if (path === "/" || path === "") return null;
  return (
    <AlgoField className="-z-20 text-ink/[0.03]" />
  );
}
