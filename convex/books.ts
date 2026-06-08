import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireTenantAccess } from "./tenantAccess";

const optionalText = v.optional(v.string());

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(v.object({
    id: v.string(),
    titleEnglish: optionalText,
    titleArabic: optionalText,
    titleAmharic: optionalText,
    authorEnglish: optionalText,
    authorArabic: optionalText,
    authorAmharic: optionalText,
    publisher: optionalText,
    publisherAmharic: optionalText,
    coverUrl: v.union(v.string(), v.null()),
  })),
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);
    const organizationId = ctx.db.normalizeId("organizations", args.organizationId);
    if (!organizationId) return [];
    const books = await ctx.db.query("books").withIndex("by_org", (q) => q.eq("organizationId", organizationId)).order("desc").collect();
    return await Promise.all(books.map(async (book) => ({
      id: book._id,
      titleEnglish: book.titleEnglish,
      titleArabic: book.titleArabic,
      titleAmharic: book.titleAmharic,
      authorEnglish: book.authorEnglish,
      authorArabic: book.authorArabic,
      authorAmharic: book.authorAmharic,
      publisher: book.publisher,
      publisherAmharic: book.publisherAmharic,
      coverUrl: book.coverStorageId ? await ctx.storage.getUrl(book.coverStorageId) : null,
    })));
  },
});

export const generateUploadUrl = mutation({
  args: { organizationId: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    organizationId: v.string(),
    titleEnglish: optionalText,
    titleArabic: optionalText,
    titleAmharic: optionalText,
    authorEnglish: optionalText,
    authorArabic: optionalText,
    authorAmharic: optionalText,
    publisher: optionalText,
    publisherAmharic: optionalText,
    isbn: optionalText,
    edition: optionalText,
    bookType: v.optional(v.union(v.literal("single"), v.literal("multi-volume"))),
    expectedVolumeCount: v.optional(v.number()),
    visibleVolumes: v.optional(v.array(v.number())),
    copyCount: v.optional(v.number()),
    physicalVolumeCount: v.optional(v.number()),
    column: optionalText,
    row: optionalText,
    notes: optionalText,
    coverStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("books"),
  handler: async (ctx, args) => {
    const access = await requireTenantAccess(ctx, args.organizationId);
    const organizationId = ctx.db.normalizeId("organizations", args.organizationId);
    if (!organizationId) throw new ConvexError("Organization not found");
    if (!args.titleEnglish?.trim() && !args.titleArabic?.trim() && !args.titleAmharic?.trim()) {
      throw new ConvexError("English, Arabic, or Amharic title is required");
    }
    const clean = (value?: string) => value?.trim() || undefined;
    return await ctx.db.insert("books", {
      organizationId,
      titleEnglish: clean(args.titleEnglish),
      titleArabic: clean(args.titleArabic),
      titleAmharic: clean(args.titleAmharic),
      authorEnglish: clean(args.authorEnglish),
      authorArabic: clean(args.authorArabic),
      authorAmharic: clean(args.authorAmharic),
      publisher: clean(args.publisher),
      publisherAmharic: clean(args.publisherAmharic),
      isbn: clean(args.isbn),
      edition: clean(args.edition),
      bookType: args.bookType,
      expectedVolumeCount: args.expectedVolumeCount,
      visibleVolumes: args.visibleVolumes,
      copyCount: args.copyCount,
      physicalVolumeCount: args.physicalVolumeCount,
      column: clean(args.column),
      row: clean(args.row),
      notes: clean(args.notes),
      coverStorageId: args.coverStorageId,
      createdBy: access.userId,
      createdAt: Date.now(),
    });
  },
});
