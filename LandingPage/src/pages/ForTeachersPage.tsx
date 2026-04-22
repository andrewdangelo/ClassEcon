import { Link } from 'react-router-dom';
import {
  Users,
  BarChart3,
  Settings,
  Clock,
  Shield,
  Zap,
  Check,
  Star,
  ArrowRight,
  Briefcase,
  ShoppingBag,
  DollarSign,
} from 'lucide-react';

const features = [
  {
    icon: Briefcase,
    title: 'Job management',
    description: 'Roles, applications, salaries, and employment—without a spreadsheet war.',
  },
  {
    icon: ShoppingBag,
    title: 'Store & redemptions',
    description: 'Inventory, purchases, and fulfillment that students can follow.',
  },
  {
    icon: DollarSign,
    title: 'Pay & fines',
    description: 'Requests, approvals, and adjustments with a clear audit trail.',
  },
  {
    icon: BarChart3,
    title: 'Signals, not noise',
    description: 'Engagement and economy health at a glance—jump in when it matters.',
  },
  {
    icon: Users,
    title: 'Per-student context',
    description: 'Balances, jobs, and history so conversations stay grounded.',
  },
  {
    icon: Settings,
    title: 'Your rules',
    description: 'Currency names, routines, and policies that match your classroom.',
  },
];

const benefits = [
  { icon: Clock, title: 'Hours back each week', description: 'Automations for pay cycles and repeat approvals.' },
  { icon: Zap, title: 'Realtime for students', description: 'Fewer “did it go through?” interruptions.' },
  { icon: Shield, title: 'Designed for schools', description: 'Secure flows for the parts that touch money.' },
];

const reasons = [
  'Built for real class periods—not demo-day UX',
  'No engineering background required',
  'Works on the devices you already have',
  'Backups and access controls you can explain to admin',
  'Support from people who have run classrooms',
  'Shipping improvements on a steady cadence',
  'Aligns with financial literacy goals',
  'Onboarding that respects your calendar',
];

export default function ForTeachersPage() {
  return (
    <div className="bg-ce-canvas pt-16">
      <section className="border-b border-ce-border pb-16 pt-12 sm:pb-20 sm:pt-16">
        <div className="container">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-ce-surface px-3 py-1 text-sm font-medium text-ce-positive ring-1 ring-ce-border">
              <Users className="h-4 w-4" strokeWidth={2} />
              For teachers
            </p>
            <h1 className="font-display text-hero font-bold text-ce-ink">
              Run the economy,
              <span className="text-ce-positive"> keep the teaching.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ce-ink-muted">
              ClassEcon handles the operational load—jobs, store, pay, fines—so incentives stay consistent and you stay
              present for instruction.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/waitlist"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ce-accent px-7 py-3.5 text-base font-semibold text-ce-on-accent hover:bg-ce-accent-hover focus-visible:ce-focus"
              >
                Start with early access
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center rounded-2xl bg-ce-surface px-7 py-3.5 text-base font-semibold text-ce-ink ring-1 ring-ce-border hover:bg-ce-muted focus-visible:ce-focus"
              >
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container">
          <h2 className="font-display text-display font-bold text-ce-ink">Everything in one calm surface</h2>
          <p className="mt-4 max-w-2xl text-lg text-ce-ink-muted">
            Dense where you need power, quiet everywhere else—so you can scan between bell rings.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-3xl bg-ce-surface p-6 ring-1 ring-ce-border">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ce-muted text-ce-accent">
                  <f.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-lg font-bold text-ce-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ce-ink-muted">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ce-border bg-ce-muted/40 py-20 sm:py-24">
        <div className="container grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="font-display text-display font-bold text-ce-ink">Why teachers switch</h2>
            <div className="mt-8 space-y-5">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ce-accent text-ce-on-accent">
                    <b.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ce-ink">{b.title}</h3>
                    <p className="mt-1 text-sm text-ce-ink-muted">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-ce-surface p-8 ring-1 ring-ce-border">
            <h3 className="font-display text-xl font-bold text-ce-ink">What teachers say</h3>
            <div className="mt-8 space-y-8">
              <figure>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-ce-warm text-ce-warm" />
                  ))}
                </div>
                <blockquote className="mt-3 text-ce-ink leading-relaxed">
                  “Students stopped asking if I remembered their pay. The system shows it—and I get time back.”
                </blockquote>
                <figcaption className="mt-3 text-sm text-ce-ink-muted">Mrs. Johnson · 4th grade</figcaption>
              </figure>
              <figure>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-ce-warm text-ce-warm" />
                  ))}
                </div>
                <blockquote className="mt-3 text-ce-ink leading-relaxed">
                  “The analytics help me spot who is disengaged before grades slip. It feels proactive, not punitive.”
                </blockquote>
                <figcaption className="mt-3 text-sm text-ce-ink-muted">Mr. Davis · 5th grade</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container">
          <h2 className="font-display text-display font-bold text-ce-ink">Checklist you can share with admin</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {reasons.map((r) => (
              <div key={r} className="flex gap-3 rounded-2xl bg-ce-surface p-4 ring-1 ring-ce-border">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-ce-positive" strokeWidth={2.5} />
                <span className="text-sm leading-relaxed text-ce-ink">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ce-ink py-16 text-ce-on-accent sm:py-20">
        <div className="container text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Pilot it with your next unit</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ce-footer-text">
            We will help you translate your current reward language into a living economy.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/waitlist"
              className="inline-flex items-center gap-2 rounded-2xl bg-ce-accent px-7 py-3.5 font-semibold text-ce-on-accent hover:bg-ce-accent-hover focus-visible:ce-focus"
            >
              Join waitlist
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-semibold text-ce-on-accent ring-1 ring-ce-footer-muted hover:bg-white/5 focus-visible:ce-focus"
            >
              Book a conversation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
