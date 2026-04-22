import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      usdMonthly: 9,
      period: '/month',
      description: 'Individual teachers getting started',
      features: [
        'Up to 30 students',
        '1 classroom',
        'Job system',
        'Classroom store',
        'Transaction history',
        'Email support',
      ],
      cta: 'Start free trial',
      highlighted: false,
    },
    {
      name: 'Professional',
      usdMonthly: 19,
      period: '/month',
      description: 'Full classroom economy for growing programs',
      features: [
        'Unlimited students',
        'Up to 5 classrooms',
        'Advanced jobs & approvals',
        'Custom store items',
        'Analytics overview',
        'Fine workflows',
        'Priority support',
        'Custom currency labels',
      ],
      cta: 'Start free trial',
      highlighted: true,
      badge: 'Most popular',
    },
    {
      name: 'School',
      usdMonthly: null as number | null,
      period: '',
      description: 'Districts and multi-teacher deployments',
      features: [
        'Unlimited classrooms',
        'Unlimited students',
        'Everything in Professional',
        'Admin reporting',
        'Bulk roster tools',
        'Training session',
        'Dedicated support',
        'Custom integrations',
      ],
      cta: 'Contact sales',
      highlighted: false,
    },
  ];

  return (
    <div className="bg-ce-canvas pt-16">
      <section className="border-b border-ce-border pb-14 pt-12 sm:pb-16 sm:pt-16">
        <div className="container max-w-3xl">
          <h1 className="font-display text-hero font-bold text-ce-ink">Straightforward pricing</h1>
          <p className="mt-5 text-lg leading-relaxed text-ce-ink-muted">
            Every plan includes a 14-day trial. No card required to explore—upgrade when you are ready to run with your
            full roster.
          </p>
          <p className="mt-3 text-sm text-ce-ink-muted">Listed amounts are in United States dollars (USD).</p>
        </div>
      </section>

      <section className="border-y border-ce-border bg-ce-warm-soft py-10 text-ce-ink">
        <div className="container flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-6 sm:text-left">
          <Sparkles className="h-8 w-8 shrink-0 text-ce-warm" strokeWidth={1.75} />
          <div>
            <h2 className="font-display text-xl font-bold text-ce-ink sm:text-2xl">Founding member offer</h2>
            <p className="mt-1 text-sm leading-relaxed text-ce-ink-muted sm:text-base">
              <strong className="text-ce-warm">50% off for life</strong> for the first 100 teachers on the waitlist—
              pricing locks when you join the cohort.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3 lg:items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl p-8 ring-1 ${
                  plan.highlighted
                    ? 'bg-ce-accent text-ce-on-accent ring-ce-accent lg:-translate-y-1 lg:shadow-[0_24px_80px_-32px_oklch(0.35_0.08_252/0.35)]'
                    : 'bg-ce-surface text-ce-ink ring-ce-border'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ce-warm px-4 py-1 text-xs font-bold uppercase tracking-wide text-ce-on-accent">
                    {plan.badge}
                  </span>
                )}
                <h3 className={`font-display text-2xl font-bold ${plan.highlighted ? '' : 'text-ce-ink'}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 flex flex-wrap items-baseline gap-x-1 gap-y-0">
                  {plan.usdMonthly != null ? (
                    <>
                      <span
                        className={`text-sm font-semibold uppercase tracking-wide ${plan.highlighted ? 'text-ce-on-accent/85' : 'text-ce-ink-muted'}`}
                      >
                        USD
                      </span>
                      <span className="font-display text-5xl font-bold tabular-nums">{plan.usdMonthly}</span>
                      <span className={`text-lg ${plan.highlighted ? 'text-ce-on-accent/80' : 'text-ce-ink-muted'}`}>
                        {plan.period}
                      </span>
                    </>
                  ) : (
                    <span className="font-display text-5xl font-bold tabular-nums">Custom</span>
                  )}
                </div>
                <p className={`mt-2 text-sm ${plan.highlighted ? 'text-ce-on-accent/85' : 'text-ce-ink-muted'}`}>
                  {plan.description}
                </p>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm">
                      <Check
                        className={`mt-0.5 h-5 w-5 shrink-0 ${plan.highlighted ? 'text-ce-on-accent' : 'text-ce-positive'}`}
                        strokeWidth={2.5}
                      />
                      <span className={plan.highlighted ? 'text-ce-on-accent/95' : 'text-ce-ink'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.name === 'School' ? '/contact' : '/waitlist'}
                  className={`mt-10 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-center text-sm font-semibold transition focus-visible:ce-focus ${
                    plan.highlighted
                      ? 'bg-ce-surface text-ce-accent hover:bg-ce-canvas'
                      : 'bg-ce-canvas text-ce-accent ring-1 ring-ce-accent hover:bg-ce-muted'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ce-border bg-ce-muted/40 py-16 sm:py-20">
        <div className="container max-w-3xl">
          <h2 className="font-display text-center text-display font-bold text-ce-ink">FAQ</h2>
          <div className="mt-10 space-y-4">
            {[
              {
                q: 'Is there really a free trial?',
                a: 'Yes. All plans include 14 days with full access. No credit card required to start.',
              },
              {
                q: 'What happens when the trial ends?',
                a: 'Choose a paid plan to continue. Your classes and history stay intact.',
              },
              {
                q: 'Can we switch plans later?',
                a: 'Upgrade or downgrade anytime. Proration is handled in the billing portal.',
              },
              {
                q: 'Do you invoice schools?',
                a: 'School and district plans include invoicing options and dedicated onboarding.',
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-2xl bg-ce-surface p-6 ring-1 ring-ce-border">
                <h3 className="font-display font-bold text-ce-ink">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ce-ink-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ce-ink py-16 text-ce-on-accent">
        <div className="container flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-2xl font-bold">Still comparing?</h2>
            <p className="mt-2 max-w-lg text-sm text-ce-footer-text">Tell us your roster size and we will recommend a lane.</p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-2xl bg-ce-accent px-6 py-3 font-semibold text-ce-on-accent hover:bg-ce-accent-hover focus-visible:ce-focus"
          >
            Contact
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
