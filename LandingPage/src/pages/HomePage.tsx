import { Link } from 'react-router-dom';
import { CLASS_CURRENCY, formatClassCredits } from '@/lib/classCurrency';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  ClipboardCheck,
  ShoppingBag,
  Briefcase,
  BarChart3,
  Check,
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  Clock,
  Building2,
  BookOpen,
  CreditCard,
  Wallet,
  PiggyBank,
} from 'lucide-react';

const pillars = [
  {
    icon: Briefcase,
    title: 'Reward system that sticks',
    description:
      'Structured incentives, consequences, and routines students can predict—so behavior conversations get easier, not louder.',
    span: 'md:col-span-2',
    tone: 'bg-ce-surface ring-1 ring-ce-border',
  },
  {
    icon: ShoppingBag,
    title: 'Spend with intention',
    description: 'Jobs, store, and approvals connect choices to outcomes—practice for real budgets.',
    span: '',
    tone: 'bg-ce-muted/60 ring-1 ring-ce-border',
  },
  {
    icon: BarChart3,
    title: 'Live class visibility',
    description: 'Balances, activity, and trends stay legible for teachers and motivating for students.',
    span: '',
    tone: 'bg-ce-muted/60 ring-1 ring-ce-border',
  },
  {
    icon: ClipboardCheck,
    title: 'Less admin, more teaching',
    description: 'Automate recurring pay and approvals so the economy runs even on busy days.',
    span: 'md:col-span-2',
    tone: 'bg-ce-surface ring-1 ring-ce-border',
  },
];

const audiences = [
  {
    title: 'Students',
    description:
      'A classroom wallet that feels fair: earn, save, request pay, and see progress without guesswork.',
    icon: GraduationCap,
    to: '/for-students',
    cta: 'See the student experience',
    highlights: ['Clear next steps', 'History that makes sense', 'Goals you can actually reach'],
  },
  {
    title: 'Teachers',
    description:
      'Operate jobs, store, fines, and approvals from one calm surface—built for real class periods.',
    icon: Users,
    to: '/for-teachers',
    cta: 'Explore teacher tools',
    highlights: ['Fast approvals', 'Consistent rules', 'Signals when something needs you'],
  },
  {
    title: 'Families',
    description:
      'Shared language at home for responsibility, effort, and growth—without turning dinner into a lecture.',
    icon: HeartHandshake,
    to: '/waitlist',
    cta: 'Join the interest list',
    highlights: ['Aligned vocabulary', 'Progress you can discuss', 'Support without surveillance vibes'],
  },
];

const steps = [
  {
    title: 'Set the economy',
    description: 'Expectations, currency, and reward paths—guided so day one feels doable.',
    icon: Building2,
  },
  {
    title: 'Turn on jobs & store',
    description: 'Make effort visible with roles students want and rewards they understand.',
    icon: Briefcase,
  },
  {
    title: 'Coach daily habits',
    description: 'Students practice decisions; you steer with data instead of constant reminders.',
    icon: BookOpen,
  },
  {
    title: 'Review and adjust',
    description: 'Dashboards and ledgers show what is working—iterate without starting over.',
    icon: TrendingUp,
  },
];

const trustPoints = [
  {
    title: 'Billing you can explain',
    description: 'Subscriptions, invoices, and portal flows stay transparent for schools and families.',
    icon: CreditCard,
  },
  {
    title: 'Onboarding that respects time',
    description: 'Short paths to a working class economy—no engineering degree required.',
    icon: Clock,
  },
  {
    title: 'Security-minded defaults',
    description: 'Authenticated workflows and validated webhooks for the parts that touch real money.',
    icon: ShieldCheck,
  },
];

