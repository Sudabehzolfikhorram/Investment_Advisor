import { HeroCompass } from "@/components/home/hero-ideas";
import { MainCategories, Categories, Featured, HowItWorks, HelpCenter } from "@/components/home/sections";
import { Footer } from "@/components/site/header";

export default function Home() {
  return (
    <main>
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
