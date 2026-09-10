import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import { ensureInbox } from "../lib/inbox.js";
import Note from "../models/Note.js";

// One-off: notes written before the Inbox existed have notebookId null or
// missing. Give every user an Inbox and move those notes into it, so
// notebookId can become required.
const run = async () => {
  await connectDB();

  const userIds = await Note.distinct("userId", { notebookId: null });
  if (!userIds.length) {
    console.log("Nothing to migrate - every note already has a notebook.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${userIds.length} user(s) with unfiled notes.`);
  let total = 0;

  for (const userId of userIds) {
    const inbox = await ensureInbox(userId);
    // { notebookId: null } also matches documents missing the field entirely.
    const { modifiedCount } = await Note.updateMany(
      { userId, notebookId: null },
      { $set: { notebookId: inbox._id } }
    );
    total += modifiedCount;
    console.log(`  ${userId}: ${modifiedCount} note(s) -> Inbox ${inbox._id}`);
  }

  const remaining = await Note.countDocuments({ notebookId: null });
  console.log(`\nMoved ${total} note(s). Remaining unfiled: ${remaining}`);

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});
