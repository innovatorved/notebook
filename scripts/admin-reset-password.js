/**
 * Admin Password Reset Script
 * Resets a user's password so they can log in
 * 
 * Usage: bun run scripts/admin-reset-password.js <email> <new-password>
 */

import { MongoClient, ObjectId } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const MONGO_URI = process.env.MONGO_API;
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
    console.log('Usage: bun run scripts/admin-reset-password.js <email> <new-password>');
    console.log('Example: bun run scripts/admin-reset-password.js user@example.com NewPass123');
    process.exit(1);
}

// better-auth password hashing (scrypt-based)
async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(salt + ':' + derivedKey.toString('hex'));
        });
    });
}

async function resetPassword() {
    const client = new MongoClient(MONGO_URI);

    try {
        console.log(`\nResetting password for: ${email}\n`);
        await client.connect();

        const dbName = new URL(MONGO_URI).pathname.slice(1) || 'prenotebook';
        const db = client.db(dbName);

        // Find user
        const user = await db.collection('user').findOne({ email });

        if (!user) {
            console.log('❌ User not found with that email');
            console.log('\nAvailable users:');
            const users = await db.collection('user').find({}).limit(10).toArray();
            users.forEach(u => console.log(`  - ${u.email}`));
            return;
        }

        console.log(`Found user: ${user.name} (${user.email})`);

        // Hash new password in better-auth format
        const hashedPassword = await hashPassword(newPassword);

        // Find or create account
        const userId = user._id;
        const existingAccount = await db.collection('account').findOne({
            userId: userId,
            providerId: 'credential'
        });

        if (existingAccount) {
            // Update existing account
            await db.collection('account').updateOne(
                { _id: existingAccount._id },
                { $set: { password: hashedPassword, updatedAt: new Date() } }
            );
            console.log('✓ Password updated in existing account');
        } else {
            // Create new account
            await db.collection('account').insertOne({
                _id: new ObjectId(),
                accountId: userId.toString(),
                providerId: 'credential',
                userId: userId,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('✓ Created new credential account');
        }

        console.log('\n✅ Password reset successful!');
        console.log(`\nLogin credentials:`);
        console.log(`  Email: ${email}`);
        console.log(`  Password: ${newPassword}`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.close();
    }
}

resetPassword();
