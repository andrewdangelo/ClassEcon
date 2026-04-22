import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact submission:', formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-ce-canvas pt-16">
        <div className="container flex flex-1 items-center py-16">
          <div className="mx-auto w-full max-w-lg rounded-3xl bg-ce-surface p-10 text-center ring-1 ring-ce-border">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ce-accent text-ce-on-accent">
              <Send className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold text-ce-ink">Message received</h1>
            <p className="mt-3 text-ce-ink-muted">We reply within one business day. Confirmation sent to your inbox.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-8 rounded-2xl bg-ce-muted px-6 py-3 text-sm font-semibold text-ce-ink hover:bg-ce-elevated focus-visible:ce-focus"
            >
              Send another note
            </button>
          </div>
        </div>
      </div>
    );
  }

  const contactBlocks = [
    { icon: Mail, title: 'Email', content: 'hello@classecon.com', href: 'mailto:hello@classecon.com' },
    { icon: Phone, title: 'Phone', content: '(555) 123-4567', href: 'tel:+15551234567' },
    {
      icon: MapPin,
      title: 'Office',
      content: '123 Education Lane, San Francisco, CA 94102',
      href: null as string | null,
    },
  ];

  return (
    <div className="bg-ce-canvas pt-16">
      <section className="border-b border-ce-border pb-12 pt-12 sm:pb-16 sm:pt-16">
        <div className="container max-w-3xl">
          <h1 className="font-display text-hero font-bold text-ce-ink">Talk with ClassEcon</h1>
          <p className="mt-5 text-lg text-ce-ink-muted">
            Questions about pilots, security reviews, or pricing—we read every message.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-lg font-bold text-ce-ink">Channels</h2>
                <p className="mt-2 text-sm text-ce-ink-muted">
                  Prefer email? That is where we send security packets and onboarding checklists.
                </p>
              </div>
              <div className="space-y-6">
                {contactBlocks.map((block) => (
                  <div key={block.title} className="flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ce-muted text-ce-accent">
                      <block.icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-ce-ink">{block.title}</h3>
                      {block.href ? (
                        <a href={block.href} className="mt-1 block text-sm text-ce-accent hover:text-ce-accent-hover">
                          {block.content}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-ce-ink-muted">{block.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-ce-muted/50 p-5 text-sm text-ce-ink-muted ring-1 ring-ce-border">
                <p className="font-semibold text-ce-ink">Quick links</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <Link to="/pricing" className="text-ce-accent hover:text-ce-accent-hover">
                      Pricing →
                    </Link>
                  </li>
                  <li>
                    <Link to="/waitlist" className="text-ce-accent hover:text-ce-accent-hover">
                      Waitlist →
                    </Link>
                  </li>
                  <li>
                    <Link to="/for-teachers" className="text-ce-accent hover:text-ce-accent-hover">
                      Teacher tools →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-3xl bg-ce-surface p-8 ring-1 ring-ce-border">
                <div className="mb-6 flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-ce-accent" strokeWidth={1.75} />
                  <h2 className="font-display text-xl font-bold text-ce-ink">Write to us</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ce-ink">Name *</label>
                      <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-2xl border border-ce-border bg-ce-canvas px-4 py-3 text-ce-ink focus:border-ce-accent focus:outline-none focus:ring-2 focus:ring-ce-accent/25"
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
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ce-ink">Subject *</label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-2xl border border-ce-border bg-ce-canvas px-4 py-3 text-ce-ink focus:border-ce-accent focus:outline-none focus:ring-2 focus:ring-ce-accent/25"
                    >
                      <option value="">Choose…</option>
                      <option value="general">General</option>
                      <option value="demo">Request a demo</option>
                      <option value="pricing">Pricing</option>
                      <option value="support">Technical support</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Product feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ce-ink">Message *</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full resize-none rounded-2xl border border-ce-border bg-ce-canvas px-4 py-3 text-ce-ink focus:border-ce-accent focus:outline-none focus:ring-2 focus:ring-ce-accent/25"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ce-accent py-3.5 font-semibold text-ce-on-accent hover:bg-ce-accent-hover focus-visible:ce-focus"
                  >
                    <Send className="h-5 w-5" />
                    Send message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ce-border bg-ce-muted/40 py-14">
        <div className="container max-w-4xl">
          <h2 className="text-center font-display text-2xl font-bold text-ce-ink">Common questions</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                q: 'When can we pilot?',
                a: 'We onboard founding teachers in rolling cohorts—tell us your timeline in the form.',
              },
              {
                q: 'Do you sign DPAs?',
                a: 'Yes for school deployments. Mention it in your note and we will route to legal.',
              },
              {
                q: 'Is there a sandbox?',
                a: 'Founding members receive a staging class populated with demo transactions.',
              },
              {
                q: 'What about roster imports?',
                a: 'CSV import ships with School tier; we can discuss interim workflows on Professional.',
              },
            ].map((item) => (
              <div key={item.q} className="rounded-2xl bg-ce-surface p-6 ring-1 ring-ce-border">
                <h3 className="font-display font-bold text-ce-ink">{item.q}</h3>
                <p className="mt-2 text-sm text-ce-ink-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
