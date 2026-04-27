import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Topbar } from "../../_components/Topbar";
import { requireRole } from "@/portal/auth/rbac";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { db } from "@/portal/db";
import { performanceReviews, employees } from "@/portal/db/schema";
import { audit } from "@/portal/audit";

export const dynamic = "force-dynamic";

function rating(label: string, name: string, defaultValue: number | null) {
  return (
    <div>
      <label htmlFor={name}>{label} (1–5)</label>
      <input
        id={name}
        name={name}
        type="number"
        min={1}
        max={5}
        defaultValue={defaultValue ?? ""}
      />
    </div>
  );
}

async function createReview(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireRole("hr");
  const employeeId = String(formData.get("employeeId") ?? "");
  const periodLabel = String(formData.get("periodLabel") ?? "").trim().slice(0, 40);
  const periodStart = String(formData.get("periodStart") ?? "");
  const periodEnd = String(formData.get("periodEnd") ?? "");
  if (!employeeId || !periodLabel || !periodStart || !periodEnd) {
    redirect("/portal/admin/reviews?error=missing");
  }
  const intOrNull = (v: FormDataEntryValue | null): number | null => {
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
  };
  const submit = formData.get("submit") === "1";
  const [r] = await db
    .insert(performanceReviews)
    .values({
      employeeId,
      reviewerId: ctx.user.id,
      periodLabel,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      ratingWorkQuality: intOrNull(formData.get("ratingWorkQuality")),
      ratingAttendance: intOrNull(formData.get("ratingAttendance")),
      ratingSafety: intOrNull(formData.get("ratingSafety")),
      ratingTeamwork: intOrNull(formData.get("ratingTeamwork")),
      ratingInitiative: intOrNull(formData.get("ratingInitiative")),
      ratingOverall: intOrNull(formData.get("ratingOverall")),
      strengths: String(formData.get("strengths") ?? "").slice(0, 4000) || null,
      improvements: String(formData.get("improvements") ?? "").slice(0, 4000) || null,
      goals: String(formData.get("goals") ?? "").slice(0, 4000) || null,
      privateNotes: String(formData.get("privateNotes") ?? "").slice(0, 4000) || null,
      status: submit ? "submitted" : "draft",
      submittedAt: submit ? new Date() : null,
    })
    .returning();
  await audit({
    actorUserId: ctx.user.id,
    action: submit ? "review_submitted" : "review_created",
    entity: "performance_review",
    entityId: r.id,
    after: { employeeId, periodLabel, status: r.status },
  });
  redirect("/portal/admin/reviews?ok=1");
}

export default async function AdminReviews({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const ctx = await requireRole("hr");
  const sp = await searchParams;
  const csrf = await ensureCsrfToken();

  const allEmployees = await db
    .select()
    .from(employees)
    .orderBy(employees.fullNameEn);
  const recent = await db
    .select({ r: performanceReviews, e: employees })
    .from(performanceReviews)
    .innerJoin(employees, eq(employees.id, performanceReviews.employeeId))
    .orderBy(desc(performanceReviews.createdAt))
    .limit(30);

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Performance reviews</h1>
        {sp.ok && <div className="portal-success">Saved.</div>}
        {sp.error && <div className="portal-error">Missing required fields.</div>}

        <div className="portal-card">
          <h2>New review</h2>
          <form action={createReview} className="portal-form">
            <input type="hidden" name="_csrf" value={csrf} />
            <div className="portal-grid portal-grid--3">
              <div>
                <label htmlFor="employeeId">Employee</label>
                <select id="employeeId" name="employeeId" required>
                  <option value="">— pick —</option>
                  {allEmployees.map((e) => (
                    <option key={e.id} value={e.id}>{e.fullNameEn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="periodLabel">Period label</label>
                <input id="periodLabel" name="periodLabel" placeholder="2026-Q1" required />
              </div>
              <div className="portal-grid portal-grid--2" style={{ gap: 8 }}>
                <div>
                  <label htmlFor="periodStart">Start</label>
                  <input id="periodStart" name="periodStart" type="date" required />
                </div>
                <div>
                  <label htmlFor="periodEnd">End</label>
                  <input id="periodEnd" name="periodEnd" type="date" required />
                </div>
              </div>
            </div>
            <div className="portal-grid portal-grid--3">
              {rating("Work quality", "ratingWorkQuality", null)}
              {rating("Attendance", "ratingAttendance", null)}
              {rating("Safety", "ratingSafety", null)}
              {rating("Teamwork", "ratingTeamwork", null)}
              {rating("Initiative", "ratingInitiative", null)}
              {rating("Overall", "ratingOverall", null)}
            </div>
            <div>
              <label htmlFor="strengths">Strengths</label>
              <textarea id="strengths" name="strengths" maxLength={4000} />
            </div>
            <div>
              <label htmlFor="improvements">Improvements</label>
              <textarea id="improvements" name="improvements" maxLength={4000} />
            </div>
            <div>
              <label htmlFor="goals">Goals</label>
              <textarea id="goals" name="goals" maxLength={4000} />
            </div>
            <div>
              <label htmlFor="privateNotes">Private notes (not visible to employee)</label>
              <textarea id="privateNotes" name="privateNotes" maxLength={4000} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" name="submit" value="0" className="portal-btn portal-btn--ghost">
                Save draft
              </button>
              <button type="submit" name="submit" value="1" className="portal-btn">
                Submit to employee
              </button>
            </div>
          </form>
        </div>

        <div className="portal-card">
          <h2>Recent reviews</h2>
          {recent.length === 0 ? (
            <p className="portal-muted">No reviews yet.</p>
          ) : (
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Overall</th>
                  <th>Submitted</th>
                  <th>Acknowledged</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(({ r, e }) => (
                  <tr key={r.id}>
                    <td>{e.fullNameEn}</td>
                    <td>{r.periodLabel}</td>
                    <td>
                      <span className="portal-tag portal-tag--mute">{r.status}</span>
                    </td>
                    <td>{r.ratingOverall ?? "—"}/5</td>
                    <td>{r.submittedAt?.toISOString().slice(0, 10) ?? "—"}</td>
                    <td>{r.acknowledgedAt?.toISOString().slice(0, 10) ?? "—"}</td>
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
