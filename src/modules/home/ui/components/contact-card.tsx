import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  PiArrowUpRight,
  PiGithubLogoDuotone,
  PiLinkedinLogoDuotone,
  PiPenNibDuotone,
  PiPaperPlaneTiltDuotone,
} from "react-icons/pi";

// icon map
const iconMap = {
  LinkedIn: <PiLinkedinLogoDuotone size={18} />,
  GitHub: <PiGithubLogoDuotone size={18} />,
  Website: <PiPenNibDuotone size={18} />,
  "Contact me": <PiPaperPlaneTiltDuotone size={18} />,
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
        "w-full h-full p-3 lg:p-5 bg-muted hover:bg-muted-hover rounded-xl flex justify-between items-center cursor-pointer group transition-all duration-150 ease-[cubic-bezier(0.22, 1, 0.36, 1)]",
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
