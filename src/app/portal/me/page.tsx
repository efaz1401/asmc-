import { eq, and, gte, desc } from "drizzle-orm";
import { Topbar } from "../_components/Topbar";
import { requireUser } from "@/portal/auth/rbac";
import { onboardingNextStep } from "@/portal/auth/rbac";
import { redirect } from "next/navigation";
import { getEmployeeByUserId } from "@/portal/data/employees";
import { db } from "@/portal/db";
import { attendance, leaveRequests, performanceReviews } from "@/portal/db/schema";

export const dynamic = "force-dynamic";

export default async function MyDashboard() {
  const ctx = await requireUser();
  const next = onboardingNextStep(ctx.user);
  if (next) redirect(next);

  const me = await getEmployeeByUserId(ctx.user.id);
  // Last 30 days of attendance count
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sinceStr = since.toISOString().slice(0, 10);
  const recentAttendance = me
    ? await db
        .select()
        .from(attendance)
        .where(and(eq(attendance.employeeId, me.id), gte(attendance.workDate, sinceStr)))
        .orderBy(desc(attendance.workDate))
        .limit(10)
    : [];
  const myLeave = me
    ? await db
        .select()
        .from(leaveRequests)
        .where(eq(leaveRequests.employeeId, me.id))
        .orderBy(desc(leaveRequests.createdAt))
        .limit(5)
    : [];
  const myReviews = me
    ? await db
        .select()
        .from(performanceReviews)
        .where(eq(performanceReviews.employeeId, me.id))
        .orderBy(desc(performanceReviews.createdAt))
        .limit(3)
    : [];

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Hello{me ? `, ${me.fullNameEn}` : ""}</h1>

        {!me && (
          <div className="portal-card portal-error">
            Your employee profile hasn't been set up yet. Ask HR to complete it.
          </div>
        )}

        <div className="portal-grid portal-grid--3">
          <div className="portal-card">
            <h2>Quick check-in</h2>
            {me ? (
              <p className="portal-muted">
                Use the <a href="/portal/me/attendance">Attendance</a> page to check in or out.
              </p>
            ) : (
              <p className="portal-muted">Profile not set up.</p>
            )}
          </div>
          <div className="portal-card">
            <h2>Recent leave</h2>
            {myLeave.length === 0 ? (
              <p className="portal-muted">No requests yet.</p>
            ) : (
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {myLeave.map((l) => (
                  <li key={l.id}>
                    {l.kind} · {l.startDate.toISOString().slice(0, 10)} → {l.endDate.toISOString().slice(0, 10)} ·{" "}
                    <span className="portal-tag portal-tag--mute">{l.status}</span>
                  </li>
                ))}
              </ul>
            )}
            <p style={{ marginTop: 12 }}>
              <a href="/portal/me/leave">Request leave</a>
            </p>
          </div>
          <div className="portal-card">
            <h2>Recent reviews</h2>
            {myReviews.length === 0 ? (
              <p className="portal-muted">No reviews yet.</p>
            ) : (
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {myReviews.map((r) => (
                  <li key={r.id}>
                    {r.periodLabel} ·{" "}
                    <span className="portal-tag portal-tag--mute">{r.status}</span>
                    {r.ratingOverall != null ? ` · ${r.ratingOverall}/5` : ""}
                  </li>
                ))}
              </ul>
            )}
            <p style={{ marginTop: 12 }}>
              <a href="/portal/me/reviews">All reviews</a>
            </p>
          </div>
        </div>

        <div className="portal-card">
          <h2>Recent attendance</h2>
          {recentAttendance.length === 0 ? (
            <p className="portal-muted">No attendance records.</p>
          ) : (
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Worked</th>
                  <th>Overtime</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((a) => (
                  <tr key={a.id}>
                    <td>{a.workDate}</td>
                    <td>{a.status}</td>
                    <td>{a.checkInAt ? a.checkInAt.toISOString().slice(11, 16) : "—"}</td>
                    <td>{a.checkOutAt ? a.checkOutAt.toISOString().slice(11, 16) : "—"}</td>
                    <td>{Math.floor(a.minutesWorked / 60)}h {a.minutesWorked % 60}m</td>
                    <td>
                      {a.overtimeMinutes
                        ? `${Math.floor(a.overtimeMinutes / 60)}h ${a.overtimeMinutes % 60}m`
                        : "—"}
                    </td>
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
