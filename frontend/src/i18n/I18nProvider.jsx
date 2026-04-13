import { useCallback, useMemo, useState } from "react";
import { I18nContext } from "./I18nContext";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, messages } from "./messages";

const LANGUAGE_STORAGE_KEY = "appLanguage";

function getInitialLanguage() {
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(savedLanguage)
    ? savedLanguage
    : DEFAULT_LANGUAGE;
}

function readMessage(language, key) {
  return key.split(".").reduce((value, part) => value?.[part], messages[language]);
}

function interpolate(message, params) {
  if (typeof message !== "string" || !params) {
    return message;
  }

  return message.replace(/\{(\w+)\}/g, (match, key) =>
    params[key] === undefined ? match : String(params[key])
  );
}

function readLiteral(language, text) {
  return messages[language].uiText?.[text];
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) {
      return;
    }

    setLanguageState(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "uz" ? "ru" : "uz");
  }, [language, setLanguage]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: (key, fallbackOrParams = key, maybeParams) => {
        const fallback =
          typeof fallbackOrParams === "string" ? fallbackOrParams : key;
        const params =
          typeof fallbackOrParams === "object" ? fallbackOrParams : maybeParams;
        const message =
          readMessage(language, key) ??
          readMessage(DEFAULT_LANGUAGE, key) ??
          fallback;

        return interpolate(message, params);
      },
      tx: (text, params) =>
        interpolate(
          readLiteral(language, text) ??
            readLiteral(DEFAULT_LANGUAGE, text) ??
            text,
          params
        ),
    }),
    [language, setLanguage, toggleLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
