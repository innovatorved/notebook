import { useState } from 'react';
import { 
  XIcon, 
  PlusIcon,
  TagIcon,
  AlertIcon,
  RocketIcon
} from '@primer/octicons-react';

export default function AddNoteModal({ onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (title.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }
    
    if (description.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await onSave({ title, description, tag: tag || 'General' });
    } catch (err) {
      setError(err.message || 'Failed to create note');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <PlusIcon size={20} />
            Create New Note
          </h2>
          <button onClick={onClose} className="btn btn-icon btn-secondary btn-sm">
            <XIcon size={16} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">
                <AlertIcon size={16} />
                <span>{error}</span>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label" htmlFor="new-title">
                Title
              </label>
              <input
                type="text"
                id="new-title"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your note a title..."
                required
                minLength={3}
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="new-description">
                Description
              </label>
              <textarea
                id="new-description"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your thoughts here..."
                required
                minLength={10}
                rows={6}
              />
              <span className="form-hint">Minimum 10 characters</span>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="new-tag">
                <TagIcon size={14} />
                Tag (optional)
              </label>
              <input
                type="text"
                id="new-tag"
                className="form-control"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g., Work, Personal, Ideas"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <RocketIcon size={16} />
                  Create Note
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
