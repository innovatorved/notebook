import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { toNodeHandler } from "better-auth/node";
import { MongoClient } from "mongodb";

// Load env
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// MongoDB Connection
const mongoClient = new MongoClient(process.env.MONGO_API);
await mongoClient.connect();
console.log('✓ Connected to MongoDB');

const dbName = process.env.DB_NAME || 'prenotebook';
const db = mongoClient.db(dbName);

// Initialize Better-Auth
const auth = betterAuth({
    database: mongodbAdapter(db),
    baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${PORT}`,
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
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 7
        }
    },
    trustedOrigins: [
        `http://localhost:${PORT}`,
        "http://localhost:5173",
        "https://notebook.vedgupta.in"
    ]
});

// Create Express app
const app = express();
app.use(express.json());

// Logging
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        console.log(`${req.method} ${req.path}`);
    }
    next();
});

// Mount better-auth handler on /api/auth/*
const authHandler = toNodeHandler(auth);
app.all(/^\/api\/auth(\/.*)?$/, (req, res) => authHandler(req, res));

// Notes API
app.get('/api/notes', async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const notes = await db.collection('notes').find({ user: session.user.id }).toArray();
        res.json(notes);
    } catch (err) {
        console.error('Notes error:', err);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

app.post('/api/notes', async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
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
        res.json({ saveNote: { ...note, _id: result.insertedId } });
    } catch (err) {
        console.error('Create error:', err);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

app.put('/api/notes/:id', async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { title, description, tag, share } = req.body;
        const { ObjectId } = await import('mongodb');
        const result = await db.collection('notes').findOneAndUpdate(
            { _id: new ObjectId(req.params.id), user: session.user.id },
            { $set: { title, description, tag, share } },
            { returnDocument: 'after' }
        );
        if (!result) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json({ UpdateNote1: result });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

app.delete('/api/notes/:id', async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { ObjectId } = await import('mongodb');
        await db.collection('notes').deleteOne({ _id: new ObjectId(req.params.id), user: session.user.id });
        res.json({ success: true });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

app.get('/api/notes/shared/:id', async (req, res) => {
    try {
        const { ObjectId } = await import('mongodb');
        const note = await db.collection('notes').findOne({ _id: new ObjectId(req.params.id), share: true });
        if (!note) {
            return res.json({ success: false, error: 'Note not found' });
        }
        res.json({ success: true, mynote: note });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch note' });
    }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Static files in production
if (isProduction) {
    const distPath = join(__dirname, '..', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(join(distPath, 'index.html'));
        }
    });
} else {
    app.get('/', (req, res) => res.send('API running. Use bunx vite for frontend.'));
}

// Start
app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
});
