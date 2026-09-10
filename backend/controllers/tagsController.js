import Note from "../models/Note.js";

// The sidebar tag list is derived from the notes themselves rather than stored
// separately, so it can never drift out of sync with what is actually tagged.
export const getAllTags = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const tags = await Note.aggregate([
      { $match: { userId: req.user.id, deletedAt: null, isArchived: { $ne: true } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]);

    res.status(200).json(tags.map(({ _id, count }) => ({ tag: _id, count })));
  } catch (error) {
    console.error("Error in getAllTags controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
};
