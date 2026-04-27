import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import {
  SESSION_COOKIE,
  clearSessionCookie,
  destroySession,
} from "@/portal/auth/session";
import { audit } from "@/portal/audit";
import { getCurrentUser } from "@/portal/auth/session";
import { assertCsrfFromForm } from "@/portal/auth/csrf";

export async function POST(req: Request) {
  const formData = await req.formData();
  await assertCsrfFromForm(formData);
  const ctx = await getCurrentUser();
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (token) await destroySession(token);
  await clearSessionCookie();
  if (ctx) {
    const h = await headers();
    await audit({
      actorUserId: ctx.user.id,
      action: "logout",
      entity: "user",
      entityId: ctx.user.id,
      ip: h.get("x-forwarded-for"),
      userAgent: h.get("user-agent"),
    });
  }
  redirect("/portal/login");
}
