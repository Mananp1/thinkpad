import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { queryKeys } from "../lib/queryKeys";

export const useNotebooks = ({ enabled = true } = {}) => {
  const query = useQuery({
    queryKey: queryKeys.notebooks(),
    queryFn: async () => (await api.get("/notebooks")).data,
    enabled,
  });

  return { ...query, notebooks: query.data?.notebooks ?? [] };
};

export const useNotebookMutations = () => {
  const queryClient = useQueryClient();

  // Deleting a notebook unfiles its notes, so the note lists have to refetch too.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notebooks() });
    queryClient.invalidateQueries({ queryKey: queryKeys.notesAll() });
  };

  const onError = (error, fallback) =>
    toast.error(error.response?.data?.message || fallback);

  const create = useMutation({
    mutationFn: async (body) => (await api.post("/notebooks", body)).data,
    onSuccess: () => {
      invalidate();
      toast.success("Notebook created");
    },
    onError: (e) => onError(e, "Could not create notebook"),
  });

  // Covers renaming, colour, icon and the per-notebook view settings; they all
  // go through the same whitelisted PUT.
  const update = useMutation({
    mutationFn: async ({ id, ...body }) => (await api.put(`/notebooks/${id}`, body)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notebooks() }),
    onError: (e) => onError(e, "Could not update notebook"),
  });

  const reorder = useMutation({
    mutationFn: async (orderedIds) =>
      (await api.patch("/notebooks/reorder", { orderedIds })).data,
    // Optimistic: the row must not snap back while the request is in flight.
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notebooks() });
      const previous = queryClient.getQueryData(queryKeys.notebooks());
      queryClient.setQueryData(queryKeys.notebooks(), (old) => {
        if (!old) return old;
        const rank = new Map(orderedIds.map((id, index) => [id, index]));
        const sorted = [...old.notebooks].sort((a, b) => {
          if (a.isInbox !== b.isInbox) return a.isInbox ? -1 : 1;
          return (rank.get(a._id) ?? 0) - (rank.get(b._id) ?? 0);
        });
        return { ...old, notebooks: sorted };
      });
      return { previous };
    },
    onError: (e, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.notebooks(), context.previous);
      onError(e, "Could not reorder notebooks");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notebooks() }),
  });

  const remove = useMutation({
    mutationFn: async (id) => (await api.delete(`/notebooks/${id}`)).data,
    onSuccess: () => {
      invalidate();
      toast.success("Notebook deleted - its notes moved to Inbox");
    },
    onError: (e) => onError(e, "Could not delete notebook"),
  });

  return { create, update, reorder, remove };
};
