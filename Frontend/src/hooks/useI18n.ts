import { useTranslation } from "react-i18next";

/**
 * Custom hook that wraps react-i18next's useTranslation
 * Provides a simpler API for accessing translations
 */
export const useI18n = () => {
  const { t, i18n } = useTranslation();

  return {
    t, // Translation function
    language: i18n.language, // Current language
    changeLanguage: i18n.changeLanguage, // Function to change language
    languages: i18n.languages, // Available languages
  };
};
