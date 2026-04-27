import { redirect } from "next/navigation";
import { eq, and, desc } from "drizzle-orm";
import { Topbar } from "../../_components/Topbar";
import { requireRole } from "@/portal/auth/rbac";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { db } from "@/portal/db";
import { attendance, employees } from "@/portal/db/schema";
import { audit } from "@/portal/audit";

export const dynamic = "force-dynamic";

async function correct(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireRole("hr");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "present") as
    | "present" | "absent" | "late" | "half_day" | "leave" | "holiday";
  const minutesWorked = Math.max(0, Number(formData.get("minutesWorked") ?? 0));
  const overtimeMinutes = Math.max(0, Number(formData.get("overtimeMinutes") ?? 0));
  const note = String(formData.get("note") ?? "").slice(0, 500) || null;

  const [before] = await db.select().from(attendance).where(eq(attendance.id, id)).limit(1);
  if (!before) redirect("/portal/admin/attendance");

  await db
    .update(attendance)
    .set({
      status, minutesWorked, overtimeMinutes, note,
      correctedBy: ctx.user.id,
      correctedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(attendance.id, id));
  await audit({
    actorUserId: ctx.user.id,
    action: "attendance_corrected",
    entity: "attendance",
    entityId: id,
    before: { status: before.status, minutesWorked: before.minutesWorked, overtimeMinutes: before.overtimeMinutes },
    after: { status, minutesWorked, overtimeMinutes, note },
  });
  redirect("/portal/admin/attendance?ok=1");
}

export default async function AdminAttendance({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string; date?: string; ok?: string }>;
}) {
  const ctx = await requireRole("hr");
  const sp = await searchParams;
  const csrf = await ensureCsrfToken();

  const allEmployees = await db
    .select()
    .from(employees)
    .orderBy(employees.fullNameEn);

  const conditions = [];
  if (sp.employee) conditions.push(eq(attendance.employeeId, sp.employee));
  if (sp.date) conditions.push(eq(attendance.workDate, sp.date));

  const rows = await db
    .select({ a: attendance, e: employees })
    .from(attendance)
    .innerJoin(employees, eq(employees.id, attendance.employeeId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(attendance.workDate))
    .limit(200);

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Attendance</h1>
        {sp.ok && <div className="portal-success">Saved.</div>}

        <form className="portal-card" method="get" style={{ display: "flex", gap: 12, alignItems: "end" }}>
          <div>
            <label htmlFor="employee">Employee</label>
            <select id="employee" name="employee" defaultValue={sp.employee ?? ""}>
              <option value="">All</option>
              {allEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullNameEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date">Date</label>
            <input id="date" name="date" type="date" defaultValue={sp.date ?? ""} />
          </div>
          <button type="submit" className="portal-btn portal-btn--ghost">Filter</button>
        </form>

        <div className="portal-card">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Status</th>
                <th>In</th>
                <th>Out</th>
                <th>Worked (min)</th>
                <th>OT (min)</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={9} className="portal-muted">No records.</td></tr>
              )}
              {rows.map(({ a, e }) => (
                <tr key={a.id}>
                  <td>{a.workDate}</td>
                  <td>{e.fullNameEn}</td>
                  <td>
                    <form action={correct} style={{ display: "inline-flex", gap: 4 }}>
                      <input type="hidden" name="_csrf" value={csrf} />
                      <input type="hidden" name="id" value={a.id} />
                      <select name="status" defaultValue={a.status}>
                        <option value="present">present</option>
                        <option value="absent">absent</option>
                        <option value="late">late</option>
                        <option value="half_day">half_day</option>
                        <option value="leave">leave</option>
                        <option value="holiday">holiday</option>
                      </select>
                      <input
                        name="minutesWorked"
                        type="number"
                        min={0}
                        defaultValue={a.minutesWorked}
                        style={{ width: 80 }}
                      />
                      <input
                        name="overtimeMinutes"
                        type="number"
                        min={0}
                        defaultValue={a.overtimeMinutes}
                        style={{ width: 80 }}
                      />
                      <input
                        name="note"
                        type="text"
                        defaultValue={a.note ?? ""}
                        maxLength={500}
                        style={{ width: 160 }}
                      />
                      <button type="submit" className="portal-btn">Save</button>
                    </form>
                  </td>
                  <td colSpan={5}>
                    {a.checkInAt ? a.checkInAt.toISOString().slice(11, 16) : "—"} →{" "}
                    {a.checkOutAt ? a.checkOutAt.toISOString().slice(11, 16) : "—"}
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
