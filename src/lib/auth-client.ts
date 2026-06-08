/**
 * Client-side auth instance — single source of truth.
 *
 * Every client component imports authClient from here.
 * Never create a second createAuthClient() call elsewhere.
 */
import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [convexClient()],
});
