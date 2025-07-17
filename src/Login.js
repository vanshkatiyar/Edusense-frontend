import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiLeafFill } from 'react-icons/ri';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // State for loading feedback
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Start loading
    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json(); // Always try to get JSON response

      if (!response.ok) {
        // Use the error message from backend if available
        throw new Error(data.msg || 'Login failed. Please check your credentials.');
      }
      
      login(data.user, data.access_token);
      navigate(from, { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Stop loading regardless of outcome
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
              disabled={loading} // Disable input while loading
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
              disabled={loading} // Disable input while loading
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