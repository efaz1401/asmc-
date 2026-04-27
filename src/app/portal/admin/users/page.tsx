import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Topbar } from "../../_components/Topbar";
import { requireRole, hasRole } from "@/portal/auth/rbac";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { db } from "@/portal/db";
import { users, invites } from "@/portal/db/schema";
import { destroyAllSessionsForUser } from "@/portal/auth/session";
import { hashPassword } from "@/portal/auth/password";
import { randomToken, sha256Hex } from "@/portal/crypto/field";
import { audit } from "@/portal/audit";
import type { User } from "@/portal/db/schema";

export const dynamic = "force-dynamic";

async function lockUnlock(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  if (id === ctx.user.id) redirect("/portal/admin/users?error=" + encodeURIComponent("You can't lock yourself."));
  const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!target) redirect("/portal/admin/users");
  if (action === "lock") {
    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id));
    await destroyAllSessionsForUser(id);
    await audit({ actorUserId: ctx.user.id, action: "user_locked", entity: "user", entityId: id });
  } else if (action === "unlock") {
    await db
      .update(users)
      .set({ isActive: true, lockedUntil: null, failedLoginCount: 0, updatedAt: new Date() })
      .where(eq(users.id, id));
    await audit({ actorUserId: ctx.user.id, action: "user_unlocked", entity: "user", entityId: id });
  } else if (action === "kill_sessions") {
    await destroyAllSessionsForUser(id);
    await audit({ actorUserId: ctx.user.id, action: "session_revoked", entity: "user", entityId: id });
  }
  redirect("/portal/admin/users?ok=1");
}

async function forcePasswordReset(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  if (id === ctx.user.id) {
    redirect("/portal/admin/users?error=" + encodeURIComponent("Use Change password for your own account."));
  }
  const tempPw = randomToken(24);
  const hash = await hashPassword(tempPw);
  await db
    .update(users)
    .set({ passwordHash: hash, mustChangePassword: true, updatedAt: new Date() })
    .where(eq(users.id, id));
  await destroyAllSessionsForUser(id);
  // Issue an invite token so they can set a new password without HR sharing
  // the temp password.
  const token = randomToken(32);
  await db.insert(invites).values({
    id: sha256Hex(token),
    userId: id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdBy: ctx.user.id,
  });
  await audit({
    actorUserId: ctx.user.id,
    action: "user_password_force_reset",
    entity: "user",
    entityId: id,
  });
  redirect(`/portal/admin/users?reset_token=${encodeURIComponent(token)}&reset_for=${id}`);
}

async function changeRole(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireRole("super_admin");
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "") as User["role"];
  if (id === ctx.user.id) {
    redirect("/portal/admin/users?error=" + encodeURIComponent("You can't change your own role."));
  }
  if (!["super_admin", "admin", "hr", "employee"].includes(role)) {
    redirect("/portal/admin/users");
  }
  const [before] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!before) redirect("/portal/admin/users");
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id));
  await destroyAllSessionsForUser(id);
  await audit({
    actorUserId: ctx.user.id,
    action: "user_role_changed",
    entity: "user",
    entityId: id,
    before: { role: before.role },
    after: { role },
  });
  redirect("/portal/admin/users?ok=1");
}

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{
    ok?: string;
    error?: string;
    reset_token?: string;
    reset_for?: string;
  }>;
}) {
  const ctx = await requireRole("admin");
  const sp = await searchParams;
  const csrf = await ensureCsrfToken();
  const list = await db.select().from(users).orderBy(desc(users.createdAt));

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Users</h1>
        {sp.ok && <div className="portal-success">Saved.</div>}
        {sp.error && <div className="portal-error">{sp.error}</div>}
        {sp.reset_token && (
          <div className="portal-card portal-success">
            <h2 style={{ marginTop: 0 }}>One-time reset link</h2>
            <p>
              Share this with the user via a secure channel. Valid for 24 hours.
            </p>
            <code
              className="portal-mono"
              style={{
                display: "block",
                wordBreak: "break-all",
                background: "rgba(255,255,255,0.04)",
                padding: 8,
                borderRadius: 6,
              }}
            >
              https://portal.asmc.com.sa/portal/invite/{sp.reset_token}
            </code>
          </div>
        )}

        <div className="portal-card">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Active</th>
                <th>2FA</th>
                <th>Last login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.email}
                    {u.mustChangePassword && (
                      <span className="portal-tag portal-tag--warn" style={{ marginLeft: 8 }}>
                        must reset
                      </span>
                    )}
                  </td>
                  <td>
                    {hasRole(ctx.user, "super_admin") && u.id !== ctx.user.id ? (
                      <form action={changeRole} style={{ display: "inline-flex", gap: 6 }}>
                        <input type="hidden" name="_csrf" value={csrf} />
                        <input type="hidden" name="id" value={u.id} />
                        <select name="role" defaultValue={u.role}>
                          <option value="super_admin">super_admin</option>
                          <option value="admin">admin</option>
                          <option value="hr">hr</option>
                          <option value="employee">employee</option>
                        </select>
                        <button type="submit" className="portal-btn portal-btn--ghost">Set</button>
                      </form>
                    ) : (
                      <span className="portal-tag portal-tag--mute">{u.role}</span>
                    )}
                  </td>
                  <td>
                    {u.isActive ? (
                      <span className="portal-tag portal-tag--ok">active</span>
                    ) : (
                      <span className="portal-tag portal-tag--bad">locked</span>
                    )}
                  </td>
                  <td>{u.totpSecretEnc ? "Yes" : "No"}</td>
                  <td>{u.lastLoginAt?.toISOString().slice(0, 16).replace("T", " ") ?? "—"}</td>
                  <td>
                    {u.id === ctx.user.id ? (
                      <span className="portal-muted">— self —</span>
                    ) : (
                      <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
                        <form action={lockUnlock}>
                          <input type="hidden" name="_csrf" value={csrf} />
                          <input type="hidden" name="id" value={u.id} />
                          <button
                            type="submit"
                            name="action"
                            value={u.isActive ? "lock" : "unlock"}
                            className="portal-btn portal-btn--ghost"
                          >
                            {u.isActive ? "Lock" : "Unlock"}
                          </button>
                        </form>
                        <form action={lockUnlock}>
                          <input type="hidden" name="_csrf" value={csrf} />
                          <input type="hidden" name="id" value={u.id} />
                          <button
                            type="submit"
                            name="action"
                            value="kill_sessions"
                            className="portal-btn portal-btn--ghost"
                          >
                            Kill sessions
                          </button>
                        </form>
                        <form action={forcePasswordReset}>
                          <input type="hidden" name="_csrf" value={csrf} />
                          <input type="hidden" name="id" value={u.id} />
                          <button type="submit" className="portal-btn portal-btn--danger">
                            Force pw reset
                          </button>
                        </form>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
