const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const dateBucket = (note) => {
  const today = startOfDay(new Date());
  const updated = startOfDay(note.updatedAt);
  const days = Math.round((today - updated) / 86_400_000);

  if (days <= 0) return { key: "0-today", label: "Today" };
  if (days === 1) return { key: "1-yesterday", label: "Yesterday" };
  if (days < 7) return { key: "2-week", label: "Earlier this week" };
  if (days < 30) return { key: "3-month", label: "Earlier this month" };
  return { key: "4-older", label: "Older" };
};

// Returns [{ key, label, notes }]. A note with several tags appears under each
// of them, which is the point of grouping by tag.
export const groupNotes = (notes, groupBy, notebooksById) => {
  if (groupBy === "none") return [{ key: "all", label: null, notes }];

  const groups = new Map();
  const push = (key, label, note) => {
    if (!groups.has(key)) groups.set(key, { key, label, notes: [] });
    groups.get(key).notes.push(note);
  };

  for (const note of notes) {
    if (groupBy === "notebook") {
      // Every note has a notebook now; the fallback only covers the moment
      // after one is deleted but before the list refetches.
      const name = notebooksById.get(String(note.notebookId))?.name;
      push(name ?? "￿Unknown", name ?? "Unknown notebook", note);
    } else if (groupBy === "tag") {
      if (!note.tags?.length) push("￿Untagged", "Untagged", note);
      else for (const tag of note.tags) push(tag, tag, note);
    } else if (groupBy === "date") {
      const { key, label } = dateBucket(note);
      push(key, label, note);
    }
  }

  // Date buckets are already chronological via their numeric key prefix; the
  // other modes sort by label, with the "￿" prefix parking the catch-all
  // group last.
  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
};
