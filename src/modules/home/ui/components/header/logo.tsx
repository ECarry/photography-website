import Link from "next/link";
import WordRotate from "@/components/word-rotate";
import { RiCameraLensFill } from "react-icons/ri";

const Logo = () => {
  return (
    <Link href="/" className="flex gap-2 items-center">
      <RiCameraLensFill size={18} />
      <WordRotate label="Tahmidul Islam" label2="Photo" style="font-medium uppercase" />
    </Link>
  );
};

export default Logo;
