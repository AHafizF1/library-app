"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { normalizeJoinCode } from "@/lib/onboarding";

/**
 * Sign-up page — inline form.
 *
 * DRY note: NOT extracted to shared form component.
 * Only 1 sign-up form exists. Extract at third form occurrence.
 */
export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const joinOrganization = useMutation(api.orgJoinCodes.join);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Sign-up failed. Please try again.");
      } else {
        await joinOrganization({ code: normalizeJoinCode(joinCode) });
        router.push("/library");
        router.refresh();
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Account created, but organization key could not be accepted. Sign in and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6a1b]">Get started</p>
      <h2 className="mt-3 font-serif text-4xl tracking-[-0.025em] text-[#1f2b27]">Create account</h2>
      <p className="mt-3 text-[15px] leading-6 text-[#6f675b]">Create your account using key supplied by organization admin.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#39342d]" htmlFor="signup-name">Full name</label>
          <input id="signup-name" type="text" className="w-full rounded-xl border border-[#cfc5b5] bg-[#fffdf8]/80 px-4 py-3.5 text-base outline-none transition placeholder:text-[#9e9588] focus:border-[#9a6a1b] focus:ring-4 focus:ring-[#d6a950]/15" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#39342d]" htmlFor="signup-email">Email address</label>
          <input id="signup-email" type="email" className="w-full rounded-xl border border-[#cfc5b5] bg-[#fffdf8]/80 px-4 py-3.5 text-base outline-none transition placeholder:text-[#9e9588] focus:border-[#9a6a1b] focus:ring-4 focus:ring-[#d6a950]/15" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#39342d]" htmlFor="signup-password">Password</label>
          <input id="signup-password" type="password" className="w-full rounded-xl border border-[#cfc5b5] bg-[#fffdf8]/80 px-4 py-3.5 text-base outline-none transition placeholder:text-[#9e9588] focus:border-[#9a6a1b] focus:ring-4 focus:ring-[#d6a950]/15" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#39342d]" htmlFor="signup-organization-key">Organization key</label>
          <input id="signup-organization-key" type="text" className="w-full rounded-xl border border-[#cfc5b5] bg-[#fffdf8]/80 px-4 py-3.5 font-mono text-base uppercase outline-none transition placeholder:text-[#9e9588] focus:border-[#9a6a1b] focus:ring-4 focus:ring-[#d6a950]/15" placeholder="LIB-XXXX-XXXX" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} required autoComplete="off" />
          <p className="mt-2 text-xs leading-5 text-[#81786b]">No key? Ask your library administrator.</p>
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-[#26352f] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(38,53,47,0.18)] transition hover:-translate-y-0.5 hover:bg-[#31443c] focus:outline-none focus:ring-4 focus:ring-[#26352f]/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creating account\u2026" : "Create account"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-[#6f675b]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-[#7d571c] underline decoration-[#c8a96f] underline-offset-4 hover:text-[#523b18]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
