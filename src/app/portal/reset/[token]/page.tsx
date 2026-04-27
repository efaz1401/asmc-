import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/portal/db";
import { passwordResetTokens, users } from "@/portal/db/schema";
import { sha256Hex } from "@/portal/crypto/field";
import {
  hashPassword,
  hibpBreachCount,
  passwordPolicyError,
} from "@/portal/auth/password";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { audit } from "@/portal/audit";
import { destroyAllSessionsForUser } from "@/portal/auth/session";

export const dynamic = "force-dynamic";

async function consume(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const token = String(formData.get("token") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next !== confirm) {
    redirect(`/portal/reset/${token}?error=` + encodeURIComponent("Passwords do not match."));
  }
  const policy = passwordPolicyError(next);
  if (policy) {
    redirect(`/portal/reset/${token}?error=` + encodeURIComponent(policy));
  }
  const breach = await hibpBreachCount(next);
  if (breach && breach > 0) {
    redirect(
      `/portal/reset/${token}?error=` +
        encodeURIComponent(`That password has appeared in ${breach} known breaches.`),
    );
  }
  const id = sha256Hex(token);
  const [tok] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.id, id))
    .limit(1);
  if (!tok || tok.expiresAt.getTime() < Date.now()) notFound();

  const hash = await hashPassword(next);
  await db
    .update(users)
    .set({ passwordHash: hash, mustChangePassword: false, updatedAt: new Date() })
    .where(eq(users.id, tok.userId));
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, id));
  await destroyAllSessionsForUser(tok.userId);
  await audit({
    actorUserId: tok.userId,
    action: "password_reset_completed",
    entity: "user",
    entityId: tok.userId,
  });
  redirect("/portal/login?error=" + encodeURIComponent("Password reset. Sign in with the new password."));
}

export default async function ResetPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const csrf = await ensureCsrfToken();
  const id = sha256Hex(token);
  const [tok] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.id, id))
    .limit(1);
  const nowMs = new Date().getTime();
  if (!tok || tok.expiresAt.getTime() < nowMs) {
    return (
      <div className="portal-login">
        <div className="portal-login__card portal-card">
          <h1>Link expired</h1>
          <p>Request a new password reset.</p>
          <p>
            <a href="/portal/forgot">Forgot password</a>
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="portal-login">
      <div className="portal-login__card portal-card">
        <h1>New password</h1>
        {sp.error && <div className="portal-error">{sp.error}</div>}
        <form action={consume} className="portal-form" autoComplete="off">
          <input type="hidden" name="_csrf" value={csrf} />
          <input type="hidden" name="token" value={token} />
          <div>
            <label htmlFor="next">New password</label>
            <input id="next" name="next" type="password" required minLength={12} autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="confirm">Confirm</label>
            <input id="confirm" name="confirm" type="password" required minLength={12} autoComplete="new-password" />
          </div>
          <button type="submit" className="portal-btn">Save</button>
        </form>
      </div>
    </div>
  );
}
