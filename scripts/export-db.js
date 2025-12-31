/**
 * MongoDB Database Export Script (Node.js version)
 * Exports all collections to JSON files for backup
 * 
 * Usage: node scripts/export-db.js
 */

import { MongoClient } from 'mongodb';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const MONGO_URI = process.env.MONGO_API;

if (!MONGO_URI) {
    console.error('Error: MONGO_API environment variable not set');
    process.exit(1);
}

async function exportDatabase() {
    const client = new MongoClient(MONGO_URI);

    try {
        console.log('=== MongoDB Database Export ===\n');
        console.log('Connecting to MongoDB...');
        await client.connect();

        // Get database name from URI or use default
        const dbName = new URL(MONGO_URI).pathname.slice(1) || 'prenotebook';
        const db = client.db(dbName);

        // Create backup directory with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const backupDir = join(dirname(fileURLToPath(import.meta.url)), 'backups', timestamp);

        if (!existsSync(backupDir)) {
            mkdirSync(backupDir, { recursive: true });
        }

        console.log(`Backup directory: ${backupDir}\n`);

        // Get all collection names
        const collections = await db.listCollections().toArray();
        console.log(`Found ${collections.length} collections:\n`);

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`  Exporting '${collectionName}'...`);

            const collection = db.collection(collectionName);
            const documents = await collection.find({}).toArray();

            const filePath = join(backupDir, `${collectionName}.json`);
            writeFileSync(filePath, JSON.stringify(documents, null, 2));

            console.log(`    ✓ Exported ${documents.length} documents`);
        }

        console.log('\n=== Export Complete ===');
        console.log(`Backup saved to: ${backupDir}`);

    } catch (error) {
        console.error('Export failed:', error.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

exportDatabase();
