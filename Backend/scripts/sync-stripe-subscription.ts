// scripts/sync-stripe-subscription.ts
/**
 * Sync a user's subscription from Stripe
 * This manually fetches subscription data from Stripe and updates the user
 */

import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";
import { connectMongo } from "../src/db/connection.js";
import axios from "axios";

async function syncSubscription() {
  try {
    await connectMongo(process.env.DATABASE_URL!);
    console.log("Connected to MongoDB");
    console.log("Database:", mongoose.connection.db?.databaseName);

    const email = "teacher+carter@demo.school";
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User ${email} not found`);
      process.exit(1);
    }

    console.log(`\n=== Found User ===`);
    console.log(`ID: ${user._id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Current Tier: ${user.subscriptionTier}`);
    console.log(`Current Status: ${user.subscriptionStatus}`);

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("Missing STRIPE_SECRET_KEY. Set it in Backend/.env (or the environment) — never commit keys.");
      process.exit(1);
    }

    console.log("\n=== Searching for Stripe customer ===");
    const customersResponse = await axios.get("https://api.stripe.com/v1/customers", {
      auth: {
        username: stripeKey,
        password: ""
      },
      params: {
        email: email,
        limit: 1
      }
    });

    if (customersResponse.data.data.length === 0) {
      console.log("No Stripe customer found for this email");
      process.exit(1);
    }

    const customer = customersResponse.data.data[0];
    console.log(`Found Stripe Customer: ${customer.id}`);

    // Get subscriptions for this customer
    const subscriptionsResponse = await axios.get("https://api.stripe.com/v1/subscriptions", {
      auth: {
        username: stripeKey,
        password: ""
      },
      params: {
        customer: customer.id,
        limit: 1
      }
    });

    if (subscriptionsResponse.data.data.length === 0) {
      console.log("No active subscriptions found");
      process.exit(1);
    }

    const subscription = subscriptionsResponse.data.data[0];
    console.log(`\n=== Stripe Subscription ===`);
    console.log(`ID: ${subscription.id}`);
    console.log(`Status: ${subscription.status}`);
    
    // Get period dates from subscription items
    const subscriptionItem = subscription.items?.data?.[0];
    const currentPeriodEnd = subscriptionItem?.current_period_end;
    const currentPeriodStart = subscriptionItem?.current_period_start;
    const trialEnd = subscription.trial_end;
    
    console.log(`Current Period End: ${currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : 'N/A'}`);
    console.log(`Current Period Start: ${currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : 'N/A'}`);
    console.log(`Trial End: ${trialEnd ? new Date(trialEnd * 1000).toISOString() : 'N/A'}`);
    
    // Map status
    let status = "ACTIVE";
    if (subscription.status === "trialing") status = "TRIAL";
    else if (subscription.status === "active") status = "ACTIVE";
    else if (subscription.status === "past_due") status = "PAST_DUE";
    else if (subscription.status === "canceled") status = "CANCELED";

    // Get tier from metadata or default to PROFESSIONAL
    const tier = subscription.metadata?.tier || "PROFESSIONAL";
    const isFoundingMember = subscription.metadata?.isFoundingMember === "true";

    console.log(`Mapped Tier: ${tier}`);
    console.log(`Mapped Status: ${status}`);
    console.log(`Is Founding Member: ${isFoundingMember}`);

    // Update user
    user.subscriptionTier = tier as any;
    user.subscriptionStatus = status as any;
    user.stripeCustomerId = customer.id;
    user.stripeSubscriptionId = subscription.id;
    
    // Handle current_period_end from subscription items
    if (currentPeriodEnd && !isNaN(currentPeriodEnd)) {
      user.subscriptionExpiresAt = new Date(currentPeriodEnd * 1000);
    }
    
    // Handle trial_end
    if (trialEnd && !isNaN(trialEnd)) {
      user.trialEndsAt = new Date(trialEnd * 1000);
    }
    
    user.isFoundingMember = isFoundingMember;

    await user.save();

    console.log(`\n✅ User updated successfully!`);
    console.log(`New Tier: ${user.subscriptionTier}`);
    console.log(`New Status: ${user.subscriptionStatus}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    if (axios.isAxiosError(error)) {
      console.error("Stripe API Error:", error.response?.data);
    }
    process.exit(1);
  }
}

syncSubscription();
