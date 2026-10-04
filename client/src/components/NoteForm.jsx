import { useState } from 'react';

const PRESET_CATEGORIES = ['General', 'Work', 'Personal', 'Ideas', 'School'];

export default function NoteForm({ note, categories, onSubmit, onCancel }) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [category, setCategory] = useState(note?.category ?? 'General');
  const [tagsText, setTagsText] = useState(note?.tags?.join(', ') ?? '');
  const [saving, setSaving] = useState(false);

  const allCategories = [...new Set([...PRESET_CATEGORIES, ...categories])];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tags = tagsText.split(',').map((t) => t.trim()).filter(Boolean);
    setSaving(true);
    try {
      await onSubmit({ title, content, category: category.trim() || 'General', tags });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="note-form">
      <h2>{note ? 'Edit note' : 'New note'}</h2>

      <div className="form-group">
        <label htmlFor="note-title">Title</label>
        <input id="note-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
      </div>

      <div className="form-group">
        <label htmlFor="note-content">Content <span className="hint">Markdown supported</span></label>
        <textarea id="note-content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} maxLength={10000} required />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="note-category">Category</label>
          <input id="note-category" type="text" list="category-options" value={category} onChange={(e) => setCategory(e.target.value)} maxLength={50} />
          <datalist id="category-options">
            {allCategories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div className="form-group">
          <label htmlFor="note-tags">Tags <span className="hint">comma separated</span></label>
          <input id="note-tags" type="text" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="exam, urgent" />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="primary" disabled={saving}>{saving ? 'Saving…' : note ? 'Save changes' : 'Create note'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
