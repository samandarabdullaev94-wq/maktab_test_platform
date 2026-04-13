import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import api from "../utils/api";
import { canManageContentArea, saveAuth } from "../utils/auth";

const LOGIN_ERROR_TEXT = "Login yoki parol noto‘g‘ri";

function LoginModal({ onClose }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const inputStyle = {
    width: "100%",
    height: "48px",
    padding: "0 14px",
    borderRadius: "var(--app-radius-md)",
    border: "1px solid var(--app-control-border)",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    background: "var(--app-control-bg)",
    color: "var(--app-text)",
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setLoginError("");
      const res = await api.post("login/", {
        username: login,
        password,
      });

      saveAuth(res.data);
      onClose();

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

  const handleLoginChange = (value) => {
    setLogin(value);
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
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--app-overlay-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
          borderRadius: "var(--app-radius-lg)",
          padding: "28px",
          boxSizing: "border-box",
          boxShadow: "var(--app-card-shadow-strong)",
          position: "relative",
          zIndex: 20,
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            width: "36px",
            height: "36px",
            borderRadius: "var(--app-radius-md)",
            border: "none",
            background: "var(--app-surface-muted)",
            color: "var(--app-text)",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          {t("loginModal.close")}
        </button>

        <h2
          style={{
            margin: "0 0 8px 0",
            fontSize: "32px",
            color: "var(--app-text)",
          }}
        >
          {t("loginModal.title")}
        </h2>

        <p
          style={{
            margin: "0 0 22px 0",
            color: "var(--app-muted-text)",
            fontSize: "15px",
          }}
        >
          {t("loginModal.description")}
        </p>

        <div style={{ display: "grid", gap: "14px" }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                color: "var(--app-muted-text)",
              }}
            >
              {t("loginModal.loginLabel")}
            </label>
            <input
              type="text"
              placeholder={t("loginModal.loginPlaceholder")}
              value={login}
              onChange={(e) => handleLoginChange(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                color: "var(--app-muted-text)",
              }}
            >
              {t("loginModal.passwordLabel")}
            </label>
            <input
              type="password"
              placeholder={t("loginModal.passwordPlaceholder")}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              style={inputStyle}
            />
            {loginError && (
              <p
                style={{
                  margin: "8px 0 0 0",
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
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginTop: "22px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              height: "48px",
              borderRadius: "var(--app-radius-md)",
              border: "none",
              background: "var(--app-surface-muted)",
              color: "var(--app-text)",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            {t("loginModal.cancel")}
          </button>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              height: "48px",
              borderRadius: "var(--app-radius-md)",
              border: "none",
              background: "var(--app-primary-strong)",
              color: "var(--app-text-inverse)",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px",
              fontWeight: "600",
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? t("loginPage.submitting") : t("loginModal.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;

