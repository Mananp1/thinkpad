import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { queryKeys } from "../lib/queryKeys";

export const useTags = ({ enabled = true } = {}) => {
  const query = useQuery({
    queryKey: queryKeys.tags(),
    queryFn: async () => (await api.get("/tags")).data,
    enabled,
  });

  return { ...query, tags: query.data ?? [] };
};
