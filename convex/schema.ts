import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),

  organizationMemberships: defineTable({
    organizationId: v.id("organizations"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["organizationId"])
    .index("by_org_user", ["organizationId", "userId"]),

  books: defineTable({
    organizationId: v.id("organizations"),
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
    // Deprecated fields kept for backward compatibility with old records
    expectedVolumeCount: v.optional(v.number()),
    visibleVolumes: v.optional(v.array(v.number())),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_parent", ["parentBookId"]),

  /**
   * A shelf is a physical bookshelf unit within a library (organization).
   * Contains one or more columns.
   */
  shelves: defineTable({
    organizationId: v.string(),
    name: v.string(),
    order: v.number(),
  }).index("by_org", ["organizationId"]),

  /**
   * A column is a vertical section within a shelf.
   * Each column is created with DEFAULT_ROWS_PER_COLUMN rows.
   */
  columns: defineTable({
    organizationId: v.string(),
    shelfId: v.id("shelves"),
    label: v.string(),
    order: v.number(),
  })
    .index("by_shelf", ["shelfId"])
    .index("by_org", ["organizationId"]),

  /**
   * A row is a horizontal slot within a column where books are placed.
   * Rows are numbered starting from 1.
   */
  rows: defineTable({
    organizationId: v.string(),
    columnId: v.id("columns"),
    rowNumber: v.number(),
  })
    .index("by_column", ["columnId"])
    .index("by_org", ["organizationId"]),

  /**
   * Access codes to join an organization workspace directly.
   */
  orgJoinCodes: defineTable({
    organizationId: v.string(),
    code: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
    createdById: v.string(),
    isActive: v.boolean(),
  })
    .index("by_code", ["code"])
    .index("by_org", ["organizationId"]),
});
