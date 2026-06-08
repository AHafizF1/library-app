import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { requireTenantAccess } from "./tenantAccess";
import { createJoinCodeArgs, disableJoinCodeArgs, joinWithCodeArgs, orgIdArg } from "./validators";
import { createAuth, authComponent } from "./auth";

const normalizeCode = (code: string) => code.trim().toUpperCase();

/**
 * Lists all active join codes for a given organization workspace.
 * Requires caller to be an admin or owner.
 */
export const list = query({
  args: orgIdArg,
  handler: async (ctx, args) => {
    // 1. Check basic tenant access
    const access = await requireTenantAccess(ctx, args.organizationId);
    
    // 2. Enforce admin/owner permission
    if (access.role !== "admin" && access.role !== "owner") {
      throw new ConvexError("Forbidden: Only workspace admins can manage join codes");
    }

    // 3. Retrieve codes
    const codes = await ctx.db
      .query("orgJoinCodes")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Return active codes
    return codes.filter((c) => c.isActive);
  },
});

/**
 * Generates a new join code for an organization with a specific role.
 * Requires caller to be an admin or owner.
 */
export const create = mutation({
  args: createJoinCodeArgs,
  handler: async (ctx, args) => {
    // 1. Check basic tenant access
    const access = await requireTenantAccess(ctx, args.organizationId);
    
    // 2. Enforce admin/owner permission
    if (access.role !== "admin" && access.role !== "owner") {
      throw new ConvexError("Forbidden: Only workspace admins can manage join codes");
    }

    // 3. Generate random unique join code
    const randomPart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `LIB-${randomPart1}-${randomPart2}`;

    // 4. Save code to DB
    const codeId = await ctx.db.insert("orgJoinCodes", {
      organizationId: args.organizationId,
      code,
      role: args.role, // "member" | "admin"
      createdById: access.userId,
      isActive: true,
    });

    return { codeId, code };
  },
});

/**
 * Disables a join code.
 * Requires caller to be an admin or owner.
 */
export const disable = mutation({
  args: disableJoinCodeArgs,
  handler: async (ctx, args) => {
    // 1. Check basic tenant access
    const access = await requireTenantAccess(ctx, args.organizationId);
    
    // 2. Enforce admin/owner permission
    if (access.role !== "admin" && access.role !== "owner") {
      throw new ConvexError("Forbidden: Only workspace admins can manage join codes");
    }

    // 3. Get code doc and verify
    const codeDoc = await ctx.db.get(args.codeId);
    if (!codeDoc || codeDoc.organizationId !== args.organizationId) {
      throw new ConvexError("Join code not found");
    }

    // 4. Set inactive
    await ctx.db.patch(args.codeId, { isActive: false });
  },
});

/**
 * Public mutation to join an organization using a valid join code.
 * The caller must be authenticated in Better Auth.
 */
export const join = mutation({
  args: joinWithCodeArgs,
  handler: async (ctx, args) => {
    // 1. Retrieve the authenticated user session
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const sessionResponse = await auth.api.getSession({ headers });
    if (!sessionResponse || !sessionResponse.session) {
      throw new ConvexError("UNAUTHENTICATED");
    }

    const user = sessionResponse.user;

    // 2. Query the code document
    const codeDoc = await ctx.db
      .query("orgJoinCodes")
      .withIndex("by_code", (q) => q.eq("code", normalizeCode(args.code)))
      .first();

    if (!codeDoc || !codeDoc.isActive) {
      throw new ConvexError("Invalid or inactive join code");
    }

    const organizationId = ctx.db.normalizeId("organizations", codeDoc.organizationId);
    if (!organizationId) throw new ConvexError("Organization not found");

    const existing = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", organizationId).eq("userId", user.id),
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("organizationMemberships", {
        organizationId,
        userId: user.id,
        role: codeDoc.role,
        createdAt: Date.now(),
      });
    }

    return {
      success: true,
      organizationId: codeDoc.organizationId,
    };
  },
});
