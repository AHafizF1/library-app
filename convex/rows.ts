import { query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { requireTenantAccess } from "./tenantAccess";
import { byColumnArgs } from "./validators";

/**
 * Lists rows for a given column.
 */
export const listByColumn = query({
  args: byColumnArgs,
  handler: async (ctx, args) => {
    // 1. Guard tenant access
    await requireTenantAccess(ctx, args.organizationId);

    // 2. Verify column exists and belongs to the tenant
    const column = await ctx.db.get(args.columnId);
    if (!column || column.organizationId !== args.organizationId) {
      throw new ConvexError("Column not found or unauthorized");
    }

    // 3. Get rows
    const rows = await ctx.db
      .query("rows")
      .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
      .collect();

    return rows.sort((a, b) => a.rowNumber - b.rowNumber);
  },
});
