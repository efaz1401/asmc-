import "server-only";

import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { employees, users } from "../db/schema";
import { decryptField } from "../crypto/field";
import type { Employee, User } from "../db/schema";

export async function getEmployeeByUserId(userId: string) {
  const [row] = await db
    .select()
    .from(employees)
    .where(eq(employees.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function listEmployees(opts: { search?: string; status?: Employee["status"] | "all" } = {}) {
  // Keep this simple — small table, full scan is fine.
  const rows = await db
    .select({ e: employees, u: users })
    .from(employees)
    .leftJoin(users, eq(users.id, employees.userId))
    .orderBy(desc(employees.createdAt));
  const search = opts.search?.toLowerCase().trim() ?? "";
  const status = opts.status ?? "all";
  return rows.filter(({ e }) => {
    if (status !== "all" && e.status !== status) return false;
    if (!search) return true;
    return [e.fullNameEn, e.fullNameAr, e.jobTitle, e.department, e.trade]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(search));
  });
}

export async function getEmployeeWithUser(id: string) {
  const [row] = await db
    .select({ e: employees, u: users })
    .from(employees)
    .leftJoin(users, eq(users.id, employees.userId))
    .where(eq(employees.id, id))
    .limit(1);
  return row ?? null;
}

/**
 * Decrypt an employee record's sensitive fields. Caller must have already
 * gated this behind a role check + sensitive-reveal step. Audit log it.
 */
export function revealSensitive(e: Employee) {
  return {
    iqamaNumber: decryptField(e.iqamaNumberEnc),
    passportNumber: decryptField(e.passportNumberEnc),
    monthlySalary: decryptField(e.monthlySalaryEnc),
    iban: decryptField(e.ibanEnc),
    allowancesJson: decryptField(e.allowancesJsonEnc),
  };
}

export type EmployeeWithUser = { e: Employee; u: User | null };
