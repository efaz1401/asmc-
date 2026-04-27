import { eq, desc } from "drizzle-orm";
import { Topbar } from "../../_components/Topbar";
import { requireUser } from "@/portal/auth/rbac";
import { getEmployeeByUserId } from "@/portal/data/employees";
import { db } from "@/portal/db";
import { performanceReviews } from "@/portal/db/schema";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { audit } from "@/portal/audit";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function acknowledge(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireUser();
  const me = await getEmployeeByUserId(ctx.user.id);
  const id = String(formData.get("id") ?? "");
  const comment = String(formData.get("comment") ?? "").slice(0, 1000);
  if (!me || !id) redirect("/portal/me/reviews");
  // Only allow acknowledging your own review.
  const [row] = await db
    .select()
    .from(performanceReviews)
    .where(eq(performanceReviews.id, id))
    .limit(1);
  if (!row || row.employeeId !== me.id || row.status !== "submitted") {
    redirect("/portal/me/reviews");
  }
  await db
    .update(performanceReviews)
    .set({
      status: "acknowledged",
      acknowledgedAt: new Date(),
      employeeComment: comment,
    })
    .where(eq(performanceReviews.id, id));
  await audit({
    actorUserId: ctx.user.id,
    action: "review_acknowledged",
    entity: "performance_review",
    entityId: id,
  });
  redirect("/portal/me/reviews?ok=1");
}

export default async function MyReviews({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const ctx = await requireUser();
  const sp = await searchParams;
  const me = await getEmployeeByUserId(ctx.user.id);
  const csrf = await ensureCsrfToken();
  const list = me
    ? await db
        .select()
        .from(performanceReviews)
        .where(eq(performanceReviews.employeeId, me.id))
        .orderBy(desc(performanceReviews.createdAt))
    : [];

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>Performance reviews</h1>
        {sp.ok && <div className="portal-success">Acknowledged.</div>}
        {list.length === 0 ? (
          <div className="portal-card">
            <p className="portal-muted">No reviews yet.</p>
          </div>
        ) : (
          list.map((r) => (
            <div key={r.id} className="portal-card">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>{r.periodLabel}</h2>
                <span className="portal-tag portal-tag--mute">{r.status}</span>
              </div>
              <dl className="portal-kv">
                <dt>Period</dt>
                <dd>
                  {r.periodStart.toISOString().slice(0, 10)} →{" "}
                  {r.periodEnd.toISOString().slice(0, 10)}
                </dd>
                <dt>Work quality</dt><dd>{r.ratingWorkQuality ?? "—"}/5</dd>
                <dt>Attendance</dt><dd>{r.ratingAttendance ?? "—"}/5</dd>
                <dt>Safety</dt><dd>{r.ratingSafety ?? "—"}/5</dd>
                <dt>Teamwork</dt><dd>{r.ratingTeamwork ?? "—"}/5</dd>
                <dt>Initiative</dt><dd>{r.ratingInitiative ?? "—"}/5</dd>
                <dt>Overall</dt><dd>{r.ratingOverall ?? "—"}/5</dd>
                <dt>Strengths</dt><dd>{r.strengths ?? "—"}</dd>
                <dt>Improvements</dt><dd>{r.improvements ?? "—"}</dd>
                <dt>Goals</dt><dd>{r.goals ?? "—"}</dd>
              </dl>
              {r.status === "submitted" && (
                <form action={acknowledge} className="portal-form" style={{ marginTop: 12 }}>
                  <input type="hidden" name="_csrf" value={csrf} />
                  <input type="hidden" name="id" value={r.id} />
                  <div>
                    <label htmlFor={`comment-${r.id}`}>Your response (optional)</label>
                    <textarea id={`comment-${r.id}`} name="comment" maxLength={1000} />
                  </div>
                  <button type="submit" className="portal-btn">Acknowledge</button>
                </form>
              )}
              {r.status === "acknowledged" && r.employeeComment && (
                <div className="portal-card" style={{ marginTop: 12 }}>
                  <h2>Your response</h2>
                  <p>{r.employeeComment}</p>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </>
  );
}
