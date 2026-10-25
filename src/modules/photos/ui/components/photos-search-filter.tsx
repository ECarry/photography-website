import { Input } from "@/components/ui/input";
import { usePhotosFilters } from "../../hooks/use-photos-filters";
import { SearchIcon } from "lucide-react";

export const PhotosSearchFilter = () => {
  const [filters, setFilters] = usePhotosFilters();

  return (
    <div className="relative w-full sm:w-[260px]">
      <Input
        placeholder="Search title, details, or location"
        value={filters.search}
        aria-label="Search photos"
        className="h-9 w-full rounded-md border-0 bg-white pl-9 text-[14px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] focus-visible:ring-0 focus-visible:shadow-[0_0_0_1px_#005FCC] dark:bg-[#171717]"
        onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
      />
      <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8F8F8F]" />
    </div>
  );
};
