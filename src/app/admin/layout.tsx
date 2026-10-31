import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAdmin } from "./actions";
import "./admin-theme.css";

export const metadata: Metadata = {
  title: "Admin Studio",
  description: "AIToolss administrator control center.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { data: { user } } = await (async () => {
    try {
      const supabase = await createClient();
      return await supabase.auth.getUser();
    } catch {
      redirect("/admin-login?error=configuration");
    }
  })();

  if (!user || user.app_metadata?.role !== "admin") redirect("/admin-login");

  return (
    <div className="admin-theme">
      {children}
      <form action={signOutAdmin} className="admin-session-actions">
        <span title={user.email ?? "Administrator"} aria-label="Signed in administrator">● Admin session</span>
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
}
