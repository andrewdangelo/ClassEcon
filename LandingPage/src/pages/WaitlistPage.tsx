import { useState } from 'react';
import { Sparkles, Check, Rocket, Mail } from 'lucide-react';

const JOIN_WAITLIST_MUTATION = `
  mutation JoinWaitlist($input: JoinWaitlistInput!) {
    joinWaitlist(input: $input) {
      success
      message
    }
  }
`;

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'teacher',
    school: '',
    students: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql';

    try {
      const res = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: JOIN_WAITLIST_MUTATION,
          variables: {
            input: {
              email: formData.email.trim().toLowerCase(),
              name: formData.name.trim() || undefined,
              role: formData.role,
              school: formData.school.trim() || undefined,
              approximateStudents: formData.students || undefined,
            },
          },
        }),
      });
      const json = await res.json();
      if (json.errors?.length) {
        setFormError(json.errors[0]?.message || 'Something went wrong.');
        return;
      }
      const row = json.data?.joinWaitlist;
      if (!row?.success) {
        setFormError(row?.message || 'Could not join the waitlist right now.');
        return;
      }
      setSubmitted(true);
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-ce-canvas pt-16">
        <div className="container flex flex-1 items-center py-16">
          <div className="mx-auto w-full max-w-lg rounded-3xl bg-ce-surface p-10 text-center ring-1 ring-ce-border">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ce-positive text-ce-on-accent">
              <Check className="h-8 w-8" strokeWidth={2} />
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold text-ce-ink">You are on the list</h1>
            <p className="mt-3 text-ce-ink-muted">
              We will email <span className="font-medium text-ce-ink">{formData.email}</span> with next steps.
            </p>
            <div className="mt-8 rounded-2xl bg-ce-warm-soft p-6 text-left text-sm text-ce-ink ring-1 ring-ce-border">
              <p className="font-display font-bold text-ce-ink">Founding member perks</p>
              <ul className="mt-4 space-y-2">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ce-positive" strokeWidth={2.5} />
                  50% lifetime discount when billing opens
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ce-positive" strokeWidth={2.5} />
                  Early feature previews
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ce-positive" strokeWidth={2.5} />
                  Priority support during beta
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const benefits = [
    { icon: Sparkles, title: 'Founding pricing', description: 'Lock discounted rates for the life of your account.' },
    { icon: Rocket, title: 'Ship feedback fast', description: 'Your classroom notes go straight to the product queue.' },
    { icon: Mail, title: 'Human onboarding', description: 'We help translate your current system into ClassEcon.' },
    { icon: Check, title: 'Priority support', description: 'Direct line while we harden workflows for launch.' },
  ];

  return (
    <div className="bg-ce-canvas pt-16">
      <section className="border-b border-ce-border pb-12 pt-12 sm:pb-16 sm:pt-16">
        <div className="container max-w-3xl text-center">
          <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-ce-warm-soft px-4 py-1.5 text-sm font-semibold text-ce-warm ring-1 ring-ce-border">
            <Sparkles className="h-4 w-4" />
            Limited founding seats
          </p>
          <h1 className="font-display text-hero font-bold text-ce-ink">
            Join the waitlist
            <span className="text-ce-accent"> for early access</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ce-ink-muted">
            Be among the first cohort to run ClassEcon with your students—and secure founding pricing before public
            launch.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="font-display text-2xl font-bold text-ce-ink">What founders receive</h2>
              <div className="mt-8 space-y-5">
                {benefits.map((b) => (
                  <div key={b.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ce-muted text-ce-accent">
                      <b.icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-ce-ink">{b.title}</h3>
                      <p className="mt-1 text-sm text-ce-ink-muted">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-8 rounded-2xl bg-ce-muted/60 p-5 text-sm text-ce-ink-muted ring-1 ring-ce-border">
                Offer closes when we reach 100 founding teachers or launch publicly—whichever comes first.
              </p>
            </div>

            <div className="rounded-3xl bg-ce-surface p-8 ring-1 ring-ce-border">
              <h3 className="font-display text-xl font-bold text-ce-ink">Tell us about your classroom</h3>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ce-ink">Full name *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl border border-ce-border bg-ce-canvas px-4 py-3 text-ce-ink focus:border-ce-accent focus:outline-none focus:ring-2 focus:ring-ce-accent/25"
                    placeholder="Jordan Lee"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ce-ink">Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-2xl border border-ce-border bg-ce-canvas px-4 py-3 text-ce-ink focus:border-ce-accent focus:outline-none focus:ring-2 focus:ring-ce-accent/25"
                    placeholder="you@school.edu"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ce-ink">I am a *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-2xl border border-ce-border bg-ce-canvas px-4 py-3 text-ce-ink focus:border-ce-accent focus:outline-none focus:ring-2 focus:ring-ce-accent/25"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="administrator">Administrator</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ce-ink">School / organization</label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    className="w-full rounded-2xl border border-ce-border bg-ce-canvas px-4 py-3 text-ce-ink focus:border-ce-accent focus:outline-none focus:ring-2 focus:ring-ce-accent/25"
                    placeholder="Lincoln Elementary"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ce-ink">Students you support</label>
                  <select
                    value={formData.students}
                    onChange={(e) => setFormData({ ...formData, students: e.target.value })}
                    className="w-full rounded-2xl border border-ce-border bg-ce-canvas px-4 py-3 text-ce-ink focus:border-ce-accent focus:outline-none focus:ring-2 focus:ring-ce-accent/25"
                  >
                    <option value="">Select…</option>
                    <option value="1-15">1–15</option>
                    <option value="16-30">16–30</option>
                    <option value="31-50">31–50</option>
                    <option value="51+">51+</option>
                  </select>
                </div>
                {formError && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
                    {formError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-ce-accent py-3.5 text-base font-semibold text-ce-on-accent transition hover:bg-ce-accent-hover focus-visible:ce-focus disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : 'Reserve my spot'}
                </button>
                <p className="text-center text-xs text-ce-ink-muted">
                  By joining you agree to receive product updates. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
