import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tx } = useI18n();

  const data = location.state;

  if (!data) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "40px",
          color: "var(--app-text)",
        }}
      >
        <h2>{tx("Natija topilmadi")}</h2>
        <button onClick={() => navigate("/")}>{tx("Bosh sahifa")}</button>
      </div>
    );
  }

  const percentage =
    data.percentage ??
    (data.total_questions
      ? Math.round((data.score / data.total_questions) * 100)
      : 0);
  const certificate = data.certificate;

  return (
    <div
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
      <div
        style={{
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "var(--app-card-shadow-strong)",
          textAlign: "center",
          width: "min(460px, 100%)",
        }}
      >
        <h1 style={{ marginBottom: "10px" }}>{tx("Natija")}</h1>

        <h2
          style={{
            color: "var(--app-primary-strong)",
            fontSize: "48px",
            margin: "20px 0",
          }}
        >
          {data.score} / {data.total_questions}
        </h2>

        <p style={{ fontSize: "20px", marginBottom: "20px" }}>{percentage}%</p>

        {certificate && (
          <div
            style={{
              margin: "22px 0",
              padding: "18px",
              borderRadius: "var(--app-radius-md)",
              border: "1px solid var(--app-border)",
              background: "var(--app-surface-muted)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>{tx("Sertifikat berildi")}</h3>
            <p style={{ margin: "8px 0", color: "var(--app-muted-text)" }}>
              {tx("Sertifikat kodi")}: {certificate.code}
            </p>
            {certificate.qr_code_url && (
              <img
                src={certificate.qr_code_url}
                alt={tx("Sertifikat QR kodi")}
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "contain",
                  display: "block",
                  margin: "12px auto",
                  borderRadius: "var(--app-radius-md)",
                }}
              />
            )}
            <a
              href={certificate.verify_url}
              style={{
                color: "var(--app-primary-strong)",
                wordBreak: "break-all",
                fontSize: "14px",
              }}
            >
              {certificate.verify_url}
            </a>
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            background: "var(--app-primary-strong)",
            color: "var(--app-text-inverse)",
            border: "none",
            borderRadius: "8px",
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          {tx("Bosh sahifaga qaytish")}
        </button>
        <button
          onClick={() => navigate(`/leaderboard?test_id=${data.test_id}`)}
          style={{
            marginTop: "10px",
            background: "var(--app-success)",
            color: "var(--app-text-inverse)",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          {tx("Reytingni ko'rish")}
        </button>
      </div>
    </div>
  );
}

export default ResultPage;
