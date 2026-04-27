import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";
import type { User } from "../db/schema";

export type Role = User["role"];

/** super_admin > admin > hr > employee */
const RANK: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  hr: 2,
  employee: 1,
};

export function hasRole(user: { role: Role }, required: Role) {
  return RANK[user.role] >= RANK[required];
}

/** Server-side gate. Redirects to /portal/login if not authenticated. */
export async function requireUser() {
  const ctx = await getCurrentUser();
  if (!ctx) redirect("/portal/login");
  return ctx;
}

/** Require auth + a minimum role. Redirects with 403 page on insufficient. */
export async function requireRole(min: Role) {
  const ctx = await requireUser();
  if (!hasRole(ctx.user, min)) redirect("/portal/forbidden");
  return ctx;
}

/** Has the user finished onboarding (password change + TOTP if required)? */
export function onboardingNextStep(user: User): string | null {
  if (user.mustChangePassword) return "/portal/change-password";
  // admin and hr must have TOTP enrolled
  if ((user.role === "admin" || user.role === "hr" || user.role === "super_admin") && !user.totpSecretEnc) {
    return "/portal/enroll-totp";
  }
  return null;
}
