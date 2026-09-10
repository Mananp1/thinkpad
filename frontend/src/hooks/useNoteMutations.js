import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { queryKeys } from "../lib/queryKeys";

// Any note write can shift tag counts and notebook counts, so all three
// caches are invalidated together rather than trying to patch them by hand.
export const useNoteMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notesAll() });
    queryClient.invalidateQueries({ queryKey: queryKeys.tags() });
    queryClient.invalidateQueries({ queryKey: queryKeys.notebooks() });
  };

  const onError = (error, fallback) =>
    toast.error(error.response?.data?.message || fallback);

  const createNote = useMutation({
    mutationFn: async (body) => (await api.post("/notes", body)).data,
    onSuccess: invalidate,
    onError: (e) => onError(e, "Could not create note"),
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, ...body }) => (await api.put(`/notes/${id}`, body)).data,
    onSuccess: (note) => {
      queryClient.setQueryData(queryKeys.note(note._id), note);
      invalidate();
    },
    onError: (e) => onError(e, "Could not update note"),
  });

  const trashNote = useMutation({
    mutationFn: async (id) => (await api.delete(`/notes/${id}`)).data,
    onSuccess: () => {
      invalidate();
      toast.success("Note moved to Trash");
    },
    onError: (e) => onError(e, "Could not delete note"),
  });

  const restoreNote = useMutation({
    mutationFn: async (id) => (await api.post(`/notes/${id}/restore`)).data,
    onSuccess: () => {
      invalidate();
      toast.success("Note restored");
    },
    onError: (e) => onError(e, "Could not restore note"),
  });

  const deleteForever = useMutation({
    mutationFn: async (id) => (await api.delete(`/notes/${id}`, { params: { permanent: true } })).data,
    onSuccess: () => {
      invalidate();
      toast.success("Note deleted permanently");
    },
    onError: (e) => onError(e, "Could not delete note"),
  });

  // Optimistic: the card must not jump back to its old slot mid-request.
  const reorderNotes = useMutation({
    mutationFn: async (body) => (await api.patch("/notes/reorder", body)).data,
    onMutate: async ({ orderedIds }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notesAll() });
      const snapshots = queryClient.getQueriesData({ queryKey: queryKeys.notesAll() });
      const rank = new Map(orderedIds.map((id, index) => [id, index]));

      queryClient.setQueriesData({ queryKey: queryKeys.notesAll() }, (old) => {
        if (!old?.pages) return old;
        const all = old.pages.flatMap((page) => page.notes);
        if (!all.some((note) => rank.has(note._id))) return old;

        const sorted = [...all].sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return (rank.get(a._id) ?? 0) - (rank.get(b._id) ?? 0);
        });

        // Re-slice the flat order back into the pages it came from.
        let cursor = 0;
        return {
          ...old,
          pages: old.pages.map((page) => {
            const notes = sorted.slice(cursor, cursor + page.notes.length);
            cursor += page.notes.length;
            return { ...page, notes };
          }),
        };
      });

      return { snapshots };
    },
    onError: (error, _vars, context) => {
      for (const [key, data] of context?.snapshots ?? []) queryClient.setQueryData(key, data);
      onError(error, "Could not reorder notes");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notesAll() }),
  });

  const bulkUpdate = useMutation({
    mutationFn: async (body) => (await api.patch("/notes/bulk", body)).data,
    onSuccess: invalidate,
    onError: (e) => onError(e, "Bulk action failed"),
  });

  return { createNote, updateNote, trashNote, restoreNote, deleteForever, reorderNotes, bulkUpdate };
};
