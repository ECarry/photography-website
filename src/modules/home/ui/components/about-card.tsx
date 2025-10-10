import CardContainer from "@/components/card-container";

const AboutCard = () => {
  return (
    <CardContainer>
      <div className="flex flex-col p-12 gap-[128px]">
        <h1 className="text-3xl">About</h1>
        <div className="flex flex-col gap-4 font-light">
          <p>
            It is a great privilege to be able to travel around the world, and I am grateful to be enjoy that privilege. This world that we live in, the people, the cultures, the landscapes, and life in general is so beautiful and fascinating. I humbly attempt to capture some of the random moments that I find interesting and beautiful through my lens.
          </p>
          <p>
            I am not a professional photographer, nor do I aspire to be one. I am just an enthusiast who loves to travel and take pictures. Social media used to be a place where I shared my photos, to look back on and hopefully inspire others. However, I have become increasingly uncomfortable with the way social media works, and I have decided to take a step back from it. This website is my attempt to create a space where I can share my photos without the distractions and negativity of social media.
          </p>
          <p>
            I hope you enjoy browsing through my photos as much as I enjoyed taking them. If you have any questions or comments, please feel free to reach out to me. Massive shoutout to <a href="https://p.ecarry.me/" className="underline">Ecarry</a> for sharing this amazing website template with the world.
          </p>
          <p>
            Thank you for visiting my website.
          </p>
          <p>
            - Aryan
          </p>
        </div>
      </div>
    </CardContainer>
  );
};

export default AboutCard;
