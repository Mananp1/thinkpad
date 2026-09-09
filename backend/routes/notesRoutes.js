import express from "express";

import requireAuth from "../middleware/auth.js";
import {
  createNote,
  deleteNote,
  getAllNotes,
  updateNote,
  getNoteById,
} from "../controllers/notesController.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getAllNotes);

router.get("/:id", getNoteById);

router.post("/", createNote);

router.put("/:id", updateNote);

router.delete("/:id", deleteNote);

export default router;
