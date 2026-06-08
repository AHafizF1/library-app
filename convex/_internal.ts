import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { DEFAULT_ROWS_PER_COLUMN } from "./constants";

/**
 * Shared internal helper to create rows for a given column.
 * Not exposed as a public query or mutation.
 */
export async function createDefaultRows(
  ctx: MutationCtx,
  columnId: Id<"columns">,
  organizationId: string,
  count: number = DEFAULT_ROWS_PER_COLUMN,
) {
  const promises = Array.from({ length: count }, (_, i) =>
    ctx.db.insert("rows", {
      columnId,
      organizationId,
      rowNumber: i + 1,
    })
  );
  await Promise.all(promises);
}
