/**
 * Payment Service Client
 * 
 * HTTP client for communicating with the PaymentService microservice.
 * The Backend acts as a proxy, forwarding payment requests to the dedicated
 * PaymentService which handles all Stripe integration and payment logic.
 */

import axios, { AxiosInstance } from 'axios';
import { env } from '../config';

class PaymentServiceClientClass {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.PAYMENT_SERVICE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.PAYMENT_SERVICE_API_KEY,
      },
    });
  }

  private buildServiceAuthHeaders(userId: string, userRole: string = 'TEACHER') {
    return {
      'x-user-id': userId,
      'x-user-role': userRole,
    };
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(params: {
    userId: string;
    email: string;
    tier: string;
    interval?: string;
    isFoundingMember?: boolean;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ sessionId: string; url: string }> {
    const { userId, ...payload } = params;
    const response = await this.client.post('/api/payments/checkout', payload, {
      headers: this.buildServiceAuthHeaders(userId),
    });
    return response.data;
  }

  /**
   * Create billing portal session
   */
  async createPortalSession(
    userId: string,
    returnUrl: string
  ): Promise<{ url: string }> {
    const response = await this.client.post(
      '/api/payments/portal',
      { returnUrl },
      { headers: this.buildServiceAuthHeaders(userId) }
    );
    return response.data;
  }

  /**
   * Get user's current subscription from PaymentService
   */
  async getSubscription(userId: string): Promise<{
    tier: string;
    status: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId: string | null;
  } | null> {
    try {
      const response = await this.client.get('/api/payments/subscription', {
        headers: this.buildServiceAuthHeaders(userId),
      });
      const subscription = response.data?.subscription;
      if (!subscription) {
        return null;
      }
      return {
        tier: subscription.tier,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart || null,
        currentPeriodEnd: subscription.currentPeriodEnd || null,
        cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
        stripeSubscriptionId: subscription.stripeSubscriptionId || null,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post(
      '/api/payments/cancel',
      {},
      { headers: this.buildServiceAuthHeaders(userId) }
    );
    return response.data;
  }

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post(
      '/api/payments/reactivate',
      {},
      { headers: this.buildServiceAuthHeaders(userId) }
    );
    return response.data;
  }

  /**
   * Update subscription tier (upgrade/downgrade)
   */
  async updateSubscriptionTier(
    userId: string,
    tier: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post(
      '/api/payments/change-tier',
      { tier },
      { headers: this.buildServiceAuthHeaders(userId) }
    );
    return response.data;
  }

  /**
   * Get user's invoices
   */
  async getInvoices(
    userId: string,
    limit: number = 12
  ): Promise<Array<{
    id: string;
    number: string;
    status: string;
    amountDue: number;
    amountPaid: number;
    currency: string;
    periodStart: string;
    periodEnd: string;
    invoiceUrl: string | null;
    invoicePdfUrl: string | null;
    createdAt: string;
  }>> {
    const response = await this.client.get('/api/payments/invoices', {
      params: { limit },
      headers: this.buildServiceAuthHeaders(userId),
    });
    const invoices = response.data?.invoices || [];
    return invoices.map((invoice: any) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amountDue: invoice.amount || 0,
      amountPaid: invoice.amount || 0,
      currency: invoice.currency || 'usd',
      periodStart: invoice.date || new Date().toISOString(),
      periodEnd: invoice.date || new Date().toISOString(),
      invoiceUrl: invoice.hostedUrl || null,
      invoicePdfUrl: invoice.pdfUrl || null,
      createdAt: invoice.date || new Date().toISOString(),
    }));
  }

  /**
   * Get upcoming invoice preview
   */
  async getUpcomingInvoice(userId: string): Promise<{
    amountDue: number;
    currency: string;
    periodStart: string;
    periodEnd: string;
  } | null> {
    try {
      const response = await this.client.get('/api/payments/upcoming-invoice', {
        headers: this.buildServiceAuthHeaders(userId),
      });
      const upcomingInvoice = response.data?.upcomingInvoice;
      if (!upcomingInvoice) {
        return null;
      }
      return {
        amountDue: upcomingInvoice.amount || 0,
        currency: upcomingInvoice.currency || 'usd',
        periodStart: upcomingInvoice.periodStart || new Date().toISOString(),
        periodEnd: upcomingInvoice.periodEnd || new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(userId: string): Promise<Array<{
    id: string;
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  }>> {
    const response = await this.client.get('/api/payments/payment-methods', {
      headers: this.buildServiceAuthHeaders(userId),
    });
    return response.data.paymentMethods || [];
  }

  /**
   * Admin: Update user subscription
   */
  async adminUpdateSubscription(
    userId: string,
    updates: {
      tier?: string;
      status?: string;
      isFoundingMember?: boolean;
    }
  ): Promise<{ success: boolean }> {
    const response = await this.client.put(`/api/admin/subscriptions/${userId}`, updates);
    return response.data;
  }

  /**
   * Admin: Cancel user subscription
   */
  async adminCancelSubscription(
    userId: string,
    immediately: boolean = false,
    reason?: string
  ): Promise<{ success: boolean }> {
    const response = await this.client.post(`/api/admin/subscriptions/${userId}/cancel`, {
      immediately,
      reason,
    });
    return response.data;
  }

  /**
   * Admin: Extend user trial
   */
  async adminExtendTrial(userId: string, days: number): Promise<{ success: boolean; newTrialEnd: string }> {
    const response = await this.client.post(`/api/admin/subscriptions/${userId}/extend-trial`, {
      days,
    });
    return response.data;
  }

  /**
   * Admin: Issue refund
   */
  async adminIssueRefund(
    userId: string,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; refundId: string }> {
    const response = await this.client.post(`/api/admin/subscriptions/${userId}/refund`, {
      amount,
      reason,
    });
    return response.data;
  }

  /**
   * Admin: Get subscription stats
   */
  async adminGetStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    cancelledSubscriptions: number;
    revenue: {
      monthly: number;
      yearly: number;
    };
  }> {
    const response = await this.client.get('/api/admin/stats');
    return response.data;
  }
}

// Export singleton instance
export const PaymentServiceClient = new PaymentServiceClientClass();
