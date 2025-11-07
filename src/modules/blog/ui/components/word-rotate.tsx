import { cn } from "@/lib/utils";

interface Props {
  label: string;
  label2?: string;
  style?: string;
}

/**
 * WordRotate component displays a vertical rotation of different words when user hover it
 * @preview ![img]() - https://p.ecarry.me/components/word-rotate
 *
 * @param {Object} props - Component props
 * @param {string} props.label - first word
 * @param {string} props.label2 - second word
 * @param {string} props.style - Component styles
 * @returns {JSX.Element} JSX Element
 */

const WordRotate = ({ label, label2, style }: Props) => {
  return (
    <div
      className="relative inline-block overflow-hidden"
      style={{ lineHeight: 0.75 }}
    >
      <div
        className={cn("relative inline-block group text-sm font-light", style)}
      >
        {/* Default Text (visible initially, moves down on hover) */}
        <span className="block transform transition-transform duration-300 ease-in-out group-hover:translate-y-full">
          {label}
        </span>

        {/* Hover Text (hidden initially, moves up on hover) */}
        <span className="absolute inset-0 transform -translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0">
          {label2 || label}
        </span>
      </div>
    </div>
  );
};

export default WordRotate;
