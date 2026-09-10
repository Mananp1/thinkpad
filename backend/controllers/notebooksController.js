import mongoose from "mongoose";

import Note from "../models/Note.js";
import Notebook from "../models/Notebook.js";
import { ensureInbox } from "../lib/inbox.js";
import { SORT_FIELDS } from "../lib/noteQuery.js";

const GROUP_OPTIONS = ["none", "notebook", "tag", "date"];

const handleError = (res, error, where) => {
  // A duplicate key here can only be the { userId, name } index.
  if (error?.code === 11000) {
    return res.status(409).json({ message: "A notebook with that name already exists" });
  }
  if (error?.status) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(`Error in ${where} controller`, error);
  return res.status(500).json({ message: "Internal server error!" });
};

export const getAllNotebooks = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    // A fresh account gets its Inbox here, before it can ever be listed empty.
    await ensureInbox(req.user.id);

    // One grouped pass over the notes beats a per-notebook count query.
    const [notebooks, counts] = await Promise.all([
      Notebook.find({ userId: req.user.id })
        .sort({ position: 1, name: 1 })
        .collation({ locale: "en", strength: 2 }),
      Note.aggregate([
        { $match: { userId: req.user.id, deletedAt: null, isArchived: { $ne: true } } },
        { $group: { _id: "$notebookId", count: { $sum: 1 } } },
      ]),
    ]);

    const countByNotebook = new Map(counts.map((c) => [String(c._id), c.count]));

    res.status(200).json({
      notebooks: notebooks.map((notebook) => ({
        ...notebook.toObject(),
        noteCount: countByNotebook.get(String(notebook._id)) ?? 0,
      })),
    });
  } catch (error) {
    handleError(res, error, "getAllNotebooks");
  }
};

export const createNotebook = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { name, color, icon, position } = req.body ?? {};
    if (!String(name ?? "").trim()) {
      return res.status(400).json({ message: "Notebook name is required" });
    }

    const notebook = await Notebook.create({
      userId: req.user.id,
      name,
      color: color ?? null,
      icon: icon ?? null,
      position: Number.isFinite(position) ? position : 0,
    });

    res.status(201).json({ ...notebook.toObject(), noteCount: 0 });
  } catch (error) {
    handleError(res, error, "createNotebook");
  }
};

export const updateNotebook = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { name, color, icon, position, viewSort, viewOrder, viewGroup } = req.body ?? {};
    const existing = await Notebook.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existing) return res.status(404).json({ message: "Notebook not found!" });

    const update = {};

    if (name !== undefined) {
      // The Inbox is a fixed destination; renaming it would make it
      // unrecognisable while still behaving as the default.
      if (existing.isInbox) {
        return res.status(400).json({ message: "The Inbox cannot be renamed" });
      }
      if (!String(name).trim()) {
        return res.status(400).json({ message: "Notebook name is required" });
      }
      update.name = name;
    }

    if (color !== undefined) update.color = color;
    if (icon !== undefined) update.icon = icon;
    if (position !== undefined) update.position = position;

    // View settings are per notebook, and validated the same way the list
    // endpoint validates its query params.
    if (viewSort !== undefined) {
      if (!SORT_FIELDS.includes(viewSort)) {
        return res.status(400).json({ message: "Invalid viewSort" });
      }
      update.viewSort = viewSort;
    }
    if (viewOrder !== undefined) {
      if (viewOrder !== "asc" && viewOrder !== "desc") {
        return res.status(400).json({ message: "Invalid viewOrder" });
      }
      update.viewOrder = viewOrder;
    }
    if (viewGroup !== undefined) {
      if (!GROUP_OPTIONS.includes(viewGroup)) {
        return res.status(400).json({ message: "Invalid viewGroup" });
      }
      update.viewGroup = viewGroup;
    }

    const updated = await Notebook.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { returnDocument: "after", runValidators: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    handleError(res, error, "updateNotebook");
  }
};

// Deleting a notebook never deletes notes - they fall back to the Inbox.
export const deleteNotebook = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Notebook not found!" });
    }

    const target = await Notebook.findOne({ _id: req.params.id, userId: req.user.id });
    if (!target) return res.status(404).json({ message: "Notebook not found!" });
    if (target.isInbox) {
      return res.status(400).json({ message: "The Inbox cannot be deleted" });
    }

    const inbox = await ensureInbox(req.user.id);
    const { modifiedCount } = await Note.updateMany(
      { userId: req.user.id, notebookId: target._id },
      { notebookId: inbox._id, position: 0 }
    );

    await Notebook.deleteOne({ _id: target._id, userId: req.user.id });

    res.status(200).json({ notebook: target, notesMovedToInbox: modifiedCount });
  } catch (error) {
    handleError(res, error, "deleteNotebook");
  }
};

export const reorderNotebooks = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { orderedIds } = req.body ?? {};
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ message: "orderedIds must be a non-empty array" });
    }

    const valid = orderedIds.filter((id) => mongoose.isValidObjectId(id));
    if (!valid.length) {
      return res.status(400).json({ message: "orderedIds contains no valid notebook ids" });
    }

    // userId in the filter means ids belonging to anyone else match nothing.
    // Inbox is excluded so it keeps position -1 and stays pinned to the top.
    const result = await Notebook.bulkWrite(
      valid.map((id, index) => ({
        updateOne: {
          filter: { _id: id, userId: req.user.id, isInbox: { $ne: true } },
          update: { $set: { position: index } },
        },
      }))
    );

    res.status(200).json({ reordered: result.modifiedCount ?? 0 });
  } catch (error) {
    handleError(res, error, "reorderNotebooks");
  }
};
