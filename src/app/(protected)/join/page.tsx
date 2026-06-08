"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { normalizeJoinCode } from "@/lib/onboarding";
import { useQuery } from "convex/react";
import { useEffect } from "react";

export default function JoinOrganizationPage() {
  const router = useRouter();
  const join = useMutation(api.orgJoinCodes.join);
  const organization = useQuery(api.organizations.current);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organization) router.replace("/library");
  }, [organization, router]);

  if (organization === undefined || organization) {
    return <p className="py-20 text-center text-sm text-stone-500">Opening library...</p>;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await join({ code: normalizeJoinCode(code) });
      router.replace("/library");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invalid organization key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto mt-12 max-w-md rounded-2xl border border-[#d8cebd] bg-[#fffdf8] p-8 shadow-[0_20px_60px_rgba(66,55,37,0.1)]">
      <h1 className="font-serif text-3xl">Join organization</h1>
      <p className="mt-2 text-sm text-stone-600">
        Enter key supplied by organization admin.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label htmlFor="organization-key" className="block text-sm font-medium">
          Organization key
        </label>
        <input
          id="organization-key"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="LIB-XXXX-XXXX"
          autoComplete="off"
          required
          className="w-full rounded-xl border border-[#cfc5b5] bg-white px-4 py-3.5 font-mono uppercase outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10"
        />
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-xl bg-[#26352f] px-4 py-3.5 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Joining..." : "Join organization"}
        </button>
      </form>
    </section>
  );
}
