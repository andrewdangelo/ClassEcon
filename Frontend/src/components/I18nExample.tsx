/**
 * Example component demonstrating i18n usage
 * This file shows various ways to use translations in ClassEcon
 */

import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function I18nExample() {
  const { t, language, setLanguage, availableLanguages } = useLanguage();

  return (
    <div className="container py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("common.welcome")}</CardTitle>
          <CardDescription>
            {t("settings.language")}: {availableLanguages[language as keyof typeof availableLanguages]?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic translation */}
          <div>
            <h3 className="font-semibold mb-2">Basic Translation</h3>
            <p>{t("dashboard.overview")}</p>
          </div>

          {/* Translation with interpolation */}
          <div>
            <h3 className="font-semibold mb-2">With Dynamic Values</h3>
            <p>{t("common.welcome")} John!</p>
          </div>

          {/* Common UI elements */}
          <div className="flex gap-2">
            <Button>{t("common.save")}</Button>
            <Button variant="outline">{t("common.cancel")}</Button>
            <Button variant="destructive">{t("common.delete")}</Button>
          </div>

          {/* Navigation items */}
          <div>
            <h3 className="font-semibold mb-2">Navigation</h3>
            <ul className="space-y-1">
              <li>{t("navigation.dashboard")}</li>
              <li>{t("navigation.classes")}</li>
              <li>{t("navigation.students")}</li>
              <li>{t("navigation.store")}</li>
            </ul>
          </div>

          {/* Language switcher buttons */}
          <div>
            <h3 className="font-semibold mb-2">Switch Language</h3>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(availableLanguages).map(([code, info]) => (
                <Button
                  key={code}
                  variant={language === code ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage(code as any)}
                >
                  {info.flag} {info.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
