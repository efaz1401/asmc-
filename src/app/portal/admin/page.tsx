import { eq, sql, desc } from "drizzle-orm";
import { Topbar } from "../_components/Topbar";
import { requireRole, onboardingNextStep } from "@/portal/auth/rbac";
import { redirect } from "next/navigation";
import { db } from "@/portal/db";
import { employees, leaveRequests, auditLog } from "@/portal/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const ctx = await requireRole("hr");
  const next = onboardingNextStep(ctx.user);
  if (next) redirect(next);

  const [{ active }] = await db
    .select({ active: sql<number>`count(*)::int` })
    .from(employees)
    .where(eq(employees.status, "active"));
  const [{ archived }] = await db
    .select({ archived: sql<number>`count(*)::int` })
    .from(employees)
    .where(eq(employees.status, "archived"));
  const [{ pendingLeave }] = await db
    .select({ pendingLeave: sql<number>`count(*)::int` })
    .from(leaveRequests)
    .where(eq(leaveRequests.status, "pending"));

  const recentAudit = await db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(8);

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Admin overview</h1>

        <div className="portal-grid portal-grid--3">
          <div className="portal-card">
            <h2>Active employees</h2>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{active}</div>
          </div>
          <div className="portal-card">
            <h2>Archived</h2>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{archived}</div>
          </div>
          <div className="portal-card">
            <h2>Leave to review</h2>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{pendingLeave}</div>
            {pendingLeave > 0 && (
              <p style={{ marginTop: 8 }}>
                <a href="/portal/admin/leave">Review →</a>
              </p>
            )}
          </div>
        </div>

        <div className="portal-card">
          <h2>Recent activity</h2>
          {recentAudit.length === 0 ? (
            <p className="portal-muted">No activity yet.</p>
          ) : (
            <table className="portal-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                </tr>
              </thead>
              <tbody>
                {recentAudit.map((a) => (
                  <tr key={a.id}>
                    <td>{a.createdAt.toISOString().replace("T", " ").slice(0, 19)}</td>
                    <td className="portal-mono">{a.actorUserId?.slice(0, 8) ?? "system"}</td>
                    <td>{a.action}</td>
                    <td>{a.entity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
