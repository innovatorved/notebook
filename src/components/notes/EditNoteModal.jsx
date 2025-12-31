import { useState } from 'react';
import { 
  XIcon, 
  PencilIcon,
  TagIcon,
  AlertIcon,
  CheckIcon,
  GlobeIcon,
  LockIcon,
  CopyIcon
} from '@primer/octicons-react';

export default function EditNoteModal({ note, onClose, onSave }) {
  const [title, setTitle] = useState(note.title);
  const [description, setDescription] = useState(note.description);
  const [tag, setTag] = useState(note.tag || '');
  const [share, setShare] = useState(note.share || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
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
      await onSave({ title, description, tag: tag || 'General', share });
    } catch (err) {
      setError(err.message || 'Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/note/${note._id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 640 }}
      >
        {/* Header with visibility toggle */}
        <div className="modal-header" style={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-5)'
        }}>
          <h2 className="modal-title" style={{ fontSize: 16 }}>
            <PencilIcon size={16} />
            Edit Note
          </h2>
          
          {/* Small visibility toggle in header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div 
              onClick={() => setShare(!share)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: '6px 12px',
                background: share ? 'var(--success-subtle)' : 'var(--canvas-subtle)',
                border: `1px solid ${share ? 'rgba(46, 160, 67, 0.4)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                color: share ? 'var(--success-fg)' : 'var(--fg-muted)',
                transition: 'all 0.15s'
              }}
            >
              {share ? <GlobeIcon size={14} /> : <LockIcon size={14} />}
              {share ? 'Public' : 'Private'}
            </div>
            
            {share && (
              <button 
                type="button"
                onClick={copyShareLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 10px',
                  background: copied ? 'var(--success-emphasis)' : 'var(--canvas-subtle)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  color: copied ? 'white' : 'var(--fg-muted)',
                  transition: 'all 0.15s'
                }}
              >
                {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
            
            <button onClick={onClose} className="btn btn-icon btn-secondary btn-sm">
              <XIcon size={16} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: 'var(--space-4) var(--space-5)' }}>
            {error && (
              <div className="alert alert-danger" style={{ marginBottom: 'var(--space-3)' }}>
                <AlertIcon size={16} />
                <span>{error}</span>
              </div>
            )}
            
            {/* Title + Tag in one row */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr auto', 
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-3)'
            }}>
              <div>
                <input
                  type="text"
                  id="edit-title"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  required
                  minLength={3}
                  style={{ 
                    height: 42,
                    fontSize: 15,
                    fontWeight: 500
                  }}
                />
              </div>
              <div>
                <div style={{ position: 'relative' }}>
                  <TagIcon 
                    size={14} 
                    style={{ 
                      position: 'absolute', 
                      left: 12, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: 'var(--fg-subtle)'
                    }} 
                  />
                  <input
                    type="text"
                    id="edit-tag"
                    className="form-control"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Tag"
                    style={{ 
                      height: 42,
                      width: 140,
                      paddingLeft: 32
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Large Description Area */}
            <div>
              <textarea
                id="edit-description"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your note content here..."
                required
                minLength={10}
                style={{ 
                  minHeight: 280,
                  lineHeight: 1.7,
                  resize: 'vertical',
                  fontSize: 14
                }}
              />
              <div style={{ 
                textAlign: 'right',
                marginTop: 'var(--space-1)',
                fontSize: 11,
                color: 'var(--fg-subtle)'
              }}>
                {description.length} characters
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="modal-footer" style={{ padding: 'var(--space-3) var(--space-5)' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14 }}></span>
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon size={14} />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
