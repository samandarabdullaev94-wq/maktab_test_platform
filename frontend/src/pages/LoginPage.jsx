import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import api from "../utils/api";
import { canManageContentArea, saveAuth } from "../utils/auth";

const LOGIN_ERROR_TEXT = "Login yoki parol noto‘g‘ri";

function LoginPage() {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setLoginError("");
      const res = await api.post("login/", { username, password });
      saveAuth(res.data);

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else if (canManageContentArea(res.data.user)) {
        navigate("/admin");
      } else {
        navigate("/staff");
      }
    } catch {
      setLoginError(LOGIN_ERROR_TEXT);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (value) => {
    setUsername(value);
    if (loginError) {
      setLoginError("");
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (loginError) {
      setLoginError("");
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
        justifyContent: "center",
        alignItems: "center",
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
          borderRadius: "var(--app-radius-lg)",
          padding: "28px",
          boxShadow: "var(--app-card-shadow-strong)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>{t("loginPage.title")}</h2>

        <input
          type="text"
          placeholder={t("loginPage.usernamePlaceholder")}
          value={username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            marginBottom: "14px",
            borderRadius: "var(--app-radius-md)",
            border: "1px solid var(--app-control-border)",
            background: "var(--app-control-bg)",
            color: "var(--app-text)",
            padding: "0 14px",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder={t("loginPage.passwordPlaceholder")}
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            marginBottom: loginError ? "0" : "14px",
            borderRadius: "var(--app-radius-md)",
            border: "1px solid var(--app-control-border)",
            background: "var(--app-control-bg)",
            color: "var(--app-text)",
            padding: "0 14px",
            boxSizing: "border-box",
          }}
        />
        {loginError && (
          <p
            style={{
              margin: "8px 0 14px 0",
              color: "var(--app-danger, #ef4444)",
              fontSize: "13px",
              lineHeight: 1.35,
              opacity: 1,
              transition: "opacity 0.18s ease",
            }}
          >
            {loginError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            height: "48px",
            border: "none",
            borderRadius: "var(--app-radius-md)",
            background: "var(--app-primary-strong)",
            color: "var(--app-text-inverse)",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {loading ? t("loginPage.submitting") : t("loginPage.submit")}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;

