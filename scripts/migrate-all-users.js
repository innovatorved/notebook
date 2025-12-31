/**
 * Complete User Migration Script
 * Migrates ALL users from old system to better-auth with proper notes update
 */

import { MongoClient, ObjectId } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const MONGO_URI = process.env.MONGO_API;

async function migrateAllUsers() {
    const client = new MongoClient(MONGO_URI);

    try {
        console.log('=== Complete User Migration ===\n');
        await client.connect();

        const dbName = new URL(MONGO_URI).pathname.slice(1) || 'prenotebook';
        const db = client.db(dbName);

        // Get all old users from 'users' collection (Mongoose format)
        const oldUsers = await db.collection('users').find({
            password: { $exists: true }
        }).toArray();

        console.log(`Found ${oldUsers.length} users to migrate\n`);

        let migrated = 0;
        let skipped = 0;
        let notesUpdated = 0;

        for (const oldUser of oldUsers) {
            // Check if already migrated (has entry in 'user' collection with email)
            const existingBetterAuthUser = await db.collection('user').findOne({
                email: oldUser.email
            });

            if (existingBetterAuthUser) {
                // User exists - just update notes to point to their new ID
                const notesResult = await db.collection('notes').updateMany(
                    { user: oldUser._id },
                    { $set: { user: existingBetterAuthUser._id.toString() } }
                );

                if (notesResult.modifiedCount > 0) {
                    console.log(`  ✓ Updated ${notesResult.modifiedCount} notes for ${oldUser.email}`);
                    notesUpdated += notesResult.modifiedCount;
                }
                skipped++;
                continue;
            }

            // Create new better-auth user via signup-style insert
            const newUserId = new ObjectId();

            // Insert user in better-auth format
            await db.collection('user').insertOne({
                _id: newUserId,
                name: oldUser.name,
                email: oldUser.email,
                emailVerified: false,
                createdAt: oldUser.date || new Date(),
                updatedAt: new Date()
            });

            // Create account with a temporary password marker
            // Users will need to use "forgot password" or sign up again
            await db.collection('account').insertOne({
                _id: new ObjectId(),
                accountId: newUserId.toString(),
                providerId: 'credential',
                userId: newUserId,
                password: 'NEEDS_RESET:' + oldUser.password, // Mark for reset
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Update notes to point to new user ID
            const notesResult = await db.collection('notes').updateMany(
                { user: oldUser._id },
                { $set: { user: newUserId.toString() } }
            );

            console.log(`  ✓ Migrated ${oldUser.email} (${oldUser.name}) - ${notesResult.modifiedCount} notes`);
            migrated++;
            notesUpdated += notesResult.modifiedCount;
        }

        console.log('\n=== Migration Complete ===');
        console.log(`Migrated: ${migrated} new users`);
        console.log(`Skipped: ${skipped} (already migrated)`);
        console.log(`Notes updated: ${notesUpdated}`);
        console.log('\n⚠️  Note: Migrated users need to reset their password or sign up again!');

    } finally {
        await client.close();
    }
}

migrateAllUsers().catch(console.error);
