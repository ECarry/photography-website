import { Input } from "@/components/ui/input";
import { usePhotosFilters } from "../../hooks/use-photos-filters";
import { SearchIcon } from "lucide-react";

export const PhotosSearchFilter = () => {
  const [filters, setFilters] = usePhotosFilters();

  return (
    <div className="relative">
      <Input
        placeholder="Filter by title"
        value={filters.search}
        className="h-9 w-[200px] pl-7"
        onChange={(e) => setFilters({ search: e.target.value })}
      />
      <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2" />
    </div>
  );
};
