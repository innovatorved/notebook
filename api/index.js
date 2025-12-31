/**
 * Vercel Serverless API Handler
 * Handles all /api/* routes
 */

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { toNodeHandler } from "better-auth/node";
import { MongoClient, ObjectId } from "mongodb";

// MongoDB connection (cached for serverless)
let cachedClient = null;
let cachedDb = null;

async function getDb() {
    if (cachedDb) return cachedDb;

    const uri = process.env.MONGO_API;
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();

    const dbName = new URL(uri).pathname.slice(1) || 'notebook';
    cachedDb = cachedClient.db(dbName);
    return cachedDb;
}

// Create auth instance
let authInstance = null;

async function getAuth() {
    if (authInstance) return authInstance;

    const db = await getDb();

    authInstance = betterAuth({
        database: mongodbAdapter(db),
        baseURL: process.env.BETTER_AUTH_URL || 'https://notebook.vedgupta.in',
        basePath: '/api/auth',
        secret: process.env.BETTER_AUTH_SECRET,
        emailAndPassword: {
            enabled: true,
            autoSignIn: true,
            minPasswordLength: 6
        },
        session: {
            expiresIn: 60 * 60 * 24 * 7,
            updateAge: 60 * 60 * 24,
            cookieCache: { enabled: true, maxAge: 60 * 60 * 24 * 7 }
        },
        trustedOrigins: [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://notebook.vedgupta.in"
        ]
    });

    return authInstance;
}

// Main handler
export default async function handler(req, res) {
    const { url, method } = req;
    const path = url.split('?')[0];

    try {
        // Auth routes
        if (path.startsWith('/api/auth')) {
            const auth = await getAuth();
            return toNodeHandler(auth)(req, res);
        }

        // Health check
        if (path === '/api/health') {
            return res.json({ status: 'ok', timestamp: new Date().toISOString() });
        }

        const db = await getDb();
        const auth = await getAuth();

        // Notes API
        if (path === '/api/notes') {
            const session = await auth.api.getSession({ headers: req.headers });

            if (!session?.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (method === 'GET') {
                const notes = await db.collection('notes').find({ user: session.user.id }).toArray();
                return res.json(notes);
            }

            if (method === 'POST') {
                const { title, description, tag } = req.body;
                if (!title || title.length < 3 || !description || description.length < 10) {
                    return res.status(400).json({ error: 'Invalid note data' });
                }
                const note = {
                    user: session.user.id,
                    title,
                    description,
                    tag: tag || 'General',
                    share: false,
                    date: new Date()
                };
                const result = await db.collection('notes').insertOne(note);
                return res.json({ saveNote: { ...note, _id: result.insertedId } });
            }
        }

        // Notes with ID
        const notesMatch = path.match(/^\/api\/notes\/([a-f0-9]+)$/);
        if (notesMatch) {
            const noteId = notesMatch[1];
            const session = await auth.api.getSession({ headers: req.headers });

            if (!session?.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (method === 'PUT') {
                const { title, description, tag, share } = req.body;
                const result = await db.collection('notes').findOneAndUpdate(
                    { _id: new ObjectId(noteId), user: session.user.id },
                    { $set: { title, description, tag, share } },
                    { returnDocument: 'after' }
                );
                return res.json({ UpdateNote1: result });
            }

            if (method === 'DELETE') {
                await db.collection('notes').deleteOne({ _id: new ObjectId(noteId), user: session.user.id });
                return res.json({ success: true });
            }
        }

        // Shared notes (public)
        const sharedMatch = path.match(/^\/api\/notes\/shared\/([a-f0-9]+)$/);
        if (sharedMatch && method === 'GET') {
            const noteId = sharedMatch[1];
            const note = await db.collection('notes').findOne({ _id: new ObjectId(noteId), share: true });
            if (!note) {
                return res.json({ success: false, error: 'Note not found' });
            }
            return res.json({ success: true, mynote: note });
        }

        return res.status(404).json({ error: 'Not found' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
