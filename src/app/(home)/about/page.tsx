// External dependencies
import { type Metadata } from "next";

// Internal dependencies - UI Components
import Footer from "../../../modules/home/ui/components/footer";
import AboutCard from "../../../modules/home/ui/components/about-card";
import TechMarquee from "@/components/tech-marquee";
import CameraCard from "../../../modules/home/ui/components/camera-card";
import ProfileCard from "../../../modules/home/ui/components/profile-card";
import CardContainer from "@/components/card-container";
import VectorCombined from "@/components/vector-combined";
import {
  PageTransitionContainer,
  PageTransitionItem,
} from "@/components/page-transition";

export const metadata: Metadata = {
  title: "About",
  description: "About page",
};

const AboutPage = () => {
  return (
    <PageTransitionContainer className="flex flex-col gap-3 lg:gap-0 lg:flex-row w-full">
      {/* LEFT CONTENT - Fixed */}
      <div className="w-full h-[70vh] lg:w-1/2 lg:fixed lg:top-0 lg:left-0 lg:h-screen p-0 lg:p-3">
        <div className="w-full h-full relative bg-[url(/bg.webp)] bg-top bg-cover rounded-xl">
          <div className="absolute right-0 bottom-0">
            <VectorCombined title="About" position="bottom-right" />
          </div>
        </div>
      </div>

      {/* Spacer for fixed left content */}
      <div className="hidden lg:block lg:w-1/2" />

      {/* RIGHT CONTENT - Scrollable */}
      <PageTransitionContainer className="w-full lg:w-1/2 space-y-3 pb-3">
        {/* PROFILE CARD  */}
        <PageTransitionItem>
          <ProfileCard />
        </PageTransitionItem>

        {/* ABOUT CARD  */}
        <PageTransitionItem>
          <AboutCard />
        </PageTransitionItem>

        {/* TECH CARD  */}
        <PageTransitionItem>
          <TechMarquee />
        </PageTransitionItem>

        {/* CAMERA CARD  */}
        <PageTransitionItem>
          <CameraCard />
        </PageTransitionItem>

        <PageTransitionItem>
          <CardContainer>
            <div className="flex items-center justify-between p-6">
              <h1 className="text-lg">Apple</h1>
              <p className="text-sm">iPhone 15 Pro</p>
            </div>
          </CardContainer>
        </PageTransitionItem>

        <PageTransitionItem>
          <CardContainer>
            <div className="flex items-center justify-between p-6">
              <h1 className="text-lg">MOMENT</h1>
              <p className="text-sm">67mm Snap-On Filter Mount with Camera Case</p>
            </div>
          </CardContainer>
        </PageTransitionItem>

        <PageTransitionItem>
          <CardContainer>
            <div className="flex items-center justify-between p-6">
              <h1 className="text-lg">K&F Concept</h1>
              <p className="text-sm">Variable ND3-ND1000 Filter</p>
            </div>
          </CardContainer>
        </PageTransitionItem>

        <PageTransitionItem>
          <CardContainer>
            <div className="flex items-center justify-between p-6">
              <h1 className="text-lg">Hoya</h1>
              <p className="text-sm">HRT Circular Polarizer UV Filter</p>
            </div>
          </CardContainer>
        </PageTransitionItem>

        <PageTransitionItem>
          <Footer />
        </PageTransitionItem>
      </PageTransitionContainer>
    </PageTransitionContainer>
  );
};

export default AboutPage;
