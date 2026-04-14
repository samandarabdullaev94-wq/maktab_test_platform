import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useI18n } from "../i18n";
import api from "../utils/api";

function CertificatePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { tx } = useI18n();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`certificates/${code}/`)
      .then((res) => {
        setCertificate(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Sertifikat topilmadi");
      })
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "calc(100vh - 72px)",
          background: "var(--app-bg-soft)",
          color: "var(--app-text)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "28px 18px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "560px",
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            borderRadius: "var(--app-radius-lg)",
            boxShadow: "var(--app-card-shadow-strong)",
            padding: "28px",
            textAlign: "center",
          }}
        >
          {loading ? (
            <p>{tx("Yuklanmoqda...")}</p>
          ) : error ? (
            <>
              <h1>{tx(error)}</h1>
              <button
                onClick={() => navigate("/")}
                style={{
                  background: "var(--app-primary-strong)",
                  color: "var(--app-text-inverse)",
                  border: "none",
                  borderRadius: "var(--app-radius-md)",
                  padding: "12px 18px",
                  cursor: "pointer",
                }}
              >
                {tx("Bosh sahifa")}
              </button>
            </>
          ) : (
            <>
              <p style={{ color: "var(--app-muted-text)", marginTop: 0 }}>
                {tx("Sertifikat kodi")}
              </p>
              <h1 style={{ marginTop: 0 }}>{certificate.code}</h1>
              <h2>{certificate.full_name}</h2>
              <p style={{ fontSize: "20px", color: "var(--app-primary-strong)" }}>
                {certificate.score} / {certificate.total_questions} -{" "}
                {certificate.percentage}%
              </p>
              {certificate.qr_code_url && (
                <img
                  src={certificate.qr_code_url}
                  alt={tx("Sertifikat QR kodi")}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "180px",
                    height: "180px",
                    objectFit: "contain",
                    margin: "18px auto",
                    display: "block",
                    borderRadius: "var(--app-radius-md)",
                  }}
                />
              )}
              <a
                href={certificate.verify_url}
                style={{ color: "var(--app-primary-strong)", wordBreak: "break-all" }}
              >
                {certificate.verify_url}
              </a>
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default CertificatePage;
