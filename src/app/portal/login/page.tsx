import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/portal/db";
import { users } from "@/portal/db/schema";
import { verifyPassword } from "@/portal/auth/password";
import {
  createSession,
  setSessionCookie,
  getCurrentUser,
} from "@/portal/auth/session";
import { verifyTotp } from "@/portal/auth/totp";
import {
  isLocked,
  rateLimit,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/portal/auth/rate-limit";
import { onboardingNextStep } from "@/portal/auth/rbac";
import { ensureCsrfToken, assertCsrfFromForm } from "@/portal/auth/csrf";
import { audit } from "@/portal/audit";

export const dynamic = "force-dynamic";

async function clientIp() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    null
  );
}

async function login(formData: FormData) {
  "use server";
  await assertCsrfFromForm(formData);

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const totpCode = String(formData.get("totp") ?? "").trim();
  const honey = String(formData.get("company") ?? "");
  const h = await headers();
  const ip = await clientIp();
  const ua = h.get("user-agent");

  if (honey) {
    redirect(`/portal/login?error=${encodeURIComponent("Invalid credentials.")}`);
  }

  // Rate limit per IP and per email — both, so neither can dominate.
  const rlIp = await rateLimit(`login:ip:${ip ?? "unknown"}`, 20, 10 * 60 * 1000);
  if (!rlIp.ok) {
    redirect(
      `/portal/login?error=${encodeURIComponent("Too many attempts. Try again later.")}`,
    );
  }
  const rlEmail = await rateLimit(`login:email:${email}`, 10, 10 * 60 * 1000);
  if (!rlEmail.ok) {
    redirect(
      `/portal/login?error=${encodeURIComponent("Too many attempts. Try again later.")}`,
    );
  }

  if (!email || !password) {
    redirect(`/portal/login?error=${encodeURIComponent("Email and password are required.")}`);
  }

  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  // Constant-ish failure path: always return same message even if email unknown.
  const fail = (msg = "Invalid credentials.") => {
    redirect(`/portal/login?error=${encodeURIComponent(msg)}`);
  };

  if (!u || !u.isActive) return fail();
  if (isLocked(u)) {
    return fail("Account is temporarily locked. Try again later.");
  }

  const ok = await verifyPassword(u.passwordHash, password);
  if (!ok) {
    await recordLoginFailure(u.id);
    await audit({
      actorUserId: u.id,
      action: "login_failed",
      entity: "user",
      entityId: u.id,
      ip,
      userAgent: ua,
    });
    return fail();
  }

  // TOTP step (required for super_admin/admin/hr if enrolled).
  if (u.totpSecretEnc) {
    if (!totpCode) {
      // Render a TOTP-only prompt by reflecting the email + a flag.
      redirect(
        `/portal/login?email=${encodeURIComponent(email)}&need_totp=1`,
      );
    }
    if (!verifyTotp(u.totpSecretEnc, totpCode)) {
      await recordLoginFailure(u.id);
      await audit({
        actorUserId: u.id,
        action: "totp_failed",
        entity: "user",
        entityId: u.id,
        ip,
        userAgent: ua,
      });
      return fail("Invalid two-factor code.");
    }
  }

  await recordLoginSuccess(u.id);
  const { token, expiresAt } = await createSession(u.id, {
    ip: ip ?? undefined,
    userAgent: ua ?? undefined,
  });
  await setSessionCookie(token, expiresAt);
  await audit({
    actorUserId: u.id,
    action: "login",
    entity: "user",
    entityId: u.id,
    ip,
    userAgent: ua,
  });

  const next = onboardingNextStep(u);
  if (next) redirect(next);
  redirect(u.role === "employee" ? "/portal/me" : "/portal/admin");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string; need_totp?: string }>;
}) {
  const sp = await searchParams;
  // If already signed in, bounce to the right place.
  const ctx = await getCurrentUser();
  if (ctx) {
    const next = onboardingNextStep(ctx.user);
    if (next) redirect(next);
    redirect(ctx.user.role === "employee" ? "/portal/me" : "/portal/admin");
  }

  const csrf = await ensureCsrfToken();
  const needTotp = sp.need_totp === "1";

  return (
    <div className="portal-login">
      <div className="portal-login__card portal-card">
        <h1>ASMC Portal</h1>
        <p className="portal-muted" style={{ marginTop: 0 }}>
          Sign in with your work email.
        </p>
        {sp.error && <div className="portal-error">{sp.error}</div>}
        <form action={login} className="portal-form" autoComplete="off">
          <input type="hidden" name="_csrf" value={csrf} />
          {/* Honeypot — bots fill it; real users don't see it. */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
            aria-hidden="true"
          />
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              defaultValue={sp.email ?? ""}
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </div>
          {needTotp && (
            <div>
              <label htmlFor="totp">Two-factor code</label>
              <input
                type="text"
                id="totp"
                name="totp"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                autoFocus
                autoComplete="one-time-code"
              />
            </div>
          )}
          <button type="submit" className="portal-btn">
            Sign in
          </button>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <a href="/portal/forgot" style={{ fontSize: 12 }}>
              Forgot password?
            </a>
            <span className="portal-muted" style={{ fontSize: 12 }}>
              Internal use only.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
