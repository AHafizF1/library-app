import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getOrgRaw = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("organizations").collect();
  },
});

export const importBookRaw = internalMutation({
  args: {
    organizationId: v.string(),
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
    expectedVolumeCount: v.optional(v.number()),
    visibleVolumes: v.optional(v.array(v.number())),
    copyCount: v.optional(v.number()),
    physicalVolumeCount: v.optional(v.number()),
    column: v.optional(v.string()),
    row: v.optional(v.string()),
    notes: v.optional(v.string()),
    coverStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const organizationId = ctx.db.normalizeId("organizations", args.organizationId);
    if (!organizationId) {
      throw new Error("Invalid organizationId");
    }

    return await ctx.db.insert("books", {
      ...args,
      organizationId,
      createdBy: "system_import",
      createdAt: Date.now(),
    });
  },
});
