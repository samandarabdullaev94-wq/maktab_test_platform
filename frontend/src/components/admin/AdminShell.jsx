export function StatCard({ title, value }) {
  return (
    <div className="admin-stat-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

export function SidebarButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`admin-nav-btn ${active ? "active" : ""}`}
    >
      {children}
    </button>
  );
}
