// Every notes query is keyed by the filter object, so changing any filter is a
// distinct cache entry and invalidating ["notes"] refetches all of them.
export const queryKeys = {
  notes: (filters) => ["notes", filters],
  notesAll: () => ["notes"],
  note: (id) => ["note", id],
  notebooks: () => ["notebooks"],
  tags: () => ["tags"],
};
