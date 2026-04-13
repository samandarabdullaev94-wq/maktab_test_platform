import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import api from "../utils/api";
import { clearAuth, saveAuth } from "../utils/auth";

function AdminLogin() {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("login/", {
        username,
        password,
      });

      saveAuth(res.data);
      if (res.data.user.role !== "admin") {
        clearAuth();
        alert(t("adminLogin.error"));
        return;
      }

      navigate("/admin");
    } catch (error) {
      console.error(error);
      alert(t("adminLogin.error"));
    }
  };

  return (
    <div
      className="auth-page"
      style={{
        minHeight: "100vh",
        background: "var(--app-bg-soft)",
        color: "var(--app-text)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial",
      }}
    >
      <form
        className="auth-card"
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
          padding: "32px",
          borderRadius: "var(--app-radius-lg)",
          boxShadow: "var(--app-card-shadow-strong)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "24px", textAlign: "center" }}>
          {t("adminLogin.title")}
        </h2>

        <input
          type="text"
          placeholder={t("adminLogin.usernamePlaceholder")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            height: "50px",
            marginBottom: "14px",
            padding: "0 14px",
            borderRadius: "var(--app-radius-md)",
            border: "1px solid var(--app-control-border)",
            background: "var(--app-control-bg)",
            color: "var(--app-text)",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder={t("adminLogin.passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            height: "50px",
            marginBottom: "18px",
            padding: "0 14px",
            borderRadius: "var(--app-radius-md)",
            border: "1px solid var(--app-control-border)",
            background: "var(--app-control-bg)",
            color: "var(--app-text)",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            height: "50px",
            border: "none",
            borderRadius: "var(--app-radius-md)",
            background: "var(--app-primary-strong)",
            color: "var(--app-text-inverse)",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {t("adminLogin.submit")}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;

