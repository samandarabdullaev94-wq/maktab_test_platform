import CustomSelect from "../../CustomSelect";
import { useI18n } from "../../../i18n/useI18n";

const CLASS_SECTION_OPTIONS = [
  { id: "A", label: "A" },
  { id: "B", label: "B" },
  { id: "C", label: "C" },
];

function ClassesSection({
  schools,
  classes,
  sections,
  newClass,
  setNewClass,
  newSection,
  setNewSection,
  classLoading,
  savingClassId,
  savingSectionId,
  onCreateClass,
  onCreateSection,
  onClassFieldChange,
  onSectionFieldChange,
  onSaveClass,
  onSaveSection,
}) {
  const { tx } = useI18n();

  return (
    <>
      <div className="admin-card">
        <h2 className="admin-card-title">
          {tx("Yangi sinf / sinf harfi qo'shish")}
        </h2>

        <div className="admin-grid-2">
          <div className="admin-inline-grid">
            <div className="admin-field">
              <label>{tx("Maktab")}</label>
              <CustomSelect
                value={newClass.school}
                onChange={(value) =>
                  setNewClass((p) => ({ ...p, school: value }))
                }
                options={schools}
                placeholder={tx("Tanlang")}
                getOptionLabel={(item) => item.name_uz}
                getOptionValue={(item) => item.id}
              />
            </div>

            <div className="admin-grid-3">
              <div className="admin-field">
                <label>{tx("Sinf")}</label>
                <input
                  className="admin-input"
                  type="number"
                  value={newClass.name}
                  onChange={(e) =>
                    setNewClass((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              <div className="admin-field">
                <label>{tx("Limit")}</label>
                <input
                  className="admin-input"
                  type="number"
                  value={newClass.student_limit}
                  onChange={(e) =>
                    setNewClass((p) => ({
                      ...p,
                      student_limit: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="admin-field">
                <label>{tx("Vaqt (min)")}</label>
                <input
                  className="admin-input"
                  type="number"
                  value={newClass.duration_minutes}
                  onChange={(e) =>
                    setNewClass((p) => ({
                      ...p,
                      duration_minutes: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="admin-field">
              <label>{tx("Test narxi")}</label>
              <input
                className="admin-input"
                type="number"
                value={newClass.test_price}
                onChange={(e) =>
                  setNewClass((p) => ({ ...p, test_price: e.target.value }))
                }
              />
            </div>

            <button className="admin-primary-btn" onClick={onCreateClass}>
              {tx("Sinf qo'shish")}
            </button>
          </div>

          <div className="admin-inline-grid">
            <div className="admin-field">
              <label>{tx("Sinf")}</label>
              <CustomSelect
                value={newSection.school_class}
                onChange={(value) =>
                  setNewSection((p) => ({ ...p, school_class: value }))
                }
                options={classes}
                placeholder={tx("Tanlang")}
                getOptionLabel={(item) => `${item.school_name} - ${item.name}-sinf`}
                getOptionValue={(item) => item.id}
              />
            </div>

            <div className="admin-field">
              <label>{tx("Sinf harfi")}</label>
              <CustomSelect
                value={newSection.name}
                onChange={(value) =>
                  setNewSection((p) => ({ ...p, name: value }))
                }
                options={CLASS_SECTION_OPTIONS}
                placeholder={tx("Tanlang")}
                getOptionLabel={(item) => item.label}
                getOptionValue={(item) => item.id}
              />
            </div>

            <button className="admin-primary-btn" onClick={onCreateSection}>
              {tx("Sinf harfi qo'shish")}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">{tx("Sinflar va limitlar")}</h2>
        {classLoading ? (
          <p>{tx("Yuklanmoqda...")}</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{tx("Maktab")}</th>
                  <th>{tx("Sinf")}</th>
                  <th>{tx("Limit")}</th>
                  <th>{tx("Narx")}</th>
                  <th>{tx("Vaqt")}</th>
                  <th>{tx("Holati")}</th>
                  <th>{tx("Amal")}</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.school_name}</td>
                    <td>
                      <input
                        className="admin-mini-input"
                        type="number"
                        value={item.name}
                        onChange={(e) =>
                          onClassFieldChange(item.id, "name", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="admin-mini-input"
                        type="number"
                        value={item.student_limit}
                        onChange={(e) =>
                          onClassFieldChange(
                            item.id,
                            "student_limit",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="admin-mini-input"
                        type="number"
                        value={item.test_price}
                        onChange={(e) =>
                          onClassFieldChange(
                            item.id,
                            "test_price",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="admin-mini-input"
                        type="number"
                        value={item.duration_minutes}
                        onChange={(e) =>
                          onClassFieldChange(
                            item.id,
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
                          checked={item.is_active}
                          onChange={(e) =>
                            onClassFieldChange(
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
                      <button
                        className="admin-primary-btn"
                        onClick={() => onSaveClass(item)}
                        disabled={savingClassId === item.id}
                      >
                        {savingClassId === item.id
                          ? tx("Saqlanmoqda...")
                          : tx("Saqlash")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">{tx("Sinf harflari")}</h2>
        {classLoading ? (
          <p>{tx("Yuklanmoqda...")}</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{tx("Maktab")}</th>
                  <th>{tx("Sinf")}</th>
                  <th>{tx("Harf")}</th>
                  <th>{tx("Holati")}</th>
                  <th>{tx("Amal")}</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.school_name}</td>
                    <td>{item.school_class_name}-sinf</td>
                    <td style={{ minWidth: "140px" }}>
                      <CustomSelect
                        value={item.name}
                        onChange={(value) =>
                          onSectionFieldChange(item.id, "name", value)
                        }
                        options={CLASS_SECTION_OPTIONS}
                        placeholder={tx("Tanlang")}
                        getOptionLabel={(opt) => opt.label}
                        getOptionValue={(opt) => opt.id}
                      />
                    </td>
                    <td>
                      <label className="admin-status-check">
                        <input
                          type="checkbox"
                          checked={item.is_active}
                          onChange={(e) =>
                            onSectionFieldChange(
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
                      <button
                        className="admin-primary-btn"
                        onClick={() => onSaveSection(item)}
                        disabled={savingSectionId === item.id}
                      >
                        {savingSectionId === item.id
                          ? tx("Saqlanmoqda...")
                          : tx("Saqlash")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default ClassesSection;
