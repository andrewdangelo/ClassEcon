/**
 * Stripe Webhook Handlers
 * 
 * Handles Stripe webhook events for subscription lifecycle
 */

import { Router, Request, Response } from 'express';
import { StripeService } from '../services/stripe';
import Stripe from 'stripe';

const router = Router();

/**
 * Stripe webhook endpoint
 * Must use raw body for signature verification
 */
router.post(
  '/webhooks/stripe',
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'];

    if (!signature || typeof signature !== 'string') {
      console.error('Missing stripe-signature header');
      return res.status(400).send('Missing signature');
    }

    let event: Stripe.Event;

    try {
      // Construct event from webhook payload
      event = StripeService.constructWebhookEvent(
        req.body,
        signature
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    console.log(`Received Stripe webhook: ${event.type}`);

    try {
      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await StripeService.handlePaymentSuccess(session);
          console.log(`✅ Checkout session completed: ${session.id}`);
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await StripeService.handleSubscriptionUpdated(subscription);
          console.log(`✅ Subscription ${event.type}: ${subscription.id}`);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await StripeService.handleSubscriptionDeleted(subscription);
          console.log(`✅ Subscription deleted: ${subscription.id}`);
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`✅ Invoice payment succeeded: ${invoice.id}`);
          // Subscription will be updated via subscription.updated event
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`❌ Invoice payment failed: ${invoice.id}`);
          // Handle failed payment (e.g., send email notification)
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Return success response
      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
