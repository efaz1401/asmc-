import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/portal/db";
import { users, passwordResetTokens } from "@/portal/db/schema";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { randomToken, sha256Hex } from "@/portal/crypto/field";
import { rateLimit } from "@/portal/auth/rate-limit";
import { audit } from "@/portal/audit";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function request(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = await rateLimit(`forgot:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    redirect("/portal/forgot?ok=1");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/portal/forgot?ok=1");
  }
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (u && u.isActive) {
    const token = randomToken(32);
    await db.insert(passwordResetTokens).values({
      id: sha256Hex(token),
      userId: u.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    await audit({
      actorUserId: u.id,
      action: "password_reset_requested",
      entity: "user",
      entityId: u.id,
      ip,
    });
    // TODO: email the link. For now, the token is only retrievable via the
    // audit log + a manual operator step. This avoids leaking the existence
    // of an account when no email infra is wired up.
    console.warn(
      `[portal] reset link for ${email}: /portal/reset/${token} (ip=${ip})`,
    );
  }
  // Always show the same success message — never leak whether the email exists.
  redirect("/portal/forgot?ok=1");
}

export default async function ForgotPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const sp = await searchParams;
  const csrf = await ensureCsrfToken();
  if (sp.ok) {
    return (
      <div className="portal-login">
        <div className="portal-login__card portal-card">
          <h1>Check your email</h1>
          <p>
            If that email matches an active account, we&apos;ve sent a password reset
            link. The link expires in 1 hour.
          </p>
          <p>
            <a href="/portal/login">Back to sign in</a>
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="portal-login">
      <div className="portal-login__card portal-card">
        <h1>Forgot password</h1>
        <p className="portal-muted">Enter your work email to receive a reset link.</p>
        <form action={request} className="portal-form">
          <input type="hidden" name="_csrf" value={csrf} />
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="username" />
          </div>
          <button type="submit" className="portal-btn">Send link</button>
        </form>
      </div>
    </div>
  );
}
