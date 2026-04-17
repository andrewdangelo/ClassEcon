// scripts/check-subscription.ts
import "dotenv/config";
import mongoose from "mongoose";
import { SubscriptionRecord } from "../src/models/index.js";

async function checkSubscriptions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB (PaymentService)");

    const subscriptions = await SubscriptionRecord.find({});
    
    console.log(`\n=== Found ${subscriptions.length} subscriptions ===\n`);
    
    subscriptions.forEach(sub => {
      console.log(`User ID: ${sub.userId}`);
      console.log(`Tier: ${sub.tier}`);
      console.log(`Status: ${sub.status}`);
      console.log(`Stripe Customer ID: ${sub.stripeCustomerId}`);
      console.log(`Stripe Subscription ID: ${sub.stripeSubscriptionId}`);
      console.log(`Created: ${sub.createdAt}`);
      console.log(`---`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkSubscriptions();
