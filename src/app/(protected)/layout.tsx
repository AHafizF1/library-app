import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import AppNav from "@/components/layout/AppNav";

/**
 * Protected Layout — wraps all authenticated routes.
 * Ensures the user is logged in, otherwise redirects to /sign-in.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[#f4f0e7] text-[#29241d]">
      <AppNav />
      <main className="mx-auto w-full max-w-7xl px-5 pb-28 pt-8 sm:px-8 md:pb-10 md:pl-32 md:pr-8 md:pt-10">
        {children}
      </main>
    </div>
  );
}
