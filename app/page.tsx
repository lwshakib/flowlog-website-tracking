import AboutSection from "@/components/about-section";
import CTASection from "@/components/cta-section";
import FeaturesSection from "@/components/features-section";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import SimplePricing from "@/components/pricing";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen w-full">
    <div id="home">
      <HeroSection />
    </div>
    <FeaturesSection />
    <AboutSection />
    <SimplePricing />
    <CTASection />
    <FooterSection/>
    </div>
  );
}
