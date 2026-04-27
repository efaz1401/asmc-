import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uuid,
  pgEnum,
  index,
  bigint,
} from "drizzle-orm/pg-core";

/* ----- enums ----- */

export const roleEnum = pgEnum("role", [
  "super_admin",
  "admin",
  "hr",
  "employee",
]);

export const employeeStatusEnum = pgEnum("employee_status", [
  "active",
  "on_leave",
  "terminated",
  "archived",
]);

export const documentKindEnum = pgEnum("document_kind", [
  "iqama",
  "passport",
  "contract",
  "certificate",
  "medical",
  "other",
]);

export const leaveKindEnum = pgEnum("leave_kind", [
  "annual",
  "sick",
  "unpaid",
  "emergency",
]);

export const leaveStatusEnum = pgEnum("leave_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "half_day",
  "leave",
  "holiday",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "draft",
  "submitted",
  "acknowledged",
]);

export const payrollRunStatusEnum = pgEnum("payroll_run_status", [
  "draft",
  "approved",
  "paid",
]);

export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "consumed",
  "expired",
  "revoked",
]);

/* ----- core auth / users ----- */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").notNull().default("employee"),
    isActive: boolean("is_active").notNull().default(true),
    mustChangePassword: boolean("must_change_password").notNull().default(true),
    totpSecretEnc: text("totp_secret_enc"), // null until enrolled
    totpEnrolledAt: timestamp("totp_enrolled_at"),
    lastLoginAt: timestamp("last_login_at"),
    failedLoginCount: integer("failed_login_count").notNull().default(0),
    lockedUntil: timestamp("locked_until"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("users_email_idx").on(t.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    // session id is sha256(token); the cookie holds the raw token
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/* ----- employee record (1:1 with users where role='employee') ----- */

export const employees = pgTable(
  "employees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "restrict" }),
    fullNameEn: text("full_name_en").notNull(),
    fullNameAr: text("full_name_ar"),
    dob: timestamp("dob"),
    nationality: text("nationality"),
    gender: text("gender"),
    iqamaNumberEnc: text("iqama_number_enc"),
    iqamaExpiry: timestamp("iqama_expiry"),
    passportNumberEnc: text("passport_number_enc"),
    passportExpiry: timestamp("passport_expiry"),
    contactPhone: text("contact_phone"),
    contactEmail: text("contact_email"),
    addressLine: text("address_line"),
    city: text("city"),
    region: text("region"),
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactPhone: text("emergency_contact_phone"),
    jobTitle: text("job_title"),
    department: text("department"),
    trade: text("trade"),
    hiredAt: timestamp("hired_at"),
    contractType: text("contract_type"),
    contractEndAt: timestamp("contract_end_at"),
    monthlySalaryEnc: text("monthly_salary_enc"),
    allowancesJsonEnc: text("allowances_json_enc"),
    ibanEnc: text("iban_enc"),
    bankName: text("bank_name"),
    status: employeeStatusEnum("status").notNull().default("active"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("employees_status_idx").on(t.status),
    index("employees_name_idx").on(t.fullNameEn),
  ],
);

/* ----- documents ----- */

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    kind: documentKindEnum("kind").notNull(),
    filename: text("filename").notNull(),
    mime: text("mime").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    storageKey: text("storage_key").notNull(),
    sha256: text("sha256").notNull(),
    expiresAt: timestamp("expires_at"),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id),
    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  },
  (t) => [index("documents_employee_idx").on(t.employeeId)],
);

/* ----- leave ----- */

export const leaveRequests = pgTable(
  "leave_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    kind: leaveKindEnum("kind").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    reason: text("reason"),
    status: leaveStatusEnum("status").notNull().default("pending"),
    decidedBy: uuid("decided_by").references(() => users.id),
    decidedAt: timestamp("decided_at"),
    decisionNote: text("decision_note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("leave_employee_idx").on(t.employeeId),
    index("leave_status_idx").on(t.status),
  ],
);

/* ----- attendance (one row per employee per date) ----- */

