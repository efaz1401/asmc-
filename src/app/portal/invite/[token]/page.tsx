import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/portal/db";
import { invites, users } from "@/portal/db/schema";
import { sha256Hex } from "@/portal/crypto/field";
import {
  hashPassword,
  hibpBreachCount,
  passwordPolicyError,
} from "@/portal/auth/password";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { audit } from "@/portal/audit";
import {
  createSession,
  destroyAllSessionsForUser,
  setSessionCookie,
} from "@/portal/auth/session";
import { onboardingNextStep } from "@/portal/auth/rbac";

export const dynamic = "force-dynamic";

async function consume(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const token = String(formData.get("token") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next !== confirm) {
    redirect(`/portal/invite/${token}?error=` + encodeURIComponent("Passwords do not match."));
  }
  const policy = passwordPolicyError(next);
  if (policy) {
    redirect(`/portal/invite/${token}?error=` + encodeURIComponent(policy));
  }
  const breach = await hibpBreachCount(next);
  if (breach && breach > 0) {
    redirect(
      `/portal/invite/${token}?error=` +
        encodeURIComponent(`That password has appeared in ${breach} known breaches.`),
    );
  }

  const id = sha256Hex(token);
  const [inv] = await db.select().from(invites).where(eq(invites.id, id)).limit(1);
  if (!inv || inv.status !== "pending" || inv.expiresAt.getTime() < Date.now()) {
    notFound();
  }
  const hash = await hashPassword(next);
  await db
    .update(users)
    .set({
      passwordHash: hash,
      mustChangePassword: false,
      isActive: true,
      lockedUntil: null,
      failedLoginCount: 0,
      updatedAt: new Date(),
    })
    .where(eq(users.id, inv.userId));
  await db
    .update(invites)
    .set({ status: "consumed", consumedAt: new Date() })
    .where(eq(invites.id, id));
  // Revoke any pre-existing sessions for safety, then issue a fresh one.
  await destroyAllSessionsForUser(inv.userId);
  const { token: sToken, expiresAt } = await createSession(inv.userId);
  await setSessionCookie(sToken, expiresAt);
  await audit({
    actorUserId: inv.userId,
    action: "password_reset_completed",
    entity: "user",
    entityId: inv.userId,
  });
  // Bounce to onboarding next step.
  const [u] = await db.select().from(users).where(eq(users.id, inv.userId)).limit(1);
  if (u) {
    const ns = onboardingNextStep(u);
    if (ns) redirect(ns);
    redirect(u.role === "employee" ? "/portal/me" : "/portal/admin");
  }
  redirect("/portal/login");
}

export default async function InvitePage({
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
  const [inv] = await db.select().from(invites).where(eq(invites.id, id)).limit(1);
  const nowMs = new Date().getTime();
  if (!inv || inv.status !== "pending" || inv.expiresAt.getTime() < nowMs) {
    return (
      <div className="portal-login">
        <div className="portal-login__card portal-card">
          <h1>Link expired</h1>
          <p>
            This invite is no longer valid. Ask HR to send you a new one.
          </p>
          <p>
            <a href="/portal/login">Sign-in page</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-login">
      <div className="portal-login__card portal-card">
        <h1>Set your password</h1>
        <p className="portal-muted">
          Welcome to ASMC Portal. Choose a password (min 12 chars, mixed
          classes). It&apos;s checked against known breaches.
        </p>
        {sp.error && <div className="portal-error">{sp.error}</div>}
        <form action={consume} className="portal-form" autoComplete="off">
          <input type="hidden" name="_csrf" value={csrf} />
          <input type="hidden" name="token" value={token} />
          <div>
            <label htmlFor="next">New password</label>
            <input
              id="next"
              name="next"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm">Confirm</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="portal-btn">Save and sign in</button>
        </form>
      </div>
    </div>
  );
}
