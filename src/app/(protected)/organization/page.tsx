"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { api } from "../../../../convex/_generated/api";
import SignOutButton from "@/components/auth/SignOutButton";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const organization = useQuery(api.organizations.current);
  const [role, setRole] = useState<"member" | "admin">("member");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const organizationId = organization?.id ?? "";
  const canManage = organization?.role === "owner" || organization?.role === "admin";
  const codes = useQuery(api.orgJoinCodes.list, organizationId && canManage ? { organizationId } : "skip");
  const createCode = useMutation(api.orgJoinCodes.create);
  const disableCode = useMutation(api.orgJoinCodes.disable);

  async function generateCode(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await createCode({ organizationId, role });
      setMessage(result.code);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Key could not be generated.");
    }
  }

  if (isPending || organization === undefined) return <p className="py-24 text-center text-sm text-stone-500">Loading profile...</p>;

  return (
    <div className="mx-auto max-w-4xl">
      <header className="border-b border-[#d9cfbf] pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94691f]">Account</p>
        <h1 className="mt-2 font-serif text-4xl tracking-[-0.025em]">Profile and settings</h1>
      </header>

      <div className="grid gap-6 py-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#d9cfbf] bg-[#fffdf8] p-6 shadow-sm">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#26352f] font-serif text-2xl text-white">
              {session?.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <h2 className="mt-5 text-xl font-semibold">{session?.user.name}</h2>
            <p className="mt-1 text-sm text-stone-600">{session?.user.email}</p>
            <div className="mt-5 border-t border-[#e5dccd] pt-5">
              <SignOutButton />
            </div>
          </section>

          <section className="rounded-2xl border border-[#d9cfbf] bg-[#fffdf8] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">Organization</p>
            <h2 className="mt-2 font-serif text-2xl">{organization?.name ?? "No organization"}</h2>
            {organization && <span className="mt-3 inline-flex rounded-full bg-[#e5ede8] px-3 py-1 text-xs font-semibold capitalize text-[#26352f]">{organization.role}</span>}
            {!organization && <a href="/join" className="mt-4 inline-block font-semibold text-amber-800 underline underline-offset-4">Join organization</a>}
          </section>
        </div>

        <section className="rounded-2xl border border-[#d9cfbf] bg-[#fffdf8] p-6 shadow-sm sm:p-8">
          <h2 className="font-serif text-2xl">Member access</h2>
          {canManage ? (
            <>
              <p className="mt-2 max-w-lg text-sm leading-6 text-stone-600">Generate organization keys for trusted people. Revoke keys no longer needed.</p>
              <form onSubmit={generateCode} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <label className="mb-2 block text-sm font-semibold">New member role</label>
                  <select value={role} onChange={(event) => setRole(event.target.value as "member" | "admin")} className="w-full rounded-xl border border-[#cfc5b5] bg-white px-4 py-3 outline-none focus:border-[#94691f]">
                    <option value="member">Member — catalogue access</option>
                    <option value="admin">Admin — manage access keys</option>
                  </select>
                </div>
                <button className="self-end rounded-xl bg-[#26352f] px-5 py-3 font-semibold text-white">Generate key</button>
              </form>
              {message && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-800">New key</p><p className="mt-1 select-all font-mono text-lg font-bold">{message}</p></div>}
              {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
              <div className="mt-8">
                <h3 className="text-sm font-semibold">Active keys</h3>
                {codes?.length ? (
                  <ul className="mt-3 divide-y divide-[#e5dccd]">
                    {codes.map((code) => (
                      <li key={code._id} className="flex items-center justify-between gap-4 py-4">
                        <div><p className="font-mono font-semibold">{code.code}</p><p className="mt-1 text-xs capitalize text-stone-500">{code.role} access</p></div>
                        <button onClick={() => disableCode({ organizationId, codeId: code._id })} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Revoke</button>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-3 text-sm text-stone-500">No active keys.</p>}
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-xl bg-[#f2ede4] p-5 text-sm leading-6 text-stone-600">Your member role can catalogue books. Organization owners and admins manage access keys.</div>
          )}
        </section>
      </div>
    </div>
  );
}