export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    workDate: text("work_date").notNull(), // YYYY-MM-DD, naive (KSA business date)
    checkInAt: timestamp("check_in_at"),
    checkOutAt: timestamp("check_out_at"),
    status: attendanceStatusEnum("status").notNull().default("present"),
    minutesWorked: integer("minutes_worked").notNull().default(0),
    overtimeMinutes: integer("overtime_minutes").notNull().default(0),
    note: text("note"),
    checkInIp: text("check_in_ip"),
    checkOutIp: text("check_out_ip"),
    correctedBy: uuid("corrected_by").references(() => users.id),
    correctedAt: timestamp("corrected_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("attendance_employee_date_idx").on(t.employeeId, t.workDate),
    index("attendance_date_idx").on(t.workDate),
  ],
);

/* ----- performance reviews ----- */

export const performanceReviews = pgTable(
  "performance_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    reviewerId: uuid("reviewer_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    periodLabel: text("period_label").notNull(), // e.g. "2026-Q1" or "2026"
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    // ratings 1..5 per category
    ratingWorkQuality: integer("rating_work_quality"),
    ratingAttendance: integer("rating_attendance"),
    ratingSafety: integer("rating_safety"),
    ratingTeamwork: integer("rating_teamwork"),
    ratingInitiative: integer("rating_initiative"),
    ratingOverall: integer("rating_overall"),
    strengths: text("strengths"),
    improvements: text("improvements"),
    goals: text("goals"),
    privateNotes: text("private_notes"), // not shown to employee
    status: reviewStatusEnum("status").notNull().default("draft"),
    submittedAt: timestamp("submitted_at"),
    acknowledgedAt: timestamp("acknowledged_at"),
    employeeComment: text("employee_comment"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("review_employee_idx").on(t.employeeId),
    index("review_period_idx").on(t.periodStart, t.periodEnd),
  ],
);

/* ----- payroll: a run is one period (e.g. 2026-04). Each item is one
   employee's pay for that run. All money fields are AES-256-GCM encrypted. */

export const payrollRuns = pgTable(
  "payroll_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    periodYear: integer("period_year").notNull(),
    periodMonth: integer("period_month").notNull(),
    status: payrollRunStatusEnum("status").notNull().default("draft"),
    workingDays: integer("working_days").notNull().default(26),
    overtimeRateEnc: text("overtime_rate_enc"), // multiplier as string e.g. "1.5"
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    approvedBy: uuid("approved_by").references(() => users.id),
    approvedAt: timestamp("approved_at"),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("payroll_run_period_idx").on(t.periodYear, t.periodMonth)],
);

export const payrollItems = pgTable(
  "payroll_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    runId: uuid("run_id")
      .notNull()
      .references(() => payrollRuns.id, { onDelete: "cascade" }),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "restrict" }),
    daysPresent: integer("days_present").notNull().default(0),
    daysAbsent: integer("days_absent").notNull().default(0),
    overtimeMinutes: integer("overtime_minutes").notNull().default(0),
    // all money values are encrypted strings (numeric stored as decimal text)
    baseSalaryEnc: text("base_salary_enc"),
    allowancesJsonEnc: text("allowances_json_enc"),
    overtimePayEnc: text("overtime_pay_enc"),
    deductionsJsonEnc: text("deductions_json_enc"),
    grossEnc: text("gross_enc"),
    netEnc: text("net_enc"),
    payslipKey: text("payslip_key"), // R2 key of the rendered PDF
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("payroll_item_run_idx").on(t.runId),
    index("payroll_item_employee_idx").on(t.employeeId),
  ],
);

/* ----- invite tokens for HR-created employees ----- */

export const invites = pgTable(
  "invites",
  {
    id: text("id").primaryKey(), // sha256(token)
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    consumedAt: timestamp("consumed_at"),
    status: inviteStatusEnum("status").notNull().default("pending"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("invites_user_idx").on(t.userId)],
);

/* ----- audit log + rate limit ----- */

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    beforeJson: jsonb("before_json"),
    afterJson: jsonb("after_json"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("audit_actor_idx").on(t.actorUserId),
    index("audit_created_idx").on(t.createdAt),
    index("audit_entity_idx").on(t.entity, t.entityId),
  ],
);

export const rateLimitEvents = pgTable(
  "rate_limit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bucket: text("bucket").notNull(), // e.g. "login:1.2.3.4" or "login:user@x.com"
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("rl_bucket_idx").on(t.bucket, t.createdAt)],
);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: text("id").primaryKey(), // sha256(token)
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Session = typeof sessions.$inferSelect;
