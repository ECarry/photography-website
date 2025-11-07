// External dependencies
import { type Metadata } from "next";

// Internal dependencies - UI Components
import Footer from "../../../modules/home/ui/components/footer";
import AboutCard from "../../../modules/home/ui/components/about-card";
import TechMarquee from "@/components/tech-marquee";
import CameraCard from "../../../modules/home/ui/components/camera-card";
import ProfileCard from "../../../modules/home/ui/components/profile-card";
import CardContainer from "@/components/card-container";
import VectorCombined from "@/modules/home/ui/components/vector-combined";

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

        <CardContainer>
          <div className="flex items-center justify-between p-6">
            <h1 className="text-lg">SONY</h1>
            <p className="text-sm">Alpha 7RⅡ</p>
          </div>
        </CardContainer>

        <CardContainer>
          <div className="flex items-center justify-between p-6">
            <h1 className="text-lg">DJI</h1>
            <p className="text-sm">Air 2S</p>
          </div>
        </CardContainer>

        <CardContainer>
          <div className="flex items-center justify-between p-6">
            <h1 className="text-lg">Tamron</h1>
            <p className="text-sm">50-400mm F/4.5-6.3 Di III VC VXD</p>
          </div>
        </CardContainer>

        <CardContainer>
          <div className="flex items-center justify-between p-6">
            <h1 className="text-lg">Sigma</h1>
            <p className="text-sm">35mm F/1.4 DG HSM</p>
          </div>
        </CardContainer>

        <CardContainer>
          <div className="flex items-center justify-between p-6">
            <h1 className="text-lg">Viltrox</h1>
            <p className="text-sm">AF 40mm F/2.5 FE</p>
          </div>
        </CardContainer>

        <Footer />
      </div>
    </div>
  );
};

export default AboutPage;
