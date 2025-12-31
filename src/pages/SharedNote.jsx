import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  NoteIcon, 
  ClockIcon,
  TagIcon,
  ArrowLeftIcon,
  AlertIcon,
  ShareIcon
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
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <main className="main">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--space-8)' }}>
          <div className="spinner" style={{ width: 32, height: 32 }}></div>
        </div>
      </main>
    );
  }
  
  if (error || !note) {
    return (
      <main className="main">
        <div className="container" style={{ maxWidth: 600, textAlign: 'center', paddingTop: 'var(--space-8)' }}>
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <AlertIcon size={48} fill="var(--danger-fg)" />
          </div>
          <h1 style={{ marginBottom: 'var(--space-3)' }}>Note Not Found</h1>
          <p style={{ color: 'var(--fg-muted)', marginBottom: 'var(--space-5)' }}>
            {error || 'This note might have been deleted or is not shared.'}
          </p>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeftIcon size={16} />
            Go Home
          </Link>
        </div>
      </main>
    );
  }
  
  return (
    <main className="main">
      <div className="container" style={{ maxWidth: '100%', padding: '0 var(--space-6)' }}>
        {/* Back button */}
        <Link 
          to="/" 
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: 'var(--space-5)' }}
        >
          <ArrowLeftIcon size={16} />
          Back to Home
        </Link>
        
        {/* Note Card */}
        <div className="card" style={{ minHeight: '80vh' }}>
          <div className="card-header" style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            padding: 'var(--space-5)'
          }}>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <h1 style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-3)',
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 600,
                  color: 'var(--fg-default)',
                  wordBreak: 'break-word'
                }}>
                  <NoteIcon size={28} fill="var(--accent-fg)" />
                  {note.title}
                </h1>

                {note.tag && (
                  <span className="tag" style={{ fontSize: 14, padding: '4px 12px' }}>
                    <TagIcon size={14} />
                    {note.tag}
                  </span>
                )}
              </div>
              
              {/* Meta info */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-4)',
                marginTop: 'var(--space-3)',
                fontSize: 14,
                color: 'var(--fg-muted)'
              }}>
                {note.date && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <ClockIcon size={14} />
                    {formatDate(note.date)}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <ShareIcon size={14} fill="var(--success-fg)" />
                  Shared publicly
                </span>
              </div>
            </div>
          </div>
          
          <div className="card-body" style={{ padding: 'var(--space-6)' }}>
            <div style={{ 
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              fontSize: 16,
              color: 'var(--fg-default)',
              wordBreak: 'break-word'
            }}>
              {note.description}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 'var(--space-6)',
          padding: 'var(--space-5)',
          color: 'var(--fg-subtle)',
          fontSize: 14
        }}>
          <p style={{ margin: 0 }}>
            Shared via <Link to="/" style={{ color: 'var(--accent-fg)' }}>Notebook</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
