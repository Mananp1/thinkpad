import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

// Only things that *narrow* a place live here. Where you are is the route's
// job - see useNoteScope.
export const DEFAULT_FILTERS = {
  q: "",
  tags: [],
  tagMatch: "any",
};

export const useNoteFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const tags = searchParams.get("tags");
    return {
      q: searchParams.get("q") || "",
      tags: tags ? tags.split(",").filter(Boolean) : [],
      tagMatch: searchParams.get("tagMatch") || DEFAULT_FILTERS.tagMatch,
    };
  }, [searchParams]);

  // Values equal to the default are dropped so the URL stays readable.
  const setFilters = useCallback(
    (patch) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            const serialized = Array.isArray(value) ? value.join(",") : value;
            if (!serialized || serialized === DEFAULT_FILTERS[key]) next.delete(key);
            else next.set(key, serialized);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const toggleTag = useCallback(
    (tag) => {
      const next = filters.tags.includes(tag)
        ? filters.tags.filter((t) => t !== tag)
        : [...filters.tags, tag];
      setFilters({ tags: next });
    },
    [filters.tags, setFilters]
  );

  // Clears the narrowing only - never the notebook or view you are in.
  const clearFilters = useCallback(
    () => setFilters({ q: "", tags: [], tagMatch: "any" }),
    [setFilters]
  );

  const hasActiveFilters = Boolean(filters.q) || filters.tags.length > 0;

  return { filters, setFilters, toggleTag, clearFilters, hasActiveFilters };
};
