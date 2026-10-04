import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterForm({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 8) return setError('Password must be at least 8 characters');

    setIsSubmitting(true);
    try {
      await register(formData.email, formData.password, formData.name);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Create account</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message" role="alert">{error}</div>}

        <div className="form-group">
          <label htmlFor="name">Full name</label>
          <input type="text" id="name" name="name" autoComplete="name" value={formData.name} onChange={handleChange} placeholder="Wanjiku Mwangi" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="wanjiku@mail.com" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} placeholder="At least 8 characters" required minLength={8} maxLength={72} />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} placeholder="Type your password again" required />
        </div>

        <button type="submit" className="primary full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="switch-form">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="link-button">Log in</button>
      </p>
    </div>
  );
}
