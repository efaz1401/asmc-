import { redirect } from "next/navigation";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { Topbar } from "../../_components/Topbar";
import { requireRole } from "@/portal/auth/rbac";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { db } from "@/portal/db";
import {
  attendance,
  employees,
  payrollItems,
  payrollRuns,
} from "@/portal/db/schema";
import {
  computePayroll,
  formatSar,
  parseSar,
} from "@/portal/payroll/calc";
import { decryptField, encryptField } from "@/portal/crypto/field";
import { audit } from "@/portal/audit";

export const dynamic = "force-dynamic";

async function createRun(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireRole("admin");
  const periodYear = Number(formData.get("periodYear") ?? 0);
  const periodMonth = Number(formData.get("periodMonth") ?? 0);
  const workingDays = Math.max(1, Math.min(31, Number(formData.get("workingDays") ?? 26)));
  const overtimeRate = String(formData.get("overtimeRate") ?? "0");
  if (
    !Number.isInteger(periodYear) ||
    periodYear < 2020 ||
    periodYear > 2100 ||
    !Number.isInteger(periodMonth) ||
    periodMonth < 1 ||
    periodMonth > 12
  ) {
    redirect("/portal/admin/payroll?error=invalid_period");
  }

  // Date window for the month (KSA business calendar — naive UTC).
  const startStr = `${periodYear}-${String(periodMonth).padStart(2, "0")}-01`;
  const endDate = new Date(periodYear, periodMonth, 0).toISOString().slice(0, 10);

  const [run] = await db
    .insert(payrollRuns)
    .values({
      periodYear,
      periodMonth,
      workingDays,
      overtimeRateEnc: encryptField(overtimeRate),
      createdBy: ctx.user.id,
      status: "draft",
    })
    .returning();

  // Build a payroll item per active employee with their base salary +
  // attendance roll-up for that month.
  const activeEmployees = await db
    .select()
    .from(employees)
    .where(eq(employees.status, "active"));

  for (const e of activeEmployees) {
    const attRows = await db
      .select({
        days: sql<number>`count(*)::int`,
        present: sql<number>`count(*) filter (where ${attendance.status} = 'present')::int`,
        absent: sql<number>`count(*) filter (where ${attendance.status} = 'absent')::int`,
        ot: sql<number>`coalesce(sum(${attendance.overtimeMinutes}), 0)::int`,
      })
      .from(attendance)
      .where(
        and(
          eq(attendance.employeeId, e.id),
          gte(attendance.workDate, startStr),
          lte(attendance.workDate, endDate),
        ),
      );
    const a = attRows[0];
    const baseSalaryStr = decryptField(e.monthlySalaryEnc) ?? "0";
    const baseHalalas = parseSar(baseSalaryStr || "0");
    const otRateHalalasPerHour = parseSar(overtimeRate || "0");
    const result = computePayroll({
      baseSalary: baseHalalas,
      workingDays,
      daysPresent: a.present ?? 0,
      daysAbsent: a.absent ?? 0,
      overtimeMinutes: a.ot ?? 0,
      overtimeRatePerHour: otRateHalalasPerHour,
      allowances: [],
      deductions: [],
    });
    await db.insert(payrollItems).values({
      runId: run.id,
      employeeId: e.id,
      daysPresent: a.present ?? 0,
      daysAbsent: a.absent ?? 0,
      overtimeMinutes: a.ot ?? 0,
      baseSalaryEnc: encryptField(String(result.baseEarned)),
      allowancesJsonEnc: encryptField(JSON.stringify([])),
      overtimePayEnc: encryptField(String(result.overtimePay)),
      deductionsJsonEnc: encryptField(JSON.stringify([])),
      grossEnc: encryptField(String(result.gross)),
      netEnc: encryptField(String(result.net)),
    });
  }

  await audit({
    actorUserId: ctx.user.id,
    action: "payroll_run_created",
    entity: "payroll_run",
    entityId: run.id,
    after: { periodYear, periodMonth, workingDays, employees: activeEmployees.length },
  });
  redirect(`/portal/admin/payroll?ok=1&run=${run.id}`);
}

async function approveRun(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  if (!id) redirect("/portal/admin/payroll");
  const [r] = await db.select().from(payrollRuns).where(eq(payrollRuns.id, id)).limit(1);
  if (!r) redirect("/portal/admin/payroll");
  if (action === "approve" && r.status === "draft") {
    await db
      .update(payrollRuns)
      .set({ status: "approved", approvedBy: ctx.user.id, approvedAt: new Date() })
      .where(eq(payrollRuns.id, id));
    await audit({
      actorUserId: ctx.user.id,
      action: "payroll_run_approved",
      entity: "payroll_run",
      entityId: id,
    });
  } else if (action === "pay" && r.status === "approved") {
    await db
      .update(payrollRuns)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(payrollRuns.id, id));
    await audit({
      actorUserId: ctx.user.id,
      action: "payroll_run_paid",
      entity: "payroll_run",
      entityId: id,
    });
  }
  redirect(`/portal/admin/payroll?ok=1&run=${id}`);
}

