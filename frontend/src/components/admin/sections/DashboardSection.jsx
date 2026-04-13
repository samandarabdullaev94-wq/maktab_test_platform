import { StatCard } from "../AdminShell";
import { useI18n } from "../../../i18n/useI18n";

function DashboardSection({
  loading,
  error,
  totalStudents,
  totalScore,
  averageScore,
  recentTop,
}) {
  const { tx } = useI18n();

  return (
    <>
      <h1 className="admin-page-title">{tx("Dashboard")}</h1>
      <p className="admin-page-subtitle">
        {tx("Platformaning umumiy ko'rsatkichlari")}
      </p>

      {loading ? (
        <h2 style={{ textAlign: "center", marginTop: "40px" }}>
          {tx("Yuklanmoqda...")}
        </h2>
      ) : error ? (
        <h2 style={{ textAlign: "center", marginTop: "40px" }}>
          {tx(error)}
        </h2>
      ) : (
        <>
          <div className="admin-grid-3">
            <StatCard title={tx("Jami o'quvchilar")} value={totalStudents} />
            <StatCard title={tx("Jami ball")} value={totalScore} />
            <StatCard title={tx("O'rtacha ball")} value={averageScore} />
          </div>

          <div className="admin-card">
            <h2 className="admin-card-title">{tx("So'nggi TOP natijalar")}</h2>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{tx("Ism familiya")}</th>
                    <th>{tx("Ball")}</th>
                    <th>{tx("Maktab")}</th>
                    <th>{tx("Sinf")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTop.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="admin-table-empty">
                        {tx("Ma'lumot yo'q")}
                      </td>
                    </tr>
                  ) : (
                    recentTop.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.full_name}</td>
                        <td>
                          {item.score}/{item.total_questions}
                        </td>
                        <td>{item.school}</td>
                        <td>
                          {item.class}-{item.section}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default DashboardSection;
