// scripts/create-stripe-prices.ts
import Stripe from "stripe";
import * as dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover" as Stripe.LatestApiVersion,
});

async function createPrices() {
  console.log("🎯 Creating Stripe Products and Prices...\n");

  try {
    // Create Starter Product
    console.log("Creating Starter product...");
    const starterProduct = await stripe.products.create({
      name: "ClassEcon Starter",
      description: "Perfect for individual teachers just getting started",
      metadata: { tier: "STARTER" },
    });

    const starterMonthly = await stripe.prices.create({
      product: starterProduct.id,
      currency: "usd",
      unit_amount: 900, // $9.00
      recurring: { interval: "month", trial_period_days: 14 },
      metadata: { tier: "STARTER", interval: "monthly" },
    });

    const starterYearly = await stripe.prices.create({
      product: starterProduct.id,
      currency: "usd",
      unit_amount: 9000, // $90.00
      recurring: { interval: "year", trial_period_days: 14 },
      metadata: { tier: "STARTER", interval: "yearly" },
    });

    console.log(`✓ Starter Monthly: ${starterMonthly.id}`);
    console.log(`✓ Starter Yearly: ${starterYearly.id}\n`);

    // Create Professional Product
    console.log("Creating Professional product...");
    const professionalProduct = await stripe.products.create({
      name: "ClassEcon Professional",
      description: "Best for teachers who want the full experience",
      metadata: { tier: "PROFESSIONAL" },
    });

    const professionalMonthly = await stripe.prices.create({
      product: professionalProduct.id,
      currency: "usd",
      unit_amount: 1900, // $19.00
      recurring: { interval: "month", trial_period_days: 14 },
      metadata: { tier: "PROFESSIONAL", interval: "monthly" },
    });

    const professionalYearly = await stripe.prices.create({
      product: professionalProduct.id,
      currency: "usd",
      unit_amount: 19000, // $190.00
      recurring: { interval: "year", trial_period_days: 14 },
      metadata: { tier: "PROFESSIONAL", interval: "yearly" },
    });

    console.log(`✓ Professional Monthly: ${professionalMonthly.id}`);
    console.log(`✓ Professional Yearly: ${professionalYearly.id}\n`);

    // Create School Product (custom pricing, but we'll create a placeholder)
    console.log("Creating School product...");
    const schoolProduct = await stripe.products.create({
      name: "ClassEcon School",
      description: "For schools and districts with multiple teachers",
      metadata: { tier: "SCHOOL" },
    });

    const schoolMonthly = await stripe.prices.create({
      product: schoolProduct.id,
      currency: "usd",
      unit_amount: 0, // Custom pricing
      recurring: { interval: "month" },
      metadata: { tier: "SCHOOL", interval: "monthly" },
    });

    const schoolYearly = await stripe.prices.create({
      product: schoolProduct.id,
      currency: "usd",
      unit_amount: 0, // Custom pricing
      recurring: { interval: "year" },
      metadata: { tier: "SCHOOL", interval: "yearly" },
    });

    console.log(`✓ School Monthly: ${schoolMonthly.id}`);
    console.log(`✓ School Yearly: ${schoolYearly.id}\n`);

    // Print environment variables
    console.log("📋 Add these to your PaymentService/.env file:\n");
    console.log(`STRIPE_PRICE_STARTER_MONTHLY=${starterMonthly.id}`);
    console.log(`STRIPE_PRICE_STARTER_YEARLY=${starterYearly.id}`);
    console.log(`STRIPE_PRICE_PROFESSIONAL_MONTHLY=${professionalMonthly.id}`);
    console.log(`STRIPE_PRICE_PROFESSIONAL_YEARLY=${professionalYearly.id}`);
    console.log(`STRIPE_PRICE_SCHOOL_MONTHLY=${schoolMonthly.id}`);
    console.log(`STRIPE_PRICE_SCHOOL_YEARLY=${schoolYearly.id}`);
    console.log("\n✅ All products and prices created successfully!");
  } catch (error) {
    console.error("❌ Error creating prices:", error);
    process.exit(1);
  }
}

createPrices();
