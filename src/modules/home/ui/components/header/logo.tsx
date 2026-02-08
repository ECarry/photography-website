import Link from "next/link";
import WordRotate from "../word-rotate";
import { RiCameraLensFill } from "react-icons/ri";
import { siteConfig } from "@/site.config";

const Logo = () => {
  return (
    <Link href="/" className="flex gap-2 items-center">
      <RiCameraLensFill size={18} />
      <WordRotate
        label={siteConfig.name}
        label2={siteConfig.tagline}
        style="font-medium uppercase"
      />
    </Link>
  );
};

export default Logo;
