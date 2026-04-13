import { useI18n } from "../../../i18n/useI18n";

function DirectionsTable({
  directions,
  savingId,
  onDirectionFieldChange,
  onSaveDirection,
  onDeleteDirection,
}) {
  const { tx } = useI18n();

  return (
    <div className="admin-card">
      <h2 className="admin-card-title">{tx("Yo'nalishlar")}</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{tx("Nomi UZ")}</th>
              <th>{tx("Nomi RU")}</th>
              <th>{tx("Holati")}</th>
              <th>{tx("Amal")}</th>
            </tr>
          </thead>
          <tbody>
            {directions.length === 0 ? (
              <tr>
                <td colSpan="5" className="admin-table-empty">
                  {tx("Yo'nalishlar yo'q")}
                </td>
              </tr>
            ) : (
              directions.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    <input
                      className="admin-input"
                      value={item.name_uz}
                      onChange={(e) =>
                        onDirectionFieldChange(
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
                        onDirectionFieldChange(
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
                          onDirectionFieldChange(
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
                        onClick={() => onSaveDirection(item)}
                        disabled={savingId === `direction-${item.id}`}
                      >
                        {savingId === `direction-${item.id}`
                          ? tx("Saqlanmoqda...")
                          : tx("Saqlash")}
                      </button>
                      <button
                        className="admin-danger-btn"
                        onClick={() => onDeleteDirection(item)}
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

export default DirectionsTable;
