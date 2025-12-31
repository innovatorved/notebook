/**
 * Better-Auth Server Configuration
 * Handles authentication with MongoDB adapter
 */

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// MongoDB client - singleton
let client = null;
let db = null;

export async function getMongoClient() {
    if (!client) {
        const uri = process.env.MONGO_API;
        if (!uri) {
            throw new Error('MONGO_API environment variable is not set');
        }
        client = new MongoClient(uri);
        await client.connect();
        console.log('✓ Connected to MongoDB');
    }
    return client;
}

export async function getDb() {
    if (!db) {
        const mongoClient = await getMongoClient();
        const uri = process.env.MONGO_API;
        const dbName = new URL(uri).pathname.slice(1) || 'prenotebook';
        db = mongoClient.db(dbName);
    }
    return db;
}

// Create auth instance lazily
let authInstance = null;

export async function getAuth() {
    if (!authInstance) {
        const mongoClient = await getMongoClient();

        authInstance = betterAuth({
            database: mongodbAdapter(mongoClient),
            baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
            basePath: '/api/auth',
            secret: process.env.BETTER_AUTH_SECRET,

            // Enable email/password authentication
            emailAndPassword: {
                enabled: true,
                autoSignIn: true,
                minPasswordLength: 6
            },

            // Session configuration  
            session: {
                cookieCache: {
                    enabled: true,
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                },
                expiresIn: 60 * 60 * 24 * 7, // 7 days
                updateAge: 60 * 60 * 24 // 1 day
            },

            // User fields configuration
            user: {
                additionalFields: {
                    username: {
                        type: "string",
                        required: false
                    }
                }
            },

            // Trust the host header (for proxies)
            trustedOrigins: [
                "http://localhost:3000",
                "http://localhost:5173",
                process.env.BETTER_AUTH_URL
            ].filter(Boolean)
        });
    }
    return authInstance;
}

// Export the auth instance getter
export const auth = {
    getAuth
};
