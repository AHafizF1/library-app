import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { requireTenantAccess } from "./tenantAccess";
import { createColumnArgs, addRowArgs, byShelfArgs } from "./validators";
import { createDefaultRows } from "./_internal";

/**
 * Lists columns for a given shelf.
 */
export const listByShelf = query({
  args: byShelfArgs,
  handler: async (ctx, args) => {
    // 1. Guard tenant access
    await requireTenantAccess(ctx, args.organizationId);

    // 2. Query shelf to make sure it belongs to the tenant
    const shelf = await ctx.db.get(args.shelfId);
    if (!shelf || shelf.organizationId !== args.organizationId) {
      throw new ConvexError("Shelf not found or unauthorized");
    }

    // 3. Get columns
    const columns = await ctx.db
      .query("columns")
      .withIndex("by_shelf", (q) => q.eq("shelfId", args.shelfId))
      .collect();

    return columns.sort((a, b) => a.order - b.order);
  },
});

/**
 * Creates a new column on a shelf.
 * Automatically creates 6 default rows for it.
 */
export const create = mutation({
  args: createColumnArgs,
  handler: async (ctx, args) => {
    // 1. Guard tenant access
    await requireTenantAccess(ctx, args.organizationId);

    // 2. Verify shelf exists and belongs to the tenant
    const shelf = await ctx.db.get(args.shelfId);
    if (!shelf || shelf.organizationId !== args.organizationId) {
      throw new ConvexError("Shelf not found or unauthorized");
    }

    // 3. Determine column order
    const existingColumns = await ctx.db
      .query("columns")
      .withIndex("by_shelf", (q) => q.eq("shelfId", args.shelfId))
      .collect();
    const nextOrder = existingColumns.reduce((max, c) => Math.max(max, c.order), -1) + 1;

    // 4. Insert column
    const columnId = await ctx.db.insert("columns", {
      organizationId: args.organizationId,
      shelfId: args.shelfId,
      label: args.label,
      order: nextOrder,
    });

    // 5. Create default rows for the column
    await createDefaultRows(ctx, columnId, args.organizationId);

    return columnId;
  },
});

/**
 * Adds an extra row to a column.
 * Calculates next rowNumber based on current max.
 */
export const addRow = mutation({
  args: addRowArgs,
  handler: async (ctx, args) => {
    // 1. Guard tenant access
    await requireTenantAccess(ctx, args.organizationId);

    // 2. Verify column exists and belongs to the tenant
    const column = await ctx.db.get(args.columnId);
    if (!column || column.organizationId !== args.organizationId) {
      throw new ConvexError("Column not found or unauthorized");
    }

    // 3. Get existing rows to find max rowNumber
    const existingRows = await ctx.db
      .query("rows")
      .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
      .collect();
    const nextRowNumber = existingRows.reduce((max, r) => Math.max(max, r.rowNumber), 0) + 1;

    // 4. Insert row
    const rowId = await ctx.db.insert("rows", {
      organizationId: args.organizationId,
      columnId: args.columnId,
      rowNumber: nextRowNumber,
    });

    return rowId;
  },
});
