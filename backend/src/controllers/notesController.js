import Note from "../models/Note.js";

export const getAllNotes = async (req, res) => {
  try {

    if (!req.user?.sub)
      return res.status(401).json({ message: "Unauthorized" });
    const notes = await Note.find({ userId: req.user.sub }).sort({
      createdAt: -1,
    });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in getAllNotes controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

export const getNoteById = async (req, res) => {
  try {

    if (!req.user?.sub)
      return res.status(401).json({ message: "Unauthorized" });
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.sub,
    });

    if (!note) return res.status(404).json({ message: "Note not found!" });
    res.status(200).json(note);
  } catch (error) {
    console.error("Error in getNoteById controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

export const createNote = async (req, res) => {
  try {

    if (!req.user?.sub)
      return res.status(401).json({ message: "Unauthorized" });
    const { title, content } = req.body;
    const note = new Note({
      title,
      content,
      userId: req.user.sub,
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error in createdNote controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

export const updateNote = async (req, res) => {
  try {

    if (!req.user?.sub)
      return res.status(401).json({ message: "Unauthorized" });
    const { title, content } = req.body;
    const updatedNote = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.sub,
      },
      { title, content },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found!" });
    }

    return res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error in updateNote controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

export const deleteNote = async (req, res) => {
  try {

    if (!req.user?.sub)
      return res.status(401).json({ message: "Unauthorized" });
    const deletedNote = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.sub,
    });

    if (!deletedNote)
      return res.status(404).json({ message: "Note not found!" });

    res.status(200).json(deletedNote);
  } catch (error) {
    console.error("Error in deletNote controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
};
