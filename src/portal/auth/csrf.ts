import "server-only";

import { cookies, headers } from "next/headers";
import { timingSafeEqualStr } from "../crypto/field";

const CSRF_COOKIE = "__Host-portal_csrf";

/**
 * Double-submit cookie CSRF defence. The cookie is set by the root middleware
 * (because Server Components can't write cookies in Next.js 16). Pages embed
 * the value as a hidden form field, server actions verify both match.
 */

export async function ensureCsrfToken(): Promise<string> {
  const c = await cookies();
  const v = c.get(CSRF_COOKIE)?.value;
  // If middleware didn't run (e.g. local script test) we still render —
  // server-action verification will fail and the user will be told to refresh.
  return v ?? "";
}

export async function assertCsrfFromForm(formData: FormData) {
  const c = await cookies();
  const cookieToken = c.get(CSRF_COOKIE)?.value;
  const formToken = String(formData.get("_csrf") ?? "");
  if (
    !cookieToken ||
    !formToken ||
    !timingSafeEqualStr(cookieToken, formToken)
  ) {
    throw new Error("CSRF token invalid. Refresh the page and try again.");
  }
}

export async function assertCsrfFromHeader() {
  const c = await cookies();
  const h = await headers();
  const cookieToken = c.get(CSRF_COOKIE)?.value;
  const headerToken = h.get("x-csrf-token") ?? "";
  if (
    !cookieToken ||
    !headerToken ||
    !timingSafeEqualStr(cookieToken, headerToken)
  ) {
    throw new Error("CSRF token invalid. Refresh the page and try again.");
  }
}
