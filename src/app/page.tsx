import { HeroCompass } from "@/components/home/hero-ideas";
import { MainCategories, Categories, Featured, HowItWorks, HelpCenter } from "@/components/home/sections";
import { AlgoField } from "@/components/brand/algo-field";
import { Footer } from "@/components/site/header";

export default function Home() {
  return (
    <main className="relative isolate">
      {/* پترن هویت ثابت پشت صفحه: یک طرح یکتا و بی‌تکرار، بسیار کم‌رنگ، محتوا رویش اسکرول می‌خورد */}
      <AlgoField className="text-ink/[0.04]" />
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