function MockClassCard() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-3 rounded-[2rem] opacity-60 blur-2xl"
        style={{ background: "radial-gradient(ellipse at 30% 20%, var(--ce-glow), transparent 55%)" }}
        aria-hidden
      />
      <div className="relative rounded-3xl bg-ce-surface p-6 sm:p-8 ring-1 ring-ce-border shadow-[0_24px_80px_-32px_oklch(0.35_0.06_252/0.35)]">
        <div className="flex items-center justify-between gap-4 border-b border-ce-border pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ce-ink-muted">Class balance</p>
            <p className="mt-1 font-display text-3xl sm:text-4xl font-bold tabular-nums tracking-tight text-ce-ink">
              {formatClassCredits('128.40')}
            </p>
            <p className="mt-1 text-xs text-ce-ink-muted">Class credits — not US dollars</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ce-muted text-ce-accent">
            <Wallet className="h-6 w-6" strokeWidth={1.75} />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {[
            { label: 'Payday (jobs)', amount: `+${CLASS_CURRENCY} 12.00` },
            { label: 'Store — hall pass', amount: `−${CLASS_CURRENCY} 3.50` },
            { label: 'Bonus — teamwork', amount: `+${CLASS_CURRENCY} 4.00` },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-xl bg-ce-canvas px-4 py-3 text-sm"
            >
              <span className="text-ce-ink-muted">{row.label}</span>
              <span className="font-medium tabular-nums text-ce-ink">{row.amount}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-ce-muted/80 px-4 py-3 text-sm text-ce-ink-muted">
          <PiggyBank className="h-5 w-5 shrink-0 text-ce-secondary" strokeWidth={1.75} />
          <span>Students see the same numbers you do—no mystery balance.</span>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ce-canvas">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            background:
              "radial-gradient(900px 420px at 12% -10%, oklch(0.92 0.06 252), transparent 60%), radial-gradient(700px 380px at 92% 10%, oklch(0.9 0.05 195), transparent 55%)",
          }}
          aria-hidden
        />

        <div className="container relative grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center lg:gap-12">
          <div>
            <p className="ce-fade-up mb-5 inline-flex items-center gap-2 rounded-full bg-ce-surface px-4 py-1.5 text-sm font-medium text-ce-ink ring-1 ring-ce-border">
              <span className="h-1.5 w-1.5 rounded-full bg-ce-positive" aria-hidden />
              Classroom economy · real habits
            </p>
            <h1 className="ce-fade-up ce-delay-1 font-display text-hero font-bold text-ce-ink">
              The reward system your class will actually use.
            </h1>
            <p className="ce-fade-up ce-delay-2 mt-5 max-w-measure text-lg leading-relaxed text-ce-ink-muted">
              ClassEcon helps teachers run a consistent classroom economy—jobs, store, pay, and history—so students
              practice responsibility and money skills without turning your whiteboard into a spreadsheet.
            </p>
            <div className="ce-fade-up ce-delay-3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/waitlist"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ce-accent px-7 py-3.5 text-base font-semibold text-ce-on-accent transition hover:bg-ce-accent-hover focus-visible:ce-focus"
              >
                Join early access
                <ArrowRight className="h-5 w-5" strokeWidth={2} />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center rounded-2xl bg-ce-surface px-7 py-3.5 text-base font-semibold text-ce-ink ring-1 ring-ce-border transition hover:bg-ce-muted focus-visible:ce-focus"
              >
                View plans
              </Link>
            </div>
            <dl className="mt-12 grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { k: 'Student clarity', v: 'Balances and next steps, always in plain language.' },
                { k: 'Teacher throughput', v: 'Approve pay and requests without tab gymnastics.' },
                { k: 'Family alignment', v: 'Talk about growth with shared vocabulary.' },
              ].map((item) => (
                <div key={item.k} className="rounded-2xl bg-ce-surface/80 p-4 ring-1 ring-ce-border">
                  <dt className="text-sm font-semibold text-ce-accent">{item.k}</dt>
                  <dd className="mt-2 text-sm leading-snug text-ce-ink-muted">{item.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="ce-fade-up ce-delay-2 lg:justify-self-end">
            <MockClassCard />
          </div>
        </div>
      </section>

      {/* Pillars — bento */}
      <section className="border-t border-ce-border bg-ce-surface py-20 sm:py-24">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="font-display text-display font-bold text-ce-ink">Built for the whole school day</h2>
            <p className="mt-4 text-lg text-ce-ink-muted leading-relaxed">
              Behavior systems first. Economics and accountability follow naturally—without a second product to learn.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {pillars.map((p) => (
              <div
                key={p.title}
                className={`rounded-3xl p-7 sm:p-8 ${p.span} ${p.tone}`}
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ce-accent text-ce-on-accent">
                  <p.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-xl font-bold text-ce-ink sm:text-2xl">{p.title}</h3>
                <p className="mt-3 max-w-prose text-ce-ink-muted leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section id="for-families" className="py-20 sm:py-24">
        <div className="container">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-display font-bold text-ce-ink">One platform, three perspectives</h2>
              <p className="mt-4 text-lg text-ce-ink-muted leading-relaxed">
                Everyone sees what matters to their role—without duplicate tools or conflicting stories.
              </p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 text-sm font-semibold text-ce-accent hover:text-ce-accent-hover"
            >
              Talk with us →
            </Link>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-12">
            {audiences.map((a, i) => (
              <article
                key={a.title}
                className={`flex flex-col rounded-3xl bg-ce-surface p-7 ring-1 ring-ce-border lg:p-8 ${
                  i === 0 ? 'lg:col-span-7' : i === 1 ? 'lg:col-span-5' : 'lg:col-span-12 lg:flex-row lg:items-start lg:gap-10'
                }`}
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ce-muted text-ce-accent lg:mb-0">
                  <a.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl font-bold text-ce-ink">{a.title}</h3>
                  <p className="mt-3 max-w-measure text-ce-ink-muted leading-relaxed">{a.description}</p>
                  <ul className="mt-6 space-y-2">
                    {a.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm text-ce-ink">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-ce-positive" strokeWidth={2.5} />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={a.to}
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ce-accent hover:text-ce-accent-hover"
                  >
                    {a.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-ce-border bg-ce-muted/50 py-20 sm:py-24">
        <div className="container">
          <h2 className="font-display text-display font-bold text-ce-ink">Launch sequence</h2>
          <p className="mt-4 max-w-2xl text-lg text-ce-ink-muted leading-relaxed">
            A practical order that gets you to a working economy fast—then keeps it sustainable.
          </p>
          <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, index) => (
              <li key={s.title} className="relative rounded-3xl bg-ce-surface p-6 ring-1 ring-ce-border">
                <span className="font-display text-sm font-bold text-ce-ink-muted">0{index + 1}</span>
                <div className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ce-muted text-ce-accent">
                  <s.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ce-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ce-ink-muted">{s.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-display font-bold text-ce-ink">Trust, without the fine print theater</h2>
            <p className="mt-4 text-lg text-ce-ink-muted leading-relaxed">
              ClassEcon pairs classroom workflows with infrastructure schools can stand behind.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {trustPoints.map((t) => (
              <div key={t.title} className="rounded-3xl bg-ce-surface p-7 ring-1 ring-ce-border">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ce-muted text-ce-accent">
                  <t.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-lg font-bold text-ce-ink">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ce-ink-muted">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ce-border bg-ce-ink py-20 text-ce-on-accent sm:py-24">
        <div className="container text-center">
          <h2 className="font-display text-display font-bold">Ready when your class is</h2>
          <p className="mx-auto mt-5 max-w-measure text-base leading-relaxed text-ce-footer-text">
            Join the waitlist for early access and founding-member pricing—we will meet you where your classroom
            already runs.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/waitlist"
              className="inline-flex min-w-[200px] items-center justify-center rounded-2xl bg-ce-accent px-8 py-3.5 text-base font-semibold text-ce-on-accent transition hover:bg-ce-accent-hover focus-visible:ce-focus"
            >
              Reserve your spot
            </Link>
            <Link
              to="/contact"
              className="inline-flex min-w-[200px] items-center justify-center rounded-2xl px-8 py-3.5 text-base font-semibold text-ce-on-accent ring-1 ring-ce-footer-muted transition hover:bg-white/5 focus-visible:ce-focus"
            >
              Contact the team
            </Link>
          </div>
          <p className="mt-8 text-sm text-ce-footer-muted">No credit card to join the waitlist.</p>
        </div>
      </section>
    </div>
  );
}
