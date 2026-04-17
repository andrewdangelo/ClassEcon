import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Shield, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';

const CREATE_BETA_CODE = gql`
  mutation CreateBetaCode($code: String!, $description: String, $maxUses: Int, $expiresAt: DateTime) {
    createBetaCode(code: $code, description: $description, maxUses: $maxUses, expiresAt: $expiresAt) {
      id
      code
      description
      maxUses
      currentUses
      expiresAt
      isActive
      createdAt
    }
  }
`;

interface FormData {
  code: string;
  description: string;
  maxUses: string;
  expiresAt: string;
}

export default function BetaCodesManagement() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    code: '',
    description: '',
    maxUses: '1',
    expiresAt: '',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [createBetaCode, { loading, error }] = useMutation(CREATE_BETA_CODE, {
    onCompleted: (data: any) => {
      setSuccessMessage(`Beta code "${data.createBetaCode.code}" created successfully!`);
      setFormData({
        code: '',
        description: '',
        maxUses: '1',
        expiresAt: '',
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      return;
    }

    try {
      await createBetaCode({
        variables: {
          code: formData.code.trim().toUpperCase(),
          description: formData.description || null,
          maxUses: parseInt(formData.maxUses) || 1,
          expiresAt: formData.expiresAt || null,
        },
      });
    } catch (err) {
      console.error('Failed to create beta code:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="page-stack mx-auto w-full max-w-4xl">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <Shield className="h-9 w-9 shrink-0 text-primary" aria-hidden />
          <h1 className="page-title">Beta Access Codes</h1>
        </div>
        <p className="page-subtitle !mt-0">
          Create and manage beta access codes for the closed beta period.
        </p>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Failed to create beta code</p>
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
        </div>
      )}

      {/* Create Form */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-md">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
          <Plus className="h-5 w-5 text-primary" />
          Create New Beta Code
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="code" className="mb-2 block text-sm font-medium text-foreground">
              Access Code *
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., BETA2024"
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm uppercase ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            />
            <p className="mt-1 text-sm text-muted-foreground">
              The code will be converted to uppercase automatically
            </p>
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Code for teachers at Spring Valley High"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="maxUses" className="mb-2 block text-sm font-medium text-foreground">
                Maximum Uses
              </label>
              <input
                type="number"
                id="maxUses"
                name="maxUses"
                value={formData.maxUses}
                onChange={handleChange}
                min="1"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                How many people can use this code
              </p>
            </div>

            <div>
              <label htmlFor="expiresAt" className="mb-2 block text-sm font-medium text-foreground">
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg" disabled={loading || !formData.code.trim()} className="gap-2">
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
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
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Create Beta Code
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <h3 className="mb-2 font-display text-lg font-semibold text-foreground">How Beta Codes Work</h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>Users must enter a valid code on the landing page to access the application</li>
          <li>Once validated, the code is stored in the user's browser</li>
          <li>Each code can be used up to the specified maximum number of times</li>
          <li>Codes can be deactivated or set to expire at a specific date/time</li>
          <li>Only teachers can create and manage beta codes</li>
        </ul>
      </div>
    </div>
  );
}
