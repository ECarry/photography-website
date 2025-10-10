import CardContainer from "@/components/card-container";
import React from "react";

const CameraCard = () => {
  return (
    <CardContainer>
      <div className="flex flex-col p-12 gap-[128px]">
        <div className="flex flex-col text-3xl">
          <h1>Camera</h1>
          <h1>& Camera Lenses</h1>
        </div>

        <div className="font-light">
          <p>
            I am a very forgetful individual, and remembering to take a camera with me on trips is often a challenge. But my phone is always with me, and smartphone cameras have improved significantly over the years. They are still not good enough to capture the beauty of the world as I see it, but they are good enough to capture some moments.
          </p>
          <p>
            I use an iPhone 15 Pro, and some lenses and filters from Moment (when I don&apos;t forget to take them).
          </p>
        </div>
      </div>
    </CardContainer>
  );
};

export default CameraCard;
