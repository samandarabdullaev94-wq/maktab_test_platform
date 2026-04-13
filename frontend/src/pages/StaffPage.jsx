import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";
import { clearAuth, getCurrentUser, hasPermission } from "../utils/auth";

function StaffPage() {
  const navigate = useNavigate();
  const { tx } = useI18n();
  const user = useMemo(() => getCurrentUser(), []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

  }, [navigate, user]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--app-bg-soft)",
        color: "var(--app-text)",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>{tx("Xodim paneli")}</h1>
            <p style={{ color: "var(--app-muted-text)" }}>
              {user?.full_name || user?.username}
            </p>
          </div>

          <button
            onClick={() => {
              clearAuth();
              navigate("/");
            }}
            style={{
              background: "var(--app-danger-bg)",
              color: "var(--app-text-inverse)",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            {tx("Chiqish")}
          </button>
        </div>

        {hasPermission("can_manage_tests") && (
          <div style={card}>{tx("Testlarni ko'rish mumkin")}</div>
        )}

        {hasPermission("can_view_results") && (
          <div style={card}>{tx("Natijalarni ko'rish mumkin")}</div>
        )}

        {hasPermission("can_manage_users") && (
          <div style={card}>{tx("O'quvchilar ro'yxati")}</div>
        )}

        {!hasPermission("can_manage_tests") &&
          !hasPermission("can_view_results") &&
          !hasPermission("can_manage_users") && (
            <div style={card}>{tx("Sizda hech qanday ruxsat yo'q")}</div>
          )}
      </div>
    </div>
  );
}

const card = {
  background: "var(--app-surface)",
  border: "1px solid var(--app-border)",
  color: "var(--app-text)",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "12px",
  boxShadow: "var(--app-card-shadow)",
};

export default StaffPage;
