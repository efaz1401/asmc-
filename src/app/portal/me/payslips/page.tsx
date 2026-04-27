import { eq, desc, and } from "drizzle-orm";
import { Topbar } from "../../_components/Topbar";
import { requireUser } from "@/portal/auth/rbac";
import { getEmployeeByUserId } from "@/portal/data/employees";
import { db } from "@/portal/db";
import { payrollItems, payrollRuns } from "@/portal/db/schema";
import { decryptField } from "@/portal/crypto/field";
import { formatSar } from "@/portal/payroll/calc";

export const dynamic = "force-dynamic";

export default async function MyPayslips() {
  const ctx = await requireUser();
  const me = await getEmployeeByUserId(ctx.user.id);

  const items = me
    ? await db
        .select({ i: payrollItems, r: payrollRuns })
        .from(payrollItems)
        .innerJoin(payrollRuns, eq(payrollRuns.id, payrollItems.runId))
        .where(
          and(eq(payrollItems.employeeId, me.id), eq(payrollRuns.status, "paid")),
        )
        .orderBy(desc(payrollRuns.periodYear), desc(payrollRuns.periodMonth))
    : [];

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Payslips</h1>
        <div className="portal-card">
          {items.length === 0 ? (
            <p className="portal-muted">No payslips published yet.</p>
          ) : (
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Days present</th>
                  <th>Overtime</th>
                  <th>Gross</th>
                  <th>Net</th>
                  <th>Document</th>
                </tr>
              </thead>
              <tbody>
                {items.map(({ i, r }) => {
                  const gross = i.grossEnc ? decryptField(i.grossEnc) : null;
                  const net = i.netEnc ? decryptField(i.netEnc) : null;
                  return (
                    <tr key={i.id}>
                      <td>
                        {r.periodYear}-{String(r.periodMonth).padStart(2, "0")}
                      </td>
                      <td>{i.daysPresent}/{r.workingDays}</td>
                      <td>
                        {i.overtimeMinutes
                          ? `${Math.floor(i.overtimeMinutes / 60)}h ${i.overtimeMinutes % 60}m`
                          : "—"}
                      </td>
                      <td>{gross ? formatSar(Number(gross)) : "—"}</td>
                      <td>{net ? formatSar(Number(net)) : "—"}</td>
                      <td>
                        {i.payslipKey ? (
                          <a href={`/portal/api/file/${encodeURIComponent(i.payslipKey)}`}>
                            Download PDF
                          </a>
                        ) : (
                          <span className="portal-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
