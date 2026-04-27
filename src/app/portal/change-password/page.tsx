import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/portal/db";
import { users } from "@/portal/db/schema";
import {
  hashPassword,
  hibpBreachCount,
  passwordPolicyError,
  verifyPassword,
} from "@/portal/auth/password";
import { requireUser } from "@/portal/auth/rbac";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { audit } from "@/portal/audit";
import { destroyAllSessionsForUser } from "@/portal/auth/session";

export const dynamic = "force-dynamic";

async function changePassword(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireUser();

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next !== confirm) {
    redirect(
      `/portal/change-password?error=${encodeURIComponent("New passwords do not match.")}`,
    );
  }
  const policy = passwordPolicyError(next);
  if (policy) redirect(`/portal/change-password?error=${encodeURIComponent(policy)}`);

  // First-login flow: skip current-password if forced.
  if (!ctx.user.mustChangePassword) {
    const ok = await verifyPassword(ctx.user.passwordHash, current);
    if (!ok) {
      redirect(
        `/portal/change-password?error=${encodeURIComponent("Current password is incorrect.")}`,
      );
    }
  }

  const breachCount = await hibpBreachCount(next);
  if (breachCount && breachCount > 0) {
    redirect(
      `/portal/change-password?error=${encodeURIComponent(
        `That password has appeared in ${breachCount} known breaches. Pick another.`,
      )}`,
    );
  }

  const hash = await hashPassword(next);
  await db
    .update(users)
    .set({
      passwordHash: hash,
      mustChangePassword: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, ctx.user.id));

  // Revoke every other session — limits damage from a stolen cookie.
  await destroyAllSessionsForUser(ctx.user.id);
  await audit({
    actorUserId: ctx.user.id,
    action: "password_changed",
    entity: "user",
    entityId: ctx.user.id,
  });
  // Force re-login so we know they have the new password.
  redirect("/portal/login?error=" + encodeURIComponent("Password changed. Sign in again."));
}

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const ctx = await requireUser();
  const sp = await searchParams;
  const csrf = await ensureCsrfToken();
  const forced = ctx.user.mustChangePassword;

  return (
    <div className="portal-main">
      <div className="portal-card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1>{forced ? "Set a new password" : "Change password"}</h1>
        <p className="portal-muted">
          Minimum 12 characters, mixing 3 of: lowercase, uppercase, digit, symbol.
          We check the new password against known breaches via HIBP k-anonymity.
        </p>
        {sp.error && <div className="portal-error">{sp.error}</div>}
        <form action={changePassword} className="portal-form">
          <input type="hidden" name="_csrf" value={csrf} />
          {!forced && (
            <div>
              <label htmlFor="current">Current password</label>
              <input
                type="password"
                id="current"
                name="current"
                required
                autoComplete="current-password"
              />
            </div>
          )}
          <div>
            <label htmlFor="next">New password</label>
            <input
              type="password"
              id="next"
              name="next"
              required
              autoComplete="new-password"
              minLength={12}
            />
          </div>
          <div>
            <label htmlFor="confirm">Confirm new password</label>
            <input
              type="password"
              id="confirm"
              name="confirm"
              required
              autoComplete="new-password"
              minLength={12}
            />
          </div>
          <button type="submit" className="portal-btn">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
