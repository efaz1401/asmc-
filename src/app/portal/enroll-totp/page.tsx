import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/portal/db";
import { users } from "@/portal/db/schema";
import { requireUser } from "@/portal/auth/rbac";
import { makeTotp, verifyTotp } from "@/portal/auth/totp";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { audit } from "@/portal/audit";

export const dynamic = "force-dynamic";

const PENDING_COOKIE = "__Host-portal_totp_pending";

async function startEnroll() {
  "use server";
  const ctx = await requireUser();
  if (ctx.user.totpSecretEnc) redirect("/portal/admin");
  const { qrDataUrl, secretEnc } = await makeTotp(ctx.user.email);
  const c = await cookies();
  // Stash the encrypted candidate secret in a short-lived cookie so we don't
  // pollute the user row until they prove they scanned it.
  c.set(PENDING_COOKIE, secretEnc, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/portal/enroll-totp",
    maxAge: 600,
  });
  c.set(PENDING_COOKIE + "_qr", qrDataUrl, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/portal/enroll-totp",
    maxAge: 600,
  });
  redirect("/portal/enroll-totp?step=verify");
}

async function confirmEnroll(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);
  const ctx = await requireUser();
  const c = await cookies();
  const pending = c.get(PENDING_COOKIE)?.value;
  const code = String(formData.get("code") ?? "").trim();
  if (!pending) redirect("/portal/enroll-totp");
  if (!verifyTotp(pending, code)) {
    redirect(
      `/portal/enroll-totp?step=verify&error=${encodeURIComponent("Code did not match. Try again.")}`,
    );
  }
  await db
    .update(users)
    .set({
      totpSecretEnc: pending,
      totpEnrolledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, ctx.user.id));
  await audit({
    actorUserId: ctx.user.id,
    action: "totp_enrolled",
    entity: "user",
    entityId: ctx.user.id,
  });
  c.delete(PENDING_COOKIE);
  c.delete(PENDING_COOKIE + "_qr");
  redirect(ctx.user.role === "employee" ? "/portal/me" : "/portal/admin");
}

export default async function EnrollTotpPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; error?: string }>;
}) {
  const ctx = await requireUser();
  if (ctx.user.totpSecretEnc) {
    redirect(ctx.user.role === "employee" ? "/portal/me" : "/portal/admin");
  }
  const sp = await searchParams;
  const csrf = await ensureCsrfToken();
  const c = await cookies();
  const qrDataUrl = c.get(PENDING_COOKIE + "_qr")?.value;

  if (sp.step !== "verify" || !qrDataUrl) {
    return (
      <div className="portal-main">
        <div className="portal-card" style={{ maxWidth: 520, margin: "0 auto" }}>
          <h1>Enable two-factor authentication</h1>
          <p>
            Admin and HR accounts require a second factor. Use Google
            Authenticator, 1Password, Authy or any TOTP app.
          </p>
          <form action={startEnroll}>
            <button type="submit" className="portal-btn">
              Generate my QR code
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-main">
      <div className="portal-card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1>Scan + verify</h1>
        <p className="portal-muted">
          Scan with your authenticator app, then enter the 6-digit code below to
          confirm. The code rotates every 30 seconds.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          width={240}
          height={240}
          alt="TOTP QR code"
          style={{
            display: "block",
            margin: "16px auto",
            background: "white",
            padding: 8,
            borderRadius: 6,
          }}
        />
        {sp.error && <div className="portal-error">{sp.error}</div>}
        <form action={confirmEnroll} className="portal-form">
          <input type="hidden" name="_csrf" value={csrf} />
          <div>
            <label htmlFor="code">6-digit code</label>
            <input
              type="text"
              id="code"
              name="code"
              required
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              autoFocus
            />
          </div>
          <button type="submit" className="portal-btn">
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}
