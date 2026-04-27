export default function ForbiddenPage() {
  return (
    <div className="portal-main">
      <div className="portal-card">
        <h1>403 — Forbidden</h1>
        <p>You don't have access to this area.</p>
        <p>
          <a href="/portal/me">Back to your dashboard</a>
        </p>
      </div>
    </div>
  );
}
