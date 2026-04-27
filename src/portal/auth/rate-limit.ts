import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "../db";
import { rateLimitEvents, users } from "../db/schema";

/**
 * Sliding-window rate limiter, DB-backed (no Redis). Cheap because the table
 * is small and indexed; still rate-limited writes are bounded per IP.
 */
export async function rateLimit(
  bucket: string,
  max: number,
  windowMs: number,
): Promise<{ ok: boolean; remaining: number; retryAfterMs: number }> {
  const since = new Date(Date.now() - windowMs);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rateLimitEvents)
    .where(
      and(eq(rateLimitEvents.bucket, bucket), gte(rateLimitEvents.createdAt, since)),
    );
  if (count >= max) {
    return { ok: false, remaining: 0, retryAfterMs: windowMs };
  }
  await db.insert(rateLimitEvents).values({ bucket });
  return { ok: true, remaining: max - count - 1, retryAfterMs: 0 };
}

/** Account lockout after consecutive failed logins. */
const LOCK_AFTER = 5;
const LOCK_FOR_MS = 15 * 60 * 1000;

export async function recordLoginFailure(userId: string) {
  const [u] = await db
    .update(users)
    .set({
      failedLoginCount: sql`${users.failedLoginCount} + 1`,
    })
    .where(eq(users.id, userId))
    .returning({ count: users.failedLoginCount });
  if (u && u.count >= LOCK_AFTER) {
    await db
      .update(users)
      .set({
        lockedUntil: new Date(Date.now() + LOCK_FOR_MS),
        failedLoginCount: 0,
      })
      .where(eq(users.id, userId));
  }
}

export async function recordLoginSuccess(userId: string) {
  await db
    .update(users)
    .set({
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export function isLocked(user: { lockedUntil: Date | null }): boolean {
  return user.lockedUntil !== null && user.lockedUntil.getTime() > Date.now();
}
