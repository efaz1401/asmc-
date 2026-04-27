import { redirect } from "next/navigation";
import Link from "next/link";
import { Topbar } from "../../../_components/Topbar";
import { requireRole } from "@/portal/auth/rbac";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { db } from "@/portal/db";
import { users, employees, invites } from "@/portal/db/schema";
import { hashPassword } from "@/portal/auth/password";
import { encryptField, randomToken, sha256Hex } from "@/portal/crypto/field";
import { audit } from "@/portal/audit";

export const dynamic = "force-dynamic";

async function createEmployee(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireRole("hr");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/portal/admin/employees/new?error=" + encodeURIComponent("Valid email required."));
  }
  const fullNameEn = String(formData.get("fullNameEn") ?? "").trim().slice(0, 200);
  if (!fullNameEn) {
    redirect("/portal/admin/employees/new?error=" + encodeURIComponent("Full name required."));
  }

  const fullNameAr = String(formData.get("fullNameAr") ?? "").trim().slice(0, 200) || null;
  const jobTitle = String(formData.get("jobTitle") ?? "").trim().slice(0, 200) || null;
  const department = String(formData.get("department") ?? "").trim().slice(0, 100) || null;
  const trade = String(formData.get("trade") ?? "").trim().slice(0, 100) || null;
  const nationality = String(formData.get("nationality") ?? "").trim().slice(0, 100) || null;
  const contactPhone = String(formData.get("contactPhone") ?? "").trim().slice(0, 60) || null;
  const iqamaNumber = String(formData.get("iqamaNumber") ?? "").trim() || null;
  const passportNumber = String(formData.get("passportNumber") ?? "").trim() || null;
  const monthlySalary = String(formData.get("monthlySalary") ?? "").trim() || null;
  const iban = String(formData.get("iban") ?? "").trim() || null;
  const hiredAtStr = String(formData.get("hiredAt") ?? "").trim() || null;

  // Random temporary password — overwritten when the user consumes the invite.
  const tempPw = randomToken(24);
  const hash = await hashPassword(tempPw);

  try {
    const [u] = await db
      .insert(users)
      .values({
        email,
        passwordHash: hash,
        role: "employee",
        mustChangePassword: true,
        createdBy: ctx.user.id,
      })
      .returning();
    const [e] = await db
      .insert(employees)
      .values({
        userId: u.id,
        fullNameEn,
        fullNameAr,
        nationality,
        jobTitle,
        department,
        trade,
        contactPhone,
        contactEmail: email,
        iqamaNumberEnc: encryptField(iqamaNumber),
        passportNumberEnc: encryptField(passportNumber),
        monthlySalaryEnc: encryptField(monthlySalary),
        ibanEnc: encryptField(iban),
        hiredAt: hiredAtStr ? new Date(hiredAtStr) : null,
        status: "active",
      })
      .returning();
    // One-time invite token (valid 72h). The HR user shares the link with the
    // employee out-of-band (email/SMS/printout); the employee uses it to set
    // their password and enrol any required factors.
    const token = randomToken(32);
    await db.insert(invites).values({
      id: sha256Hex(token),
      userId: u.id,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      createdBy: ctx.user.id,
    });
    await audit({
      actorUserId: ctx.user.id,
      action: "employee_created",
      entity: "employee",
      entityId: e.id,
      after: { email, fullNameEn },
    });
    redirect(`/portal/admin/employees/${e.id}?invite=${encodeURIComponent(token)}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    if (msg.includes("unique")) {
      redirect(
        "/portal/admin/employees/new?error=" +
          encodeURIComponent("That email is already in use."),
      );
    }
    throw err;
  }
}

export default async function NewEmployee({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const ctx = await requireRole("hr");
  const sp = await searchParams;
  const csrf = await ensureCsrfToken();

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Add employee</h1>
        {sp.error && <div className="portal-error">{sp.error}</div>}

        <form action={createEmployee} className="portal-card portal-form">
          <input type="hidden" name="_csrf" value={csrf} />

          <h2>Account</h2>
          <div className="portal-grid portal-grid--2">
            <div>
              <label htmlFor="email">Work email *</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div>
              <label htmlFor="hiredAt">Hire date</label>
              <input id="hiredAt" name="hiredAt" type="date" />
            </div>
          </div>

          <h2>Identity</h2>
          <div className="portal-grid portal-grid--2">
            <div>
              <label htmlFor="fullNameEn">Full name (EN) *</label>
              <input id="fullNameEn" name="fullNameEn" type="text" required maxLength={200} />
            </div>
            <div>
              <label htmlFor="fullNameAr">Full name (AR)</label>
              <input id="fullNameAr" name="fullNameAr" type="text" maxLength={200} />
            </div>
            <div>
              <label htmlFor="nationality">Nationality</label>
              <input id="nationality" name="nationality" type="text" maxLength={100} />
            </div>
            <div>
              <label htmlFor="contactPhone">Contact phone</label>
              <input id="contactPhone" name="contactPhone" type="tel" maxLength={60} />
            </div>
          </div>

          <h2>Employment</h2>
          <div className="portal-grid portal-grid--3">
            <div>
              <label htmlFor="jobTitle">Job title</label>
              <input id="jobTitle" name="jobTitle" type="text" maxLength={200} />
            </div>
            <div>
              <label htmlFor="department">Department</label>
              <input id="department" name="department" type="text" maxLength={100} />
            </div>
            <div>
              <label htmlFor="trade">Trade</label>
              <input id="trade" name="trade" type="text" maxLength={100} />
            </div>
          </div>

          <h2>Sensitive (encrypted at rest)</h2>
          <div className="portal-grid portal-grid--2">
            <div>
              <label htmlFor="iqamaNumber">Iqama number</label>
              <input id="iqamaNumber" name="iqamaNumber" type="text" autoComplete="off" />
            </div>
            <div>
              <label htmlFor="passportNumber">Passport number</label>
              <input id="passportNumber" name="passportNumber" type="text" autoComplete="off" />
            </div>
            <div>
              <label htmlFor="monthlySalary">Monthly salary (SAR, e.g. 4500.00)</label>
              <input id="monthlySalary" name="monthlySalary" type="text" inputMode="decimal" autoComplete="off" />
            </div>
            <div>
              <label htmlFor="iban">IBAN</label>
              <input id="iban" name="iban" type="text" autoComplete="off" />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="portal-btn">Create employee</button>
            <Link href="/portal/admin/employees" className="portal-btn portal-btn--ghost">Cancel</Link>
          </div>
        </form>
      </main>
    </>
  );
}
