// src/components/subscription/InvoiceHistory.tsx
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { format } from 'date-fns';
import { Download, ExternalLink, FileText, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatStripeMoney } from '@/lib/format';

const GET_INVOICES = gql`
  query GetInvoices($limit: Int) {
    getInvoices(limit: $limit) {
      id
      number
      status
      amountDue
      amountPaid
      currency
      periodStart
      periodEnd
      invoiceUrl
      invoicePdfUrl
      createdAt
    }
  }
`;

interface Invoice {
  id: string;
  number: string;
  status: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  invoiceUrl: string;
  invoicePdfUrl: string;
  createdAt: string;
}

interface InvoiceHistoryProps {
  limit?: number;
}

interface GetInvoicesData {
  getInvoices: Invoice[];
}

interface GetInvoicesVars {
  limit?: number;
}

export function InvoiceHistory({ limit = 12 }: InvoiceHistoryProps) {
  const { data, loading, error } = useQuery<GetInvoicesData, GetInvoicesVars>(GET_INVOICES, {
    variables: { limit },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500">Paid</Badge>;
      case 'open':
        return <Badge variant="secondary">Open</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'void':
        return <Badge variant="destructive">Void</Badge>;
      case 'uncollectible':
        return <Badge variant="destructive">Uncollectible</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Failed to load invoice history. Please try again later.
        </CardContent>
      </Card>
    );
  }

  const invoices: Invoice[] = data?.getInvoices || [];

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice History
          </CardTitle>
          <CardDescription>Your billing history will appear here</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No invoices yet. They will appear here once you subscribe to a paid plan.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Invoice History
        </CardTitle>
        <CardDescription>View and download your past invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.number}</TableCell>
                <TableCell>
                  {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(invoice.periodStart), 'MMM d')} -{' '}
                  {format(new Date(invoice.periodEnd), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatStripeMoney(invoice.amountPaid || invoice.amountDue, invoice.currency)}
                </TableCell>
                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {invoice.invoiceUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {invoice.invoicePdfUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <a href={invoice.invoicePdfUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
