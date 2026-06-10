import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { bookFields } from "./validators";

export const getOrgRaw = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("organizations").collect();
  },
});

export const importBookRaw = internalMutation({
  args: {
    organizationId: v.string(),
    ...bookFields,
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
