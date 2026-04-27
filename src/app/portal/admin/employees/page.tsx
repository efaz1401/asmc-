import Link from "next/link";
import { Topbar } from "../../_components/Topbar";
import { requireRole } from "@/portal/auth/rbac";
import { listEmployees } from "@/portal/data/employees";
import type { Employee } from "@/portal/db/schema";

export const dynamic = "force-dynamic";

export default async function EmployeesList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: Employee["status"] | "all" }>;
}) {
  const ctx = await requireRole("hr");
  const sp = await searchParams;
  const rows = await listEmployees({ search: sp.q, status: sp.status });

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ marginTop: 0 }}>Employees</h1>
          <Link href="/portal/admin/employees/new" className="portal-btn">
            + Add employee
          </Link>
        </div>

        <form className="portal-card" method="get" style={{ display: "flex", gap: 12, alignItems: "end" }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="q">Search</label>
            <input id="q" name="q" type="text" defaultValue={sp.q ?? ""} placeholder="name, job title, trade…" />
          </div>
          <div>
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={sp.status ?? "all"}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="on_leave">On leave</option>
              <option value="terminated">Terminated</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <button type="submit" className="portal-btn portal-btn--ghost">Filter</button>
        </form>

        <div className="portal-card">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Job title</th>
                <th>Department</th>
                <th>Trade</th>
                <th>Hired</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="portal-muted">No employees match.</td>
                </tr>
              )}
              {rows.map(({ e }) => (
                <tr key={e.id}>
                  <td>
                    <Link href={`/portal/admin/employees/${e.id}`}>{e.fullNameEn}</Link>
                    {e.fullNameAr && <div className="portal-muted" style={{ fontSize: 12 }}>{e.fullNameAr}</div>}
                  </td>
                  <td>{e.jobTitle ?? "—"}</td>
                  <td>{e.department ?? "—"}</td>
                  <td>{e.trade ?? "—"}</td>
                  <td>{e.hiredAt ? e.hiredAt.toISOString().slice(0, 10) : "—"}</td>
                  <td>
                    <span
                      className={
                        e.status === "active"
                          ? "portal-tag portal-tag--ok"
                          : e.status === "archived" || e.status === "terminated"
                            ? "portal-tag portal-tag--bad"
                            : "portal-tag portal-tag--warn"
                      }
                    >
                      {e.status}
                    </span>
                  </td>
                  <td>
                    <Link href={`/portal/admin/employees/${e.id}`}>Open</Link>
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
