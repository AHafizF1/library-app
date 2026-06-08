import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { createDefaultRows } from "./_internal";

/**
 * Seeds a workspace with initial demo shelves, columns, rows, and join codes.
 * This can be run by anyone with an organizationId to populate their library.
 */
export const seedWorkspace = mutation({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const orgId = args.organizationId;

    // 1. Seed Join Codes
    const existingCodes = await ctx.db
      .query("orgJoinCodes")
      .withIndex("by_org", (q) => q.eq("organizationId", orgId))
      .collect();

    if (existingCodes.length === 0) {
      await ctx.db.insert("orgJoinCodes", {
        organizationId: orgId,
        code: "LIB-SEED-TEST",
        role: "member",
        createdById: "system-seed",
        isActive: true,
      });

      await ctx.db.insert("orgJoinCodes", {
        organizationId: orgId,
        code: "LIB-ADMIN-TEST",
        role: "admin",
        createdById: "system-seed",
        isActive: true,
      });
    }

    // 2. Check if shelves already exist to avoid duplicate seeding
    const existingShelves = await ctx.db
      .query("shelves")
      .withIndex("by_org", (q) => q.eq("organizationId", orgId))
      .collect();

    if (existingShelves.length > 0) {
      return { status: "already_seeded", message: "Workspace already has shelves." };
    }

    // ── Shelf 1: Literature & Fiction ─────────────────────────
    const shelf1Id = await ctx.db.insert("shelves", {
      organizationId: orgId,
      name: "Literature & Fiction",
      order: 0,
    });

    // Default Column A
    const col1A = await ctx.db.insert("columns", {
      organizationId: orgId,
      shelfId: shelf1Id,
      label: "Classics & Drama",
      order: 0,
    });
    await createDefaultRows(ctx, col1A, orgId);

    // Column B
    const col1B = await ctx.db.insert("columns", {
      organizationId: orgId,
      shelfId: shelf1Id,
      label: "Modern Fiction",
      order: 1,
    });
    await createDefaultRows(ctx, col1B, orgId);

    // ── Shelf 2: Science & Technology ────────────────────────
    const shelf2Id = await ctx.db.insert("shelves", {
      organizationId: orgId,
      name: "Science & Technology",
      order: 1,
    });

    // Column A
    const col2A = await ctx.db.insert("columns", {
      organizationId: orgId,
      shelfId: shelf2Id,
      label: "Physics & Chemistry",
      order: 0,
    });
    await createDefaultRows(ctx, col2A, orgId);

    // Column B
    const col2B = await ctx.db.insert("columns", {
      organizationId: orgId,
      shelfId: shelf2Id,
      label: "Computer Science & IT",
      order: 1,
    });
    await createDefaultRows(ctx, col2B, orgId);

    // ── Shelf 3: History & Biography ─────────────────────────
    const shelf3Id = await ctx.db.insert("shelves", {
      organizationId: orgId,
      name: "History & Biography",
      order: 2,
    });

    // Column A
    const col3A = await ctx.db.insert("columns", {
      organizationId: orgId,
      shelfId: shelf3Id,
      label: "Ancient History",
      order: 0,
    });
    await createDefaultRows(ctx, col3A, orgId);

    // Column B
    const col3B = await ctx.db.insert("columns", {
      organizationId: orgId,
      shelfId: shelf3Id,
      label: "Biographies",
      order: 1,
    });
    await createDefaultRows(ctx, col3B, orgId);

    return { status: "success", message: "Demo bookshelf data seeded successfully." };
  },
});
