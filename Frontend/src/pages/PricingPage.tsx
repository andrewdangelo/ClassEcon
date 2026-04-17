// src/pages/PricingPage.tsx
import { Navigate } from "react-router-dom";
import { PricingSection } from "@/components/subscription";
import { useAuth } from "@/hooks/useAuth";

export function PricingPage() {
  const { user } = useAuth();

  if (
    user?.subscriptionTier &&
    user.subscriptionTier !== "FREE" &&
    user.subscriptionTier !== "TRIAL"
  ) {
    return <Navigate to="/subscription/settings" replace />;
  }

  return (
    <div className="page-stack pb-16">
      <div className="marketing-hero text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Choose the plan that fits your classroom. Start with a free trial—upgrade anytime.
        </p>
      </div>

      <PricingSection showFoundingMemberBanner={true} />

      <div className="mx-auto w-full max-w-3xl">
        <h2 className="mb-8 text-center font-display text-2xl font-bold tracking-tight md:text-3xl">
          Frequently asked questions
        </h2>

        <div className="flex flex-col gap-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Can I try before I buy?</h3>
            <p className="mt-1 text-muted-foreground">
              Absolutely! All paid plans come with a 14-day free trial. No credit card required.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground">What happens when my trial ends?</h3>
            <p className="mt-1 text-muted-foreground">
              You will be prompted to choose a plan. If you do not upgrade, you will be moved to the free tier with
              limited features. Your data stays safe.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground">Can I change plans later?</h3>
            <p className="mt-1 text-muted-foreground">
              Yes. You can upgrade or downgrade at any time. Changes take effect immediately, and we will prorate your
              billing.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground">What payment methods do you accept?</h3>
            <p className="mt-1 text-muted-foreground">
              We accept major credit cards including Visa, Mastercard, and American Express.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground">What is the Founding Member discount?</h3>
            <p className="mt-1 text-muted-foreground">
              The first 100 teachers on Professional get 50% off for life. Our thank-you to early adopters.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground">Do you offer discounts for schools?</h3>
            <p className="mt-1 text-muted-foreground">
              Yes. Contact us for school and district pricing, volume discounts, and procurement-friendly options.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-muted-foreground">
          Have questions?{" "}
          <a href="/contact" className="font-medium text-primary hover:underline">
            Contact us
          </a>{" "}
          or email{" "}
          <a href="mailto:support@classecon.com" className="font-medium text-primary hover:underline">
            support@classecon.com
          </a>
        </p>
      </div>
    </div>
  );
}
