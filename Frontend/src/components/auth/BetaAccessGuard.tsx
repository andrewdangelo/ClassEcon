import { ReactNode, useEffect, useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';

interface BetaAccessGuardProps {
  children: ReactNode;
}

export const BetaAccessGuard = ({ children }: BetaAccessGuardProps) => {
  const [isValidating, setIsValidating] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateBetaAccess = async () => {
      try {
        // Skip beta access check in development if DISABLE_BETA_CHECK is set
        const skipBetaCheck = localStorage.getItem('DISABLE_BETA_CHECK') === 'true';
        const allowE2eBypass = import.meta.env.VITE_E2E_BETA_BYPASS === 'true';
        if (skipBetaCheck && (import.meta.env.DEV || allowE2eBypass)) {
          console.log('⚠️ Beta access check disabled for development');
          setHasAccess(true);
          setIsValidating(false);
          return;
        }

        // Check for beta code in URL parameters (from landing page redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const codeFromUrl = urlParams.get('betaCode');
        
        if (codeFromUrl) {
          console.log('📋 Beta code found in URL:', codeFromUrl);
          // Store the code in localStorage for this origin
          localStorage.setItem('betaAccessCode', codeFromUrl);
          localStorage.setItem('betaAccessValidated', 'true');
          // Remove the parameter from URL for cleaner look
          window.history.replaceState({}, '', window.location.pathname);
        }

        // Check if user has validated their beta code
        const hasValidatedCode = localStorage.getItem('betaAccessValidated');
        const storedCode = localStorage.getItem('betaAccessCode');

        console.log('🔍 Beta Access Check:', {
          hasValidatedCode,
          storedCode,
          codeFromUrl
        });

        if (!hasValidatedCode || !storedCode) {
          console.log('❌ No beta access found, redirecting to landing page');
          // No beta access - redirect to landing page
          const landingPageUrl = import.meta.env.VITE_LANDING_PAGE_URL || 'http://localhost:5174';
          window.location.href = landingPageUrl;
          return;
        }

        console.log('✅ Beta code found in localStorage, validating with server...');

        // Optionally, re-validate the code with the server
        // This ensures the code is still valid (not expired/deactivated)
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
                }
              }
            `,
            variables: { code: storedCode },
          }),
        });

        const { data, errors } = await response.json();

        if (errors) {
          setError('Failed to validate beta access');
          localStorage.removeItem('betaAccessValidated');
          localStorage.removeItem('betaAccessCode');
          const landingPageUrl = import.meta.env.VITE_LANDING_PAGE_URL || 'http://localhost:5174';
          setTimeout(() => {
            window.location.href = landingPageUrl;
          }, 3000);
          return;
        }

        const result = data.validateBetaCode;

        if (!result.valid) {
          setError(result.message || 'Beta access has been revoked');
          localStorage.removeItem('betaAccessValidated');
          localStorage.removeItem('betaAccessCode');
          const landingPageUrl = import.meta.env.VITE_LANDING_PAGE_URL || 'http://localhost:5174';
          setTimeout(() => {
            window.location.href = landingPageUrl;
          }, 3000);
          return;
        }

        // All good - allow access
        setHasAccess(true);
      } catch (err) {
        console.error('Beta access validation error:', err);
        // On error, allow access but log the issue
        // You can change this behavior based on your requirements
        setHasAccess(true);
      } finally {
        setIsValidating(false);
      }
    };

    validateBetaAccess();
  }, []);

  if (isValidating) {
    return (
      <div className="auth-shell">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <Shield className="h-8 w-8 animate-pulse text-primary" />
          </div>
          <h2 className="mb-2 font-display text-xl font-semibold text-foreground">
            Verifying access
          </h2>
          <p className="text-muted-foreground">
            Please wait while we verify your beta access…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-shell">
        <div className="max-w-md text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="mb-2 font-display text-xl font-semibold text-foreground">
            Access denied
          </h2>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">
            Redirecting to landing page…
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
};
