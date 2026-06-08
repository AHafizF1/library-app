"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

/**
 * Sign-in page — inline form.
 *
 * DRY note: Sign-in and sign-up share visual structure but
 * serve different purposes with different validation and API calls.
 * Per Iron Law #3, coincidentally similar code stays separate.
 */
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Invalid email or password.");
      } else {
        router.push("/join");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6a1b]">Welcome back</p>
      <h2 className="mt-3 font-serif text-4xl tracking-[-0.025em] text-[#1f2b27]">Sign in</h2>
      <p className="mt-3 text-[15px] leading-6 text-[#6f675b]">Continue to your organization’s private catalogue.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#39342d]" htmlFor="signin-email">Email address</label>
          <input id="signin-email" type="email" className="w-full rounded-xl border border-[#cfc5b5] bg-[#fffdf8]/80 px-4 py-3.5 text-base outline-none transition placeholder:text-[#9e9588] focus:border-[#9a6a1b] focus:ring-4 focus:ring-[#d6a950]/15" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#39342d]" htmlFor="signin-password">Password</label>
          <input id="signin-password" type="password" className="w-full rounded-xl border border-[#cfc5b5] bg-[#fffdf8]/80 px-4 py-3.5 text-base outline-none transition placeholder:text-[#9e9588] focus:border-[#9a6a1b] focus:ring-4 focus:ring-[#d6a950]/15" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-[#26352f] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(38,53,47,0.18)] transition hover:-translate-y-0.5 hover:bg-[#31443c] focus:outline-none focus:ring-4 focus:ring-[#26352f]/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Signing in\u2026" : "Sign in"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-[#6f675b]">
        Don&rsquo;t have an account?{" "}
        <Link href="/sign-up" className="font-semibold text-[#7d571c] underline decoration-[#c8a96f] underline-offset-4 hover:text-[#523b18]">
          Create account
        </Link>
      </p>
    </div>
  );
}
