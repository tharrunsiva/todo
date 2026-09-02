import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';

const ProfileModal = ({ show, onClose }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPassword('');
      setConfirmPassword('');
      setMessage({ type: '', text: '' });
    }
  }, [user, show]);

  if (!show || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setMessage({ type: 'danger', text: 'Passwords do not match' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const payload = { name };
      if (password) {
        payload.password = password;
      }

      const res = await authApi.updateProfile(payload);
      if (res.success && res.data) {
        updateUser(res.data);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || err.message || 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content dark-modal">
          <div className="modal-header border-bottom border-secondary border-opacity-25 pb-3">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-person-gear text-indigo fs-5"></i>
              <h5 className="modal-title fw-bold text-white mb-0">Account Settings</h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body py-3">
              {message.text && (
                <div className={`alert alert-${message.type} py-2 px-3 small border-0 mb-3`}>
                  {message.text}
                </div>
              )}

              {/* User Avatar & Info */}
              <div className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="rounded-circle border"
                  style={{ width: '50px', height: '50px', borderColor: 'var(--accent-primary)' }}
                />
                <div>
                  <div className="fw-bold text-white">{user.name}</div>
                  <div className="text-muted small">{user.email}</div>
                </div>
              </div>

              {/* Display Name */}
              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">Display Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Password Change */}
              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">
                  New Password <span className="text-muted fw-normal">(leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              {password && (
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="modal-footer border-top border-secondary border-opacity-25 pt-3">
              <button
                type="button"
                className="btn btn-dark-outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-accent px-4" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
