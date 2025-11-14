import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  link: string;
  label: string;
  className?: string;
}

/**
 * LinkRotate component displays a vertical rotation of link when user hover it
 * @preview ![img]() - https://p.ecarry.me/components/link-rotate
 *
 * @param {Object} props - Component props
 * @param {string} props.link - Url string
 * @param {string} props.label - Url label
 * @param {string} props.classname - Component styles
 * @returns {JSX.Element} JSX Element
 */

const LinkRotate = ({ link, label, className }: Props) => {
  return (
    <div className="relative inline-block overflow-hidden">
      <Link
        href={link}
        className={cn(
          "relative inline-block group text-black font-light text-sm dark:text-white",
          className
        )}
      >
        {/* Default Text (visible initially, moves down on hover) */}
        <span className="block transform transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
          {label}
        </span>

        {/* Hover Text (hidden initially, moves up on hover) */}
        <span className="absolute inset-0 transform translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0">
          {label}
        </span>
      </Link>
    </div>
  );
};

export default LinkRotate;
