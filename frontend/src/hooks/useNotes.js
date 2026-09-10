import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { queryKeys } from "../lib/queryKeys";

const PAGE_SIZE = 24;

// scope says *where* (route-derived), filters say *how narrowed* (query
// string), settings say *how ordered*. The API contract is unchanged.
const toParams = ({ scope, filters, settings }, page) => {
  const params = {
    page,
    limit: PAGE_SIZE,
    view: scope.view,
    sort: settings.sort,
    order: settings.order,
  };
  if (scope.notebookId) params.notebookId = scope.notebookId;
  if (filters.q) params.q = filters.q;
  if (filters.tags.length) {
    params.tags = filters.tags.join(",");
    params.tagMatch = filters.tagMatch;
  }
  return params;
};

// "Load more" rather than numbered pages: grouping runs over everything loaded
// so far, so groups accumulate instead of fragmenting at each page boundary.
export const useNotes = (request, { enabled = true } = {}) => {
  const query = useInfiniteQuery({
    queryKey: queryKeys.notes(request),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await api.get("/notes", { params: toParams(request, pageParam) });
      return res.data;
    },
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
    enabled,
  });

  const notes = query.data?.pages.flatMap((page) => page.notes) ?? [];

  return { ...query, notes, total: query.data?.pages[0]?.total ?? 0 };
};
