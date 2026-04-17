// src/pages/SubscriptionSuccessPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { CheckCircle, Loader2, ArrowRight, Sparkles, Zap, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import confetti from 'canvas-confetti';

const GET_MY_SUBSCRIPTION = gql`
  query GetMySubscription {
    mySubscription {
      planTier
      status
      trialEndsAt
      isFoundingMember
      currentPeriodEnd
    }
    me {
      id
      name
      createdAt
    }
    myClasses {
      id
    }
  }
`;

interface GetMySubscriptionData {
  mySubscription?: {
    planTier: 'FREE' | 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'SCHOOL';
    status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELED' | 'PAST_DUE';
    trialEndsAt?: string | null;
    isFoundingMember: boolean;
    currentPeriodEnd?: string | null;
  } | null;
  me?: {
    id: string;
    name?: string | null;
    createdAt: string;
  } | null;
  myClasses?: Array<{ id: string }> | null;
}

export function SubscriptionSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(false);

  const { data, loading, refetch } = useQuery<GetMySubscriptionData>(GET_MY_SUBSCRIPTION, {
    fetchPolicy: 'network-only',
  });

  // Trigger confetti on successful load
  useEffect(() => {
    if (data?.mySubscription && !showConfetti) {
      setShowConfetti(true);
      // Launch confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [data, showConfetti]);

  // Refetch subscription data after a short delay to ensure it's updated
  useEffect(() => {
    const timer = setTimeout(() => {
      refetch();
    }, 2000);
    return () => clearTimeout(timer);
  }, [refetch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Setting up your subscription...</p>
        </div>
      </div>
    );
  }

  const subscription = data?.mySubscription;
  const me = data?.me;
  const hasClasses = (data?.myClasses?.length || 0) > 0;
  
  // Determine if this is a new user (created within last 5 minutes) or an upgrade
  const accountAge = me?.createdAt ? Date.now() - new Date(me.createdAt).getTime() : Infinity;
  const isNewUser = accountAge < 5 * 60 * 1000 && !hasClasses; // Less than 5 minutes old and no classes
  
  const tierName =
    subscription?.planTier === 'STARTER'
      ? 'Starter'
      : subscription?.planTier === 'PROFESSIONAL'
      ? 'Professional'
      : subscription?.planTier === 'SCHOOL'
      ? 'School'
      : subscription?.planTier;

  // New features by tier for upgrades
  const tierFeatures = {
    PROFESSIONAL: [
      { icon: Users, title: 'Unlimited Students', desc: 'Add as many students as you need across up to 5 classrooms' },
      { icon: TrendingUp, title: 'Advanced Analytics', desc: 'Track student progress and engagement with detailed insights' },
      { icon: Zap, title: 'Custom Currency', desc: 'Brand your economy with custom currency names' },
    ],
    STARTER: [
      { icon: Users, title: 'Up to 30 Students', desc: 'Build your classroom economy with room to grow' },
      { icon: Zap, title: 'Full Job System', desc: 'Create jobs and manage student payroll' },
    ],
  };

  const features = tierFeatures[subscription?.planTier as keyof typeof tierFeatures] || [];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl md:text-3xl">
            {isNewUser ? `Welcome to ClassEcon !` : `Welcome to ${tierName}!`}
          </CardTitle>
          <CardDescription>
            {isNewUser 
              ? "Your subscription is now active. Let's get you started!" 
              : `You've successfully upgraded to ${tierName}. Here's what's new:`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Founding Member Badge */}
          {subscription?.isFoundingMember && (
            <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-400 font-semibold">
                <Sparkles className="h-5 w-5" />
                You're a Founding Member!
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                Enjoy 50% off your subscription for life. Thank you for being an early supporter!
              </p>
            </div>
          )}

          {isNewUser ? (
            /* New User Onboarding */
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What's Next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Create your first class</p>
                    <p className="text-sm text-muted-foreground">
                      Set up a classroom economy with custom currency, jobs, and stores.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Invite your students</p>
                    <p className="text-sm text-muted-foreground">
                      Share your class code so students can join and start earning.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Explore premium features</p>
                    <p className="text-sm text-muted-foreground">
                      Try analytics, custom currency names, and advanced job management.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          ) : (
            /* Upgrade - Show New Features */
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">New Features Unlocked</h3>
              <div className="grid gap-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{feature.title}</p>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Button asChild size="lg">
              <Link to="/">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {isNewUser && (
              <Button variant="outline" asChild>
                <Link to="/getting-started">View Getting Started Guide</Link>
              </Button>
            )}
          </div>

          {/* Help link */}
          <p className="text-center text-sm text-muted-foreground">
            Need help?{' '}
            <Link to="/getting-started" className="text-primary hover:underline">
              Check out our guide
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
