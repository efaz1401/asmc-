import { ensureCsrfToken } from "@/portal/auth/csrf";
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
              <a href="/portal/admin">Dashboard</a>
              <a href="/portal/admin/employees">Employees</a>
              <a href="/portal/admin/leave">Leave</a>
              <a href="/portal/admin/attendance">Attendance</a>
              <a href="/portal/admin/reviews">Reviews</a>
              <a href="/portal/admin/payroll">Payroll</a>
              <a href="/portal/admin/users">Users</a>
              <a href="/portal/admin/audit">Audit log</a>
            </>
          ) : (
            <>
              <a href="/portal/me">Dashboard</a>
              <a href="/portal/me/profile">Profile</a>
              <a href="/portal/me/documents">Documents</a>
              <a href="/portal/me/leave">Leave</a>
              <a href="/portal/me/attendance">Attendance</a>
              <a href="/portal/me/reviews">Reviews</a>
              <a href="/portal/me/payslips">Payslips</a>
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
