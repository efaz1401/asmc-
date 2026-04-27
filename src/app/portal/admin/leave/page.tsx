import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Topbar } from "../../_components/Topbar";
import { requireRole } from "@/portal/auth/rbac";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { db } from "@/portal/db";
import { leaveRequests, employees } from "@/portal/db/schema";
import { audit } from "@/portal/audit";

export const dynamic = "force-dynamic";

async function decide(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireRole("hr");
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "") as "approved" | "rejected";
  const note = String(formData.get("note") ?? "").slice(0, 500) || null;
  if (!id || (decision !== "approved" && decision !== "rejected")) {
    redirect("/portal/admin/leave");
  }
  const [before] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id)).limit(1);
  if (!before || before.status !== "pending") redirect("/portal/admin/leave");

  await db
    .update(leaveRequests)
    .set({
      status: decision,
      decidedBy: ctx.user.id,
      decidedAt: new Date(),
      decisionNote: note,
    })
    .where(eq(leaveRequests.id, id));
  await audit({
    actorUserId: ctx.user.id,
    action: "leave_decided",
    entity: "leave_request",
    entityId: id,
    before: { status: before.status },
    after: { status: decision, note },
  });
  redirect("/portal/admin/leave?ok=1");
}

export default async function AdminLeave({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const ctx = await requireRole("hr");
  const sp = await searchParams;
  const csrf = await ensureCsrfToken();
  const rows = await db
    .select({ l: leaveRequests, e: employees })
    .from(leaveRequests)
    .innerJoin(employees, eq(employees.id, leaveRequests.employeeId))
    .orderBy(desc(leaveRequests.createdAt));

  const pending = rows.filter((r) => r.l.status === "pending");
  const recent = rows.filter((r) => r.l.status !== "pending").slice(0, 30);

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Leave queue</h1>
        {sp.ok && <div className="portal-success">Decision recorded.</div>}

        <div className="portal-card">
          <h2>Pending ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="portal-muted">No pending requests.</p>
          ) : (
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Decide</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(({ l, e }) => (
                  <tr key={l.id}>
                    <td>
                      <a href={`/portal/admin/employees/${e.id}`}>{e.fullNameEn}</a>
                    </td>
                    <td>{l.kind}</td>
                    <td>{l.startDate.toISOString().slice(0, 10)}</td>
                    <td>{l.endDate.toISOString().slice(0, 10)}</td>
                    <td>{l.reason ?? "—"}</td>
                    <td>
                      <form action={decide} style={{ display: "flex", gap: 6 }}>
                        <input type="hidden" name="_csrf" value={csrf} />
                        <input type="hidden" name="id" value={l.id} />
                        <input
                          type="text"
                          name="note"
                          placeholder="optional note"
                          maxLength={500}
                          style={{ width: 160 }}
                        />
                        <button name="decision" value="approved" className="portal-btn">
                          Approve
                        </button>
                        <button
                          name="decision"
                          value="rejected"
                          className="portal-btn portal-btn--danger"
                        >
                          Reject
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="portal-card">
          <h2>Recent decisions</h2>
          {recent.length === 0 ? (
            <p className="portal-muted">No decisions yet.</p>
          ) : (
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Decided</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(({ l, e }) => (
                  <tr key={l.id}>
                    <td>{e.fullNameEn}</td>
                    <td>{l.kind}</td>
                    <td>{l.startDate.toISOString().slice(0, 10)}</td>
                    <td>{l.endDate.toISOString().slice(0, 10)}</td>
                    <td>
                      <span
                        className={
                          l.status === "approved"
                            ? "portal-tag portal-tag--ok"
                            : "portal-tag portal-tag--bad"
                        }
                      >
                        {l.status}
                      </span>
                    </td>
                    <td>{l.decidedAt?.toISOString().replace("T", " ").slice(0, 19) ?? "—"}</td>
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
