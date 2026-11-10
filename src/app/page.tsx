import { Hero } from "@/components/home/hero";
import { Stats, Categories, Routes, MapSection, Featured, AssistantTeaser, HowItWorks, SaveCta } from "@/components/home/sections";
import { Footer } from "@/components/site/header";

export default function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <Categories />
      <Featured />
      <MapSection />
      <Routes />
      <AssistantTeaser />
      <HowItWorks />
      <SaveCta />
      <Footer />
    </main>
  );
}
