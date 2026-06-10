/**
 * Shared Convex validators — single source of truth.
 *
 * Arg fragments and return type shapes used across multiple
 * queries and mutations. Import from here; never define
 * duplicate v.object({}) inline.
 */
import { v } from "convex/values";

// ── Shared argument fragments ──────────────────────────────

/** Organization ID argument — used by every tenant-scoped operation. */
export const orgIdArg = { organizationId: v.string() };

/** Shared book field validators. */
export const bookFields = {
  titleEnglish: v.optional(v.string()),
  titleArabic: v.optional(v.string()),
  titleAmharic: v.optional(v.string()),
  authorEnglish: v.optional(v.string()),
  authorArabic: v.optional(v.string()),
  authorAmharic: v.optional(v.string()),
  publisher: v.optional(v.string()),
  publisherAmharic: v.optional(v.string()),
  isbn: v.optional(v.string()),
  edition: v.optional(v.string()),
  bookType: v.optional(v.union(v.literal("single"), v.literal("multi-volume"))),
  volumeStart: v.optional(v.number()),
  volumeEnd: v.optional(v.number()),
  copyCount: v.optional(v.number()),
  physicalVolumeCount: v.optional(v.number()),
  column: v.optional(v.string()),
  row: v.optional(v.string()),
  notes: v.optional(v.string()),
  coverStorageId: v.optional(v.id("_storage")),
  parentBookId: v.optional(v.id("books")),
  expectedVolumeCount: v.optional(v.number()),
  visibleVolumes: v.optional(v.array(v.number())),
};

/** Shelf creation args. */
export const createShelfArgs = {
  ...orgIdArg,
  name: v.string(),
};

/** Column creation args. */
export const createColumnArgs = {
  ...orgIdArg,
  shelfId: v.id("shelves"),
  label: v.string(),
};

/** Add-row args. */
export const addRowArgs = {
  ...orgIdArg,
  columnId: v.id("columns"),
};

/** Shelf rename args. */
export const renameShelfArgs = {
  ...orgIdArg,
  shelfId: v.id("shelves"),
  name: v.string(),
};

/** List-by-shelf args. */
export const byShelfArgs = {
  ...orgIdArg,
  shelfId: v.id("shelves"),
};

/** List-by-column args. */
export const byColumnArgs = {
  ...orgIdArg,
  columnId: v.id("columns"),
};

// ── Return type validators ─────────────────────────────────

export const shelfDoc = v.object({
  _id: v.id("shelves"),
  _creationTime: v.number(),
  organizationId: v.string(),
  name: v.string(),
  order: v.number(),
});

export const columnDoc = v.object({
  _id: v.id("columns"),
  _creationTime: v.number(),
  organizationId: v.string(),
  shelfId: v.id("shelves"),
  label: v.string(),
  order: v.number(),
});

export const rowDoc = v.object({
  _id: v.id("rows"),
  _creationTime: v.number(),
  organizationId: v.string(),
  columnId: v.id("columns"),
  rowNumber: v.number(),
});

// ── Join Code specific arguments ────────────────────────────
export const createJoinCodeArgs = {
  ...orgIdArg,
  role: v.union(v.literal("member"), v.literal("admin")),
};

export const disableJoinCodeArgs = {
  ...orgIdArg,
  codeId: v.id("orgJoinCodes"),
};

export const joinWithCodeArgs = {
  code: v.string(),
};
