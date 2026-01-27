/**
 * Seed an Application Admin user
 * 
 * Usage: pnpm run seed-admin
 *   or: pnpm run seed-admin [email] [password] [name]
 * 
 * Default credentials:
 *   Email: admin@classecon.app
 *   Password: AdminPassword123!
 *   Name: System Admin
 */

import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models";
import { authClient } from "../src/services/auth-client";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

async function seedAdmin() {
  const args = process.argv.slice(2);
  
  const email = args[0] || "admin@classecon.app";
  const password = args[1] || "AdminPassword123!";
  const name = args[2] || "System Admin";

  console.log("🔐 Seeding Application Admin...\n");

  try {
    // Connect to MongoDB
    await mongoose.connect(DATABASE_URL, { dbName: "classroomecon" });
    console.log("✅ Connected to MongoDB\n");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email, role: "ADMIN" });
    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists: ${email}`);
      console.log(`   ID: ${existingAdmin._id}`);
      console.log(`   Status: ${existingAdmin.status}`);
      
      // Optionally update password
      if (args[1]) {
        console.log("\n🔄 Updating password...");
        const passwordHash = await authClient.hashPassword(password);
        existingAdmin.passwordHash = passwordHash;
        await existingAdmin.save();
        console.log("✅ Password updated!");
      }
      
      await mongoose.disconnect();
      return;
    }

    // Hash password via auth service
    console.log("🔑 Hashing password via AuthService...");
    const passwordHash = await authClient.hashPassword(password);

    // Create admin user
    const admin = await User.create({
      role: "ADMIN",
      name,
      email,
      passwordHash,
      status: "ACTIVE",
      hasBetaAccess: true,
      subscriptionTier: "SCHOOL",
      subscriptionStatus: "ACTIVE",
      isFoundingMember: true,
    });

    console.log("\n🎉 Admin user created successfully!\n");
    console.log("═══════════════════════════════════════════════════");
    console.log("  📋 Admin Credentials");
    console.log("═══════════════════════════════════════════════════");
    console.log(`  Name:     ${name}`);
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role:     ADMIN`);
    console.log(`  ID:       ${admin._id}`);
    console.log("═══════════════════════════════════════════════════\n");
    console.log("⚠️  IMPORTANT: Change this password in production!\n");

    await mongoose.disconnect();
    console.log("✅ Done!");
  } catch (error: any) {
    console.error("❌ Error seeding admin:", error.message);
    
    if (error.message.includes("ECONNREFUSED") || error.message.includes("fetch")) {
      console.error("\n💡 Make sure AuthService is running:");
      console.error("   cd AuthService && pnpm dev\n");
    }
    
    process.exit(1);
  }
}

seedAdmin();
