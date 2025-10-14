// Quick script to generate beta access codes
// Run this with: npm run generate-beta-code [CODE] [DESCRIPTION] [MAX_USES]
// Example: npm run generate-beta-code BETA2024 "Beta testing" 100

import { BetaAccessCode } from "../src/models/index";
import { connectMongo } from "../src/db/connection";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function generateBetaCode() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.DATABASE_URL || "mongodb://localhost:27017/classecon";
    console.log(`📡 Connecting to MongoDB at ${mongoUri}...`);
    await connectMongo(mongoUri);
    console.log("✅ Connected to MongoDB");
    console.log("✅ Generating beta access code...");

    // Get code from command line argument or use default
    const code = process.argv[2] || "BETA2024";
    const description = process.argv[3] || "Generated beta access code";
    const maxUses = parseInt(process.argv[4]) || 10;

    // Check if code already exists
    const existing = await BetaAccessCode.findOne({ code: code.toUpperCase() });
    if (existing) {
      console.log(`❌ Code "${code}" already exists!`);
      process.exit(1);
    }

    // Create the code
    const betaCode = await BetaAccessCode.create({
      code: code.toUpperCase(),
      description,
      maxUses,
      currentUses: 0,
      isActive: true,
      usedBy: [],
    });

    console.log("\n🎉 Beta access code created successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📋 Code: ${betaCode.code}`);
    console.log(`📝 Description: ${betaCode.description}`);
    console.log(`🔢 Max Uses: ${betaCode.maxUses}`);
    console.log(`📅 Created: ${betaCode.createdAt}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error generating beta code:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

generateBetaCode();
