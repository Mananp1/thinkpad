import express from "express";

import checkJwt from "../middleware/auth.js";
import {
  createNote,
  deleteNote,
  getAllNotes,
  updateNote,
  getNoteById,
} from "../controllers/notesController.js";

import rateLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(checkJwt);
router.use(rateLimiter);

router.get("/", getAllNotes);

router.get("/:id", getNoteById);

router.post("/", createNote);

router.put("/:id", updateNote);

router.delete("/:id", deleteNote);

export default router;
