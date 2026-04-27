import { redirect } from "next/navigation";
import { getCurrentUser } from "@/portal/auth/session";
import { onboardingNextStep } from "@/portal/auth/rbac";

export const dynamic = "force-dynamic";

export default async function PortalIndex() {
  const ctx = await getCurrentUser();
  if (!ctx) redirect("/portal/login");
  const next = onboardingNextStep(ctx.user);
  if (next) redirect(next);
  redirect(ctx.user.role === "employee" ? "/portal/me" : "/portal/admin");
}
