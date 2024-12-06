import Vector from "@/components/vector-bottom-right";
import ProfileCard from "./_components/profile-card";
import ContactCard from "./_components/contact-card";
import LatestWorkCard from "./_components/latest-work-card";
import Footer from "./_components/footer";
import { ImageSlider } from "@/components/image-slider";
import CityList from "./_components/city-list";

export default function Home() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      {/* LEFT CONTENT - Fixed */}
      <div className="w-full lg:w-1/2 h-[70vh] lg:fixed lg:top-0 lg:left-0 lg:h-screen p-0 lg:p-3 rounded-xl">
        <div className="w-full h-full relative">
          <ImageSlider />

          <div className="absolute right-0 bottom-0">
            <Vector title="Photography" />
          </div>
        </div>
      </div>

      {/* Spacer for fixed left content */}
      <div className="hidden lg:block lg:w-1/2" />

      {/* RIGHT CONTENT - Scrollable */}
      <div className="w-full mt-3 lg:mt-0 lg:w-1/2 space-y-3 pb-3">
        {/* PROFILE CARD  */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex-1">
            <ProfileCard />
          </div>

          <div className="flex-1 w-full lg:max-w-[300px] flex flex-col gap-3">
            <ContactCard title="Instagram" />
            <ContactCard title="GitHub" />
            <ContactCard title="X" />
            <ContactCard
              title="Contact me"
              className="bg-primary hover:bg-primary-foreground text-white dark:text-black"
            />
          </div>
        </div>

        {/* LAST WORK CARD  */}
        <div className="mt-3">
          <LatestWorkCard />
        </div>

        {/* CITY CARD  */}
        <div className="mt-3 w-full grid grid-cols-1 lg:grid-cols-2 gap-3">
          <CityList />
        </div>

        {/* FOOTER  */}
        <Footer />
      </div>
    </div>
  );
}
