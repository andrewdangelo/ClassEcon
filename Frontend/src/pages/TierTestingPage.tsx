import React from "react";
import { TierTestingPanel } from "@/components/subscription/TierTestingPanel";
import { FeatureGate, TierBadge, LimitWarning } from "@/components/subscription/TierComponents";
import { useSubscriptionTier, useFeatureAccess, useStudentLimit, useClassLimit } from "@/hooks/useSubscriptionTier";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, BarChart3, FileText, Palette, Download, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TierTestingPage() {
  const { tier, features, isTrialActive, daysRemainingInTrial, isFoundingMember } = useSubscriptionTier();
  
  // Test individual features
  const hasAnalytics = useFeatureAccess("analytics");
  const hasAdvancedReports = useFeatureAccess("advancedReports");
  const hasCustomBranding = useFeatureAccess("customBranding");
  const hasExportData = useFeatureAccess("exportData");
  const hasBalanceHistory = useFeatureAccess("balanceHistory");
  const hasActivityTracking = useFeatureAccess("activityTracking");
  
  // Test limits (mock data for testing)
  const [mockStudentCount, setMockStudentCount] = React.useState(5);
  const [mockClassCount, setMockClassCount] = React.useState(1);
  
  const studentLimit = useStudentLimit(mockStudentCount);
  const classLimit = useClassLimit(mockClassCount);

  const testFeatures = [
    { name: "Analytics Dashboard", feature: "analytics", hasAccess: hasAnalytics, icon: BarChart3 },
    { name: "Advanced Reports", feature: "advancedReports", hasAccess: hasAdvancedReports, icon: FileText },
    { name: "Custom Branding", feature: "customBranding", hasAccess: hasCustomBranding, icon: Palette },
    { name: "Export Data", feature: "exportData", hasAccess: hasExportData, icon: Download },
    { name: "Balance History", feature: "balanceHistory", hasAccess: hasBalanceHistory, icon: TrendingUp },
    { name: "Activity Tracking", feature: "activityTracking", hasAccess: hasActivityTracking, icon: Activity },
  ];

  return (
    <div className="page-stack mx-auto w-full max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="page-title">Subscription Tier Testing</h1>
        <p className="page-subtitle">
          Test different subscription tiers and their feature restrictions
        </p>
      </div>

      {/* Testing Panel */}
      <TierTestingPanel />

      {/* Feature Access Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Access Tests</CardTitle>
          <CardDescription>
            These features are gated based on your current tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testFeatures.map(({ name, feature, hasAccess, icon: Icon }) => (
              <div
                key={feature}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border",
                  hasAccess 
                    ? "bg-green-50 border-green-200" 
                    : "bg-red-50 border-red-200"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  hasAccess ? "text-green-600" : "text-red-600"
                )} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">{feature}</p>
                </div>
                {hasAccess ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Limit Tests */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Limit Test</CardTitle>
            <CardDescription>
              Test student count restrictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Students:</p>
                <p className="text-2xl font-bold">{mockStudentCount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Limit:</p>
                <p className="text-2xl font-bold">
                  {studentLimit.limit === null ? "∞" : studentLimit.limit}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMockStudentCount(Math.max(0, mockStudentCount - 5))}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                -5
              </button>
              <button
                onClick={() => setMockStudentCount(mockStudentCount + 5)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                +5
              </button>
              <button
                onClick={() => setMockStudentCount(0)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Reset
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Within Limit:</span>
                <Badge variant={studentLimit.withinLimit ? "default" : "destructive"}>
                  {studentLimit.withinLimit ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Remaining:</span>
                <Badge variant="outline">
                  {studentLimit.remaining === null ? "Unlimited" : studentLimit.remaining}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Exceeded:</span>
                <Badge variant={studentLimit.exceeded ? "destructive" : "default"}>
                  {studentLimit.exceeded ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            {studentLimit.limit !== null && (
              <LimitWarning 
                current={mockStudentCount} 
                limit={studentLimit.limit} 
                itemName="students" 
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Limit Test</CardTitle>
            <CardDescription>
              Test class count restrictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Classes:</p>
                <p className="text-2xl font-bold">{mockClassCount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Limit:</p>
                <p className="text-2xl font-bold">
                  {classLimit.limit === null ? "∞" : classLimit.limit}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMockClassCount(Math.max(0, mockClassCount - 1))}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                -1
              </button>
              <button
                onClick={() => setMockClassCount(mockClassCount + 1)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                +1
              </button>
              <button
                onClick={() => setMockClassCount(0)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Reset
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Within Limit:</span>
                <Badge variant={classLimit.withinLimit ? "default" : "destructive"}>
                  {classLimit.withinLimit ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Remaining:</span>
                <Badge variant="outline">
                  {classLimit.remaining === null ? "Unlimited" : classLimit.remaining}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Exceeded:</span>
                <Badge variant={classLimit.exceeded ? "destructive" : "default"}>
                  {classLimit.exceeded ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            {classLimit.limit !== null && (
              <LimitWarning 
                current={mockClassCount} 
                limit={classLimit.limit} 
                itemName="classes" 
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Gate Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Gate Examples</CardTitle>
          <CardDescription>
            These sections are wrapped in FeatureGate components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FeatureGate feature="analytics">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-green-700">
                This content is only visible to users with the "analytics" feature.
                Currently available in: Professional, School, and Trial tiers.
              </p>
            </div>
          </FeatureGate>

          <FeatureGate feature="customBranding">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Custom Branding</h3>
              <p className="text-sm text-blue-700">
                This content is only visible to users with the "customBranding" feature.
                Currently available in: Professional, School, and Trial tiers.
              </p>
            </div>
          </FeatureGate>

          <FeatureGate feature="exportData">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Export Data</h3>
              <p className="text-sm text-purple-700">
                This content is only visible to users with the "exportData" feature.
                Currently available in: Professional, School, and Trial tiers.
              </p>
            </div>
          </FeatureGate>
        </CardContent>
      </Card>

      {/* Current Tier Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Tier Summary
            <TierBadge />
          </CardTitle>
          <CardDescription>
            Complete overview of your current subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Tier Information</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tier:</span>
                  <span className="font-medium">{features.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">
                    ${isFoundingMember ? features.foundingMemberPrice : features.price}/mo
                    {isFoundingMember && <Badge className="ml-2 text-xs">Founding Member</Badge>}
                  </span>
                </div>
                {isTrialActive && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trial Days Left:</span>
                    <span className="font-medium text-purple-600">{daysRemainingInTrial}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Limits</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Students:</span>
                  <span className="font-medium">
                    {features.maxStudents === null ? "Unlimited" : features.maxStudents}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Classes:</span>
                  <span className="font-medium">
                    {features.maxClasses === null ? "Unlimited" : features.maxClasses}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Features:</span>
                  <span className="font-medium">
                    {features.features.includes("*") ? "All Features" : features.features.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
