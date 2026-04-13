import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { useTheme } from "../theme";
import LoginModal from "./LoginModal";
import api from "../utils/api";

import phoneIcon from "../assets/icons/phone.png";
import uzFlag from "../assets/ui/flags/uz.png";
import ruFlag from "../assets/ui/flags/ru.png";
import telegramIcon from "../assets/ui/social/telegram.svg";
import instagramIcon from "../assets/ui/social/instagram.svg";
import sunIcon from "../assets/ui/theme/sun.svg";
import moonIcon from "../assets/ui/theme/moon.svg";

function getOptionalLink(settings, keys) {
  return keys.map((key) => settings?.[key]).find(Boolean) || "";
}

function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const { language, t, toggleLanguage } = useI18n();
  const { resolvedTheme, toggleTheme } = useTheme();
  const activeFlag = language === "ru" ? ruFlag : uzFlag;
  const activeThemeIcon = resolvedTheme === "dark" ? moonIcon : sunIcon;
  const [siteSettings, setSiteSettings] = useState({
    header_phone: "+998 71 000 00 00",
  });
  const telegramUrl = getOptionalLink(siteSettings, [
    "telegram_url",
    "telegram_link",
    "telegram",
  ]);
  const instagramUrl = getOptionalLink(siteSettings, [
    "instagram_url",
    "instagram_link",
    "instagram",
  ]);

  useEffect(() => {
    api
      .get("site-settings/")
      .then((res) => {
        setSiteSettings(res.data);
      })
      .catch((err) => {
        console.error("Site settings olishda xatolik:", err);
      });
  }, []);

  return (
    <>
      <header
        className="public-header"
        style={{
          width: "100%",
          background: "var(--app-header-bg)",
          color: "var(--app-header-text)",
          boxSizing: "border-box",
        }}
      >
        <div
          className="public-header-inner"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            className="public-header-contact"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              minWidth: "220px",
            }}
          >
            <img
              src={phoneIcon}
              alt={t("header.phoneAlt")}
              style={{ width: "20px", height: "20px" }}
            />
            <span style={{ fontSize: "14px", fontWeight: "600" }}>
              {siteSettings.header_phone || "+998 71 000 00 00"}
            </span>
            <div className="public-header-socials" aria-label="Social links">
              <a
                className={`public-header-social ${
                  telegramUrl ? "" : "public-header-social--disabled"
                }`}
                href={telegramUrl || undefined}
                target={telegramUrl ? "_blank" : undefined}
                rel={telegramUrl ? "noreferrer" : undefined}
                aria-disabled={!telegramUrl}
                onClick={(event) => {
                  if (!telegramUrl) event.preventDefault();
                }}
              >
                <img src={telegramIcon} alt="Telegram" />
              </a>
              <a
                className={`public-header-social ${
                  instagramUrl ? "" : "public-header-social--disabled"
                }`}
                href={instagramUrl || undefined}
                target={instagramUrl ? "_blank" : undefined}
                rel={instagramUrl ? "noreferrer" : undefined}
                aria-disabled={!instagramUrl}
                onClick={(event) => {
                  if (!instagramUrl) event.preventDefault();
                }}
              >
                <img src={instagramIcon} alt="Instagram" />
              </a>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div
            className="public-header-actions"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "14px",
              minWidth: "220px",
            }}
          >
            <button
              type="button"
              onClick={toggleLanguage}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              title={t("header.languageTitle")}
            >
              <img
                src={activeFlag}
                alt={language}
                style={{ width: "20px", height: "20px" }}
              />
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                {t("header.languageCode")}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              title={t("header.themeTitle")}
              data-theme-state={resolvedTheme}
            >
              <img
                src={activeThemeIcon}
                alt={t("header.themeAlt")}
                style={{ width: "18px", height: "18px" }}
              />
            </button>

            <button
              onClick={() => setShowLogin(true)}
              style={{
                background: "var(--app-header-action-bg)",
                color: "var(--app-header-action-text)",
                border: "none",
                borderRadius: "var(--app-radius-md)",
                padding: "10px 18px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              {t("header.login")}
            </button>
          </div>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}

export default Header;
