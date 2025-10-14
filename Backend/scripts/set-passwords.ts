/* scripts/set-passwords.ts
 * Set passwords for seeded test users
 * Run with:
 *   pnpm run set-passwords
 */

import "dotenv/config";
import { connectMongo } from "../src/db/connection";
import { User } from "../src/models/index";
import bcrypt from "bcryptjs";

interface UserPassword {
  email: string;
  password: string;
  name: string;
}

// Default test passwords
const TEST_USERS: UserPassword[] = [
  {
    email: "teacher+carter@demo.school",
    password: "password123",
    name: "Ms. Carter",
  },
  {
    email: "teacher+lee@demo.school",
    password: "password123",
    name: "Mr. Lee",
  },
];

// Student accounts - you can add emails and passwords for them
const STUDENT_ACCOUNTS: Array<{ name: string; email?: string; password?: string }> = [
  { name: "Ava", email: "student+ava@demo.school", password: "student123" },
  { name: "Liam", email: "student+liam@demo.school", password: "student123" },
  { name: "Noah", email: "student+noah@demo.school", password: "student123" },
  { name: "Olivia", email: "student+olivia@demo.school", password: "student123" },
  { name: "Mason", email: "student+mason@demo.school", password: "student123" },
  { name: "Sophia", email: "student+sophia@demo.school", password: "student123" },
  { name: "Emma", email: "student+emma@demo.school", password: "student123" },
  { name: "Lucas", email: "student+lucas@demo.school", password: "student123" },
  { name: "Isabella", email: "student+isabella@demo.school", password: "student123" },
  { name: "Ethan", email: "student+ethan@demo.school", password: "student123" },
  { name: "Mia", email: "student+mia@demo.school", password: "student123" },
  { name: "Alexander", email: "student+alexander@demo.school", password: "student123" },
  { name: "Charlotte", email: "student+charlotte@demo.school", password: "student123" },
  { name: "James", email: "student+james@demo.school", password: "student123" },
  { name: "Amelia", email: "student+amelia@demo.school", password: "student123" },
  { name: "Benjamin", email: "student+benjamin@demo.school", password: "student123" },
  { name: "Harper", email: "student+harper@demo.school", password: "student123" },
  { name: "William", email: "student+william@demo.school", password: "student123" },
];

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function setUserPassword(email: string, password: string, name: string) {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`⚠️  User not found: ${email} (${name})`);
      return false;
    }

    const passwordHash = await hashPassword(password);
    await User.updateOne(
      { email },
      { $set: { passwordHash } }
    );
    
    console.log(`✅ Password set for: ${email} (${name})`);
    return true;
  } catch (error) {
    console.error(`❌ Error setting password for ${email}:`, error);
    return false;
  }
}

async function setStudentEmailAndPassword(name: string, email: string, password: string) {
  try {
    const user = await User.findOne({ name, role: "STUDENT" });
    
    if (!user) {
      console.log(`⚠️  Student not found: ${name}`);
      return false;
    }

    const passwordHash = await hashPassword(password);
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          email,
          passwordHash 
        } 
      }
    );
    
    console.log(`✅ Email and password set for student: ${name} → ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error setting credentials for ${name}:`, error);
    return false;
  }
}

async function run() {
  await connectMongo(process.env.DATABASE_URL!);

  console.log("🔐 Setting passwords for test users...\n");

  // Set passwords for teachers
  console.log("👩‍🏫 Teachers:");
  for (const user of TEST_USERS) {
    await setUserPassword(user.email, user.password, user.name);
  }

  // Set emails and passwords for students
  console.log("\n👨‍🎓 Students:");
  for (const student of STUDENT_ACCOUNTS) {
    if (student.email && student.password) {
      await setStudentEmailAndPassword(student.name, student.email, student.password);
    }
  }

  console.log("\n✅ Password setup complete!\n");
  console.log("📋 Login Credentials:\n");
  console.log("Teachers:");
  for (const user of TEST_USERS) {
    console.log(`  - ${user.email} / ${user.password}`);
  }
  console.log("\nStudents (examples):");
  console.log(`  - student+ava@demo.school / student123`);
  console.log(`  - student+liam@demo.school / student123`);
  console.log(`  - student+noah@demo.school / student123`);
  console.log(`  - (All students use 'student123' as password)`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
