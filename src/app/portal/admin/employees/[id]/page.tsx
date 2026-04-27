import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { Topbar } from "../../../_components/Topbar";
import { requireRole } from "@/portal/auth/rbac";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { getEmployeeWithUser, revealSensitive } from "@/portal/data/employees";
import { db } from "@/portal/db";
import { employees, users } from "@/portal/db/schema";
import { eq } from "drizzle-orm";
import { encryptField } from "@/portal/crypto/field";
import { verifyPassword } from "@/portal/auth/password";
import { audit } from "@/portal/audit";
import type { Employee } from "@/portal/db/schema";

export const dynamic = "force-dynamic";

function fmt(d?: Date | null): string {
  if (!d) return "—";
  return d.toISOString().slice(0, 10);
}

async function reveal(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireRole("hr");
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!(await verifyPassword(ctx.user.passwordHash, password))) {
    redirect(`/portal/admin/employees/${id}?reveal_error=1`);
  }
  const h = await headers();
  await audit({
    actorUserId: ctx.user.id,
    action: "employee_sensitive_viewed",
    entity: "employee",
    entityId: id,
    ip: h.get("x-forwarded-for"),
    userAgent: h.get("user-agent"),
  });
  redirect(`/portal/admin/employees/${id}?reveal=1`);
}

async function updateEmployee(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireRole("hr");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "active") as Employee["status"];
  const jobTitle = String(formData.get("jobTitle") ?? "").trim() || null;
  const department = String(formData.get("department") ?? "").trim() || null;
  const trade = String(formData.get("trade") ?? "").trim() || null;
  const contactPhone = String(formData.get("contactPhone") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  // Sensitive fields: only update if non-empty (so we don't blank out by accident).
  const iqamaNew = String(formData.get("iqamaNumber") ?? "").trim();
  const passportNew = String(formData.get("passportNumber") ?? "").trim();
  const salaryNew = String(formData.get("monthlySalary") ?? "").trim();
  const ibanNew = String(formData.get("iban") ?? "").trim();

  const before = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  if (before.length === 0) notFound();

  const updates: Partial<typeof employees.$inferInsert> = {
    status,
    jobTitle,
    department,
    trade,
    contactPhone,
    notes,
    updatedAt: new Date(),
  };
  if (iqamaNew) updates.iqamaNumberEnc = encryptField(iqamaNew);
  if (passportNew) updates.passportNumberEnc = encryptField(passportNew);
  if (salaryNew) updates.monthlySalaryEnc = encryptField(salaryNew);
  if (ibanNew) updates.ibanEnc = encryptField(ibanNew);

  await db.update(employees).set(updates).where(eq(employees.id, id));
  await audit({
    actorUserId: ctx.user.id,
    action: "employee_updated",
    entity: "employee",
    entityId: id,
    before: {
      status: before[0].status,
      jobTitle: before[0].jobTitle,
      department: before[0].department,
    },
    after: { status, jobTitle, department, trade },
  });
  redirect(`/portal/admin/employees/${id}?ok=1`);
}

