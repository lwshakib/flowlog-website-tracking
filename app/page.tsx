/**
 * @file app/page.tsx
 * @description The main landing page of the Flowlog application.
 * This page assembles various sections like Hero, Features, Pricing, and CTA to create the homepage.
 */

import AboutSection from "@/components/marketing/about-section";
import CTASection from "@/components/marketing/cta-section";
import FeaturesSection from "@/components/marketing/features-section";
import FooterSection from "@/components/marketing/footer";
import HeroSection from "@/components/marketing/hero-section";
import SimplePricing from "@/components/marketing/pricing";

/**
 * Home Component
 * @description Renders the landing page with multiple marketing and informational sections.
 * @returns {JSX.Element} The rendered homepage.
 */
export default function Home() {
  return (
    <div className="min-h-screen w-full">
      {/* Hero Section: The top part of the page with a clear value proposition */}
      <div id="home">
        <HeroSection />
      </div>

      {/* Features Section: Highlights key functionalities of the platform */}
      <FeaturesSection />

      {/* About Section: Provides more context about the mission and product */}
      <AboutSection />

      {/* Simple Pricing: Outlines the cost and tiers of the service */}
      <SimplePricing />

      {/* CTA Section: "Call to Action" section to encourage user sign-up */}
      <CTASection />

      {/* Footer Section: Contains navigational links and social information */}
      <FooterSection />
    </div>
  );
}
