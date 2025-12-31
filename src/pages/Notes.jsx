import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  NoteIcon, 
  SearchIcon,
  XIcon
} from '@primer/octicons-react';
import NoteCard from '../components/notes/NoteCard';
import AddNoteModal from '../components/notes/AddNoteModal';
import EditNoteModal from '../components/notes/EditNoteModal';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  
  useEffect(() => {
    fetchNotes();
  }, []);
  
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notes', { credentials: 'include' });
      
      if (!response.ok) throw new Error('Failed to fetch notes');
      
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddNote = async (note) => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(note)
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create note');
    }
    
    const data = await response.json();
    setNotes([data.saveNote, ...notes]);
    setShowAddModal(false);
  };
  
  const handleUpdateNote = async (id, updatedNote) => {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updatedNote)
    });
    
    if (!response.ok) throw new Error('Failed to update note');
    
    const data = await response.json();
    setNotes(notes.map(n => n._id === id ? data.UpdateNote1 : n));
    setEditingNote(null);
  };
  
  const handleDeleteNote = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    const response = await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (response.ok) {
      setNotes(notes.filter(n => n._id !== id));
    }
  };
  
  const filteredNotes = notes.filter(note => 
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tag?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <NoteIcon size={28} />
          <h1>My Notes</h1>
        </div>
        
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <PlusIcon size={16} />
          New Note
        </button>
      </div>
      
      {/* Search */}
      <div className="search-input" style={{ maxWidth: 320, marginBottom: 'var(--space-6)' }}>
        <SearchIcon size={16} />
        <input 
          type="search"
          className="form-control"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="btn btn-icon btn-sm"
            style={{ 
              position: 'absolute', 
              right: 4, 
              top: '50%', 
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--fg-subtle)'
            }}
          >
            <XIcon size={14} />
          </button>
        )}
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <NoteIcon size={32} />
          </div>
          <h3 className="empty-state-title">
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="empty-state-description">
            {searchQuery 
              ? 'Try a different search term'
              : 'Create your first note to get started!'
            }
          </p>
          {!searchQuery && (
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              <PlusIcon size={16} />
              Create Note
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredNotes.map(note => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={() => setEditingNote(note)}
              onDelete={() => handleDeleteNote(note._id)}
            />
          ))}
        </div>
      )}
      
      {showAddModal && (
        <AddNoteModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddNote}
        />
      )}
      
      {editingNote && (
        <EditNoteModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSave={(updatedNote) => handleUpdateNote(editingNote._id, updatedNote)}
        />
      )}
    </div>
  );
}