export default async function EmployeeDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    reveal?: string;
    reveal_error?: string;
    invite?: string;
    ok?: string;
  }>;
}) {
  const ctx = await requireRole("hr");
  const { id } = await params;
  const sp = await searchParams;
  const row = await getEmployeeWithUser(id);
  if (!row) notFound();
  const csrf = await ensureCsrfToken();
  const sensitive = sp.reveal === "1" ? revealSensitive(row.e) : null;

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>{row.e.fullNameEn}</h1>
        <p className="portal-muted" style={{ marginTop: -8 }}>
          {row.u?.email} · created {row.e.createdAt.toISOString().slice(0, 10)}
        </p>

        {sp.invite && (
          <div className="portal-card portal-success">
            <h2 style={{ marginTop: 0 }}>Invite link</h2>
            <p>
              Share this single-use link with {row.e.fullNameEn} via a secure
              channel (1Password, in-person). It expires in 72 hours.
            </p>
            <code
              className="portal-mono"
              style={{
                display: "block",
                wordBreak: "break-all",
                background: "rgba(255,255,255,0.04)",
                padding: 8,
                borderRadius: 6,
                marginTop: 8,
              }}
            >
              https://portal.asmc.com.sa/portal/invite/{sp.invite}
            </code>
            <p className="portal-muted" style={{ fontSize: 12, marginTop: 8 }}>
              This token is shown once. If you lose it, use “Send a new invite” below.
            </p>
          </div>
        )}

        {sp.ok && <div className="portal-success">Saved.</div>}

        <div className="portal-grid portal-grid--2">
          <div className="portal-card">
            <h2>Identity</h2>
            <dl className="portal-kv">
              <dt>Name (EN)</dt><dd>{row.e.fullNameEn}</dd>
              <dt>Name (AR)</dt><dd>{row.e.fullNameAr ?? "—"}</dd>
              <dt>DOB</dt><dd>{fmt(row.e.dob)}</dd>
              <dt>Nationality</dt><dd>{row.e.nationality ?? "—"}</dd>
              <dt>Phone</dt><dd>{row.e.contactPhone ?? "—"}</dd>
              <dt>Hired at</dt><dd>{fmt(row.e.hiredAt)}</dd>
              <dt>Status</dt>
              <dd>
                <span
                  className={
                    row.e.status === "active"
                      ? "portal-tag portal-tag--ok"
                      : "portal-tag portal-tag--mute"
                  }
                >
                  {row.e.status}
                </span>
              </dd>
            </dl>
          </div>

          <div className="portal-card">
            <h2>Sensitive fields</h2>
            {sp.reveal_error && (
              <div className="portal-error">Password incorrect.</div>
            )}
            {sensitive ? (
              <dl className="portal-kv">
                <dt>Iqama number</dt>
                <dd className="portal-mono">{sensitive.iqamaNumber ?? "—"}</dd>
                <dt>Passport number</dt>
                <dd className="portal-mono">{sensitive.passportNumber ?? "—"}</dd>
                <dt>Monthly salary</dt>
                <dd className="portal-mono">
                  {sensitive.monthlySalary ?? "—"}
                </dd>
                <dt>IBAN</dt>
                <dd className="portal-mono">{sensitive.iban ?? "—"}</dd>
              </dl>
            ) : (
              <form action={reveal} className="portal-form">
                <input type="hidden" name="_csrf" value={csrf} />
                <input type="hidden" name="id" value={row.e.id} />
                <p className="portal-muted">
                  Re-enter your password to view encrypted fields. Every reveal
                  is logged in the audit trail.
                </p>
                <div>
                  <label htmlFor="password">Your password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button type="submit" className="portal-btn portal-btn--ghost">
                  Reveal
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="portal-card">
          <h2>Edit</h2>
          <form action={updateEmployee} className="portal-form">
            <input type="hidden" name="_csrf" value={csrf} />
            <input type="hidden" name="id" value={row.e.id} />
            <div className="portal-grid portal-grid--2">
              <div>
                <label htmlFor="jobTitle">Job title</label>
                <input id="jobTitle" name="jobTitle" defaultValue={row.e.jobTitle ?? ""} />
              </div>
              <div>
                <label htmlFor="department">Department</label>
                <input id="department" name="department" defaultValue={row.e.department ?? ""} />
              </div>
              <div>
                <label htmlFor="trade">Trade</label>
                <input id="trade" name="trade" defaultValue={row.e.trade ?? ""} />
              </div>
              <div>
                <label htmlFor="contactPhone">Phone</label>
                <input id="contactPhone" name="contactPhone" defaultValue={row.e.contactPhone ?? ""} />
              </div>
              <div>
                <label htmlFor="status">Status</label>
                <select id="status" name="status" defaultValue={row.e.status}>
                  <option value="active">active</option>
                  <option value="on_leave">on_leave</option>
                  <option value="terminated">terminated</option>
                  <option value="archived">archived</option>
                </select>
              </div>
            </div>

            <h2 style={{ marginTop: 16 }}>Replace sensitive fields (leave blank to keep)</h2>
            <div className="portal-grid portal-grid--2">
              <div>
                <label htmlFor="iqamaNumber">Iqama number</label>
                <input id="iqamaNumber" name="iqamaNumber" autoComplete="off" />
              </div>
              <div>
                <label htmlFor="passportNumber">Passport number</label>
                <input id="passportNumber" name="passportNumber" autoComplete="off" />
              </div>
              <div>
                <label htmlFor="monthlySalary">Monthly salary (SAR)</label>
                <input id="monthlySalary" name="monthlySalary" inputMode="decimal" autoComplete="off" />
              </div>
              <div>
                <label htmlFor="iban">IBAN</label>
                <input id="iban" name="iban" autoComplete="off" />
              </div>
            </div>

            <div>
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" defaultValue={row.e.notes ?? ""} />
            </div>
            <button type="submit" className="portal-btn">Save</button>
          </form>
        </div>
      </main>
    </>
  );
}
