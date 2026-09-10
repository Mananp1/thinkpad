import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    // Every note lives in exactly one notebook; with no explicit choice it
    // lands in the user's Inbox, so this is never null.
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notebook",
      required: true,
    },

    // Normalized to lowercase by normalizeTags() before it reaches the model.
    tags: {
      type: [String],
      default: [],
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    // Manual ordering within a notebook, used by the "custom" sort. A reorder
    // writes 1..n, so a freshly created note at 0 lands at the top.
    position: {
      type: Number,
      default: 0,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    // Non-null means the note is in the trash. Kept as a date so a retention
    // sweep can find notes trashed before some cutoff.
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// The default list: one user's live, unarchived notes, pinned first.
noteSchema.index({ userId: 1, deletedAt: 1, isArchived: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ userId: 1, notebookId: 1, updatedAt: -1 });
noteSchema.index({ userId: 1, notebookId: 1, isPinned: -1, position: 1 });
noteSchema.index({ userId: 1, tags: 1 });

const Note = mongoose.model("Note", noteSchema);

export default Note;
