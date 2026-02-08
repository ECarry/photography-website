// External dependencies
import { type Metadata } from "next";

// Internal dependencies - UI Components
import Footer from "@/components/footer";
import AboutCard from "../../../modules/home/ui/components/about-card";
import TechMarquee from "@/components/tech-marquee";
import CameraCard from "../../../modules/home/ui/components/camera-card";
import ProfileCard from "../../../modules/home/ui/components/profile-card";
import CardContainer from "@/components/card-container";
import VectorCombined from "@/components/vector-combined";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "About",
  description: "About page",
};

const AboutPage = () => {
  return (
    <div className="flex flex-col gap-3 lg:gap-0 lg:flex-row w-full">
      {/* LEFT CONTENT - Fixed */}
      <div className="w-full h-[70vh] lg:w-1/2 lg:fixed lg:top-0 lg:left-0 lg:h-screen p-0 lg:p-3">
        <div className="w-full h-full relative bg-[url(/bg.jpg)] bg-top bg-cover rounded-xl">
          <div className="absolute right-0 bottom-0">
            <VectorCombined title="About" position="bottom-right" />
          </div>
        </div>
      </div>

      {/* Spacer for fixed left content */}
      <div className="hidden lg:block lg:w-1/2" />

      {/* RIGHT CONTENT - Scrollable */}
      <div className="w-full lg:w-1/2 space-y-3 pb-3">
        {/* PROFILE CARD  */}
        <ProfileCard />

        {/* ABOUT CARD  */}
        <AboutCard />

        {/* TECH CARD  */}
        <TechMarquee />

        {/* CAMERA CARD  */}
        <CameraCard />

        {siteConfig.gear.map((item) => (
          <CardContainer key={`${item.brand}-${item.model}`}>
            <div className="flex items-center justify-between p-6">
              <h1 className="text-lg">{item.brand}</h1>
              <p className="text-sm">{item.model}</p>
            </div>
          </CardContainer>
        ))}

        <Footer />
      </div>
    </div>
  );
};

export default AboutPage;
