import { redirect } from "next/navigation";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { Topbar } from "../../_components/Topbar";
import { requireUser } from "@/portal/auth/rbac";
import { getEmployeeByUserId } from "@/portal/data/employees";
import { db } from "@/portal/db";
import { attendance } from "@/portal/db/schema";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { audit } from "@/portal/audit";

export const dynamic = "force-dynamic";

function todayKsa(): string {
  // KSA is fixed UTC+3 — derive the date string without TZ libs.
  const now = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

async function checkAction(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireUser();
  const me = await getEmployeeByUserId(ctx.user.id);
  if (!me) redirect("/portal/me/attendance?error=" + encodeURIComponent("Profile missing."));
  const action = String(formData.get("action") ?? "");
  const date = todayKsa();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || null;
  const now = new Date();

  // Upsert: try update first, then insert.
  const [existing] = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.employeeId, me.id), eq(attendance.workDate, date)))
    .limit(1);

  if (action === "in") {
    if (existing?.checkInAt) {
      redirect("/portal/me/attendance?error=" + encodeURIComponent("Already checked in today."));
    }
    if (existing) {
      await db
        .update(attendance)
        .set({ checkInAt: now, checkInIp: ip, status: "present", updatedAt: now })
        .where(eq(attendance.id, existing.id));
    } else {
      await db.insert(attendance).values({
        employeeId: me.id,
        workDate: date,
        checkInAt: now,
        checkInIp: ip,
        status: "present",
      });
    }
    await audit({
      actorUserId: ctx.user.id,
      action: "attendance_check_in",
      entity: "attendance",
      entityId: existing?.id ?? null,
      ip,
    });
  } else if (action === "out") {
    if (!existing?.checkInAt) {
      redirect("/portal/me/attendance?error=" + encodeURIComponent("Check in first."));
    }
    if (existing.checkOutAt) {
      redirect("/portal/me/attendance?error=" + encodeURIComponent("Already checked out today."));
    }
    const minutes = Math.max(0, Math.round((now.getTime() - existing.checkInAt!.getTime()) / 60000));
    const STD = 8 * 60;
    const overtime = Math.max(0, minutes - STD);
    await db
      .update(attendance)
      .set({
        checkOutAt: now,
        checkOutIp: ip,
        minutesWorked: minutes,
        overtimeMinutes: overtime,
        updatedAt: now,
      })
      .where(eq(attendance.id, existing.id));
    await audit({
      actorUserId: ctx.user.id,
      action: "attendance_check_out",
      entity: "attendance",
      entityId: existing.id,
      ip,
      after: { minutes, overtime },
    });
  }
  redirect("/portal/me/attendance?ok=1");
}

export default async function MyAttendance({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const ctx = await requireUser();
  const sp = await searchParams;
  const me = await getEmployeeByUserId(ctx.user.id);
  const csrf = await ensureCsrfToken();
  const date = todayKsa();
  const today =
    me &&
    (
      await db
        .select()
        .from(attendance)
        .where(and(eq(attendance.employeeId, me.id), eq(attendance.workDate, date)))
        .limit(1)
    )[0];
  const month = me
    ? await db
        .select()
        .from(attendance)
        .where(eq(attendance.employeeId, me.id))
        .orderBy(desc(attendance.workDate))
        .limit(31)
    : [];

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Attendance</h1>
        {sp.ok && <div className="portal-success">Saved.</div>}
        {sp.error && <div className="portal-error">{sp.error}</div>}

        <div className="portal-card">
          <h2>Today · {date}</h2>
          <p className="portal-muted">
            Check-in: {today?.checkInAt ? today.checkInAt.toISOString().slice(11, 16) : "—"} · Check-out:{" "}
            {today?.checkOutAt ? today.checkOutAt.toISOString().slice(11, 16) : "—"}
          </p>
          <form action={checkAction} style={{ display: "inline-flex", gap: 8 }}>
            <input type="hidden" name="_csrf" value={csrf} />
            <button name="action" value="in" className="portal-btn" disabled={!!today?.checkInAt}>
              Check in
            </button>
            <button
              name="action"
              value="out"
              className="portal-btn portal-btn--ghost"
              disabled={!today?.checkInAt || !!today?.checkOutAt}
            >
              Check out
            </button>
          </form>
        </div>

        <div className="portal-card">
          <h2>Recent days</h2>
          {month.length === 0 ? (
            <p className="portal-muted">No attendance records.</p>
          ) : (
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Worked</th>
                  <th>OT</th>
                </tr>
              </thead>
              <tbody>
                {month.map((a) => (
                  <tr key={a.id}>
                    <td>{a.workDate}</td>
                    <td>{a.status}</td>
                    <td>{a.checkInAt ? a.checkInAt.toISOString().slice(11, 16) : "—"}</td>
                    <td>{a.checkOutAt ? a.checkOutAt.toISOString().slice(11, 16) : "—"}</td>
                    <td>
                      {Math.floor(a.minutesWorked / 60)}h {a.minutesWorked % 60}m
                    </td>
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
