# ASMC Portal — security model

## What we protect

The portal stores employee PII for an HR/payroll/operations team:

- **Identity**: full name, DOB, nationality, gender
- **Government IDs**: Iqama, passport (encrypted)
- **Compensation**: monthly salary, allowances, IBAN (encrypted)
- **Operational**: contracts, leave, attendance, performance reviews, payroll runs

A breach of any of the above could materially harm employees and create legal
exposure under Saudi PDPL.

## Trust boundaries

| Boundary | Crossed by | Controls |
|---|---|---|
| Internet → web tier | HTTPS request | TLS terminator (Vercel/Cloudflare); HSTS; locked-down CSP |
| Web tier → DB | Postgres TCP | Network ACL to managed Postgres; TLS only; non-superuser DB role |
| Web tier → object storage | HTTPS to R2 | Private bucket; only the server holds R2 keys; clients use signed URLs |
| DB at rest | Backups, dumps | AES-256-GCM field-level encryption for `*_enc` columns; key in env, not in DB |

## Threat coverage (OWASP Top 10:2021)

### A01 — Broken Access Control

- Every server action / page calls `requireUser` or `requireRole(min)`.
- Roles are ranked: `super_admin > admin > hr > employee`. Higher ranks
  inherit lower-rank permissions. Role checks happen on the server even when
  the UI hides actions, so an attacker who calls a server action directly
  still gets denied.
- Object access is row-scoped: an `employee` can only read their own
  `documents`, `attendance`, `leave_requests`, `performance_reviews`,
  `payroll_items`. The `/portal/api/file/[key]` route checks ownership
  before signing a download URL.
- Self-modification of role/lock state is prevented in code
  (`/portal/admin/users`).
- Sensitive-field reveal is gated behind a re-entered password and is logged
  to the audit trail.

### A02 — Cryptographic Failures

- Passwords: argon2id, m=64MiB, t=3, p=4 (`@node-rs/argon2`). No SHA-1 / MD5 /
  bcrypt-with-low-cost.
- Field encryption: AES-256-GCM with a fresh 96-bit IV per call. 32-byte key
  in `ENCRYPTION_KEY`, never logged. Wire format `v1:base64url(iv ‖ ct ‖ tag)`
  so we can rotate to `v2:` later without ambiguity.
- TLS: enforced by the platform; `HSTS` set with `preload` and `includeSubDomains`.
- Cookies: `__Host-` prefix, `Secure`, `HttpOnly` (session), `SameSite=Lax`.
- Session token in cookie ≠ session id in DB. We store `sha256(token)` so a
  DB read can't forge a session.

### A03 — Injection

- All DB access goes through Drizzle's parameterised query builder. There is
  **no** raw SQL except small `sql` snippets that take only column refs.
- React auto-escapes output. We never use `dangerouslySetInnerHTML`.
- CSP `default-src 'self'` blocks third-party JS; `object-src 'none'` blocks
  Flash/PDF embeds; `frame-ancestors 'none'` blocks clickjacking.
- File uploads accept only `application/pdf`, `image/jpeg`, `image/png`,
  `image/webp`, with a 10 MB cap. The S3 SDK enforces `ContentType` on the
  presigned PUT.

### A04 — Insecure Design

- All sensitive fields are encrypted by default. The salary / IBAN reveal
  flow is *opt-in* and audited.
- Predictable IDs avoided: every primary key is a UUIDv4.
- Per-IP and per-email rate limits on login (max 20/IP and 10/email per 10 min).
- Account lockout after 5 consecutive failed logins (15 min auto-unlock).
- Honeypot field on login traps unsophisticated bots.

### A05 — Security Misconfiguration

- Strict middleware-injected headers: `Content-Security-Policy`,
  `Strict-Transport-Security`, `X-Frame-Options DENY`, `X-Content-Type-Options
  nosniff`, `Referrer-Policy strict-origin-when-cross-origin`,
  `Permissions-Policy` denying camera/mic/geolocation/FLoC,
  `Cross-Origin-Opener-Policy same-origin`,
  `Cross-Origin-Resource-Policy same-origin`.
- Portal pages are `robots: noindex, nofollow`.
- No debug routes in prod. `console.warn` lines that print invite/reset
  tokens are guarded by env or only printed when the email service isn't
  wired up — to be removed when SMTP is set.

### A06 — Vulnerable Components

- `npm audit` is run in CI; `package-lock.json` is committed.
- We pin major versions of security-critical libs (`@node-rs/argon2`,
  `otpauth`, `drizzle-orm`).
