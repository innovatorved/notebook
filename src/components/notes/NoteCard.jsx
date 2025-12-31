import { 
  PencilIcon, 
  TrashIcon, 
  TagIcon,
  ClockIcon,
  ShareIcon,
  LinkIcon
} from '@primer/octicons-react';

export default function NoteCard({ note, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const copyShareLink = (e) => {
    e.stopPropagation();
    const link = `${window.location.origin}/note/${note._id}`;
    navigator.clipboard.writeText(link);
    // Could add a toast notification here
  };
  
  return (
    <div className="note-card" onClick={onEdit}>
      <h3 className="note-card-title">
        {note.title}
        {note.share && (
          <ShareIcon size={14} fill="var(--success-fg)" />
        )}
      </h3>
      
      <p className="note-card-description">
        {note.description}
      </p>
      
      <div className="note-card-footer">
        <div className="note-card-meta">
          {note.tag && (
            <span className="tag">
              <TagIcon size={12} />
              {note.tag}
            </span>
          )}
          
          {note.date && (
            <span style={{ 
              fontSize: 12, 
              color: 'var(--fg-subtle)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4 
            }}>
              <ClockIcon size={12} />
              {formatDate(note.date)}
            </span>
          )}
        </div>
        
        <div className="note-card-actions">
          {note.share && (
            <button 
              onClick={copyShareLink} 
              className="btn btn-icon btn-sm btn-outline" 
              title="Copy share link"
            >
              <LinkIcon size={14} />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }} 
            className="btn btn-icon btn-sm btn-secondary" 
            title="Edit note"
          >
            <PencilIcon size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }} 
            className="btn btn-icon btn-sm btn-danger" 
            title="Delete note"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
