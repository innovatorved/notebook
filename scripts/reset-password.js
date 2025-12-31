/**
 * Database Check and Password Reset Script
 * Usage: bun run scripts/reset-password.js <email> <new-password>
 */

import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const MONGO_URI = process.env.MONGO_API;

if (!MONGO_URI) {
    console.error('Error: MONGO_API not set');
    process.exit(1);
}

// Get args
const email = process.argv[2];
const newPassword = process.argv[3];

async function main() {
    const client = new MongoClient(MONGO_URI);

    try {
        console.log('=== Database Check & Password Reset ===\n');
        await client.connect();

        const dbName = new URL(MONGO_URI).pathname.slice(1) || 'prenotebook';
        const db = client.db(dbName);

        console.log(`Database: ${dbName}\n`);

        // Check collections
        const collections = await db.listCollections().toArray();
        console.log('Collections:');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`  - ${col.name}: ${count} documents`);
        }

        // Check better-auth user collection
        console.log('\n--- Better-Auth Users (with id field) ---');
        const betterAuthUsers = await db.collection('user').find({ id: { $exists: true } }).toArray();
        console.log(`Found ${betterAuthUsers.length} better-auth users`);

        if (betterAuthUsers.length > 0) {
            console.log('\nSample users:');
            betterAuthUsers.slice(0, 5).forEach(u => {
                console.log(`  - ${u.email} (${u.name})`);
            });
        }

        // Check account collection
        console.log('\n--- Accounts ---');
        const accounts = await db.collection('account').find({}).toArray();
        console.log(`Found ${accounts.length} accounts`);

        // If email provided, reset password
        if (email && newPassword) {
            console.log(`\n--- Resetting Password for ${email} ---`);

            // Find user
            const user = await db.collection('user').findOne({ email, id: { $exists: true } });

            if (!user) {
                console.log('User not found in better-auth users!');

                // Check if in old users
                const oldUser = await db.collection('users').findOne({ email });
                if (oldUser) {
                    console.log('Found in old users collection - migration may not have run or failed for this user');
                }
                return;
            }

            console.log(`Found user: ${user.name} (${user.id})`);

            // Hash new password using bcrypt (same as better-auth)
            const bcrypt = await import('bcrypt');
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password in account collection
            const result = await db.collection('account').updateOne(
                { userId: user.id, providerId: 'credential' },
                { $set: { password: hashedPassword, updatedAt: new Date() } }
            );

            if (result.modifiedCount > 0) {
                console.log('✓ Password updated successfully!');
                console.log(`\nNew credentials:`);
                console.log(`  Email: ${email}`);
                console.log(`  Password: ${newPassword}`);
            } else {
                // Check if account exists
                const account = await db.collection('account').findOne({ userId: user.id });
                if (!account) {
                    console.log('No account found - creating new account entry...');
                    await db.collection('account').insertOne({
                        id: crypto.randomUUID(),
                        userId: user.id,
                        accountId: user.id,
                        providerId: 'credential',
                        password: hashedPassword,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    console.log('✓ Account created with new password!');
                    console.log(`\nNew credentials:`);
                    console.log(`  Email: ${email}`);
                    console.log(`  Password: ${newPassword}`);
                } else {
                    console.log('Account found but password not updated - check providerId');
                    console.log('Account:', account);
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

main();