- Outstanding moderate dev-only advisories: `esbuild` via `drizzle-kit`,
  `postcss` via `next`. These do not ship to runtime; tracked for upgrade.

### A07 — Identification & Authentication Failures

- Passwords: argon2id; min 12 chars; mixed character classes; checked
  against HIBP via k-anonymity (only the SHA-1 prefix leaves the server).
- Sessions: 256-bit random token; 8 h TTL; sliding refresh on the DB row.
  Logout deletes the row; password change revokes all sessions; role change
  revokes all sessions; lock/unlock revokes all sessions.
- TOTP (RFC 6238, SHA-1, 6-digit, 30-second period, ±1 window) is required
  for `super_admin`, `admin`, `hr`. The secret is stored AES-256-GCM
  encrypted; the QR code is rendered server-side.
- Forgot-password flow always returns the same UI message regardless of
  whether the email exists, to prevent enumeration.

### A08 — Software & Data Integrity Failures

- Document uploads: SHA-256 is computed and stored alongside the storage
  key. Tampered objects fail integrity checks at download time.
- Git host enforces signed branches/protected `master`.
- Migrations are deterministic SQL files (`drizzle generate`), not
  ad-hoc DB tweaks.

### A09 — Security Logging and Monitoring Failures

- `audit_log` table: append-only record of every authentication event, every
  admin write, every sensitive-field reveal, every role change, every
  payroll run mutation.
- Every audit row carries: actor user id, action, entity, entity id, optional
  before/after JSON, IP, user agent, timestamp.
- Indexed on `created_at`, `entity+entity_id`, and `actor_user_id`.

### A10 — Server-Side Request Forgery

- The server makes no user-controlled outbound HTTP requests. The HIBP call
  uses a hard-coded URL with only the SHA-1 prefix appended; no user input
  reaches the host.

## Additional controls beyond OWASP

- **CSRF**: SameSite=Lax cookies + double-submit token. The token is minted
  in middleware (Server Components in Next.js 16 cannot write cookies),
  embedded in every form, and verified by every mutating server action.
- **Re-auth on sensitive operations**: revealing encrypted PII or forcing a
  password reset for another user requires the actor to re-enter their own
  password.
- **Privacy / PDPL**: the database stores only what HR needs to administer
  employment. Sensitive identifiers are encrypted at rest. The `users` /
  `employees` tables can be archived (soft-delete) on termination; documents
  can be deleted from R2.
- **Backups**: configure point-in-time recovery on Neon (on by default for
  production tier) plus a nightly logical dump to a separate, encrypted R2
  bucket.

## Operational checklist

Before going live:

- [ ] Set `DATABASE_URL` to a production Postgres (Neon EU prod tier).
- [ ] Generate `ENCRYPTION_KEY` and store it in the platform secret manager.
      **Losing this key permanently encrypts all PII in the database.**
- [ ] Configure R2 (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
      `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`).
- [ ] Run `npm run db:push` to apply the schema.
- [ ] Run `npm run portal:seed` and share the printed invite link with the
      super-admin via a secure channel.
- [ ] Wire up an SMTP provider (Resend) and replace the `console.warn`
      placeholder in `forgot/page.tsx` and the invite display in
      `admin/employees/new/page.tsx` with real email sends.
- [ ] Enable Neon point-in-time recovery and schedule encrypted nightly
      logical dumps to a second R2 bucket.
- [ ] Add a CDN/WAF in front of `portal.asmc.com.sa` (Cloudflare in front of
      Vercel works) with bot-mitigation on `/portal/login`,
      `/portal/forgot`, and `/portal/invite/*`.
- [ ] Set up uptime monitoring and a security alert channel.
- [ ] Document key rotation: every 12 months by default, with a `v2:` AES
      field re-encryption migration run that decrypts with the old key and
      re-encrypts with the new one.

## What is *not* implemented yet

- Email sending. Forgot-password and invite flows print a `console.warn` link
  instead. Wire `RESEND_API_KEY` and replace the warns when ready.
- File uploads from the employee panel UI. The signed-URL plumbing exists
  (`/portal/api/file/[key]/route.ts`) and respects ownership; the UI
  currently only lists existing documents and downloads them.
- Document expiry warnings. The schema stores `documents.expires_at`; we
  haven't built the cron/job that emails HR before expiry.
- Bulk export. Out of scope for v1; deliberately omitted because it's a
  classic foot-gun for PII leakage.
