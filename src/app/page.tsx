import { HeroCompass } from "@/components/home/hero-ideas";
import { MainCategories, Categories, Featured, HowItWorks, HelpCenter } from "@/components/home/sections";
import { AlgoPattern } from "@/components/brand/algo-pattern";
import { Footer } from "@/components/site/header";

export default function Home() {
  return (
    <main className="relative isolate">
      {/* پترن هویت در کل پس‌زمینه صفحه: بسیار کم‌رنگ تا شلوغ نشود */}
      <AlgoPattern className="inset-0 -z-10 h-full w-full text-ink/[0.05]" fade="none" scale={1.5} />
      <HeroCompass />
      <MainCategories />
      <Categories />
      <Featured />
      <HowItWorks />
      <HelpCenter />
      <Footer />
    </main>
  );
}
