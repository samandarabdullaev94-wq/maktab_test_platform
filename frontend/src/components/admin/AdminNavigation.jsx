import { SidebarButton } from "./AdminShell";
import { useI18n } from "../../i18n/useI18n";

const ADMIN_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "settings", label: "Sayt sozlamalari" },
  { id: "tests", label: "Testlar boshqaruvi" },
  { id: "organizations", label: "Viloyat / Tuman / Maktab" },
  { id: "classes", label: "Sinf / Harf / Limit" },
  { id: "users", label: "Foydalanuvchilar / Rollar" },
  { id: "content", label: "Yo'nalish / Fan / Test / Savol" },
  { id: "results", label: "Natijalar / TOP" },
];

function AdminNavigation({
  activeSection,
  onSectionChange,
  onDownloadExcel,
  onOpenLeaderboard,
  onOpenHome,
  onLogout,
  navItems = ADMIN_NAV_ITEMS,
  showAdminActions = true,
}) {
  const { tx } = useI18n();

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <h2>{tx("Admin panel")}</h2>
        <p>{tx("Test platforma boshqaruvi")}</p>
      </div>

      <div className="admin-nav">
        {navItems.map((item) => (
          <SidebarButton
            key={item.id}
            active={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
          >
            {tx(item.label)}
          </SidebarButton>
        ))}
      </div>

      <div className="admin-side-actions">
        {showAdminActions && (
          <>
            <button onClick={onDownloadExcel} className="admin-side-action green">
              {tx("Excel yuklab olish")}
            </button>

            <button onClick={onOpenLeaderboard} className="admin-side-action blue">
              {tx("Reyting sahifasi")}
            </button>
          </>
        )}

        <button onClick={onOpenHome} className="admin-side-action dark">
          {tx("Bosh sahifa")}
        </button>

        <button onClick={onLogout} className="admin-side-action danger">
          {tx("Chiqish")}
        </button>
      </div>
    </aside>
  );
}

export default AdminNavigation;
