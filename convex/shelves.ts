import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { requireTenantAccess } from "./tenantAccess";
import { createShelfArgs, renameShelfArgs, orgIdArg } from "./validators";
import { createDefaultRows } from "./_internal";

/**
 * Lists all shelves in an organization.
 */
export const list = query({
  args: orgIdArg,
  handler: async (ctx, args) => {
    // 1. Guard tenant access
    await requireTenantAccess(ctx, args.organizationId);

    // 2. Query shelves ordered by 'order' ascending
    const shelves = await ctx.db
      .query("shelves")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return shelves.sort((a, b) => a.order - b.order);
  },
});

/**
 * Creates a new shelf in an organization.
 * Automatically creates a default first column with 6 rows.
 */
export const create = mutation({
  args: createShelfArgs,
  handler: async (ctx, args) => {
    // 1. Guard tenant access
    await requireTenantAccess(ctx, args.organizationId);

    // 2. Determine shelf order
    const existingShelves = await ctx.db
      .query("shelves")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();
    const nextOrder = existingShelves.reduce((max, s) => Math.max(max, s.order), -1) + 1;

    // 3. Insert shelf
    const shelfId = await ctx.db.insert("shelves", {
      organizationId: args.organizationId,
      name: args.name,
      order: nextOrder,
    });

    // 4. Create default column "Column A"
    const columnId = await ctx.db.insert("columns", {
      organizationId: args.organizationId,
      shelfId,
      label: "Column A",
      order: 0,
    });

    // 5. Create default rows for the column
    await createDefaultRows(ctx, columnId, args.organizationId);

    return shelfId;
  },
});

/**
 * Renames a shelf.
 */
export const rename = mutation({
  args: renameShelfArgs,
  handler: async (ctx, args) => {
    // 1. Guard tenant access
    await requireTenantAccess(ctx, args.organizationId);

    // 2. Get and verify shelf exists
    const shelf = await ctx.db.get(args.shelfId);
    if (!shelf || shelf.organizationId !== args.organizationId) {
      throw new ConvexError("Shelf not found or unauthorized");
    }

    // 3. Update shelf name
    await ctx.db.patch(args.shelfId, { name: args.name });
  },
});
