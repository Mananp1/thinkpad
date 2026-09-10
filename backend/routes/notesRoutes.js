import express from "express";

import requireAuth from "../middleware/auth.js";
import {
  bulkUpdateNotes,
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  reorderNotes,
  restoreNote,
  updateNote,
} from "../controllers/notesController.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getAllNotes);

// Must come before "/:id" or Express matches these as note ids.
router.patch("/bulk", bulkUpdateNotes);

router.patch("/reorder", reorderNotes);

router.get("/:id", getNoteById);

router.post("/", createNote);

router.post("/:id/restore", restoreNote);

router.put("/:id", updateNote);

router.delete("/:id", deleteNote);

export default router;
