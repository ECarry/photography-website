import CardContainer from "@/components/card-container";

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
            I have a passion for photography and camera lenses. I use a variety
            of lenses to capture the beauty of nature and people in their
            different moments.
          </p>
        </div>
      </div>
    </CardContainer>
  );
};

export default CameraCard;
