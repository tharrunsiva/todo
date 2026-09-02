import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenAddModal, onOpenProfileModal, stats }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg border-bottom sticky-top py-3" style={{
      backgroundColor: 'rgba(5, 5, 8, 0.85)',
      borderColor: 'var(--border-subtle)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 1000,
    }}>
      <div className="container-xl">
        {/* Brand */}
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            <i className="bi bi-check2-square text-white fs-4"></i>
          </div>
          <div>
            <div className="brand-font fs-5 text-white fw-bold d-flex align-items-center gap-2">
              OBSIDIAN <span className="badge bg-dark border text-cyan" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', borderColor: 'var(--border-subtle)' }}>MERN v1.0</span>
            </div>
            <div className="text-muted small" style={{ fontSize: '0.75rem', marginTop: '-3px' }}>
              Enterprise Productivity Cloud
            </div>
          </div>
        </div>

        {/* Action Controls & User Profile */}
        <div className="d-flex align-items-center gap-3 ms-auto">
          {/* Quick Add Button */}
          <button
            onClick={onOpenAddModal}
            className="btn btn-accent d-none d-sm-flex align-items-center gap-2"
          >
            <i className="bi bi-plus-lg"></i>
            <span>New Task</span>
          </button>

          {/* User Profile Badge */}
          {user && (
            <div className="dropdown">
              <button
                className="btn d-flex align-items-center gap-2 p-1 pe-3 border rounded-pill"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="rounded-circle border"
                  style={{ width: '32px', height: '32px', borderColor: 'rgba(255,255,255,0.15)' }}
                />
                <span className="fw-semibold small d-none d-md-inline">{user.name}</span>
                <i className="bi bi-chevron-down text-muted small"></i>
              </button>
              
              <ul className="dropdown-menu dropdown-menu-end dark-modal p-2 shadow-lg" style={{ minWidth: '220px' }}>
                <li className="px-3 py-2 border-bottom border-secondary border-opacity-25">
                  <div className="fw-bold text-white small">{user.name}</div>
                  <div className="text-muted small text-truncate" style={{ fontSize: '0.78rem' }}>{user.email}</div>
                </li>
                <li>
                  <button
                    onClick={onOpenProfileModal}
                    className="dropdown-item text-light d-flex align-items-center gap-2 py-2 rounded-2 mt-1"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <i className="bi bi-person-gear text-indigo"></i> Account Settings
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider border-secondary border-opacity-25 my-1" />
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="dropdown-item text-danger d-flex align-items-center gap-2 py-2 rounded-2"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <i className="bi bi-box-arrow-right"></i> Sign Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
