"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

/**
 * Sign-out button — used in the app shell header.
 * Single client component. Uses authClient from the
 * single source of truth.
 */
export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/sign-in");
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full rounded-xl border border-[#d4c8b7] px-4 py-3 text-left text-sm font-semibold text-stone-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
      type="button"
    >
      Sign out
    </button>
  );
}
