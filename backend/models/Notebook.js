import mongoose from "mongoose";

const notebookSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    // Hex string shown as a dot in the sidebar, header and note cards.
    color: {
      type: String,
      default: null,
    },

    // A single emoji standing in for the generic folder glyph.
    icon: {
      type: String,
      default: null,
    },

    // Every user has exactly one Inbox. It is created on demand, cannot be
    // renamed or deleted, and is where notes land when no notebook is chosen.
    isInbox: {
      type: Boolean,
      default: false,
    },

    // Manual sidebar ordering; Inbox sits at -1 so it always leads.
    position: {
      type: Number,
      default: 0,
    },

    // Each notebook remembers how it likes to be looked at.
    viewSort: {
      type: String,
      default: "updatedAt",
    },
    viewOrder: {
      type: String,
      default: "desc",
    },
    viewGroup: {
      type: String,
      default: "none",
    },
  },
  { timestamps: true }
);

// Names are unique per user, case-insensitively: "Work" and "work" collide.
notebookSchema.index(
  { userId: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

// Makes "one Inbox per user" an invariant the database enforces, so two
// concurrent first requests cannot both create one.
notebookSchema.index(
  { userId: 1, isInbox: 1 },
  { unique: true, partialFilterExpression: { isInbox: true } }
);

const Notebook = mongoose.model("Notebook", notebookSchema);

export default Notebook;
