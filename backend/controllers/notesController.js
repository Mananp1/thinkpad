import Note from "../models/Note.js";
import { ensureInbox } from "../lib/inbox.js";
import {
  CASE_INSENSITIVE,
  assertNotebookOwned,
  buildNoteFilter,
  buildNoteSort,
  normalizeTags,
  parseListQuery,
  parseNoteIds,
} from "../lib/noteQuery.js";

// The helpers throw errors carrying a `status`; anything without one is a bug
// on our side and should not leak its message to the client.
const handleError = (res, error, where) => {
  if (error?.status) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(`Error in ${where} controller`, error);
  return res.status(500).json({ message: "Internal server error!" });
};

export const getAllNotes = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const parsed = parseListQuery(req.query);
    const filter = buildNoteFilter(req.user.id, parsed);
    const skip = (parsed.page - 1) * parsed.limit;

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .sort(buildNoteSort(parsed))
        .collation(CASE_INSENSITIVE)
        .skip(skip)
        .limit(parsed.limit),
      Note.countDocuments(filter),
    ]);

    res.status(200).json({
      notes,
      total,
      page: parsed.page,
      pages: Math.max(1, Math.ceil(total / parsed.limit)),
      limit: parsed.limit,
    });
  } catch (error) {
    handleError(res, error, "getAllNotes");
  }
};

export const getNoteById = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) return res.status(404).json({ message: "Note not found!" });
    res.status(200).json(note);
  } catch (error) {
    handleError(res, error, "getNoteById");
  }
};

export const createNote = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
    const { title, content, notebookId, tags, isPinned } = req.body;

    // No explicit notebook means Inbox - a note is never left without one.
    const owned = await assertNotebookOwned(req.user.id, notebookId);
    const note = new Note({
      title,
      content,
      userId: req.user.id,
      notebookId: owned ?? (await ensureInbox(req.user.id))._id,
      tags: normalizeTags(tags),
      isPinned: Boolean(isPinned),
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    handleError(res, error, "createNote");
  }
};

export const updateNote = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
    const { title, content, notebookId, tags, isPinned, isArchived } = req.body;

    // Only touch what the caller actually sent, so a pin toggle does not have
    // to round-trip the whole note.
    const update = {};
    if (title !== undefined) update.title = title;
    if (content !== undefined) update.content = content;
    if (tags !== undefined) update.tags = normalizeTags(tags);
    if (isPinned !== undefined) update.isPinned = Boolean(isPinned);
    if (isArchived !== undefined) update.isArchived = Boolean(isArchived);
    if (notebookId !== undefined) {
      const owned = await assertNotebookOwned(req.user.id, notebookId);
      update.notebookId = owned ?? (await ensureInbox(req.user.id))._id;
      // Manual order is per notebook, so a moved note starts unordered.
      update.position = 0;
    }

    const updatedNote = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      update,
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found!" });
    }

    return res.status(200).json(updatedNote);
  } catch (error) {
    handleError(res, error, "updateNote");
  }
};

// Soft delete by default: the note moves to the trash view and can be restored.
// ?permanent=true is the only way to actually remove it.
export const deleteNote = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const scope = { _id: req.params.id, userId: req.user.id };
    const permanent = req.query.permanent === "true";

    const deletedNote = permanent
      ? await Note.findOneAndDelete(scope)
      : await Note.findOneAndUpdate(scope, { deletedAt: new Date() }, { returnDocument: "after" });

    if (!deletedNote) return res.status(404).json({ message: "Note not found!" });

    res.status(200).json(deletedNote);
  } catch (error) {
    handleError(res, error, "deleteNote");
  }
};

export const restoreNote = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const restored = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { deletedAt: null },
      { returnDocument: "after" }
    );

    if (!restored) return res.status(404).json({ message: "Note not found!" });

    res.status(200).json(restored);
  } catch (error) {
    handleError(res, error, "restoreNote");
  }
};

const BULK_ACTIONS = {
  archive: () => ({ isArchived: true }),
  unarchive: () => ({ isArchived: false }),
  pin: () => ({ isPinned: true }),
  unpin: () => ({ isPinned: false }),
  trash: () => ({ deletedAt: new Date() }),
  restore: () => ({ deletedAt: null }),
};

export const bulkUpdateNotes = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { ids, action, value } = req.body ?? {};
    const noteIds = parseNoteIds(ids);
    // userId lives in the filter, never the body, so a forged id simply matches
    // nothing rather than reaching another user's notes.
    const scope = { _id: { $in: noteIds }, userId: req.user.id };

    if (action === "purge") {
      const { deletedCount } = await Note.deleteMany(scope);
      return res.status(200).json({ matched: deletedCount, action });
    }

    let update;
    if (action === "move") {
      const owned = await assertNotebookOwned(req.user.id, value);
      update = { notebookId: owned ?? (await ensureInbox(req.user.id))._id, position: 0 };
    } else if (action === "tag" || action === "untag") {
      const tags = normalizeTags(value);
      if (!tags.length) {
        return res.status(400).json({ message: "value must contain at least one tag" });
      }
      update = action === "tag" ? { $addToSet: { tags: { $each: tags } } } : { $pullAll: { tags } };
    } else if (BULK_ACTIONS[action]) {
      update = BULK_ACTIONS[action]();
    } else {
      return res.status(400).json({ message: "Invalid bulk action" });
    }

    const { modifiedCount } = await Note.updateMany(scope, update);
    res.status(200).json({ matched: modifiedCount, action });
  } catch (error) {
    handleError(res, error, "bulkUpdateNotes");
  }
};

// Writes the manual drag order for one notebook. Positions start at 1 so a
// newly created note (position 0) still sorts to the top.
export const reorderNotes = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { notebookId, orderedIds } = req.body ?? {};
    const notebook = await assertNotebookOwned(req.user.id, notebookId);
    if (!notebook) return res.status(400).json({ message: "notebookId is required" });

    const noteIds = parseNoteIds(orderedIds);

    // userId and notebookId both live in the filter, so ids that belong to
    // another user or another notebook simply match nothing.
    const { modifiedCount } = await Note.bulkWrite(
      noteIds.map((id, index) => ({
        updateOne: {
          filter: { _id: id, userId: req.user.id, notebookId: notebook },
          update: { $set: { position: index + 1 } },
        },
      }))
    ).then((result) => ({ modifiedCount: result.modifiedCount ?? 0 }));

    res.status(200).json({ reordered: modifiedCount });
  } catch (error) {
    handleError(res, error, "reorderNotes");
  }
};
