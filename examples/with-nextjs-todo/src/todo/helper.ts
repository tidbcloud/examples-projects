import { parseAsStringEnum, useQueryState } from "nuqs";

export enum Filter {
  All = "all",
  Active = "active",
  Completed = "completed",
}

export const useFilterState = () => {
  const [filter, setFilter] = useQueryState(
    "filter",
    parseAsStringEnum<Filter>(Object.values(Filter)).withDefault(Filter.All),
  );

  return [filter, setFilter] as const;
};
