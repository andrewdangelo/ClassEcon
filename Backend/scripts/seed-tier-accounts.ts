/**
 * Seed Script: Subscription Tier Test Accounts
 * 
 * Creates test accounts for each subscription tier with sample students and classes
 * 
 * Run with: pnpm seed-tiers
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";
import { Classroom } from "../src/models/Classroom";
import { Class } from "../src/models/Class";
import { Membership } from "../src/models/Membership";
import { Account } from "../src/models/Account";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/classecon";

// Test accounts configuration
const TEST_ACCOUNTS = [
  {
    tier: "FREE",
    teacher: {
      name: "Free Teacher",
      email: "teacher+free@test.com",
      password: "Test1234!",
    },
    students: [
      { name: "Alice Free", email: "alice+free@test.com" },
      { name: "Bob Free", email: "bob+free@test.com" },
      { name: "Charlie Free", email: "charlie+free@test.com" },
    ],
    className: "Free Tier Economics",
    subscriptionData: {
      subscriptionTier: "FREE",
      subscriptionStatus: "ACTIVE",
      isFoundingMember: false,
    },
  },
  {
    tier: "TRIAL",
    teacher: {
      name: "Trial Teacher",
      email: "teacher+trial@test.com",
      password: "Test1234!",
    },
    students: [
      { name: "Alice Trial", email: "alice+trial@test.com" },
      { name: "Bob Trial", email: "bob+trial@test.com" },
      { name: "Charlie Trial", email: "charlie+trial@test.com" },
      { name: "David Trial", email: "david+trial@test.com" },
      { name: "Eve Trial", email: "eve+trial@test.com" },
    ],
    className: "Trial Tier Economics",
    subscriptionData: {
      subscriptionTier: "TRIAL",
      subscriptionStatus: "TRIAL",
      trialStartedAt: new Date(),
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      isFoundingMember: false,
    },
  },
  {
    tier: "STARTER",
    teacher: {
      name: "Starter Teacher",
      email: "teacher+starter@test.com",
      password: "Test1234!",
    },
    students: [
      { name: "Alice Starter", email: "alice+starter@test.com" },
      { name: "Bob Starter", email: "bob+starter@test.com" },
      { name: "Charlie Starter", email: "charlie+starter@test.com" },
      { name: "David Starter", email: "david+starter@test.com" },
      { name: "Eve Starter", email: "eve+starter@test.com" },
      { name: "Frank Starter", email: "frank+starter@test.com" },
    ],
    className: "Starter Tier Economics",
    subscriptionData: {
      subscriptionTier: "STARTER",
      subscriptionStatus: "ACTIVE",
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isFoundingMember: false,
    },
  },
  {
    tier: "PROFESSIONAL",
    teacher: {
      name: "Professional Teacher",
      email: "teacher+pro@test.com",
      password: "Test1234!",
    },
    students: [
      { name: "Alice Pro", email: "alice+pro@test.com" },
      { name: "Bob Pro", email: "bob+pro@test.com" },
      { name: "Charlie Pro", email: "charlie+pro@test.com" },
      { name: "David Pro", email: "david+pro@test.com" },
      { name: "Eve Pro", email: "eve+pro@test.com" },
      { name: "Frank Pro", email: "frank+pro@test.com" },
      { name: "Grace Pro", email: "grace+pro@test.com" },
      { name: "Henry Pro", email: "henry+pro@test.com" },
    ],
    className: "Professional Tier Economics",
    subscriptionData: {
      subscriptionTier: "PROFESSIONAL",
      subscriptionStatus: "ACTIVE",
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isFoundingMember: false,
    },
  },
  {
    tier: "PROFESSIONAL_FOUNDING",
    teacher: {
      name: "Founding Member Teacher",
      email: "teacher+founding@test.com",
      password: "Test1234!",
    },
    students: [
      { name: "Alice Founding", email: "alice+founding@test.com" },
      { name: "Bob Founding", email: "bob+founding@test.com" },
      { name: "Charlie Founding", email: "charlie+founding@test.com" },
      { name: "David Founding", email: "david+founding@test.com" },
      { name: "Eve Founding", email: "eve+founding@test.com" },
    ],
    className: "Founding Member Economics",
    subscriptionData: {
      subscriptionTier: "PROFESSIONAL",
      subscriptionStatus: "ACTIVE",
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isFoundingMember: true, // 50% off pricing
    },
  },
  {
    tier: "SCHOOL",
    teacher: {
      name: "School Admin",
      email: "teacher+school@test.com",
      password: "Test1234!",
    },
    students: [
      { name: "Alice School", email: "alice+school@test.com" },
      { name: "Bob School", email: "bob+school@test.com" },
      { name: "Charlie School", email: "charlie+school@test.com" },
      { name: "David School", email: "david+school@test.com" },
      { name: "Eve School", email: "eve+school@test.com" },
      { name: "Frank School", email: "frank+school@test.com" },
      { name: "Grace School", email: "grace+school@test.com" },
      { name: "Henry School", email: "henry+school@test.com" },
      { name: "Ivy School", email: "ivy+school@test.com" },
      { name: "Jack School", email: "jack+school@test.com" },
    ],
    className: "School Tier Economics",
    subscriptionData: {
      subscriptionTier: "SCHOOL",
      subscriptionStatus: "ACTIVE",
      isFoundingMember: false,
    },
  },
];

async function seedTierAccounts() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n🗑️  Cleaning up existing test accounts...");
    
    // Delete existing test accounts
    await User.deleteMany({ 
      email: { 
        $regex: /@test\.com$/ 
      } 
    });
    
    await Classroom.deleteMany({
      name: { $regex: /Tier Economics|Founding Member Economics/ }
    });
    
    await Class.deleteMany({
      name: { $regex: /Tier Economics|Founding Member Economics/ }
    });

    console.log("✅ Cleanup complete");

    console.log("\n🌱 Creating test accounts for each tier...\n");

    for (const config of TEST_ACCOUNTS) {
      console.log(`📊 Creating ${config.tier} tier account...`);

      // Create teacher
      const passwordHash = await bcrypt.hash(config.teacher.password, 10);
      const teacher = await User.create({
        name: config.teacher.name,
        email: config.teacher.email,
        passwordHash,
        role: "TEACHER",
        status: "ACTIVE",
        hasBetaAccess: true,
        ...config.subscriptionData,
      });

      console.log(`   ✅ Teacher created: ${teacher.email}`);

      // Create students
      const students = [];
      for (const studentData of config.students) {
        const student = await User.create({
          name: studentData.name,
          email: studentData.email,
          passwordHash: await bcrypt.hash("Student123!", 10),
          role: "STUDENT",
          status: "ACTIVE",
          hasBetaAccess: true,
          subscriptionTier: "FREE", // Students inherit from class/teacher
          subscriptionStatus: "ACTIVE",
          isFoundingMember: false,
        });
        students.push(student);
      }

      console.log(`   ✅ ${students.length} students created`);

      // Create classroom
      const classroom = await Classroom.create({
        name: `${config.className} Classroom`,
        ownerId: teacher._id,
        settings: {
          currency: "CE$",
          overdraft: 0,
          transferAcrossClasses: false,
        },
      });

      console.log(`   ✅ Classroom created`);

      // Create class
      const classDoc = await Class.create({
        classroomId: classroom._id,
        name: config.className,
        slug: config.className.toLowerCase().replace(/\s+/g, "-"),
        description: `Test class for ${config.tier} tier subscription`,
        subject: "Economics",
        period: "1",
        gradeLevel: 10,
        joinCode: `${config.tier}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        schoolName: "Test School",
        district: "Test District",
        payPeriodDefault: "WEEKLY",
        startingBalance: 100,
        teacherIds: [teacher._id],
        defaultCurrency: "CE$",
        status: "ACTIVE",
        isArchived: false,
      });

      console.log(`   ✅ Class created: ${classDoc.name} (Join Code: ${classDoc.joinCode})`);

      // Create memberships
      await Membership.create({
        userId: teacher._id,
        classId: [classDoc._id],
        role: "TEACHER",
        status: "ACTIVE",
      });

      for (const student of students) {
        await Membership.create({
          userId: student._id,
          classId: [classDoc._id],
          role: "STUDENT",
          status: "ACTIVE",
        });

        // Create account for each student
        await Account.create({
          studentId: student._id,
          classId: classDoc._id,
          classroomId: classroom._id,
          balance: 100,
        });
      }

      console.log(`   ✅ Memberships and accounts created`);
      console.log(`   📝 Join Code: ${classDoc.joinCode}\n`);
    }

    console.log("\n✅ All test accounts created successfully!\n");
    console.log("=" .repeat(70));
    console.log("📋 TEST ACCOUNT CREDENTIALS");
    console.log("=" .repeat(70));
    console.log("\nAll passwords: Test1234!");
    console.log("Student passwords: Student123!\n");

    console.log("TEACHER ACCOUNTS:");
    console.log("-" .repeat(70));
    TEST_ACCOUNTS.forEach((config) => {
      const badge = config.subscriptionData.isFoundingMember ? " [FOUNDING MEMBER]" : "";
      console.log(`\n${config.tier}${badge}:`);
      console.log(`  Email:    ${config.teacher.email}`);
      console.log(`  Password: ${config.teacher.password}`);
      console.log(`  Tier:     ${config.subscriptionData.subscriptionTier}`);
      console.log(`  Status:   ${config.subscriptionData.subscriptionStatus}`);
      if (config.subscriptionData.trialEndsAt) {
        console.log(`  Trial:    ${config.subscriptionData.trialEndsAt.toLocaleDateString()}`);
      }
      console.log(`  Students: ${config.students.length}`);
    });

    console.log("\n\nSTUDENT ACCOUNTS (Sample - all follow same pattern):");
    console.log("-" .repeat(70));
    console.log("\nPattern: alice+[tier]@test.com, bob+[tier]@test.com, etc.");
    console.log("Password: Student123! (for all students)");
    console.log("\nExample logins:");
    console.log("  alice+free@test.com");
    console.log("  bob+trial@test.com");
    console.log("  charlie+starter@test.com");
    console.log("  david+pro@test.com");
    console.log("  eve+founding@test.com");
    console.log("  frank+school@test.com");

    console.log("\n" + "=" .repeat(70));
    console.log("\n🎯 Test each tier by logging in with the corresponding teacher account");
    console.log("🎓 Test student views by logging in with student accounts");
    console.log("🔗 Navigate to /dev/tier-testing to verify tiers are set correctly\n");

  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the seed script
seedTierAccounts();
