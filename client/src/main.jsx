import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Apply the saved theme before first paint to avoid a light-mode flash.
try {
  document.body.classList.toggle('dark', localStorage.getItem('darkMode') === 'true');
} catch {
  /* storage unavailable: stay light */
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
