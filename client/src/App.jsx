import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'

  if (loading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center min-vh-100"
        style={{ backgroundColor: 'var(--bg-pitch-black)' }}
      >
        <div
          className="spinner-border text-primary mb-3"
          style={{ width: '3rem', height: '3rem', borderWidth: '3px' }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="brand-font fs-5 text-white fw-bold mb-1">OBSIDIAN MERN</div>
        <div className="text-muted small">Initializing Secure Workspace...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login onNavigateToSignup={() => setAuthView('signup')} />
    ) : (
      <Signup onNavigateToLogin={() => setAuthView('login')} />
    );
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
