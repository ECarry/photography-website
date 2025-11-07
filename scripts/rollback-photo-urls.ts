#!/usr/bin/env bun
/**
 * Rollback script for photo URL cleanup
 * Restores original URLs from backup file
 */

import "dotenv/config";
import { db } from "../src/db";
import { photos } from "../src/db/schema";
import { sql } from "drizzle-orm";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Check environment variables
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set");
  console.log("💡 Please check your .env file and make sure DATABASE_URL is configured");
  console.log("📝 Example: DATABASE_URL=postgresql://user:password@host:port/database");
  process.exit(1);
}

const BACKUP_FILE = join(process.cwd(), "scripts", "photo-urls-backup.json");

interface PhotoBackup {
  id: string;
  originalUrl: string;
  cleanedUrl: string;
  title: string;
}

async function rollbackPhotoUrls() {
  console.log("🔄 Starting photo URL rollback...");
  
  if (!existsSync(BACKUP_FILE)) {
    console.error("❌ Backup file not found:", BACKUP_FILE);
    console.log("💡 Make sure you have run the cleanup script first to create a backup");
    process.exit(1);
  }

  try {
    const backup: PhotoBackup[] = JSON.parse(readFileSync(BACKUP_FILE, 'utf-8'));
    console.log(`📋 Found backup with ${backup.length} photos`);

    // Show some examples
    console.log("\n📋 Examples of URLs to be restored:");
    backup.slice(0, 3).forEach((photo, index) => {
      console.log(`${index + 1}. "${photo.title}"`);
      console.log(`   Current: ${photo.cleanedUrl}`);
      console.log(`   Restore: ${photo.originalUrl}`);
    });

    console.log(`\n⚠️  This will restore ${backup.length} photo URLs to their original state`);
    console.log("Press Enter to continue or Ctrl+C to cancel...");
    
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });

    console.log("🔄 Restoring photo URLs...");

    // Restore URLs using a batch update for better performance
    let restored = 0;
    for (const photo of backup) {
      const result = await db.execute(
        sql`
          UPDATE photos 
          SET url = ${photo.originalUrl},
              updated_at = NOW()
          WHERE id = ${photo.id}
        `
      );
      if (result.rowCount && result.rowCount > 0) {
        restored++;
      }
    }

    console.log(`✅ Successfully restored ${restored} photo URLs`);

    // Verify restoration
    const restoredPhotos = await db
      .select({
        id: photos.id,
        url: photos.url,
        title: photos.title,
      })
      .from(photos)
      .where(sql`${photos.url} LIKE 'https://photograph.ecarry.uk/%'`);

    console.log(`🔍 Verification: ${restoredPhotos.length} photos now have the original domain prefix`);

  } catch (error) {
    console.error("❌ Error during rollback:", error);
    process.exit(1);
  }
}

rollbackPhotoUrls()
  .then(() => {
    console.log("\n🏁 Rollback completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Rollback failed:", error);
    process.exit(1);
  });
