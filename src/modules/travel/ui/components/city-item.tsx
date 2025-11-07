import { useRouter } from "next/navigation";
import { PiArrowRight } from "react-icons/pi";
import TextScroll from "./text-scroll";
import { CitySetWithPhotos } from "@/db/schema";

// Slugify Function
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[\s]+/g, "-") // Replace spaces with dashes
    .replace(/[^\w\-]+/g, ""); // Remove special characters
};

interface CityItemProps {
  city: CitySetWithPhotos;
  onMouseEnter: (city: CitySetWithPhotos) => void;
}

export const CityItem = ({ city, onMouseEnter }: CityItemProps) => {
  const router = useRouter();

  const citySlug = slugify(city.city);

  return (
    <div
      key={city.id}
      className="w-full py-5 px-3 bg-muted hover:bg-muted-hover rounded-xl grid grid-cols-2 items-center cursor-pointer group transition-all duration-150 ease-[cubic-bezier(0.22, 1, 0.36, 1)] flex-1 overflow-hidden"
      onMouseEnter={() => onMouseEnter(city)}
      onClick={() => router.push(`/travel/${citySlug}`)} // Using slug in the URL
    >
      <p className="text-xs lg:text-sm line-clamp-1">{city.city}</p>
      <div className="relative overflow-hidden flex justify-end">
        <div className="flex items-center gap-2 transform transition-transform duration-200 ease-in-out group-hover:-translate-x-7">
          <span className="font-light text-xs lg:text-sm whitespace-nowrap text-right">
            <TextScroll className="w-28 lg:w-full">{city.country}</TextScroll>
          </span>
        </div>
        <div className="absolute right-0 transform translate-x-full transition-transform duration-200 ease-in-out group-hover:translate-x-0 flex items-center">
          <PiArrowRight size={18} />
        </div>
      </div>
    </div>
  );
};
