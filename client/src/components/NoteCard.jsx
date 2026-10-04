import { useState } from 'react';
import Markdown from './Markdown';

export default function NoteCard({ note, onEdit, onDelete, onTogglePin, onToggleShare, onTagClick }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/shared/${note.shareId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy this link:', shareUrl);
    }
  };

  return (
    <article className={`note-card ${note.isPinned ? 'pinned' : ''}`}>
      <div className="note-header">
        <h3>{note.title}</h3>
        <button onClick={() => onTogglePin(note.id)} className={`pin-button ${note.isPinned ? 'active' : ''}`} aria-pressed={note.isPinned} title={note.isPinned ? 'Unpin' : 'Pin to top'}>
          {note.isPinned ? 'Pinned' : 'Pin'}
        </button>
      </div>

      <div className="note-body">
        <Markdown>{note.content}</Markdown>
      </div>

      <div className="note-meta">
        <span className="note-category">{note.category}</span>
        {note.tags.map((t) => (
          <button key={t} className="tag" onClick={() => onTagClick(t)} title={`Filter by #${t}`}>#{t}</button>
        ))}
        <span className="note-date">{new Date(note.updatedAt).toLocaleDateString()}</span>
      </div>

      {note.isPublic && (
        <div className="share-banner">
          <span>Anyone with the link can read this note.</span>
          <button onClick={copyLink} className="small">{copied ? 'Copied' : 'Copy link'}</button>
        </div>
      )}

      <div className="note-actions">
        <button onClick={() => onEdit(note)}>Edit</button>
        <button onClick={() => onToggleShare(note.id)}>{note.isPublic ? 'Stop sharing' : 'Share'}</button>
        <button onClick={() => onDelete(note.id)} className="danger">Delete</button>
      </div>
    </article>
  );
}
