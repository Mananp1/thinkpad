import express from "express";

import requireAuth from "../middleware/auth.js";
import {
  createNotebook,
  deleteNotebook,
  getAllNotebooks,
  reorderNotebooks,
  updateNotebook,
} from "../controllers/notebooksController.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getAllNotebooks);

router.post("/", createNotebook);

// Must come before "/:id" or Express matches "reorder" as a notebook id.
router.patch("/reorder", reorderNotebooks);

router.put("/:id", updateNotebook);

router.delete("/:id", deleteNotebook);

export default router;
