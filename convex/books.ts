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
    authorEnglish: optionalText,
    authorArabic: optionalText,
    publisher: optionalText,
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
      authorEnglish: book.authorEnglish,
      authorArabic: book.authorArabic,
      publisher: book.publisher,
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
    authorEnglish: optionalText,
    authorArabic: optionalText,
    publisher: optionalText,
    isbn: optionalText,
    notes: optionalText,
    coverStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("books"),
  handler: async (ctx, args) => {
    const access = await requireTenantAccess(ctx, args.organizationId);
    const organizationId = ctx.db.normalizeId("organizations", args.organizationId);
    if (!organizationId) throw new ConvexError("Organization not found");
    if (!args.titleEnglish?.trim() && !args.titleArabic?.trim()) {
      throw new ConvexError("English or Arabic title is required");
    }
    const clean = (value?: string) => value?.trim() || undefined;
    return await ctx.db.insert("books", {
      organizationId,
      titleEnglish: clean(args.titleEnglish),
      titleArabic: clean(args.titleArabic),
      authorEnglish: clean(args.authorEnglish),
      authorArabic: clean(args.authorArabic),
      publisher: clean(args.publisher),
      isbn: clean(args.isbn),
      notes: clean(args.notes),
      coverStorageId: args.coverStorageId,
      createdBy: access.userId,
      createdAt: Date.now(),
    });
  },
});
