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
      // Call GraphQL mutation to validate code
      const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql';
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
        
        // Store the validated code in localStorage
        const upperCode = code.trim().toUpperCase();
        localStorage.setItem('betaAccessCode', upperCode);
        localStorage.setItem('betaAccessValidated', 'true');
        
        console.log('✅ Beta code stored in localStorage:', {
          betaAccessCode: upperCode,
          betaAccessValidated: 'true'
        });
        
        // Redirect to the main application auth page with code as URL parameter
        // Since localStorage doesn't work across different domains/ports
        let frontendUrl = import.meta.env.VITE_FRONTEND_URL;
        
        if (!frontendUrl) {
          // Fallback for local development only
          if (window.location.hostname === 'localhost') {
            frontendUrl = 'http://localhost:5173';
          } else {
            // Production: VITE_FRONTEND_URL MUST be set in Railway environment variables
            console.error('❌ VITE_FRONTEND_URL is not set! Cannot redirect to frontend.');
            setStatus('error');
            setMessage('Configuration error. Please contact support.');
            return;
          }
        }
        
        // Remove trailing slash if present
        frontendUrl = frontendUrl.replace(/\/$/, '');
        
        console.log('🔗 Redirecting to frontend:', frontendUrl);
        console.log('📝 Environment check:', {
          VITE_FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL,
          VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
          hostname: window.location.hostname
        });
        
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
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
          {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          disabled={status === 'validating'}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Beta Access Required
          </h2>
          <p className="text-center text-gray-600 mb-6">
            ClassEcon is currently in closed beta. Enter your access code to continue.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="Enter your code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow uppercase tracking-wider font-mono text-center text-lg"
                disabled={status === 'validating'}
                autoFocus
              />
            </div>

            {/* Status message */}
            {message && (
              <div
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  status === 'error'
                    ? 'bg-red-50 text-red-800'
                    : status === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-blue-50 text-blue-800'
                }`}
              >
                {status === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                {status === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                <p className="text-sm">{message}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={status === 'validating' || !code.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'validating' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  Validating...
                </span>
              ) : status === 'success' ? (
                'Redirecting...'
              ) : (
                'Verify Access'
              )}
            </button>
          </form>

          {/* Help text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-center text-gray-600">
              Don't have an access code?{' '}
              <a href="/waitlist" className="text-blue-600 hover:text-blue-700 font-medium">
                Join the waitlist
              </a>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
