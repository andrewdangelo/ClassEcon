import { Link } from 'react-router-dom';
import { CLASS_CURRENCY, formatClassCredits } from '@/lib/classCurrency';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Award,
  Target,
  Bell,
  Briefcase,
  ArrowRight,
  Check,
  Star,
} from 'lucide-react';

const features = [
  {
    icon: Briefcase,
    title: 'Apply for jobs',
    description: 'Browse roles, send applications, and get hired in your class economy.',
  },
  {
    icon: DollarSign,
    title: 'Watch your balance',
    description: 'Real-time balance and history so earnings and spending never feel mysterious.',
  },
  {
    icon: ShoppingBag,
    title: 'Shop with a plan',
    description: 'Store items, privileges, and goals—practice deciding what matters most.',
  },
  {
    icon: TrendingUp,
    title: 'See your activity',
    description: 'A clear ledger of pay, purchases, and bonuses—like a banking app for class.',
  },
  {
    icon: Target,
    title: 'Save toward goals',
    description: 'Name a target, track progress, and learn how patience turns into payoff.',
  },
  {
    icon: Bell,
    title: 'Stay in the loop',
    description: 'Notifications when pay hits, applications move, or something needs you.',
  },
];

const skills = [
  'Earn and manage classroom currency',
  'Make spending tradeoffs you can explain',
  'Save for goals you choose',
  'Read income, expenses, and balance together',
  'Own outcomes—good days and tough ones',
  'Plan ahead with simple budgeting habits',
  'Connect effort to recognition',
  'Understand consequences and rewards',
];

export default function ForStudentsPage() {
  return (
    <div className="bg-ce-canvas pt-16">
      <section className="border-b border-ce-border pb-16 pt-12 sm:pb-20 sm:pt-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-ce-surface px-3 py-1 text-sm font-medium text-ce-secondary ring-1 ring-ce-border">
                <Award className="h-4 w-4" strokeWidth={2} />
                For students
              </p>
              <h1 className="font-display text-hero font-bold text-ce-ink">
                Your class economy,
                <span className="text-ce-secondary"> spelled out.</span>
              </h1>
              <p className="mt-6 max-w-measure text-lg leading-relaxed text-ce-ink-muted">
                Earn, save, and spend in a system that stays fair—so you build habits that still make sense after the
                bell rings.
              </p>
              <Link
                to="/waitlist"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-ce-secondary px-7 py-3.5 text-base font-semibold text-ce-on-accent transition hover:brightness-95 focus-visible:ce-focus"
              >
                Get on the waitlist
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="rounded-3xl bg-ce-surface p-8 ring-1 ring-ce-border">
              <p className="text-xs font-semibold uppercase tracking-wider text-ce-ink-muted">This week</p>
              <p className="mt-2 font-display text-4xl font-bold tabular-nums text-ce-ink">
                {formatClassCredits('42.10')}
              </p>
              <p className="mt-1 text-sm text-ce-ink-muted">
                Classroom credits ({CLASS_CURRENCY}), not US dollars · after savings goal
              </p>
              <div className="mt-8 space-y-3 text-sm">
                <div className="flex justify-between rounded-xl bg-ce-canvas px-4 py-3">
                  <span className="text-ce-ink-muted">Line leader pay</span>
                  <span className="font-medium tabular-nums text-ce-positive">+{CLASS_CURRENCY} 6.00</span>
                </div>
                <div className="flex justify-between rounded-xl bg-ce-canvas px-4 py-3">
                  <span className="text-ce-ink-muted">Homework bonus</span>
                  <span className="font-medium tabular-nums text-ce-positive">+{CLASS_CURRENCY} 2.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container">
          <h2 className="font-display text-display font-bold text-ce-ink">What you can do</h2>
          <p className="mt-4 max-w-2xl text-lg text-ce-ink-muted">
            Tools that feel like a real wallet—without the stress of real overdrafts.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-3xl bg-ce-surface p-6 ring-1 ring-ce-border">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ce-muted text-ce-secondary">
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
        <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-display font-bold text-ce-ink">Three moves to get rolling</h2>
            <ol className="mt-10 space-y-8">
              {[
                { n: '1', t: 'Pick a job you want', d: 'Apply, show you are reliable, and earn steady pay.' },
                { n: '2', t: 'Stack small wins', d: 'Submit pay requests, celebrate deposits, repeat.' },
                { n: '3', t: 'Spend on purpose', d: 'Store runs teach tradeoffs—fun now vs goal later.' },
              ].map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ce-secondary font-display text-lg font-bold text-ce-on-accent">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-ce-ink">{s.t}</h3>
                    <p className="mt-1 text-ce-ink-muted">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl bg-ce-surface p-8 ring-1 ring-ce-border">
            <h3 className="font-display text-xl font-bold text-ce-ink">Skills that transfer</h3>
            <ul className="mt-6 space-y-3">
              {skills.map((s) => (
                <li key={s} className="flex gap-2 text-sm text-ce-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ce-positive" strokeWidth={2.5} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container max-w-3xl">
          <div className="rounded-3xl bg-ce-surface p-8 ring-1 ring-ce-border sm:p-10">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-ce-warm text-ce-warm" />
              ))}
            </div>
            <blockquote className="mt-6 font-display text-xl font-medium leading-snug text-ce-ink sm:text-2xl">
              “I finally get what ‘budget’ means. My balance is right there, and I like picking jobs I’m good at.”
            </blockquote>
            <p className="mt-6 text-sm text-ce-ink-muted">Sarah M. · 5th grade · pilot classroom</p>
          </div>
        </div>
      </section>

      <section className="bg-ce-ink py-16 text-ce-on-accent sm:py-20">
        <div className="container flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Bring ClassEcon to your school</h2>
            <p className="mt-2 max-w-xl text-sm text-ce-footer-text">Teachers start the economy—you bring the curiosity.</p>
          </div>
          <Link
            to="/waitlist"
            className="inline-flex items-center gap-2 rounded-2xl bg-ce-accent px-7 py-3.5 text-base font-semibold text-ce-on-accent hover:bg-ce-accent-hover focus-visible:ce-focus"
          >
            Join waitlist
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
