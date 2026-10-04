import { useEffect, useState } from 'react';
import { publicAPI } from '../services/api';
import Markdown from './Markdown';
import './../App.css';

export default function SharedNote({ shareId }) {
  const [note, setNote] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    publicAPI
      .getNote(shareId)
      .then((res) => setNote(res.data.note))
      .catch(() => setError('This note is private or no longer shared.'));
  }, [shareId]);

  return (
    <main className="shared-page">
      {error && <div className="error-message">{error}</div>}
      {!note && !error && <div className="loading">Loading…</div>}
      {note && (
        <article className="shared-note">
          <h1>{note.title}</h1>
          <div className="note-meta">
            <span className="note-category">{note.category}</span>
            {note.tags.map((t) => (
              <span key={t} className="tag">#{t}</span>
            ))}
            <span className="note-date">Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
          </div>
          <Markdown>{note.content}</Markdown>
        </article>
      )}
      <footer className="shared-footer">Shared with Secure Notes</footer>
    </main>
  );
}
