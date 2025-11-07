import CardContainer from "@/components/card-container";

const AboutCard = () => {
  return (
    <CardContainer>
      <div className="flex flex-col p-12 gap-[128px]">
        <h1 className="text-3xl">About</h1>
        <div className="flex flex-col gap-4 font-light">
          <p>
            With a focus on both candid moments and stunning landscapes, I
            strive to evoke emotion and tell stories through my work. My
            photography blends the rawness of everyday life with the artistry of
            fine art, allowing viewers to connect with each image on a deeper
            level.
          </p>

          <p>
            Whether I&apos;m exploring urban environments or venturing into
            nature, my goal is to highlight the extraordinary in the ordinary.
            Through my lens, I invite you to join me on this visual journey of
            discovery and inspiration.
          </p>
        </div>
      </div>
    </CardContainer>
  );
};

export default AboutCard;
