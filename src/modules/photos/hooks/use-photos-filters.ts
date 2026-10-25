import { DEFAULT_PAGE } from "@/constants";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";

export const usePhotosFilters = () => {
  return useQueryStates({
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),
    orderBy: parseAsStringEnum(["asc", "desc"] as const)
      .withDefault("desc")
      .withOptions({ clearOnDefault: true }),
    visibility: parseAsStringEnum(["all", "public", "private"] as const)
      .withDefault("all")
      .withOptions({ clearOnDefault: true }),
    favorite: parseAsStringEnum(["all", "favorites", "not-favorites"] as const)
      .withDefault("all")
      .withOptions({ clearOnDefault: true }),
    city: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  });
};
