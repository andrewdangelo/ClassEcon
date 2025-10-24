import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppSelector, useAppDispatch } from "@/redux/store/store";
import { selectUser, setCredentials } from "@/redux/authSlice";
import { useSubscriptionTier } from "@/hooks/useSubscriptionTier";
import { TIER_FEATURES, type SubscriptionTier, type SubscriptionStatus } from "@/lib/tierConstants";
import { Sparkles, Shield, Zap, Building2, Gift, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

/**
 * Development Testing Component for Subscription Tiers
 * 
 * This component allows you to test different subscription tiers
 * by temporarily updating the user object in Redux.
 * 
 * ⚠️ FOR TESTING ONLY - Does not persist to backend
 */
export function TierTestingPanel() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const { push } = useToast();
  const { tier, displayName, features, isTrialActive, daysRemainingInTrial } = useSubscriptionTier();

  if (!user) {
    return null;
  }

  const setTier = (
    newTier: SubscriptionTier,
    status: SubscriptionStatus = "ACTIVE",
    options?: {
      isFoundingMember?: boolean;
      daysInTrial?: number;
    }
  ) => {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + (options?.daysInTrial || 14) * 24 * 60 * 60 * 1000);
    const subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const updatedUser = {
      ...user,
      subscriptionTier: newTier,
      subscriptionStatus: status,
      isFoundingMember: options?.isFoundingMember || false,
      trialStartedAt: newTier === "TRIAL" ? now.toISOString() : undefined,
      trialEndsAt: newTier === "TRIAL" ? trialEnd.toISOString() : undefined,
      subscriptionExpiresAt: ["STARTER", "PROFESSIONAL"].includes(newTier) 
        ? subscriptionEnd.toISOString() 
        : undefined,
    };

    // Update Redux state (does NOT persist to backend)
    dispatch(setCredentials({
      accessToken: localStorage.getItem("accessToken") || "",
      user: updatedUser,
    }));

    push({
      title: "Tier Updated (Testing Only)",
      description: `Now testing as ${TIER_FEATURES[newTier].displayName} tier${options?.isFoundingMember ? " (Founding Member)" : ""}`,
    });
  };

  const resetToFree = () => {
    const updatedUser = {
      ...user,
      subscriptionTier: "FREE" as SubscriptionTier,
      subscriptionStatus: "ACTIVE" as SubscriptionStatus,
      isFoundingMember: false,
      trialStartedAt: undefined,
      trialEndsAt: undefined,
      subscriptionExpiresAt: undefined,
    };

    dispatch(setCredentials({
      accessToken: localStorage.getItem("accessToken") || "",
      user: updatedUser,
    }));

    push({
      title: "Reset to FREE",
      description: "User tier reset to FREE for testing",
    });
  };

  const tierButtons: Array<{
    tier: SubscriptionTier;
    icon: any;
    color: string;
    action?: () => void;
  }> = [
    {
      tier: "FREE",
      icon: Shield,
      color: "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200",
      action: resetToFree,
    },
    {
      tier: "TRIAL",
      icon: Sparkles,
      color: "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200",
      action: () => setTier("TRIAL", "TRIAL", { daysInTrial: 14 }),
    },
    {
      tier: "STARTER",
      icon: Zap,
      color: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
      action: () => setTier("STARTER", "ACTIVE"),
    },
    {
      tier: "PROFESSIONAL",
      icon: Gift,
      color: "bg-green-100 text-green-800 border-green-300 hover:bg-green-200",
      action: () => setTier("PROFESSIONAL", "ACTIVE"),
    },
    {
      tier: "SCHOOL",
      icon: Building2,
      color: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200",
      action: () => setTier("SCHOOL", "ACTIVE"),
    },
  ];

  return (
    <Card className="border-2 border-orange-300 bg-orange-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-900">Tier Testing Panel</CardTitle>
          </div>
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            TESTING ONLY
          </Badge>
        </div>
        <CardDescription className="text-orange-800">
          Switch between tiers to test feature gates. Changes are NOT saved to the backend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Tier Info */}
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Current Tier:</span>
            <Badge className={cn(
              tier === "FREE" && "bg-gray-100 text-gray-800 border-gray-300",
              tier === "TRIAL" && "bg-purple-100 text-purple-800 border-purple-300",
              tier === "STARTER" && "bg-blue-100 text-blue-800 border-blue-300",
              tier === "PROFESSIONAL" && "bg-green-100 text-green-800 border-green-300",
              tier === "SCHOOL" && "bg-amber-100 text-amber-800 border-amber-300"
            )}>
              {displayName}
            </Badge>
          </div>
          
          {isTrialActive && daysRemainingInTrial && (
            <div className="flex items-center gap-2 text-sm text-purple-700 mb-2">
              <Calendar className="h-4 w-4" />
              <span>{daysRemainingInTrial} days remaining in trial</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">Max Students:</span>{" "}
              {features.maxStudents === null ? "Unlimited" : features.maxStudents}
            </div>
            <div>
              <span className="font-medium">Max Classes:</span>{" "}
              {features.maxClasses === null ? "Unlimited" : features.maxClasses}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Features:</span>{" "}
              {features.features.includes("*") ? "All Features" : `${features.features.length} features`}
            </div>
          </div>
        </div>

        {/* Tier Switch Buttons */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Switch to:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {tierButtons.map(({ tier: btnTier, icon: Icon, color, action }) => {
              const tierInfo = TIER_FEATURES[btnTier];
              const isActive = tier === btnTier;
              
              return (
                <Button
                  key={btnTier}
                  variant="outline"
                  size="sm"
                  onClick={action}
                  disabled={isActive}
                  className={cn(
                    color,
                    "flex flex-col items-start h-auto py-3 px-3",
                    isActive && "ring-2 ring-offset-2 ring-current"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="font-semibold text-sm">{tierInfo.displayName}</span>
                  </div>
                  <div className="text-xs opacity-80">
                    {tierInfo.price > 0 ? `$${tierInfo.price}/mo` : "Free"}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Special Options */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Special Scenarios:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTier("PROFESSIONAL", "ACTIVE", { isFoundingMember: true })}
              className="text-xs"
            >
              Pro (Founding Member)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTier("TRIAL", "TRIAL", { daysInTrial: 1 })}
              className="text-xs"
            >
              Trial (1 day left)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTier("STARTER", "EXPIRED")}
              className="text-xs"
            >
              Starter (Expired)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTier("PROFESSIONAL", "CANCELED")}
              className="text-xs"
            >
              Pro (Canceled)
            </Button>
          </div>
        </div>

        {/* Feature List */}
        <div className="bg-white rounded-lg p-3 border border-orange-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Available Features:</p>
          <div className="flex flex-wrap gap-1">
            {features.features.includes("*") ? (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                All Features Unlocked
              </Badge>
            ) : (
              features.features.map((feature) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="bg-orange-100 border border-orange-300 rounded-lg p-3">
          <p className="text-xs text-orange-900">
            <strong>⚠️ Important:</strong> These changes only affect your browser session. 
            They will reset when you refresh the page or log out. To persist tier changes, 
            you need to update the database directly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
