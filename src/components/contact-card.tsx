import { cn } from "@/lib/utils";
import Link from "next/link";
import { MdEmail } from "react-icons/md";
import {
  PiArrowUpRight,
  PiInstagramLogo,
  PiGithubLogo,
  PiXLogo,
} from "react-icons/pi";
import { SiXiaohongshu } from "react-icons/si";

// icon map
const iconMap = {
  Instagram: <PiInstagramLogo size={18} />,
  GitHub: <PiGithubLogo size={18} />,
  X: <PiXLogo size={18} />,
  Xiaohongshu: <SiXiaohongshu size={18} />,
  "Contact me": <MdEmail size={18} />,
};

interface Props {
  title: keyof typeof iconMap;
  href?: string;
  className?: string;
}

const ContactCard = ({ title, href, className }: Props) => {
  return (
    <Link
      href={href || " "}
      target="_blank"
      className={cn(
        "w-full h-full p-3 lg:p-5 bg-muted hover:bg-muted-foreground/10 rounded-xl flex justify-between items-center cursor-pointer group transition-all duration-150 ease-[cubic-bezier(0.22, 1, 0.36, 1)]",
        className
      )}
    >
      <p className="text-sm">{title}</p>

      <div className="relative inline-block overflow-hidden size-[18px]">
        <div className="relative inline-block group font-light text-sm h-full w-full">
          {/* Default Text (visible initially, moves down on hover) */}
          <span className="block transform transition-transform duration-200 ease-in-out group-hover:-translate-y-full">
            {iconMap[title]}
          </span>

          {/* Hover Text (hidden initially, moves up on hover) */}
          <span className="absolute inset-0 transform translate-y-full transition-transform duration-200 ease-in-out group-hover:translate-y-0">
            <PiArrowUpRight size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ContactCard;
