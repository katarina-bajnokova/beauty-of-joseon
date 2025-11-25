import HeroSection from "@/components/sections/HeroSection/HeroSection";
import Petals from "@/components/effects/Petals/Petals";
import RitualSection from "@/components/sections/RitualSection/RitualSection";
import IngredientsSection from "@/components/sections/IngredientsSection/IngredientsSection";
import HeritageStory from "@/components/sections/HeritageStory/HeritageStory";
import SkinAnalysis from "@/components/sections/SkinAnalysis/SkinAnalysis";

function HomePage() {
  return (
    <>
      <Petals />
      <HeroSection />
      <SkinAnalysis />
      <RitualSection />

      <IngredientsSection />
      <HeritageStory />
    </>
  );
}

export default HomePage;
