import { Input } from "@/components/ui/input";
import { usePostsFilters } from "../../hooks/use-posts-filters";
import { SearchIcon } from "lucide-react";

export const PostsSearchFilter = () => {
  const [filters, setFilters] = usePostsFilters();

  return (
    <div className="relative w-full sm:w-[300px]">
      <Input
        placeholder="Search stories"
        value={filters.search}
        aria-label="Search stories"
        className="h-9 w-full rounded-md border-0 bg-white pl-9 text-[14px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] focus-visible:ring-0 focus-visible:shadow-[0_0_0_1px_#005FCC] dark:bg-[#171717]"
        onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
      />
      <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8F8F8F]" />
    </div>
  );
};
