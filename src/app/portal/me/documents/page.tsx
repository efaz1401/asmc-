import { eq, desc } from "drizzle-orm";
import { Topbar } from "../../_components/Topbar";
import { requireUser } from "@/portal/auth/rbac";
import { getEmployeeByUserId } from "@/portal/data/employees";
import { db } from "@/portal/db";
import { documents } from "@/portal/db/schema";

export const dynamic = "force-dynamic";

export default async function MyDocuments() {
  const ctx = await requireUser();
  const me = await getEmployeeByUserId(ctx.user.id);
  const list = me
    ? await db
        .select()
        .from(documents)
        .where(eq(documents.employeeId, me.id))
        .orderBy(desc(documents.uploadedAt))
    : [];

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Documents</h1>
        <div className="portal-card">
          {list.length === 0 ? (
            <p className="portal-muted">No documents on file.</p>
          ) : (
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Filename</th>
                  <th>Uploaded</th>
                  <th>Expires</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((d) => (
                  <tr key={d.id}>
                    <td>{d.kind}</td>
                    <td>{d.filename}</td>
                    <td>{d.uploadedAt.toISOString().slice(0, 10)}</td>
                    <td>
                      {d.expiresAt
                        ? d.expiresAt.toISOString().slice(0, 10)
                        : "—"}
                    </td>
                    <td>
                      <a href={`/portal/api/file/${encodeURIComponent(d.storageKey)}`}>
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="portal-muted" style={{ fontSize: 12, marginTop: 12 }}>
            To upload a new document, ask HR. Files are stored encrypted in
            object storage and only retrievable through short-lived signed URLs.
          </p>
        </div>
      </main>
    </>
  );
}
