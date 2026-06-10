import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireTenantAccess } from "./tenantAccess";
import { bookFields } from "./validators";
import { resolveBook } from "./booksResolver";

const optionalText = v.optional(v.string());

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(v.object({
    id: v.string(),
    parentBookId: v.optional(v.string()),
    titleEnglish: optionalText,
    titleArabic: optionalText,
    titleAmharic: optionalText,
    authorEnglish: optionalText,
    authorArabic: optionalText,
    authorAmharic: optionalText,
    publisher: optionalText,
    publisherAmharic: optionalText,
    edition: optionalText,
    isbn: optionalText,
    bookType: v.optional(v.string()),
    volumeStart: v.optional(v.number()),
    volumeEnd: v.optional(v.number()),
    copyCount: v.number(),
    physicalVolumeCount: v.number(),
    column: optionalText,
    row: optionalText,
    notes: optionalText,
    coverUrl: v.union(v.string(), v.null()),
  })),
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);
    const organizationId = ctx.db.normalizeId("organizations", args.organizationId);
    if (!organizationId) return [];
    const books = await ctx.db.query("books").withIndex("by_org", (q) => q.eq("organizationId", organizationId)).order("desc").collect();
    return await Promise.all(books.map((book) => resolveBook(ctx, book)));
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
    ...bookFields,
  },
  returns: v.id("books"),
  handler: async (ctx, args) => {
    const access = await requireTenantAccess(ctx, args.organizationId);
    const organizationId = ctx.db.normalizeId("organizations", args.organizationId);
    if (!organizationId) throw new ConvexError("Organization not found");
    
    // Title is required only if parentBookId is not provided
    if (!args.parentBookId && !args.titleEnglish?.trim() && !args.titleArabic?.trim() && !args.titleAmharic?.trim()) {
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
      volumeStart: args.volumeStart,
      volumeEnd: args.volumeEnd,
      copyCount: args.copyCount,
      physicalVolumeCount: args.physicalVolumeCount,
      column: clean(args.column),
      row: clean(args.row),
      notes: clean(args.notes),
      coverStorageId: args.coverStorageId,
      parentBookId: args.parentBookId,
      expectedVolumeCount: args.expectedVolumeCount,
      visibleVolumes: args.visibleVolumes,
      createdBy: access.userId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("books"),
    organizationId: v.string(),
    ...bookFields,
  },
  returns: v.id("books"),
  handler: async (ctx, args) => {
    const access = await requireTenantAccess(ctx, args.organizationId);
    if (access.role !== "owner" && access.role !== "admin") {
      throw new ConvexError("FORBIDDEN");
    }
    const organizationId = ctx.db.normalizeId("organizations", args.organizationId);
    if (!organizationId) throw new ConvexError("Organization not found");

    const book = await ctx.db.get(args.id);
    if (!book) throw new ConvexError("Book not found");
    if (book.organizationId !== organizationId) throw new ConvexError("FORBIDDEN");

    // Title is required only if parentBookId is not provided
    if (!args.parentBookId && !args.titleEnglish?.trim() && !args.titleArabic?.trim() && !args.titleAmharic?.trim()) {
      throw new ConvexError("English, Arabic, or Amharic title is required");
    }

    const clean = (value?: string) => value?.trim() || undefined;

    await ctx.db.patch(args.id, {
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
      volumeStart: args.volumeStart,
      volumeEnd: args.volumeEnd,
      copyCount: args.copyCount,
      physicalVolumeCount: args.physicalVolumeCount,
      column: clean(args.column),
      row: clean(args.row),
      notes: clean(args.notes),
      coverStorageId: args.coverStorageId,
      parentBookId: args.parentBookId,
      expectedVolumeCount: args.expectedVolumeCount,
      visibleVolumes: args.visibleVolumes,
    });

    return args.id;
  },
});

