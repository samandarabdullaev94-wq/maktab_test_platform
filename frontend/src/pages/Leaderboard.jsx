import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";
import api from "../utils/api";

function Leaderboard() {
  const [data, setData] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { tx } = useI18n();

  const safeTestId = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    const rawTestId = queryParams.get("test_id");

    if (
      rawTestId === null ||
      rawTestId === "" ||
      rawTestId === "undefined" ||
      rawTestId === "null"
    ) {
      return null;
    }

    return rawTestId;
  }, [location.search]);

  useEffect(() => {
    const url = safeTestId
      ? `leaderboard/?test_id=${safeTestId}`
      : "leaderboard/";

    api
      .get(url)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [safeTestId]);

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
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h1 style={{ margin: 0 }}>
            {safeTestId
              ? tx("Test bo'yicha TOP o'quvchilar")
              : tx("TOP o'quvchilar")}
          </h1>

          <button
            onClick={() => navigate("/")}
            style={{
              background: "var(--app-primary-strong)",
              color: "var(--app-text-inverse)",
              border: "none",
              borderRadius: "8px",
              padding: "12px 18px",
              cursor: "pointer",
            }}
          >
            {tx("Bosh sahifa")}
          </button>
        </div>

        <div
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "var(--app-card-shadow)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--app-primary-strong)",
                  color: "var(--app-text-inverse)",
                }}
              >
                <th style={{ padding: "16px" }}>#</th>
                <th style={{ padding: "16px" }}>{tx("Ism")}</th>
                <th style={{ padding: "16px" }}>{tx("Ball")}</th>
                <th style={{ padding: "16px" }}>{tx("Maktab")}</th>
                <th style={{ padding: "16px" }}>{tx("Sinf")}</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "24px" }}>
                    {tx("Reyting ma'lumotlari yo'q")}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      textAlign: "center",
                      borderBottom: "1px solid var(--app-border)",
                    }}
                  >
                    <td style={{ padding: "16px" }}>{index + 1}</td>
                    <td style={{ padding: "16px" }}>{item.full_name}</td>
                    <td style={{ padding: "16px" }}>
                      {item.score}/{item.total_questions}
                    </td>
                    <td style={{ padding: "16px" }}>{item.school}</td>
                    <td style={{ padding: "16px" }}>
                      {item.class}-{item.section}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
