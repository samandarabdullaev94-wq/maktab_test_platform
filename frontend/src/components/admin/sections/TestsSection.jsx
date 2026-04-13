import { useI18n } from "../../../i18n/useI18n";

function TestsSection({
  tests,
  testsLoading,
  savingTestId,
  onTestFieldChange,
  onSaveTest,
  onDeleteTest,
}) {
  const { tx } = useI18n();

  return (
    <div className="admin-card">
      <h2 className="admin-card-title">{tx("Testlar boshqaruvi")}</h2>

      {testsLoading ? (
        <p>{tx("Yuklanmoqda...")}</p>
      ) : tests.length === 0 ? (
        <p>{tx("Testlar topilmadi")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{tx("Test nomi")}</th>
                <th>{tx("Sinf")}</th>
                <th>{tx("Fan")}</th>
                <th>{tx("Vaqt (min)")}</th>
                <th>{tx("Holati")}</th>
                <th>{tx("Amal")}</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td>{test.id}</td>
                  <td>{test.title}</td>
                  <td>{test.class_name}</td>
                  <td>{test.subject_name}</td>
                  <td>
                    <input
                      className="admin-mini-input"
                      type="number"
                      min="1"
                      value={test.duration_minutes}
                      onChange={(e) =>
                        onTestFieldChange(
                          test.id,
                          "duration_minutes",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <label className="admin-status-check">
                      <input
                        type="checkbox"
                        checked={test.is_active}
                        onChange={(e) =>
                          onTestFieldChange(
                            test.id,
                            "is_active",
                            e.target.checked
                          )
                        }
                      />
                      {test.is_active ? tx("Faol") : tx("Nofaol")}
                    </label>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="admin-primary-btn"
                        onClick={() => onSaveTest(test)}
                        disabled={savingTestId === test.id}
                      >
                        {savingTestId === test.id
                          ? tx("Saqlanmoqda...")
                          : tx("Saqlash")}
                      </button>
                      <button
                        className="admin-danger-btn"
                        onClick={() => onDeleteTest(test)}
                      >
                        {tx("O'chirish")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TestsSection;
