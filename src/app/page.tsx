import { HeroCompass } from "@/components/home/hero-ideas";
import { MainCategories, Categories, Featured, HowItWorks, HelpCenter } from "@/components/home/sections";
import { AlgoPattern } from "@/components/brand/algo-pattern";
import { Footer } from "@/components/site/header";

export default function Home() {
  return (
    <main className="relative isolate">
      {/* پترن هویت ثابت پشت صفحه: محتوا رویش اسکرول می‌خورد؛ کاشی یکپارچه، کوچک و ۵٪ کدری */}
      <AlgoPattern className="!fixed inset-0 -z-10 h-dvh w-full text-ink/[0.05]" fade="none" scale={1.1} seamless />
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
