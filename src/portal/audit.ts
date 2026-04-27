import "server-only";

import { db } from "./db";
import { auditLog } from "./db/schema";

export type AuditAction =
  | "login"
  | "login_failed"
  | "logout"
  | "password_changed"
  | "password_reset_requested"
  | "password_reset_completed"
  | "totp_enrolled"
  | "totp_failed"
  | "user_created"
  | "user_updated"
  | "user_deleted"
  | "user_role_changed"
  | "user_locked"
  | "user_unlocked"
  | "user_password_force_reset"
  | "session_revoked"
  | "employee_created"
  | "employee_updated"
  | "employee_archived"
  | "employee_sensitive_viewed"
  | "document_uploaded"
  | "document_downloaded"
  | "document_deleted"
  | "leave_requested"
  | "leave_decided"
  | "attendance_check_in"
  | "attendance_check_out"
  | "attendance_corrected"
  | "review_created"
  | "review_submitted"
  | "review_acknowledged"
  | "payroll_run_created"
  | "payroll_run_approved"
  | "payroll_run_paid";

export async function audit(input: {
  actorUserId: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  userAgent?: string | null;
}) {
  await db.insert(auditLog).values({
    actorUserId: input.actorUserId,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId ?? null,
    beforeJson: (input.before as Record<string, unknown>) ?? null,
    afterJson: (input.after as Record<string, unknown>) ?? null,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
  });
}
