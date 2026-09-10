import Notebook from "../models/Notebook.js";

export const INBOX_NAME = "Inbox";

// Returns the user's Inbox, creating it on first use. Written as an upsert
// rather than find-then-create so two concurrent first requests cannot race;
// the partial unique index on { userId, isInbox } is the backstop.
export const ensureInbox = async (userId) => {
  try {
    return await Notebook.findOneAndUpdate(
      { userId, isInbox: true },
      {
        $setOnInsert: {
          userId,
          name: INBOX_NAME,
          isInbox: true,
          icon: "\u{1F4E5}",
          position: -1,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error?.code !== 11000) throw error;

    // Either another request won the race, or the user already had a notebook
    // literally named "Inbox" that tripped the unique { userId, name } index.
    // Promote whichever exists instead of failing the request.
    const existing = await Notebook.findOne({ userId, isInbox: true });
    if (existing) return existing;

    return Notebook.findOneAndUpdate(
      { userId, name: INBOX_NAME },
      { $set: { isInbox: true, position: -1 } },
      { returnDocument: "after" }
    );
  }
};
