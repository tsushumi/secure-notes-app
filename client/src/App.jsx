import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import NotesDashboard from './components/NotesDashboard';
import SharedNote from './components/SharedNote';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) return <div className="loading">Loading…</div>;
  if (user) return <NotesDashboard />;

  return (
    <main className="auth-container">
      <h1 className="app-title">Secure Notes</h1>
      <p className="app-subtitle">Notes that only you can read.</p>
      {showRegister ? (
        <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
      ) : (
        <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
      )}
    </main>
  );
}

export default function App() {
  // Public share links (/shared/<id>) work without logging in.
  const shared = window.location.pathname.match(/^\/shared\/([0-9a-fA-F-]{36})$/);
  if (shared) return <SharedNote shareId={shared[1]} />;

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
