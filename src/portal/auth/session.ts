import "server-only";

import { eq, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "../db";
import { sessions, users } from "../db/schema";
import { randomToken, sha256Hex } from "../crypto/field";

export const SESSION_COOKIE = "__Host-portal_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8h
const SESSION_REFRESH_THRESHOLD_MS = 1000 * 60 * 60; // refresh in last hour

/**
 * Session model:
 *  - The cookie holds a 256-bit URL-safe random token.
 *  - The DB stores sha256(token) as the primary key. A DB read alone cannot
 *    forge a session.
 *  - Cookie is __Host-prefixed: HttpOnly, Secure, SameSite=Lax, Path=/, no
 *    Domain attribute, so it cannot be set by a sibling subdomain.
 *  - Sessions are server-side; logout deletes the row and CSP forbids JS
 *    access to the cookie anyway.
 */

export async function createSession(
  userId: string,
  meta: { ip?: string; userAgent?: string } = {},
) {
  const token = randomToken(32);
  const id = sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({
    id,
    userId,
    expiresAt,
    ip: meta.ip ?? null,
    userAgent: meta.userAgent ?? null,
  });
  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function destroySession(token: string) {
  const id = sha256Hex(token);
  await db.delete(sessions).where(eq(sessions.id, id));
}

export async function destroyAllSessionsForUser(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** Returns the user + session if the cookie is valid, or null. */
export async function getCurrentUser() {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const id = sha256Hex(token);
  const rows = await db
    .select({ s: sessions, u: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, id))
    .limit(1);
  if (rows.length === 0) return null;
  const { s, u } = rows[0];
  if (s.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }
  if (!u.isActive) return null;

  // Sliding expiry: only the DB row is extended here. The cookie can't be
  // mutated from a Server Component in Next.js 16, so we accept that the
  // cookie's max-age may pre-expire by up to one TTL. Server Actions that
  // touch the cookie (login, password change, logout) will refresh it.
  if (s.expiresAt.getTime() - Date.now() < SESSION_REFRESH_THRESHOLD_MS) {
    const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
    try {
      await db
        .update(sessions)
        .set({ expiresAt: newExpiresAt })
        .where(eq(sessions.id, id));
    } catch {
      // best-effort
    }
  }
  return { user: u, session: s };
}

/** Periodic best-effort cleanup. Safe to call on every request. */
export async function gcExpiredSessions() {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
