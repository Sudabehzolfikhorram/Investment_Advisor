"use client";
// پیش‌نمایش ایده‌های هیرو با ?hero=1|2|3. بدون این پارامتر، هیروی فعلی نمایش داده می‌شود.
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Hero } from "@/components/home/hero";
import { HeroCompass, HeroDossier, HeroSentence } from "@/components/home/hero-ideas";
import { cn } from "@/lib/utils";

const ideas = [
  { id: "1", name: "قطب‌نما", C: HeroCompass },
  { id: "2", name: "جمله زنده", C: HeroSentence },
  { id: "3", name: "پرونده شفاف", C: HeroDossier },
];

export function HeroSwitch() {
  const v = useSearchParams().get("hero");
  const idea = ideas.find((i) => i.id === v);
  return (
    <>
      {idea ? <idea.C /> : <Hero />}
      {v && (
        <nav aria-label="ایده‌های هیرو" className="glass fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full p-1.5 shadow-[0_24px_50px_-24px_rgb(8_59_55/0.5)] ring-1 ring-border">
          <span className="px-3 text-xs font-extrabold text-muted-foreground">ایده هیرو</span>
          {[{ id: "0", name: "فعلی" }, ...ideas].map((i) => (
            <Link key={i.id} href={`/?hero=${i.id}`} scroll={false} className={cn("rounded-full px-4 py-2 text-[13px] font-extrabold transition-colors", (idea?.id ?? "0") === i.id ? "bg-pine text-white" : "text-ink/70 hover:bg-muted")}>{i.id !== "0" && `${i.id}. `}{i.name}</Link>
          ))}
        </nav>
      )}
    </>
  );
}
