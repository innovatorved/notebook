import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  NoteIcon, 
  PersonIcon, 
  ClockIcon,
  TagIcon,
  ArrowLeftIcon,
  AlertIcon
} from '@primer/octicons-react';

export default function SharedNote() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchSharedNote();
  }, [id]);
  
  const fetchSharedNote = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notes/shared/${id}`);
      const data = await response.json();
      
      if (!data.success || !data.mynote) {
        setError('Note not found or not shared');
      } else {
        setNote(data.mynote);
      }
    } catch (err) {
      setError('Failed to load note');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (error || !note) {
    return (
      <div className="container-narrow" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 'var(--spacing-4)' }}>
          <AlertIcon size={48} fill="var(--color-danger-fg)" />
        </div>
        <h1>Note Not Found</h1>
        <p className="text-muted" style={{ marginBottom: 'var(--spacing-4)' }}>
          {error || 'This note might have been deleted or is not shared.'}
        </p>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeftIcon size={16} />
          Go Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container-narrow">
      <Link 
        to="/" 
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: 'var(--spacing-3)' }}
      >
        <ArrowLeftIcon size={16} />
        Back to Home
      </Link>
      
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h1 style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-2)',
              margin: 0,
              fontSize: '24px'
            }}>
              <NoteIcon size={24} fill="var(--color-accent-fg)" />
              {note.title}
            </h1>
            
            {note.tag && (
              <span className="tag">
                <TagIcon size={12} style={{ marginRight: '4px' }} />
                {note.tag}
              </span>
            )}
          </div>
        </div>
        
        <div className="card-body">
          <div style={{ 
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            color: 'var(--color-fg-default)'
          }}>
            {note.description}
          </div>
        </div>
        
        <div className="card-footer">
          <div className="flex items-center gap-4 text-muted" style={{ fontSize: '14px' }}>
            {note.user && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <PersonIcon size={14} />
                {note.user.name || note.user.email}
              </span>
            )}
            
            {note.date && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ClockIcon size={14} />
                {formatDate(note.date)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
