import { ensureCsrfToken } from "@/portal/auth/csrf";
import Link from "next/link";
import type { User } from "@/portal/db/schema";

export async function Topbar({ user }: { user: User }) {
  const csrf = await ensureCsrfToken();
  const isAdmin =
    user.role === "admin" || user.role === "hr" || user.role === "super_admin";
  return (
    <header className="portal-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <span className="portal-topbar__brand">ASMC Portal</span>
        <nav className="portal-topbar__nav">
          {isAdmin ? (
            <>
              <Link href="/portal/admin">Dashboard</Link>
              <Link href="/portal/admin/employees">Employees</Link>
              <Link href="/portal/admin/leave">Leave</Link>
              <Link href="/portal/admin/attendance">Attendance</Link>
              <Link href="/portal/admin/reviews">Reviews</Link>
              <Link href="/portal/admin/payroll">Payroll</Link>
              <Link href="/portal/admin/users">Users</Link>
              <Link href="/portal/admin/audit">Audit log</Link>
            </>
          ) : (
            <>
              <Link href="/portal/me">Dashboard</Link>
              <Link href="/portal/me/profile">Profile</Link>
              <Link href="/portal/me/documents">Documents</Link>
              <Link href="/portal/me/leave">Leave</Link>
              <Link href="/portal/me/attendance">Attendance</Link>
              <Link href="/portal/me/reviews">Reviews</Link>
              <Link href="/portal/me/payslips">Payslips</Link>
            </>
          )}
        </nav>
      </div>
      <div className="portal-topbar__user">
        <span>
          {user.email} <span className="portal-tag portal-tag--mute">{user.role}</span>
        </span>
        <form action="/portal/logout" method="post">
          <input type="hidden" name="_csrf" value={csrf} />
          <button type="submit" className="portal-btn portal-btn--ghost">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
