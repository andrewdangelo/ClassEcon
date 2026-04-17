// src/components/subscription/BillingPortalButton.tsx
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, ExternalLink } from 'lucide-react';

const CREATE_BILLING_PORTAL_SESSION = gql`
  mutation CreateBillingPortalSession($returnUrl: String) {
    createBillingPortalSession(returnUrl: $returnUrl) {
      url
    }
  }
`;

interface BillingPortalButtonProps {
  returnUrl?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

interface CreateBillingPortalSessionData {
  createBillingPortalSession: {
    url: string;
  };
}

interface CreateBillingPortalSessionVars {
  returnUrl?: string;
}

export function BillingPortalButton({
  returnUrl,
  variant = 'outline',
  size = 'default',
  className,
  children,
}: BillingPortalButtonProps) {
  const [createPortalSession, { loading }] = useMutation<
    CreateBillingPortalSessionData,
    CreateBillingPortalSessionVars
  >(CREATE_BILLING_PORTAL_SESSION, {
    onCompleted: (data: CreateBillingPortalSessionData) => {
      if (data.createBillingPortalSession?.url) {
        window.location.href = data.createBillingPortalSession.url;
      }
    },
  });

  const handleClick = async () => {
    try {
      await createPortalSession({
        variables: {
          returnUrl: returnUrl || window.location.href,
        },
      });
    } catch (err) {
      console.error('Portal session error:', err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children || (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Billing
            <ExternalLink className="ml-2 h-3 w-3" />
          </>
        )
      )}
    </Button>
  );
}
