import React, { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language, languages } from "@/i18n/config";
import { Moon, Sun, Globe, Check, Crown, Download, Shield, Trash2 } from "lucide-react";
import { useClassContext } from "@/context/ClassContext";
import { Link } from "react-router-dom";
import { PlanBadge } from "@/components/subscription/FeatureGate";
import { useAppDispatch } from "@/redux/store/store";
import { clearAuth } from "@/redux/authSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const MY_PERSONAL_DATA_EXPORT = gql`
  query MyPersonalDataExport {
    myPersonalDataExport
  }
`;

const DELETE_MY_ACCOUNT = gql`
  mutation DeleteMyAccount($confirmationPhrase: String!) {
    deleteMyAccount(confirmationPhrase: $confirmationPhrase) {
      success
      message
    }
  }
`;

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { role } = useClassContext();
  const { refetch: refetchDataExport, loading: exportQueryLoading } = useQuery(
    MY_PERSONAL_DATA_EXPORT,
    { skip: true, fetchPolicy: "network-only" }
  );
  const dispatch = useAppDispatch();
  const { push: toast } = useToast();
  const exporting = exportQueryLoading;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deleteMyAccount, { loading: deleteLoading }] = useMutation(DELETE_MY_ACCOUNT);

  const downloadMyData = async () => {
    try {
      const { data } = await refetchDataExport();
      const raw = (data as { myPersonalDataExport?: unknown } | undefined)
        ?.myPersonalDataExport;
      const str = JSON.stringify(raw ?? null, null, 2);
      const blob = new Blob([str], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `classecon-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export ready", description: "Your data download has started." });
    } catch (e) {
      console.error(e);
      toast({ title: "Export failed", description: "Could not download your data. Try again or contact support." });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data } = await deleteMyAccount({
        variables: { confirmationPhrase: deletePhrase.trim() },
      });
      const res = (data as { deleteMyAccount?: { success?: boolean; message?: string } })
        ?.deleteMyAccount;
      if (res?.success) {
        dispatch(clearAuth());
        setDeleteOpen(false);
        setDeletePhrase("");
        window.location.assign("/auth");
        return;
      } else {
        toast({ title: "Could not delete account", description: res?.message || "Check the confirmation text." });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Could not delete account", description: "Try again or contact support@classecon.com." });
    }
  };

  return (
    <div className="page-stack mx-auto w-full max-w-4xl">
      <div>
        <h1 className="page-title">{t("settings.title")}</h1>
        <p className="page-subtitle">
          {t("settings.general")}
        </p>
      </div>

      <div className="flex flex-col gap-6 md:gap-8">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & data
            </CardTitle>
            <CardDescription>
              FERPA, GDPR, and your controls over personal data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Read our{" "}
              <Link to="/privacy" className="text-primary underline underline-offset-4" target="_blank" rel="noreferrer">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/terms" className="text-primary underline underline-offset-4" target="_blank" rel="noreferrer">
                Terms of Service
              </Link>
              .
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Download your data</Label>
                <p className="text-sm text-muted-foreground">
                  Machine-readable export of information tied to your account
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={downloadMyData}
                disabled={exporting}
              >
                <Download className="h-4 w-4" />
                {exporting ? "Preparing…" : "Download JSON"}
              </Button>
            </div>
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Delete your account</Label>
                <p className="text-sm text-muted-foreground">
                  Teachers and parents must first leave or close classes they own or teach. This cannot be undone.
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                className="gap-2"
                onClick={() => {
                  setDeletePhrase("");
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete your account</DialogTitle>
              <DialogDescription>
                Type <span className="font-mono text-foreground">DELETE MY ACCOUNT</span> to confirm.
                Your session will end and we will remove account data in line with our privacy policy and your role.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={deletePhrase}
              onChange={(e) => setDeletePhrase(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              autoComplete="off"
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteLoading}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? "Deleting…" : "Delete permanently"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
