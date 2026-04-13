import CustomSelect from "../../CustomSelect";
import { useI18n } from "../../../i18n/useI18n";

function SubjectsTable({
  subjects,
  directions,
  savingId,
  onSubjectFieldChange,
  onSaveSubject,
  onDeleteSubject,
}) {
  const { tx } = useI18n();

  return (
    <div className="admin-card">
      <h2 className="admin-card-title">{tx("Fanlar")}</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{tx("Yo'nalish")}</th>
              <th>{tx("Nomi UZ")}</th>
              <th>{tx("Nomi RU")}</th>
              <th>{tx("Holati")}</th>
              <th>{tx("Amal")}</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-table-empty">
                  {tx("Fanlar yo'q")}
                </td>
              </tr>
            ) : (
              subjects.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td style={{ minWidth: "220px" }}>
                    <CustomSelect
                      value={item.direction}
                      onChange={(value) =>
                        onSubjectFieldChange(item.id, "direction", value)
                      }
                      options={directions}
                      placeholder={tx("Yo'nalishni tanlang")}
                      getOptionLabel={(opt) => opt.name_uz}
                      getOptionValue={(opt) => opt.id}
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input"
                      value={item.name_uz}
                      onChange={(e) =>
                        onSubjectFieldChange(
                          item.id,
                          "name_uz",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input"
                      value={item.name_ru || ""}
                      onChange={(e) =>
                        onSubjectFieldChange(
                          item.id,
                          "name_ru",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <label className="admin-status-check">
                      <input
                        type="checkbox"
                        checked={item.is_active}
                        onChange={(e) =>
                          onSubjectFieldChange(
                            item.id,
                            "is_active",
                            e.target.checked
                          )
                        }
                      />
                      {item.is_active ? tx("Faol") : tx("Nofaol")}
                    </label>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="admin-primary-btn"
                        onClick={() => onSaveSubject(item)}
                        disabled={savingId === `subject-${item.id}`}
                      >
                        {savingId === `subject-${item.id}`
                          ? tx("Saqlanmoqda...")
                          : tx("Saqlash")}
                      </button>
                      <button
                        className="admin-danger-btn"
                        onClick={() => onDeleteSubject(item)}
                      >
                        {tx("O'chirish")}
                      </button>
                    </div>
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

export default SubjectsTable;
