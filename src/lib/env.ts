/**
 * Environment configuration — single source of truth.
 *
 * Zod-validated at import time. If a required variable is
 * missing or malformed, the app crashes immediately with
 * a clear error rather than failing at runtime in a random
 * component.
 *
 * Usage: import { env } from "@/lib/env";
 *        env.NEXT_PUBLIC_CONVEX_URL  // typed and validated
 */
import { z } from "zod";

/**
 * Server-side env vars validated at import.
 * Client-side vars (NEXT_PUBLIC_*) are available in both
 * server and client contexts in Next.js.
 */
const serverSchema = z.object({
  NEXT_PUBLIC_CONVEX_URL: z.string().url("NEXT_PUBLIC_CONVEX_URL must be a valid URL"),
  NEXT_PUBLIC_CONVEX_SITE_URL: z.string().url("NEXT_PUBLIC_CONVEX_SITE_URL must be a valid URL"),
});

function createEnv() {
  // Only validate on the server to avoid hydration issues.
  // Client components access NEXT_PUBLIC_* directly via Next.js inlining.
  if (typeof window !== "undefined") {
    return {
      NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL!,
      NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
    };
  }

  const parsed = serverSchema.safeParse({
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  });

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables. Check server logs.");
  }

  return parsed.data;
}

export const env = createEnv();
