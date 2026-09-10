import mongoose from "mongoose";

import Notebook from "../models/Notebook.js";

export const VIEWS = ["all", "pinned", "archived", "trash"];
export const SORT_FIELDS = ["updatedAt", "createdAt", "title", "custom"];

// "custom" is the manual drag order, stored per note as `position`.
const SORT_PATHS = { custom: "position" };

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 32;

// Title sorting should read alphabetically to a human, so compare
// case-insensitively rather than putting every uppercase title first.
export const CASE_INSENSITIVE = { locale: "en", strength: 2 };

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

// User input lands inside a RegExp, so a stray "(" or "+" would either throw or
// silently mean something else.
export const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Accepts an array or a comma-separated string, since tags arrive as a query
// param on reads and as JSON on writes.
export const normalizeTags = (input) => {
  if (input === undefined || input === null) return [];

  const raw = Array.isArray(input) ? input : String(input).split(",");

  const cleaned = raw
    .map((tag) => String(tag).trim().replace(/^#+/, "").toLowerCase())
    .filter(Boolean)
    .map((tag) => tag.slice(0, MAX_TAG_LENGTH));

  return [...new Set(cleaned)].slice(0, MAX_TAGS);
};

const parseNotebookId = (value) => {
  if (!value) return undefined;
  if (!mongoose.isValidObjectId(value)) throw badRequest("Invalid notebookId");
  return value;
};

export const parseListQuery = (query = {}) => {
  const view = query.view ?? "all";
  if (!VIEWS.includes(view)) throw badRequest("Invalid view");

  const sort = query.sort ?? "updatedAt";
  if (!SORT_FIELDS.includes(sort)) throw badRequest("Invalid sort field");

  const order = query.order ?? "desc";
  if (order !== "asc" && order !== "desc") throw badRequest("Invalid sort order");

  const tagMatch = query.tagMatch ?? "any";
  if (tagMatch !== "any" && tagMatch !== "all") throw badRequest("Invalid tagMatch");

  const page = Number.parseInt(query.page ?? "1", 10);
  if (!Number.isInteger(page) || page < 1) throw badRequest("Invalid page");

  const limit = Number.parseInt(query.limit ?? String(DEFAULT_LIMIT), 10);
  if (!Number.isInteger(limit) || limit < 1) throw badRequest("Invalid limit");

  return {
    view,
    q: String(query.q ?? "").trim(),
    notebookId: parseNotebookId(query.notebookId),
    tags: normalizeTags(query.tags),
    tagMatch,
    sort,
    order,
    page,
    limit: Math.min(limit, MAX_LIMIT),
  };
};

export const buildNoteFilter = (userId, parsed) => {
  const { view, q, notebookId, tags, tagMatch } = parsed;
  const filter = { userId };

  if (view === "trash") {
    filter.deletedAt = { $ne: null };
  } else {
    filter.deletedAt = null;
    // $ne matches false, null and *missing*, so notes written before these
    // fields existed still show up without a backfill.
    filter.isArchived = view === "archived" ? true : { $ne: true };
    if (view === "pinned") filter.isPinned = true;
  }

  if (notebookId) filter.notebookId = notebookId;

  if (tags.length) filter.tags = tagMatch === "all" ? { $all: tags } : { $in: tags };

  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ title: rx }, { content: rx }];
  }

  return filter;
};

export const buildNoteSort = ({ sort, order }) => {
  const direction = order === "asc" ? 1 : -1;
  // Manual order is the order itself, so `order` only flips the direction you
  // walk it; createdAt breaks ties between notes never dragged (position 0).
  if (sort === "custom") {
    return { isPinned: -1, position: direction, createdAt: -1 };
  }
  return { isPinned: -1, [SORT_PATHS[sort] ?? sort]: direction };
};

// Guards every write that names a notebook: an id belonging to somebody else
// must be indistinguishable from one that does not exist. A blank value means
// "no choice made", which callers resolve to the user's Inbox.
export const assertNotebookOwned = async (userId, notebookId) => {
  if (notebookId === undefined || notebookId === null || notebookId === "") return undefined;

  if (!mongoose.isValidObjectId(notebookId)) {
    throw Object.assign(new Error("Notebook not found!"), { status: 404 });
  }

  const notebook = await Notebook.exists({ _id: notebookId, userId });
  if (!notebook) {
    throw Object.assign(new Error("Notebook not found!"), { status: 404 });
  }

  return notebookId;
};

// Keeps the id list bounded and drops anything that could never match, so a
// bulk call cannot be used to probe for valid ObjectIds.
export const parseNoteIds = (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) throw badRequest("ids must be a non-empty array");
  if (ids.length > MAX_LIMIT) throw badRequest(`ids is limited to ${MAX_LIMIT} entries`);

  const valid = ids.filter((id) => mongoose.isValidObjectId(id));
  if (!valid.length) throw badRequest("ids contains no valid note ids");

  return valid;
};
