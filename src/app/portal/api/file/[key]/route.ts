import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/portal/db";
import { documents, payrollItems, employees } from "@/portal/db/schema";
import { presignDownload } from "@/portal/storage/r2";
import { getCurrentUser } from "@/portal/auth/session";
import { hasRole } from "@/portal/auth/rbac";
import { audit } from "@/portal/audit";

/**
 * Authorise a download by storage key. Employees may only fetch their own
 * documents and payslips; HR/admin/super_admin may fetch anything.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ key: string }> },
) {
  const { key } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const decodedKey = decodeURIComponent(key);

  const isStaff = hasRole(user.user, "hr");
  let allowed = isStaff;
  let entity = "document";
  let entityId: string | null = null;

  if (!allowed) {
    // Look it up in documents
    const [doc] = await db
      .select({ d: documents, e: employees })
      .from(documents)
      .innerJoin(employees, eq(employees.id, documents.employeeId))
      .where(eq(documents.storageKey, decodedKey))
      .limit(1);
    if (doc) {
      allowed = doc.e.userId === user.user.id;
      entityId = doc.d.id;
    } else {
      const [item] = await db
        .select({ i: payrollItems, e: employees })
        .from(payrollItems)
        .innerJoin(employees, eq(employees.id, payrollItems.employeeId))
        .where(eq(payrollItems.payslipKey, decodedKey))
        .limit(1);
      if (item) {
        allowed = item.e.userId === user.user.id;
        entity = "payroll_item";
        entityId = item.i.id;
      }
    }
  }
  if (!allowed) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let url: string;
  try {
    url = await presignDownload(decodedKey);
  } catch {
    return NextResponse.json(
      { error: "storage not configured" },
      { status: 500 },
    );
  }
  const h = await headers();
  await audit({
    actorUserId: user.user.id,
    action: "document_downloaded",
    entity,
    entityId,
    ip: h.get("x-forwarded-for"),
    userAgent: h.get("user-agent"),
  });
  return NextResponse.redirect(url);
}
