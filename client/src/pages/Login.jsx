import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ onNavigateToSignup }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
      <div className="glass-card p-4 p-md-5 animate-fade-in" style={{ maxWidth: '440px', width: '100%' }}>
        {/* Brand Icon & Heading */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center mb-3"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.45)',
            }}
          >
            <i className="bi bi-shield-lock-fill text-white fs-3"></i>
          </div>
          <h2 className="brand-font fw-bold text-white mb-1">Welcome Back</h2>
          <p className="text-muted small">Sign in to your Obsidian Task Workspace</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small border-0 d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label small text-secondary fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text border-0" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="developer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small text-secondary fw-semibold mb-0">Password</label>
            </div>
            <div className="input-group">
              <span className="input-group-text border-0" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                <i className="bi bi-key"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-dark-outline border-start-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-accent w-100 py-2.5 mb-3" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-box-arrow-in-right me-1"></i>
            )}
            Sign In to Dashboard
          </button>
        </form>

        {/* Quick Demo Login Preset */}
        <div className="p-2.5 rounded-3 mb-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Demo Preset:</span>
            <button
              type="button"
              className="btn btn-link text-cyan p-0 small fw-semibold text-decoration-none"
              style={{ fontSize: '0.78rem' }}
              onClick={() => fillDemoAccount('demo@obsidian.io', 'demo1234')}
            >
              Fill Demo Login <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>

        {/* Signup Redirect */}
        <div className="text-center">
          <span className="text-muted small">Don't have an account? </span>
          <button
            onClick={onNavigateToSignup}
            className="btn btn-link text-white fw-bold p-0 small text-decoration-none"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
