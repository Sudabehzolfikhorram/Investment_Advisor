import { Hero } from "@/components/home/hero";
import { Stats, MainCategories, Categories, Featured, HowItWorks } from "@/components/home/sections";
import { Footer } from "@/components/site/header";

export default function Home() {
  return (
    <main>
      <Hero />
      <MainCategories />
      <Categories />
      <Featured />
      <Stats />
      <HowItWorks />
      <Footer />
    </main>
  );
}
