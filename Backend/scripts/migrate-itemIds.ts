/**
 * Migration script to add itemId to existing Purchase documents
 * Run this with: npx tsx scripts/migrate-itemIds.ts
 */

import { Purchase } from "../src/models";
import { connectMongo } from "../src/db/connection";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function migrateItemIds() {
  try {
    console.log("Connecting to database...");
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/classecon";
    await connectMongo(mongoUri);
    console.log("Connected to database");

    // Find all purchases without itemId
    const purchasesWithoutItemId = await Purchase.find({
      $or: [
        { itemId: { $exists: false } },
        { itemId: null }
      ]
    }).exec();

    console.log(`Found ${purchasesWithoutItemId.length} purchases without itemId`);

    if (purchasesWithoutItemId.length === 0) {
      console.log("No migration needed - all purchases already have itemId");
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    for (const purchase of purchasesWithoutItemId) {
      try {
        // Generate a unique itemId
        const itemId = `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        purchase.itemId = itemId;
        await purchase.save();
        
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`Migrated ${successCount} purchases...`);
        }
      } catch (error: any) {
        console.error(`Error migrating purchase ${purchase._id}:`, error.message);
        errorCount++;
      }
    }

    console.log("\n=== Migration Complete ===");
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total processed: ${purchasesWithoutItemId.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateItemIds();
