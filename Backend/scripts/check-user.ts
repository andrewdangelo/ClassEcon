// scripts/check-user.ts
import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";
import { connectMongo } from "../src/db/connection.js";

async function checkUser() {
  try {
    await connectMongo(process.env.DATABASE_URL!);
    console.log("Connected to MongoDB");
    console.log("Database:", mongoose.connection.db?.databaseName);

    // First, list all users to find the right one
    const allUsers = await User.find({}).select('email name role subscriptionTier stripeCustomerId');
    console.log(`\n=== Found ${allUsers.length} users ===`);
    allUsers.forEach(u => {
      console.log(`${u.email || 'No email'} - ${u.name} (${u.role}) - ${u.subscriptionTier} - Stripe: ${u.stripeCustomerId || 'none'}`);
    });

    const email = "teacher+carter@demo.school";
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`\nUser ${email} not found in database`);
      process.exit(1);
    }

    console.log("\n=== User Data ===");
    console.log(`ID: ${user._id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`\n=== Subscription Info ===`);
    console.log(`Tier: ${user.subscriptionTier}`);
    console.log(`Status: ${user.subscriptionStatus}`);
    console.log(`Stripe Customer ID: ${user.stripeCustomerId || "Not set"}`);
    console.log(`Stripe Subscription ID: ${user.stripeSubscriptionId || "Not set"}`);
    console.log(`Expires At: ${user.subscriptionExpiresAt || "Not set"}`);
    console.log(`Trial Ends At: ${user.trialEndsAt || "Not set"}`);
    console.log(`Founding Member: ${user.isFoundingMember}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkUser();
