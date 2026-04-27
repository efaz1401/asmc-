import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Topbar } from "../../_components/Topbar";
import { requireUser } from "@/portal/auth/rbac";
import { getEmployeeByUserId } from "@/portal/data/employees";
import { db } from "@/portal/db";
import { leaveRequests } from "@/portal/db/schema";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { audit } from "@/portal/audit";

export const dynamic = "force-dynamic";

async function requestLeave(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireUser();
  const me = await getEmployeeByUserId(ctx.user.id);
  if (!me) redirect("/portal/me/leave?error=" + encodeURIComponent("Profile missing."));

  const kind = String(formData.get("kind") ?? "annual") as
    | "annual"
    | "sick"
    | "unpaid"
    | "emergency";
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  const reason = String(formData.get("reason") ?? "").slice(0, 500);
  const sd = new Date(start);
  const ed = new Date(end);
  if (isNaN(+sd) || isNaN(+ed) || ed < sd) {
    redirect("/portal/me/leave?error=" + encodeURIComponent("Invalid dates."));
  }
  const [row] = await db
    .insert(leaveRequests)
    .values({ employeeId: me.id, kind, startDate: sd, endDate: ed, reason })
    .returning();
  await audit({
    actorUserId: ctx.user.id,
    action: "leave_requested",
    entity: "leave_request",
    entityId: row.id,
    after: { kind, start, end },
  });
  redirect("/portal/me/leave?ok=1");
}

export default async function MyLeave({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const ctx = await requireUser();
  const sp = await searchParams;
  const me = await getEmployeeByUserId(ctx.user.id);
  const csrf = await ensureCsrfToken();
  const list = me
    ? await db
        .select()
        .from(leaveRequests)
        .where(eq(leaveRequests.employeeId, me.id))
        .orderBy(desc(leaveRequests.createdAt))
    : [];

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Leave</h1>

        <div className="portal-card">
          <h2>Request leave</h2>
          {sp.ok && <div className="portal-success">Request submitted.</div>}
          {sp.error && <div className="portal-error">{sp.error}</div>}
          <form action={requestLeave} className="portal-form">
            <input type="hidden" name="_csrf" value={csrf} />
            <div>
              <label htmlFor="kind">Type</label>
              <select id="kind" name="kind" required>
                <option value="annual">Annual</option>
                <option value="sick">Sick</option>
                <option value="unpaid">Unpaid</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="portal-grid portal-grid--2">
              <div>
                <label htmlFor="start">Start date</label>
                <input type="date" id="start" name="start" required />
              </div>
              <div>
                <label htmlFor="end">End date</label>
                <input type="date" id="end" name="end" required />
              </div>
            </div>
            <div>
              <label htmlFor="reason">Reason (optional)</label>
              <textarea id="reason" name="reason" maxLength={500} />
            </div>
            <button type="submit" className="portal-btn">Submit request</button>
          </form>
        </div>

        <div className="portal-card">
          <h2>My requests</h2>
          {list.length === 0 ? (
            <p className="portal-muted">No requests yet.</p>
          ) : (
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {list.map((l) => (
                  <tr key={l.id}>
                    <td>{l.kind}</td>
                    <td>{l.startDate.toISOString().slice(0, 10)}</td>
                    <td>{l.endDate.toISOString().slice(0, 10)}</td>
                    <td><span className="portal-tag portal-tag--mute">{l.status}</span></td>
                    <td>{l.reason ?? "—"}</td>
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
