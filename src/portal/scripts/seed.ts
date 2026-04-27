/**
 * Seed: ensure the super-admin exists and is forced to set a password on first
 * login. Run after `npm run db:push`. Idempotent — safe to re-run.
 *
 *   tsx src/portal/scripts/seed.ts
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, invites } from "../db/schema";
import { hashPassword } from "../auth/password";
import { randomToken, sha256Hex } from "../crypto/field";

const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL ?? "jubu1401@gmail.com";

async function main() {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, SUPER_ADMIN_EMAIL))
    .limit(1);

  if (existing) {
    console.log(`super-admin already exists: ${SUPER_ADMIN_EMAIL} (${existing.id})`);
    return;
  }

  const tempPw = randomToken(24);
  const hash = await hashPassword(tempPw);
  const [u] = await db
    .insert(users)
    .values({
      email: SUPER_ADMIN_EMAIL,
      passwordHash: hash,
      role: "super_admin",
      mustChangePassword: true,
    })
    .returning();

  // Issue a 7-day invite link instead of printing the temp password — that's
  // safer and matches the normal employee-onboarding flow.
  const token = randomToken(32);
  await db.insert(invites).values({
    id: sha256Hex(token),
    userId: u.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdBy: u.id,
  });

  console.log(`Created super-admin: ${SUPER_ADMIN_EMAIL}`);
  console.log("");
  console.log(`First-login link (valid 7 days):`);
  console.log("");
  console.log(`  https://portal.asmc.com.sa/portal/invite/${token}`);
  console.log("");
  console.log("Open this link to set a password and enrol TOTP.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
