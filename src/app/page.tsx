import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { HeroSwitch } from "@/components/home/hero-switch";
import { Stats, MainCategories, Categories, Featured, HowItWorks, HelpCenter } from "@/components/home/sections";
import { Footer } from "@/components/site/header";

export default function Home() {
  return (
    <main>
      <Suspense fallback={<Hero />}><HeroSwitch /></Suspense>
      <MainCategories />
      <Categories />
      <Featured />
      <Stats />
      <HowItWorks />
      <HelpCenter />
      <Footer />
    </main>
  );
}
