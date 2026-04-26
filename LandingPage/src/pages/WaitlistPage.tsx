import { useState } from 'react';
import { Sparkles, Check, Rocket, Mail } from 'lucide-react';

const JOIN_WAITLIST_MUTATION = `
  mutation JoinWaitlist($input: JoinWaitlistInput!) {
    joinWaitlist(input: $input) {
      success
      message
      referralCode
      referralLink
      successfulReferrals
      boostPoints
      displayPosition
    }
  }
`;

const WAITLIST_PROGRESS_QUERY = `
  query WaitlistProgress($email: String!, $referralCode: String!) {
    waitlistProgress(email: $email, referralCode: $referralCode) {
      success
      message
      referralCode
      referralLink
      successfulReferrals
      boostPoints
      displayPosition
    }
  }
`;

type JoinWaitlistResponse = {
  success: boolean;
  message?: string;
  referralCode?: string | null;
  referralLink?: string | null;
  successfulReferrals?: number | null;
  boostPoints?: number | null;
  displayPosition?: number | null;
};

export default function WaitlistPage() {
  const isProgressRoute = window.location.pathname === '/waitlist/progress';
  const [progressModalOpen, setProgressModalOpen] = useState(false);
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
  const [result, setResult] = useState<JoinWaitlistResponse | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const referralCodeFromUrl = new URLSearchParams(window.location.search)
    .get('ref')
    ?.trim()
    .toUpperCase();
  const [progressLookup, setProgressLookup] = useState({
    email: '',
    referralCode: referralCodeFromUrl || '',
  });
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [progressResult, setProgressResult] = useState<JoinWaitlistResponse | null>(null);

  const handleCopyReferralLink = async () => {
    if (!result?.referralLink) return;
    try {
      await navigator.clipboard.writeText(result.referralLink);
      setCopyStatus('Referral link copied');
    } catch {
      setCopyStatus('Could not copy link. Please copy it manually.');
    }
  };

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
              referralCode: referralCodeFromUrl || undefined,
            },
          },
        }),
      });
      const json = await res.json();
      if (json.errors?.length) {
        setFormError(json.errors[0]?.message || 'Something went wrong.');
        return;
      }
      const row = json.data?.joinWaitlist as JoinWaitlistResponse | undefined;
      if (!row?.success) {
        setFormError(row?.message || 'Could not join the waitlist right now.');
        return;
      }
      setResult(row);
      setSubmitted(true);
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgressError(null);
    setProgressLoading(true);
    const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql';

    try {
      const res = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: WAITLIST_PROGRESS_QUERY,
          variables: {
            email: progressLookup.email.trim().toLowerCase(),
            referralCode: progressLookup.referralCode.trim().toUpperCase(),
          },
        }),
      });
      const json = await res.json();
      if (json.errors?.length) {
        setProgressError(json.errors[0]?.message || 'Could not load progress.');
        return;
      }
      const row = json.data?.waitlistProgress as JoinWaitlistResponse | undefined;
      if (!row?.success) {
        setProgressError(row?.message || 'Could not find your waitlist profile.');
        return;
      }
      setProgressResult(row);
    } catch {
      setProgressError('Network error. Please try again.');
    } finally {
      setProgressLoading(false);
    }
  };

  if (submitted) {
    const referralCount = result?.successfulReferrals ?? 0;
    const milestoneTarget = 5;
    const referralProgress = Math.min(100, Math.round((referralCount / milestoneTarget) * 100));

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
            <div className="mt-6 rounded-2xl bg-ce-muted/60 p-5 text-left text-sm text-ce-ink ring-1 ring-ce-border">
              <p>
                Current waitlist position:
                <span className="ml-2 font-semibold text-ce-accent">#{result?.displayPosition ?? '—'}</span>
              </p>
              <p className="mt-2">
                Successful referrals:
                <span className="ml-2 font-semibold">{result?.successfulReferrals ?? 0}</span>
              </p>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-ce-ink-muted">
                  <span>Referral boost progress</span>
                  <span>
                    {Math.min(referralCount, milestoneTarget)}/{milestoneTarget}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-ce-border">
                  <div
                    className="h-full rounded-full bg-ce-accent transition-all duration-500"
                    style={{ width: `${referralProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-ce-ink-muted">
                  Reach 5 referrals to unlock the major jump bonus.
                </p>
              </div>
              {result?.referralLink && (
                <div className="mt-3 rounded-xl bg-ce-canvas px-3 py-3 text-xs ring-1 ring-ce-border">
                  <p className="break-all">{result.referralLink}</p>
                  <button
                    type="button"
                    onClick={handleCopyReferralLink}
                    className="mt-3 w-full rounded-xl bg-ce-accent px-3 py-2 text-sm font-semibold text-ce-on-accent transition hover:bg-ce-accent-hover"
                  >
                    Copy referral link
                  </button>
                  {copyStatus && <p className="mt-2 text-center text-xs text-ce-ink-muted">{copyStatus}</p>}
                </div>
              )}
              <div className="mt-4 rounded-xl bg-ce-canvas px-3 py-3 ring-1 ring-ce-border">
                <p className="text-xs font-semibold text-ce-ink">How to move up your spot</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-ce-ink-muted">
                  <li>Share your referral link with colleagues and friends.</li>
                  <li>Each successful signup with your link increases your referral count.</li>
                  <li>At 5 referrals, you unlock a major jump bonus on the waitlist.</li>
                </ol>
              </div>
            </div>
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
          <div className={`grid gap-12 ${isProgressRoute ? '' : 'lg:grid-cols-2 lg:items-start'}`}>
            {!isProgressRoute && (
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
            )}

            <div className="rounded-3xl bg-ce-surface p-8 ring-1 ring-ce-border">
              {isProgressRoute && (
                <div className="mb-6 rounded-2xl bg-ce-muted/50 p-4 text-sm text-ce-ink ring-1 ring-ce-border">
                  <p className="font-semibold">Track your waitlist progress</p>
                  <p className="mt-1 text-xs text-ce-ink-muted">
                    Use the email and referral code from your welcome message to see your latest position and referral count.
                  </p>
                </div>
              )}
              <h3 className="font-display text-xl font-bold text-ce-ink">Tell us about your classroom</h3>
              {!isProgressRoute && (
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
                {referralCodeFromUrl && (
                  <p className="text-center text-xs font-medium text-ce-accent">
                    Referral code applied: {referralCodeFromUrl}
                  </p>
                )}
              </form>
              )}
              {isProgressRoute ? (
                <div className="mt-8 rounded-2xl bg-ce-muted/50 p-5 ring-1 ring-ce-border">
                  <h4 className="font-display text-base font-bold text-ce-ink">Already on the waitlist?</h4>
                  <p className="mt-1 text-xs text-ce-ink-muted">
                    Enter your email + referral code to check your current position and referral usage.
                  </p>
                  <form onSubmit={handleCheckProgress} className="mt-4 space-y-3">
                    <input
                      type="email"
                      required
                      value={progressLookup.email}
                      onChange={(e) => setProgressLookup({ ...progressLookup, email: e.target.value })}
                      className="w-full rounded-xl border border-ce-border bg-ce-canvas px-3 py-2 text-sm text-ce-ink focus:border-ce-accent focus:outline-none focus:ring-2 focus:ring-ce-accent/25"
                      placeholder="you@school.edu"
                    />
                    <input
                      type="text"
                      required
                      value={progressLookup.referralCode}
                      onChange={(e) =>
                        setProgressLookup({ ...progressLookup, referralCode: e.target.value.toUpperCase() })
                      }
                      className="w-full rounded-xl border border-ce-border bg-ce-canvas px-3 py-2 text-sm text-ce-ink focus:border-ce-accent focus:outline-none focus:ring-2 focus:ring-ce-accent/25"
                      placeholder="Your referral code"
                    />
                    <button
                      type="submit"
                      disabled={progressLoading}
                      className="w-full rounded-xl bg-ce-accent py-2.5 text-sm font-semibold text-ce-on-accent transition hover:bg-ce-accent-hover disabled:opacity-60"
                    >
                      {progressLoading ? 'Checking…' : 'Check my progress'}
                    </button>
                    {progressError && <p className="text-xs text-red-700">{progressError}</p>}
                    {progressResult && (
                      <div className="rounded-xl bg-ce-canvas px-3 py-3 text-xs text-ce-ink ring-1 ring-ce-border">
                        <p>
                          Position: <span className="font-semibold text-ce-accent">#{progressResult.displayPosition}</span>
                        </p>
                        <p className="mt-1">
                          Successful referrals: <span className="font-semibold">{progressResult.successfulReferrals ?? 0}</span>
                        </p>
                      </div>
                    )}
                  </form>
                </div>
              ) : (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => setProgressModalOpen(true)}
                    className="text-sm font-semibold text-ce-accent underline-offset-4 transition hover:text-ce-accent-hover hover:underline"
                  >
                    View my progress
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {!isProgressRoute && progressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ce-ink/45 p-4">
          <div className="w-full max-w-md rounded-3xl bg-ce-surface p-6 shadow-xl ring-1 ring-ce-border">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-display text-lg font-bold text-ce-ink">View my progress</h4>
                <p className="mt-1 text-xs text-ce-ink-muted">
                  Enter your email + referral code to check your current position and referral usage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProgressModalOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-ce-ink-muted transition hover:bg-ce-muted hover:text-ce-ink"
                aria-label="Close progress lookup"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleCheckProgress} className="mt-5 space-y-3">
              <input
                type="email"
                required
                value={progressLookup.email}
                onChange={(e) => setProgressLookup({ ...progressLookup, email: e.target.value })}
                className="w-full rounded-xl border border-ce-border bg-ce-canvas px-3 py-2 text-sm text-ce-ink focus:border-ce-accent focus:outline-none focus:ring-2 focus:ring-ce-accent/25"
                placeholder="you@school.edu"
              />
              <input
                type="text"
                required
                value={progressLookup.referralCode}
                onChange={(e) =>
                  setProgressLookup({ ...progressLookup, referralCode: e.target.value.toUpperCase() })
                }
                className="w-full rounded-xl border border-ce-border bg-ce-canvas px-3 py-2 text-sm text-ce-ink focus:border-ce-accent focus:outline-none focus:ring-2 focus:ring-ce-accent/25"
                placeholder="Your referral code"
              />
              <button
                type="submit"
                disabled={progressLoading}
                className="w-full rounded-xl bg-ce-accent py-2.5 text-sm font-semibold text-ce-on-accent transition hover:bg-ce-accent-hover disabled:opacity-60"
              >
                {progressLoading ? 'Checking…' : 'Check my progress'}
              </button>
              {progressError && <p className="text-xs text-red-700">{progressError}</p>}
              {progressResult && (
                <div className="rounded-xl bg-ce-canvas px-3 py-3 text-xs text-ce-ink ring-1 ring-ce-border">
                  <p>
                    Position: <span className="font-semibold text-ce-accent">#{progressResult.displayPosition}</span>
                  </p>
                  <p className="mt-1">
                    Successful referrals: <span className="font-semibold">{progressResult.successfulReferrals ?? 0}</span>
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
