/**
 * Notes API Router
 * CRUD operations for notes with better-auth session validation
 */

import express from 'express';
import { ObjectId } from 'mongodb';
import { auth, getDb } from '../lib/auth.js';

const router = express.Router();

// Middleware to verify session
async function requireAuth(req, res, next) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session || !session.user) {
            return res.status(401).json({ error: 'Unauthorized - Please login' });
        }

        req.user = session.user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

// GET /api/notes - Fetch all notes for authenticated user
router.get('/', requireAuth, async (req, res) => {
    try {
        const db = await getDb();
        const notes = await db.collection('notes')
            .find({ user: req.user.id })
            .sort({ date: -1 })
            .toArray();

        res.json(notes);
    } catch (error) {
        console.error('Fetch notes error:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// POST /api/notes - Create a new note
router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        if (!title || title.length < 3) {
            return res.status(400).json({ error: 'Title must be at least 3 characters' });
        }

        if (!description || description.length < 10) {
            return res.status(400).json({ error: 'Description must be at least 10 characters' });
        }

        const db = await getDb();
        const note = {
            title,
            description,
            tag: tag || 'General',
            share: false,
            user: req.user.id,
            date: new Date()
        };

        const result = await db.collection('notes').insertOne(note);
        note._id = result.insertedId;

        res.status(201).json({ success: true, saveNote: note });
    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

// PUT /api/notes/:id - Update a note
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, tag, share } = req.body;

        const db = await getDb();
        const note = await db.collection('notes').findOne({ _id: new ObjectId(id) });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (note.user !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (tag) updateData.tag = tag;
        if (typeof share === 'boolean') updateData.share = share;

        const result = await db.collection('notes').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        res.json({ UpdateNote1: result });
    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const db = await getDb();
        const note = await db.collection('notes').findOne({ _id: new ObjectId(id) });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (note.user !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        await db.collection('notes').deleteOne({ _id: new ObjectId(id) });

        res.json({ Delete: 'Note has been deleted' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// GET /api/notes/shared/:id - Get a shared note (public)
router.get('/shared/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const db = await getDb();
        const note = await db.collection('notes').findOne({
            _id: new ObjectId(id),
            share: true
        });

        if (!note) {
            return res.json({ success: false, error: 'Note not found or not shared' });
        }

        // Get user info
        const user = await db.collection('user').findOne(
            { id: note.user },
            { projection: { name: 1, email: 1 } }
        );

        res.json({
            success: true,
            mynote: { ...note, user }
        });
    } catch (error) {
        console.error('Shared note error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch shared note' });
    }
});

export default router;
