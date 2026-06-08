/**
 * Better Auth instance — AuthBridge deep module.
 *
 * Interface: zero for callers. Auth just works because this file exists.
 * Hides: component registration, plugin wiring, role definitions,
 *        adapter configuration.
 *
 * The organization plugin is enabled via Local Install approach
 * since it's not in the default supported plugins list.
 */
import { betterAuth } from "better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { createClient } from "@convex-dev/better-auth";
import type { GenericCtx } from "@convex-dev/better-auth";
import type { DataModel } from "./_generated/dataModel";
import { components } from "./_generated/api";
import authConfig from "./auth.config";

/** Convex component client for Better Auth. */
export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Factory: creates a Better Auth instance bound to a Convex context.
 * Called by the HTTP router for each request.
 */
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: process.env.SITE_URL,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      convex({ authConfig }),
    ],
  });
};
