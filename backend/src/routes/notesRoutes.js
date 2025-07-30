import express from "express";
<<<<<<< HEAD
=======
import checkJwt from "../middleware/auth.js";
>>>>>>> 884855a (New Features)
import {
  createNote,
  deleteNote,
  getAllNotes,
  updateNote,
  getNoteById,
} from "../controllers/notesController.js";
<<<<<<< HEAD

const router = express.Router();

=======
import rateLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(checkJwt);
router.use(rateLimiter);

>>>>>>> 884855a (New Features)
router.get("/", getAllNotes);

router.get("/:id", getNoteById);

router.post("/", createNote);

router.put("/:id", updateNote);

router.delete("/:id", deleteNote);

export default router;
