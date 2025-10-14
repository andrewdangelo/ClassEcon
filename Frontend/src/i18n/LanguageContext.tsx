import React, { createContext, useContext, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Language, languages } from "./config";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
  availableLanguages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { i18n, t } = useTranslation();

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  const value: LanguageContextType = {
    language: i18n.language as Language,
    setLanguage,
    t,
    availableLanguages: languages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
