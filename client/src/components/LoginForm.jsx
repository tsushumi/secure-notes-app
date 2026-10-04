import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginForm({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Welcome back</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message" role="alert">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="wanjiku@mail.com" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" autoComplete="current-password" value={formData.password} onChange={handleChange} placeholder="Your password" required />
        </div>

        <button type="submit" className="primary full" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="switch-form">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister} className="link-button">Create one</button>
      </p>
    </div>
  );
}
