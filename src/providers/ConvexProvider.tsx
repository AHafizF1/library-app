/**
 * ConvexClientProvider — deep provider module.
 *
 * Interface: one component, two props (children + initialToken).
 * Hides: Convex client instantiation, Better Auth config,
 *        organization plugin wiring, token hydration.
 *
 * Every page in the app gets auth + real-time data for free
 * because this provider exists.
 */
"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({
  children,
  initialToken,
}: {
  children: ReactNode;
  initialToken?: string | null;
}) {
  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient}
      initialToken={initialToken}
    >
      {children}
    </ConvexBetterAuthProvider>
  );
}
