import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";

/**
 * Landing page — redirects based on auth state.
 */
export default async function HomePage() {
  const authed = await isAuthenticated();

  if (authed) {
    redirect("/library");
  } else {
    redirect("/sign-in");
  }
}
