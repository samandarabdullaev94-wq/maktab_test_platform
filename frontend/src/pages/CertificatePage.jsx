import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useI18n } from "../i18n";
import api from "../utils/api";

const PLACEHOLDER_KEYS = new Set([
  "full_name",
  "test_title",
  "subject_names",
  "percentage",
  "score",
  "total_questions",
  "date",
  "code",
]);

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const hasTemplateContent = (template) => {
  if (typeof template === "string") {
    return template.trim().length > 0;
  }

  if (Array.isArray(template)) {
    return template.length > 0;
  }

  return isPlainObject(template) && Object.keys(template).length > 0;
};

const replacePlaceholders = (value, placeholders) =>
  String(value ?? "").replace(/\{([a-z_]+)\}/g, (match, key) => {
    if (!PLACEHOLDER_KEYS.has(key)) {
      return "";
    }

    return placeholders[key] ?? "";
  });

const normalizeTemplateBlock = (block) => {
  if (typeof block === "string" || typeof block === "number") {
    return {
      type: "paragraph",
      text: String(block),
    };
  }

  if (!isPlainObject(block)) {
    return null;
  }

  const text = block.text ?? block.value ?? block.content ?? block.label;

  if (text === undefined || text === null) {
    return null;
  }

  const supportedTypes = new Set([
    "title",
    "heading",
    "subtitle",
    "paragraph",
    "text",
    "small",
    "meta",
  ]);

  return {
    type: supportedTypes.has(block.type) ? block.type : "paragraph",
    text: String(text),
  };
};

const getTemplateBlocks = (template) => {
  if (!hasTemplateContent(template)) {
    return null;
  }

  if (typeof template === "string") {
    return [normalizeTemplateBlock(template)];
  }

  if (Array.isArray(template)) {
    const blocks = template.map(normalizeTemplateBlock).filter(Boolean);
    return blocks.length ? blocks : null;
  }

  const candidates = [
    template.blocks,
    template.sections,
    template.lines,
    template.content,
    template.body,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" || typeof candidate === "number") {
      return [normalizeTemplateBlock(candidate)].filter(Boolean);
    }

    if (Array.isArray(candidate)) {
      const blocks = candidate.map(normalizeTemplateBlock).filter(Boolean);
      if (blocks.length) {
        return blocks;
      }
    }
  }

  const directBlocks = [
    template.title && { type: "title", text: template.title },
    template.subtitle && { type: "subtitle", text: template.subtitle },
    template.text && { type: "paragraph", text: template.text },
  ].filter(Boolean);

  return directBlocks.length ? directBlocks : null;
};

const getBlockStyle = (type) => {
  if (type === "title" || type === "heading") {
    return {
      margin: "0 0 14px",
      fontSize: "32px",
      lineHeight: 1.18,
      fontWeight: 800,
      color: "var(--app-text)",
    };
  }

  if (type === "subtitle") {
    return {
      margin: "0 0 18px",
      fontSize: "22px",
      lineHeight: 1.35,
      fontWeight: 700,
      color: "var(--app-primary-strong)",
    };
  }

  if (type === "small" || type === "meta") {
    return {
      margin: "8px 0",
      fontSize: "14px",
      lineHeight: 1.5,
      color: "var(--app-muted-text)",
    };
  }

  return {
    margin: "10px 0",
    fontSize: "18px",
    lineHeight: 1.55,
    color: "var(--app-text)",
  };
};

const formatCertificateDate = (certificate) =>
  certificate.date ||
  (certificate.issued_at
    ? new Date(certificate.issued_at).toLocaleDateString("uz-UZ")
    : "");

const buildPlaceholders = (certificate) => ({
  full_name: certificate.full_name || "",
  test_title: certificate.test_title || "",
  subject_names: certificate.subject_names || "",
  percentage: certificate.percentage ?? "",
  score: certificate.score ?? "",
  total_questions: certificate.total_questions ?? "",
  date: formatCertificateDate(certificate),
  code: certificate.code || "",
});

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

  const renderFallbackCertificate = () => (
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
      {formatCertificateDate(certificate) && (
        <p style={{ color: "var(--app-muted-text)" }}>
          {tx("Sana")}: {formatCertificateDate(certificate)}
        </p>
      )}
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
  );

  const renderTemplateCertificate = () => {
    const blocks = getTemplateBlocks(certificate.template_snapshot);

    if (!blocks) {
      return renderFallbackCertificate();
    }

    const placeholders = buildPlaceholders(certificate);
    const renderedBlocks = blocks
      .map((block) => ({
        ...block,
        text: replacePlaceholders(block.text, placeholders).trim(),
      }))
      .filter((block) => block.text);

    if (!renderedBlocks.length) {
      return renderFallbackCertificate();
    }

    return (
      <>
        <div style={{ display: "grid", gap: "6px" }}>
          {renderedBlocks.map((block, index) => (
            <p key={`${block.type}-${index}`} style={getBlockStyle(block.type)}>
              {block.text}
            </p>
          ))}
        </div>

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
    );
  };

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
            renderTemplateCertificate()
          )}
        </section>
      </main>
    </>
  );
}

export default CertificatePage;
