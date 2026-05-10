import { Link, useLocation } from "react-router-dom";

function Layout({ children }) {
  const name = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role") || "";
  const companyName = localStorage.getItem("companyName");
  const formattedRole = role ? role.toUpperCase() : "UNKNOWN";
  const location = useLocation();

  const links = [
    { to: "/dashboard", icon: "📊", label: "Dashboard" },
    { to: "/tasks", icon: "📋", label: "Tasks" },
    { to: "/inventory", icon: "📦", label: "Stock" },
    { to: "/reports", icon: "📈", label: "Reports" },
  ];

  const showAuditLogs = ['admin', 'manager', 'ceo'].includes(role);

  return (
    <div className="sp-layout">
      {/* Sidebar */}
      <aside className="sp-sidebar">
        <div className="sidebar-brand">Smart Pharma</div>

        <div className="user-card">
          <div className="user-name">{name}</div>
          <div className="user-role">{formattedRole}</div>
          {companyName && <div className="user-company">{companyName}</div>}
        </div>

        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link${location.pathname === link.to ? ' active' : ''}`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}

        {showAuditLogs && (
          <Link
            to="/audit-logs"
            className={`nav-link${location.pathname === '/audit-logs' ? ' active' : ''}`}
          >
            <span>🔍</span>
            <span>Audit Logs</span>
          </Link>
        )}

        <Link
          to="/profile"
          className={`nav-link${location.pathname === '/profile' ? ' active' : ''}`}
        >
          <span>👤</span>
          <span>Profile</span>
        </Link>

        <Link to="/signout" className="nav-link" style={{ marginTop: 'auto' }}>
          <span>🚪</span>
          <span>Logout</span>
        </Link>
      </aside>

      {/* Content */}
      <main className="sp-content animate-fade">
        {children}
      </main>
    </div>
  );
}

export default Layout;
