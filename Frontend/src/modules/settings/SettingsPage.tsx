import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language, languages } from "@/i18n/config";
import { Moon, Sun, Globe, Check, Crown } from "lucide-react";
import { useClassContext } from "@/context/ClassContext";
import { Link } from "react-router-dom";
import { PlanBadge } from "@/components/subscription/FeatureGate";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { role } = useClassContext();

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("settings.general")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Subscription Section - Teachers Only */}
        {role === "TEACHER" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription plan and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-medium">Current Plan</Label>
                    <PlanBadge />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    View and manage your subscription
                  </p>
                </div>
                <Link to="/settings/subscription">
                  <Button variant="outline">Manage Subscription</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              {t("settings.appearance")}
            </CardTitle>
            <CardDescription>
              {t("settings.theme")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  {theme === "dark" ? t("settings.darkMode") : t("settings.lightMode")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {theme === "dark" 
                    ? "Dark mode is enabled" 
                    : "Light mode is enabled"}
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleTheme}
                className="gap-2"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4" />
                    {t("settings.lightMode")}
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    {t("settings.darkMode")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("settings.language")}
            </CardTitle>
            <CardDescription>
              Select your preferred language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Choose Language
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(languages).map(([code, info]) => {
                  const isActive = language === code;
                  return (
                    <Button
                      key={code}
                      variant={isActive ? "default" : "outline"}
                      className="justify-start gap-3 h-auto py-3"
                      onClick={() => setLanguage(code as Language)}
                    >
                      <span className="text-2xl">{info.flag}</span>
                      <span className="flex-1 text-left font-medium">
                        {info.name}
                      </span>
                      {isActive && <Check className="h-4 w-4" />}
                    </Button>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Your language preference will be saved and applied across all pages.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Profile</Label>
                <p className="text-sm text-muted-foreground">
                  View and edit your profile information
                </p>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Password</Label>
                <p className="text-sm text-muted-foreground">
                  Change your password
                </p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.notifications")}</CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  {t("settings.emailNotifications")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  {t("settings.pushNotifications")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications in your browser
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
