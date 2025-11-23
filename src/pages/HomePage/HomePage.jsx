import HeroSection from "@/components/sections/HeroSection/HeroSection";
import Petals from "@/components/effects/Petals/Petals";
import RitualSection from "@/components/sections/RitualSection/RitualSection";
import IngredientsSection from "@/components/sections/IngredientsSection/IngredientsSection";
import HeritageStory from "@/components/sections/HeritageStory/HeritageStory";

function HomePage() {
  return (
    <>
      <Petals />
      <HeroSection />
      <RitualSection />
      <IngredientsSection />
      <HeritageStory />
    </>
  );
}

export default HomePage;
