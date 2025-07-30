import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
<<<<<<< HEAD
=======
    userId: {
      type: String,
      required: true,
      index: true,
    },
>>>>>>> 884855a (New Features)
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
