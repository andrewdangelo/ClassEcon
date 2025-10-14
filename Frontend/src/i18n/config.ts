import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import it from "./locales/it.json";

// Define available languages
export const languages = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  pt: { name: "Português", flag: "🇧🇷" },
  it: { name: "Italiano", flag: "🇮🇹" },
} as const;

export type Language = keyof typeof languages;

const resources = {
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  it: { translation: it },
};

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: "en",
    debug: false, // Set to true for development debugging

    interpolation: {
      escapeValue: false, // React already escapes by default
    },

    detection: {
      // Order of language detection
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;
