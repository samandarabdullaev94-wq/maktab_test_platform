import { I18nProvider } from "../i18n";
import { ThemeProvider } from "../theme";

function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
