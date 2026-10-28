import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInAdmin } from "../admin/actions";

export const metadata = {
  title: "Admin sign in | AIToolss",
  robots: { index: false, follow: false },
};

const messages: Record<string, string> = {
  invalid: "Enter your email and password.",
  configuration: "Admin sign-in is not configured yet. Follow the Phase 8 setup guide.",
  credentials: "Email or password was not accepted.",
  "not-authorized": "This account does not have administrator access.",
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  let supabase;
  try {
    supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.app_metadata?.role === "admin") redirect("/admin");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
  }

  const { error } = await searchParams;
  return (
    <main className="admin-auth-shell">
      <section className="admin-auth-card">
        <Link href="/" className="admin-auth-brand"><span>A</span> AIToolss<span>.</span></Link>
        <p className="admin-auth-eyebrow">SECURE CONTROL CENTER</p>
        <h1>Welcome back<span>.</span></h1>
        <p className="admin-auth-copy">Sign in with your authorized administrator account to manage the directory.</p>
        {error && <p className="admin-auth-error" role="alert">{messages[error] ?? "Unable to sign in. Please try again."}</p>}
        <form action={signInAdmin} className="admin-auth-form">
          <label>Email address<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={1024} /></label>
          <button type="submit">Sign in securely <span aria-hidden="true">→</span></button>
        </form>
        <p className="admin-auth-footnote">Admin access is invitation-only. Public sign-up is disabled in this interface.</p>
        <Link href="/" className="admin-auth-back">← Back to AIToolss</Link>
      </section>
    </main>
  );
}
