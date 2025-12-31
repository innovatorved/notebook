/**
 * User Migration Script
 * Migrates existing users from old JWT/bcrypt system to better-auth
 * 
 * Usage: node scripts/migrate-users.js
 */

import { MongoClient } from 'mongodb';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
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

async function migrateUsers() {
    const client = new MongoClient(MONGO_URI);

    try {
        console.log('=== User Migration Script ===\n');
        console.log('Connecting to MongoDB...');
        await client.connect();

        // Get database
        const dbName = new URL(MONGO_URI).pathname.slice(1) || 'prenotebook';
        const db = client.db(dbName);

        console.log(`Database: ${dbName}\n`);

        // Check for existing users in old collection (mongoose 'users' collection)
        // The old mongoose model 'User' creates collection named 'users'
        const oldUsers = await db.collection('users').find({
            // Old mongoose users have password field but no 'id' field
            password: { $exists: true },
            id: { $exists: false }
        }).toArray();
        console.log(`Found ${oldUsers.length} users in old 'users' collection\n`);

        if (oldUsers.length === 0) {
            console.log('No users to migrate. Exiting.');
            return;
        }

        // Create backup
        const backupDir = join(dirname(fileURLToPath(import.meta.url)), 'backups');
        if (!existsSync(backupDir)) {
            mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        writeFileSync(
            join(backupDir, `users_backup_${timestamp}.json`),
            JSON.stringify(oldUsers, null, 2)
        );
        console.log('✓ Created backup of existing users\n');

        // Migrate each user
        let migrated = 0;
        let skipped = 0;

        for (const oldUser of oldUsers) {
            // Check if user already exists in better-auth's user collection by email
            const existingUser = await db.collection('user').findOne({
                email: oldUser.email,
                id: { $exists: true } // better-auth users have 'id' field
            });

            if (existingUser) {
                console.log(`  Skipping ${oldUser.email} - already migrated`);
                skipped++;
                continue;
            }

            // Create new better-auth compatible user
            const newUserId = crypto.randomUUID();

            // Create user entry (better-auth format)
            const betterAuthUser = {
                id: newUserId,
                name: oldUser.name,
                email: oldUser.email,
                emailVerified: true,
                image: null,
                createdAt: oldUser.date || new Date(),
                updatedAt: new Date()
            };

            // Create account entry for email/password auth
            const betterAuthAccount = {
                id: crypto.randomUUID(),
                userId: newUserId,
                accountId: newUserId,
                providerId: 'credential',
                password: oldUser.password, // Already bcrypt hashed - better-auth uses same format!
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Insert into better-auth collections
            await db.collection('user').insertOne(betterAuthUser);
            await db.collection('account').insertOne(betterAuthAccount);

            // Update notes to use new user ID
            await db.collection('notes').updateMany(
                { user: oldUser._id.toString() },
                { $set: { user: newUserId } }
            );

            console.log(`  ✓ Migrated ${oldUser.email} (${oldUser.name})`);
            migrated++;
        }

        console.log(`\n=== Migration Complete ===`);
        console.log(`Migrated: ${migrated} users`);
        console.log(`Skipped:  ${skipped} users (already migrated)`);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

migrateUsers();
