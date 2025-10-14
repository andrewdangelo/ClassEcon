// Quick script to generate beta access codes
// Run this with: npm run generate-beta-code [CODE] [DESCRIPTION] [MAX_USES]
// Example: npm run generate-beta-code BETA2024 "Beta testing" 100

import { BetaAccessCode } from "../src/models/index";
import mongoose from "mongoose";
import "../src/db/connection";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/classecon";

async function generateBetaCode() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

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

    process.exit(0);
  } catch (error) {
    console.error("❌ Error generating beta code:", error);
    process.exit(1);
  }
}

generateBetaCode();
