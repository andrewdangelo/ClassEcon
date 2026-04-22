import { useState } from 'react';
import { X, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface BetaAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ValidationStatus = 'idle' | 'validating' | 'success' | 'error';

export const BetaAccessModal = ({ isOpen, onClose }: BetaAccessModalProps) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<ValidationStatus>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setStatus('error');
      setMessage('Please enter an access code');
      return;
    }

    setStatus('validating');
    setMessage('');

    try {
      const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql';

      if (!graphqlUrl.startsWith('http://') && !graphqlUrl.startsWith('https://')) {
        console.error('❌ VITE_GRAPHQL_URL must include protocol (http:// or https://):', graphqlUrl);
        setStatus('error');
        setMessage('Configuration error: Invalid API URL. Please contact support.');
        return;
      }

      if (graphqlUrl.includes('.railway.internal')) {
        console.error('❌ VITE_GRAPHQL_URL cannot use Railway internal URL from browser:', graphqlUrl);
        setStatus('error');
        setMessage('Configuration error: Cannot reach API. Please contact support.');
        return;
      }

      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation ValidateBetaCode($code: String!) {
              validateBetaCode(code: $code) {
                valid
                message
                code {
                  id
                  code
                  expiresAt
                }
              }
            }
          `,
          variables: { code: code.trim() },
        }),
      });

      const { data, errors } = await response.json();

      if (errors) {
        setStatus('error');
        setMessage(errors[0]?.message || 'Failed to validate code');
        return;
      }

      const result = data.validateBetaCode;

      if (result.valid) {
        setStatus('success');
        setMessage('Access granted! Redirecting...');

        const upperCode = code.trim().toUpperCase();
        localStorage.setItem('betaAccessCode', upperCode);
        localStorage.setItem('betaAccessValidated', 'true');

        let frontendUrl = import.meta.env.VITE_FRONTEND_URL;

        if (!frontendUrl) {
          if (window.location.hostname === 'localhost') {
            frontendUrl = 'http://localhost:5173';
          } else {
            console.error('❌ VITE_FRONTEND_URL is not set! Cannot redirect to frontend.');
            setStatus('error');
            setMessage('Configuration error. Please contact support.');
            return;
          }
        }

        frontendUrl = frontendUrl.replace(/\/$/, '');

        setTimeout(() => {
          window.location.href = `${frontendUrl}/auth?betaCode=${upperCode}`;
        }, 1500);
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to connect to server. Please try again.');
      console.error('Beta code validation error:', error);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase());
    if (status !== 'idle') {
      setStatus('idle');
      setMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-ce-ink/45 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-3xl bg-ce-surface p-0 ring-1 ring-ce-border shadow-[0_32px_120px_-40px_oklch(0.25_0.05_252/0.5)]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-2 text-ce-ink-muted transition hover:bg-ce-muted disabled:opacity-50"
            disabled={status === 'validating'}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8 pt-10 sm:p-10">
            <div className="mb-6 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ce-muted text-ce-accent">
                <Shield className="h-7 w-7" strokeWidth={1.75} />
              </div>
            </div>

            <h2 className="font-display text-center text-2xl font-bold text-ce-ink">Beta access</h2>
            <p className="mt-2 text-center text-sm leading-relaxed text-ce-ink-muted">
              ClassEcon is in closed beta. Enter the access code you received to continue to the app.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label htmlFor="code" className="mb-2 block text-sm font-semibold text-ce-ink">
                  Access code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="ENTER CODE"
                  className="w-full rounded-2xl border border-ce-border bg-ce-canvas px-4 py-3.5 text-center font-mono text-lg tracking-widest text-ce-ink placeholder:text-ce-ink-muted/50 focus:border-ce-accent focus:outline-none focus:ring-2 focus:ring-ce-accent/25 disabled:opacity-60"
                  disabled={status === 'validating'}
                  autoFocus
                />
              </div>

              {message && (
                <div
                  className={`flex gap-2 rounded-2xl p-3 text-sm ${
                    status === 'error'
                      ? 'bg-red-50 text-red-900 ring-1 ring-red-200/80'
                      : status === 'success'
                        ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80'
                        : 'bg-ce-muted text-ce-ink ring-1 ring-ce-border'
                  }`}
                >
                  {status === 'error' && <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
                  {status === 'success' && <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />}
                  <p>{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'validating' || !code.trim()}
                className="w-full rounded-2xl bg-ce-accent py-3.5 text-base font-semibold text-ce-on-accent transition hover:bg-ce-accent-hover disabled:cursor-not-allowed disabled:bg-ce-elevated disabled:text-ce-ink-muted"
              >
                {status === 'validating' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden>
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Validating…
                  </span>
                ) : status === 'success' ? (
                  'Redirecting…'
                ) : (
                  'Verify access'
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-ce-border pt-6 text-center text-sm text-ce-ink-muted">
              Need a code?{' '}
              <a href="/waitlist" className="font-semibold text-ce-accent hover:text-ce-accent-hover">
                Join the waitlist
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
