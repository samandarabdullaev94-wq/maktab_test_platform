import { useI18n } from "../../../i18n/useI18n";

function ResultsSection({ leaderboard }) {
  const { tx } = useI18n();

  return (
    <div className="admin-card">
      <h2 className="admin-card-title">
        {tx("So'nggi natijalar / TOP ro'yxat")}
      </h2>

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
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan="5" className="admin-table-empty">
                  {tx("Ma'lumot yo'q")}
                </td>
              </tr>
            ) : (
              leaderboard.map((item, index) => (
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
  );
}

export default ResultsSection;
