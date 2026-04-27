import { Topbar } from "../../_components/Topbar";
import { requireUser } from "@/portal/auth/rbac";
import { getEmployeeByUserId } from "@/portal/data/employees";

export const dynamic = "force-dynamic";

function fmt(d?: Date | null): string {
  if (!d) return "—";
  return d.toISOString().slice(0, 10);
}

export default async function MyProfile() {
  const ctx = await requireUser();
  const me = await getEmployeeByUserId(ctx.user.id);

  if (!me) {
    return (
      <>
        <Topbar user={ctx.user} />
        <main className="portal-main">
          <div className="portal-card portal-error">
            Your employee profile hasn&apos;t been set up yet. Ask HR.
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar user={ctx.user} />
      <main className="portal-main">
        <h1 style={{ marginTop: 0 }}>My profile</h1>

        <div className="portal-card">
          <h2>Identity</h2>
          <dl className="portal-kv">
            <dt>Full name (EN)</dt><dd>{me.fullNameEn}</dd>
            <dt>Full name (AR)</dt><dd>{me.fullNameAr ?? "—"}</dd>
            <dt>Date of birth</dt><dd>{fmt(me.dob)}</dd>
            <dt>Nationality</dt><dd>{me.nationality ?? "—"}</dd>
            <dt>Gender</dt><dd>{me.gender ?? "—"}</dd>
          </dl>
        </div>

        <div className="portal-card">
          <h2>Employment</h2>
          <dl className="portal-kv">
            <dt>Job title</dt><dd>{me.jobTitle ?? "—"}</dd>
            <dt>Department</dt><dd>{me.department ?? "—"}</dd>
            <dt>Trade</dt><dd>{me.trade ?? "—"}</dd>
            <dt>Hired at</dt><dd>{fmt(me.hiredAt)}</dd>
            <dt>Contract type</dt><dd>{me.contractType ?? "—"}</dd>
            <dt>Contract end</dt><dd>{fmt(me.contractEndAt)}</dd>
            <dt>Status</dt><dd><span className="portal-tag portal-tag--mute">{me.status}</span></dd>
          </dl>
        </div>

        <div className="portal-card">
          <h2>Contact</h2>
          <dl className="portal-kv">
            <dt>Phone</dt><dd>{me.contactPhone ?? "—"}</dd>
            <dt>Email</dt><dd>{me.contactEmail ?? "—"}</dd>
            <dt>Address</dt><dd>{me.addressLine ?? "—"}</dd>
            <dt>City</dt><dd>{me.city ?? "—"}</dd>
            <dt>Region</dt><dd>{me.region ?? "—"}</dd>
            <dt>Emergency</dt>
            <dd>
              {me.emergencyContactName ?? "—"}
              {me.emergencyContactPhone ? ` · ${me.emergencyContactPhone}` : ""}
            </dd>
          </dl>
        </div>

        <p className="portal-muted" style={{ fontSize: 12 }}>
          To change any field, contact HR. Sensitive identifiers
          (Iqama, passport, IBAN, salary) are stored encrypted and are not shown
          to you here.
        </p>
      </main>
    </>
  );
}
