import { useI18n } from "../../../i18n/useI18n";

function SettingsSection({
  siteSettings,
  settingsLoading,
  settingsSaving,
  settingsMessage,
  onSettingsChange,
  onSaveSiteSettings,
}) {
  const { tx } = useI18n();

  return (
    <div className="admin-card">
      <h2 className="admin-card-title">{tx("Sayt sozlamalari")}</h2>

      {settingsLoading ? (
        <p>{tx("Yuklanmoqda...")}</p>
      ) : (
        <>
          <div className="admin-grid-2">
            <div className="admin-field">
              <label>{tx("Telefon raqam")}</label>
              <input
                className="admin-input"
                type="text"
                name="header_phone"
                value={siteSettings.header_phone}
                onChange={onSettingsChange}
              />
            </div>

            <div className="admin-field">
              <label>{tx("Majburiy fan soni")}</label>
              <input
                className="admin-input"
                type="number"
                name="required_subject_count"
                min="1"
                max="10"
                value={siteSettings.required_subject_count}
                onChange={onSettingsChange}
              />
            </div>

            <div className="admin-field">
              <label>{tx("Telegram link")}</label>
              <input
                className="admin-input"
                type="url"
                name="telegram_url"
                value={siteSettings.telegram_url}
                onChange={onSettingsChange}
                placeholder="https://t.me/..."
              />
            </div>

            <div className="admin-field">
              <label>{tx("Instagram link")}</label>
              <input
                className="admin-input"
                type="url"
                name="instagram_url"
                value={siteSettings.instagram_url}
                onChange={onSettingsChange}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>

          <div className="admin-check-row">
            <label className="admin-check-label">
              <input
                type="checkbox"
                name="ticker_enabled"
                checked={siteSettings.ticker_enabled}
                onChange={onSettingsChange}
              />
              {tx("Running text yoqilsin")}
            </label>
          </div>

          <div className="admin-check-row">
            <label className="admin-check-label">
              <input
                type="checkbox"
                name="certificate_enabled"
                checked={siteSettings.certificate_enabled}
                onChange={onSettingsChange}
              />
              {tx("Sertifikat yoqilsin")}
            </label>
          </div>

          <div className="admin-grid-2" style={{ marginTop: "20px" }}>
            <div className="admin-field">
              <label>{tx("Sertifikat o'tish foizi")}</label>
              <input
                className="admin-input"
                type="number"
                min="0"
                max="100"
                name="certificate_passing_percentage"
                value={siteSettings.certificate_passing_percentage}
                onChange={onSettingsChange}
              />
            </div>

            <div className="admin-field">
              <label>{tx("Sertifikat public base URL")}</label>
              <input
                className="admin-input"
                type="url"
                name="certificate_public_base_url"
                value={siteSettings.certificate_public_base_url}
                onChange={onSettingsChange}
                placeholder="https://example.uz"
              />
            </div>

            <div className="admin-field">
              <label>{tx("Sertifikat lookup path")}</label>
              <input
                className="admin-input"
                name="certificate_lookup_path"
                value={siteSettings.certificate_lookup_path}
                onChange={onSettingsChange}
                placeholder="/certificate"
              />
            </div>
          </div>

          <div className="admin-field" style={{ marginTop: "20px" }}>
            <label>{tx("Running text matni")}</label>
            <textarea
              className="admin-textarea"
              name="ticker_text"
              value={siteSettings.ticker_text}
              onChange={onSettingsChange}
              rows={4}
            />
          </div>

          <div className="admin-field" style={{ marginTop: "20px" }}>
            <label>{tx("Sertifikat template JSON")}</label>
            <textarea
              className="admin-textarea"
              name="certificate_template"
              value={siteSettings.certificate_template}
              onChange={onSettingsChange}
              rows={6}
            />
          </div>

          <div className="admin-action-row">
            <button
              className="admin-primary-btn"
              onClick={onSaveSiteSettings}
              disabled={settingsSaving}
            >
              {settingsSaving ? tx("Saqlanmoqda...") : tx("Saqlash")}
            </button>

            {settingsMessage && (
              <span
                className={`admin-save-msg ${
                  settingsMessage.includes("xatolik") ? "error" : "success"
                }`}
              >
                {tx(settingsMessage)}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SettingsSection;