export default async function AdminPayroll({
  searchParams,
}: {
  searchParams: Promise<{ run?: string; ok?: string; error?: string }>;
}) {
  const ctx = await requireRole("admin");
  const sp = await searchParams;
  const csrf = await ensureCsrfToken();

  const runs = await db
    .select()
    .from(payrollRuns)
    .orderBy(desc(payrollRuns.periodYear), desc(payrollRuns.periodMonth));

  let detail:
    | { run: typeof runs[number]; items: { i: typeof payrollItems.$inferSelect; e: typeof employees.$inferSelect }[] }
    | null = null;
  if (sp.run) {
    const [r] = await db.select().from(payrollRuns).where(eq(payrollRuns.id, sp.run)).limit(1);
    if (r) {
      const items = await db
        .select({ i: payrollItems, e: employees })
        .from(payrollItems)
        .innerJoin(employees, eq(employees.id, payrollItems.employeeId))
        .where(eq(payrollItems.runId, r.id))
        .orderBy(employees.fullNameEn);
      detail = { run: r, items };
    }
  }

  const now = new Date();
  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Payroll</h1>
        {sp.ok && <div className="portal-success">Done.</div>}
        {sp.error && <div className="portal-error">Invalid input.</div>}

        <div className="portal-card">
          <h2>New monthly run</h2>
          <p className="portal-muted">
            Generates a draft payslip per active employee using their stored base
            salary + the attendance roll-up for the month. Review, then approve and
            mark paid.
          </p>
          <form action={createRun} className="portal-form">
            <input type="hidden" name="_csrf" value={csrf} />
            <div className="portal-grid portal-grid--3">
              <div>
                <label htmlFor="periodYear">Year</label>
                <input
                  id="periodYear"
                  name="periodYear"
                  type="number"
                  min={2024}
                  max={2100}
                  defaultValue={now.getUTCFullYear()}
                  required
                />
              </div>
              <div>
                <label htmlFor="periodMonth">Month</label>
                <input
                  id="periodMonth"
                  name="periodMonth"
                  type="number"
                  min={1}
                  max={12}
                  defaultValue={now.getUTCMonth() + 1}
                  required
                />
              </div>
              <div>
                <label htmlFor="workingDays">Working days</label>
                <input
                  id="workingDays"
                  name="workingDays"
                  type="number"
                  min={1}
                  max={31}
                  defaultValue={26}
                  required
                />
              </div>
              <div>
                <label htmlFor="overtimeRate">Overtime rate (SAR / hour)</label>
                <input
                  id="overtimeRate"
                  name="overtimeRate"
                  type="text"
                  inputMode="decimal"
                  defaultValue="20.00"
                  required
                />
              </div>
            </div>
            <button type="submit" className="portal-btn">Generate run</button>
          </form>
        </div>

        <div className="portal-card">
          <h2>Past runs</h2>
          {runs.length === 0 ? (
            <p className="portal-muted">No runs yet.</p>
          ) : (
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Working days</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.periodYear}-{String(r.periodMonth).padStart(2, "0")}
                    </td>
                    <td>
                      <span className="portal-tag portal-tag--mute">{r.status}</span>
                    </td>
                    <td>{r.workingDays}</td>
                    <td>{r.createdAt.toISOString().slice(0, 10)}</td>
                    <td>
                      <a href={`/portal/admin/payroll?run=${r.id}`}>Open</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {detail && (
          <div className="portal-card">
            <h2>
              Run {detail.run.periodYear}-{String(detail.run.periodMonth).padStart(2, "0")} ·{" "}
              <span className="portal-tag portal-tag--mute">{detail.run.status}</span>
            </h2>
            <form action={approveRun} style={{ display: "inline-flex", gap: 8, marginBottom: 12 }}>
              <input type="hidden" name="_csrf" value={csrf} />
              <input type="hidden" name="id" value={detail.run.id} />
              <button
                type="submit"
                name="action"
                value="approve"
                className="portal-btn"
                disabled={detail.run.status !== "draft"}
              >
                Approve
              </button>
              <button
                type="submit"
                name="action"
                value="pay"
                className="portal-btn portal-btn--ghost"
                disabled={detail.run.status !== "approved"}
              >
                Mark paid
              </button>
            </form>
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Days</th>
                  <th>OT (min)</th>
                  <th>Base earned</th>
                  <th>OT pay</th>
                  <th>Gross</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map(({ i, e }) => {
                  const base = i.baseSalaryEnc ? Number(decryptField(i.baseSalaryEnc)) : 0;
                  const ot = i.overtimePayEnc ? Number(decryptField(i.overtimePayEnc)) : 0;
                  const gross = i.grossEnc ? Number(decryptField(i.grossEnc)) : 0;
                  const net = i.netEnc ? Number(decryptField(i.netEnc)) : 0;
                  return (
                    <tr key={i.id}>
                      <td>{e.fullNameEn}</td>
                      <td>{i.daysPresent}</td>
                      <td>{i.overtimeMinutes}</td>
                      <td>{formatSar(base)}</td>
                      <td>{formatSar(ot)}</td>
                      <td>{formatSar(gross)}</td>
                      <td>{formatSar(net)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
