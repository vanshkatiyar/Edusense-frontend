import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from './api'; // --- NEW: Import our API utility ---
import { RiLeafFill } from 'react-icons/ri';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // --- THIS IS THE CORRECTED CODE ---
      // We now use apiFetch, which knows the production URL.
      // We pass '/api/login' as the endpoint. The token is not needed for login.
      const data = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      // --- END OF CORRECTION ---
      
      login(data.user, data.access_token);
      navigate(from, { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <RiLeafFill className="brand-icon" />
          <h1>EduSense</h1>
          <p>Smart Campus Monitoring</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
         <div className="login-info">
          <p><strong>Admin:</strong> admin@edusense.com / admin123</p>
          <p><strong>Teacher:</strong> teacher@example.com / teacher123</p>
          <p><strong>Student:</strong> student@example.com / student123</p>
        </div>
      </div>
    </div>
  );
}