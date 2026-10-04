import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notesAPI } from '../services/api';
import NoteCard from './NoteCard';
import NoteForm from './NoteForm';

export default function NotesDashboard() {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('darkMode') === 'true'; } catch { return false; }
  });

  const refresh = () => setRefreshKey((k) => k + 1);

  // Dark mode (a harmless per-device preference, so localStorage is fine here)
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    try { localStorage.setItem('darkMode', darkMode); } catch { /* ignore */ }
  }, [darkMode]);

  // Wait for the user to stop typing before searching
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Fetch notes; cancel the previous request so a slow, stale response can't overwrite a newer one
  useEffect(() => {
    const controller = new AbortController();
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedTag) params.tag = selectedTag;
    if (search) params.search = search;

    notesAPI
      .getAll(params, controller.signal)
      .then((res) => {
        setNotes(res.data.notes);
        setCategories(res.data.categories);
        setTags(res.data.tags);
        setError('');
      })
      .catch((err) => {
        if (err.code !== 'ERR_CANCELED') setError('Failed to load notes');
      });

    return () => controller.abort();
  }, [selectedCategory, selectedTag, search, refreshKey]);

  const run = async (action, failMessage) => {
    try {
      await action();
      refresh();
    } catch (err) {
      setError(err.response?.data?.error || failMessage);
    }
  };

  const handleSave = async (data) => {
    setError('');
    try {
      if (editingNote) await notesAPI.update(editingNote.id, data);
      else await notesAPI.create(data);
      closeForm();
      refresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save note');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    run(() => notesAPI.delete(id), 'Failed to delete note');
  };

  const hasFilters = search || selectedCategory || selectedTag;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>My notes</h1>
        <div className="user-info">
          <span>{user.name}</span>
          <button onClick={() => setDarkMode((d) => !d)} aria-pressed={darkMode}>{darkMode ? 'Light mode' : 'Dark mode'}</button>
          <button onClick={logout}>Log out</button>
        </div>
      </header>

      {error && <div className="error-message" role="alert">{error}</div>}

      <div className="toolbar">
        <input type="search" placeholder="Search titles and content" aria-label="Search notes" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="search-input" />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} aria-label="Filter by tag">
          <option value="">All tags</option>
          {tags.map((t) => <option key={t} value={t}>#{t}</option>)}
        </select>
        <button className="primary" onClick={() => { setEditingNote(null); setShowForm(true); }}>New note</button>
      </div>

      {showForm && (
        <NoteForm key={editingNote?.id ?? 'new'} note={editingNote} categories={categories} onSubmit={handleSave} onCancel={closeForm} />
      )}

      <div className="notes-grid">
        {notes.length === 0 ? (
          <p className="empty-state">
            {hasFilters ? 'No notes match these filters. Clear them to see everything.' : 'No notes yet. Select "New note" to write your first one.'}
          </p>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={(n) => { setEditingNote(n); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onDelete={handleDelete}
              onTogglePin={(id) => run(() => notesAPI.togglePin(id), 'Failed to update pin')}
              onToggleShare={(id) => run(() => notesAPI.toggleShare(id), 'Failed to update sharing')}
              onTagClick={setSelectedTag}
            />
          ))
        )}
      </div>
    </div>
  );
}
