import { query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent, createAuth } from "./auth";

export const current = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      id: v.string(),
      name: v.string(),
      role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    }),
  ),
  handler: async (ctx) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const session = await auth.api.getSession({ headers });
    if (!session) return null;

    const membership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user", (q) => q.eq("userId", session.user.id))
      .first();
    if (!membership) return null;

    const organization = await ctx.db.get(membership.organizationId);
    if (!organization) return null;

    return {
      id: organization._id,
      name: organization.name,
      role: membership.role,
    };
  },
});
