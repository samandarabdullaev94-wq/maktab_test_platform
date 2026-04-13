import CustomSelect from "../../CustomSelect";
import { useI18n } from "../../../i18n/useI18n";

function OrganizationsSection({
  regions,
  districts,
  schools,
  newRegion,
  setNewRegion,
  newDistrict,
  setNewDistrict,
  newSchool,
  setNewSchool,
  orgLoading,
  savingRegionId,
  savingDistrictId,
  savingSchoolId,
  onCreateRegion,
  onCreateDistrict,
  onCreateSchool,
  onRegionFieldChange,
  onDistrictFieldChange,
  onSchoolFieldChange,
  onSaveRegion,
  onSaveDistrict,
  onSaveSchool,
}) {
  const { tx } = useI18n();

  return (
    <>
      <div className="admin-card">
        <h2 className="admin-card-title">
          {tx("Yangi viloyat / tuman / maktab qo'shish")}
        </h2>

        <div className="admin-grid-3">
          <div className="admin-inline-grid">
            <div className="admin-field">
              <label>{tx("Viloyat nomi (UZ)")}</label>
              <input
                className="admin-input"
                value={newRegion.name_uz}
                onChange={(e) =>
                  setNewRegion((p) => ({ ...p, name_uz: e.target.value }))
                }
              />
            </div>
            <div className="admin-field">
              <label>{tx("Viloyat nomi (RU)")}</label>
              <input
                className="admin-input"
                value={newRegion.name_ru}
                onChange={(e) =>
                  setNewRegion((p) => ({ ...p, name_ru: e.target.value }))
                }
              />
            </div>
            <button className="admin-primary-btn" onClick={onCreateRegion}>
              {tx("Viloyat qo'shish")}
            </button>
          </div>

          <div className="admin-inline-grid">
            <div className="admin-field">
              <label>{tx("Viloyat")}</label>
              <CustomSelect
                value={newDistrict.region}
                onChange={(value) =>
                  setNewDistrict((p) => ({ ...p, region: value }))
                }
                options={regions}
                placeholder={tx("Tanlang")}
                getOptionLabel={(item) => item.name_uz}
                getOptionValue={(item) => item.id}
              />
            </div>
            <div className="admin-field">
              <label>{tx("Tuman/Shahar nomi (UZ)")}</label>
              <input
                className="admin-input"
                value={newDistrict.name_uz}
                onChange={(e) =>
                  setNewDistrict((p) => ({ ...p, name_uz: e.target.value }))
                }
              />
            </div>
            <button className="admin-primary-btn" onClick={onCreateDistrict}>
              {tx("Tuman/Shahar qo'shish")}
            </button>
          </div>

          <div className="admin-inline-grid">
            <div className="admin-field">
              <label>{tx("Tuman/Shahar")}</label>
              <CustomSelect
                value={newSchool.district}
                onChange={(value) =>
                  setNewSchool((p) => ({ ...p, district: value }))
                }
                options={districts}
                placeholder={tx("Tanlang")}
                getOptionLabel={(item) => `${item.region_name} - ${item.name_uz}`}
                getOptionValue={(item) => item.id}
              />
            </div>
            <div className="admin-field">
              <label>{tx("Maktab nomi (UZ)")}</label>
              <input
                className="admin-input"
                value={newSchool.name_uz}
                onChange={(e) =>
                  setNewSchool((p) => ({ ...p, name_uz: e.target.value }))
                }
              />
            </div>
            <button className="admin-primary-btn" onClick={onCreateSchool}>
              {tx("Maktab qo'shish")}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">{tx("Viloyatlar")}</h2>
        {orgLoading ? (
          <p>{tx("Yuklanmoqda...")}</p>
        ) : (
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
                {regions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      <input
                        className="admin-input"
                        value={item.name_uz}
                        onChange={(e) =>
                          onRegionFieldChange(
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
                          onRegionFieldChange(
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
                            onRegionFieldChange(
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
                        onClick={() => onSaveRegion(item)}
                        disabled={savingRegionId === item.id}
                      >
                        {savingRegionId === item.id
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
        <h2 className="admin-card-title">{tx("Tuman / Shaharlar")}</h2>
        {orgLoading ? (
          <p>{tx("Yuklanmoqda...")}</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{tx("Viloyat")}</th>
                  <th>{tx("Nomi UZ")}</th>
                  <th>{tx("Nomi RU")}</th>
                  <th>{tx("Holati")}</th>
                  <th>{tx("Amal")}</th>
                </tr>
              </thead>
              <tbody>
                {districts.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td style={{ minWidth: "220px" }}>
                      <CustomSelect
                        value={item.region}
                        onChange={(value) =>
                          onDistrictFieldChange(item.id, "region", value)
                        }
                        options={regions}
                        placeholder={tx("Tanlang")}
                        getOptionLabel={(region) => region.name_uz}
                        getOptionValue={(region) => region.id}
                      />
                    </td>
                    <td>
                      <input
                        className="admin-input"
                        value={item.name_uz}
                        onChange={(e) =>
                          onDistrictFieldChange(
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
                          onDistrictFieldChange(
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
                            onDistrictFieldChange(
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
                        onClick={() => onSaveDistrict(item)}
                        disabled={savingDistrictId === item.id}
                      >
                        {savingDistrictId === item.id
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
        <h2 className="admin-card-title">{tx("Maktablar")}</h2>
        {orgLoading ? (
          <p>{tx("Yuklanmoqda...")}</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{tx("Tuman/Shahar")}</th>
                  <th>{tx("Nomi UZ")}</th>
                  <th>{tx("Nomi RU")}</th>
                  <th>{tx("Holati")}</th>
                  <th>{tx("Amal")}</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td style={{ minWidth: "260px" }}>
                      <CustomSelect
                        value={item.district}
                        onChange={(value) =>
                          onSchoolFieldChange(item.id, "district", value)
                        }
                        options={districts}
                        placeholder={tx("Tanlang")}
                        getOptionLabel={(district) =>
                          `${district.region_name} - ${district.name_uz}`
                        }
                        getOptionValue={(district) => district.id}
                      />
                    </td>
                    <td>
                      <input
                        className="admin-input"
                        value={item.name_uz}
                        onChange={(e) =>
                          onSchoolFieldChange(
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
                          onSchoolFieldChange(
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
                            onSchoolFieldChange(
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
                        onClick={() => onSaveSchool(item)}
                        disabled={savingSchoolId === item.id}
                      >
                        {savingSchoolId === item.id
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

export default OrganizationsSection;
