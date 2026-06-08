/**
 * Server-side auth helpers — single source of truth.
 *
 * Every server component/route that needs auth
 * imports from here. Never call convexBetterAuthNextJs
 * directly elsewhere.
 */
import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export const { handler, isAuthenticated, getToken } = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});
