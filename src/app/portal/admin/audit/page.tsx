import { desc } from "drizzle-orm";
import { Topbar } from "../../_components/Topbar";
import { requireRole } from "@/portal/auth/rbac";
import { db } from "@/portal/db";
import { auditLog } from "@/portal/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminAudit({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const ctx = await requireRole("admin");
  const sp = await searchParams;
  const PAGE = 100;
  const offset = Math.max(0, Number(sp.page ?? 0)) * PAGE;
  const rows = await db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(PAGE)
    .offset(offset);

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Audit log</h1>
        <p className="portal-muted">
          Append-only record of every admin action and security event. Sensitive
          values are hashed/encrypted; only metadata is shown.
        </p>
        <div className="portal-card">
          <table className="portal-table">
            <thead>
              <tr>
                <th>When (UTC)</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={6} className="portal-muted">No events.</td></tr>
              )}
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>{a.createdAt.toISOString().replace("T", " ").slice(0, 19)}</td>
                  <td className="portal-mono">{a.actorUserId?.slice(0, 8) ?? "system"}</td>
                  <td>{a.action}</td>
                  <td>{a.entity}</td>
                  <td className="portal-mono">{a.entityId?.slice(0, 8) ?? "—"}</td>
                  <td>{a.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            {Number(sp.page ?? 0) > 0 && (
              <a href={`/portal/admin/audit?page=${Number(sp.page ?? 0) - 1}`}>
                ← Newer
              </a>
            )}
            <span />
            {rows.length === PAGE && (
              <a href={`/portal/admin/audit?page=${Number(sp.page ?? 0) + 1}`}>
                Older →
              </a>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
