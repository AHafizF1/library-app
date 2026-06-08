import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { createAuth, authComponent } from "./auth";
import { OrgRole } from "./constants";

export type TenantContext = {
  userId: string;
  organizationId: string;
  role: OrgRole;
};

/**
 * Ensures the caller has access to the specified organization.
 * 
 * Throws a ConvexError with "UNAUTHENTICATED" or "FORBIDDEN" on failure.
 * Returns the TenantContext (userId, organizationId, role) on success.
 */
export async function requireTenantAccess(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
): Promise<TenantContext> {
  // 1. Get auth instance and headers
  const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
  
  // 2. Fetch session
  const sessionResponse = await auth.api.getSession({ headers });
  if (!sessionResponse || !sessionResponse.session) {
    throw new ConvexError("UNAUTHENTICATED");
  }

  const userId = sessionResponse.user.id;
  const normalizedOrganizationId = ctx.db.normalizeId("organizations", organizationId);
  if (!normalizedOrganizationId) throw new ConvexError("FORBIDDEN");

  const membership = await ctx.db
    .query("organizationMemberships")
    .withIndex("by_org_user", (q) =>
      q.eq("organizationId", normalizedOrganizationId).eq("userId", userId),
    )
    .unique();

  if (!membership) {
    throw new ConvexError("FORBIDDEN");
  }

  return {
    userId,
    organizationId,
    role: membership.role as OrgRole,
  };
}
