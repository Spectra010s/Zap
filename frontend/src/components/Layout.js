import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceControl } from '../contexts/VoiceControlContext';
import ThemeToggle from './theme/ThemeToggle';
import VoiceControl from './voice/VoiceControl';
import { FaChartLine, FaTable, FaCog } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  const { showVoiceControl } = useVoiceControl();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
                <span className="logo-icon">⚡</span>
                <span className="logo-text">Zap</span>
            </div>
          </div>
          
          <nav className="main-nav">
            <ul>
              <li>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  <FaChartLine className="nav-icon" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/tables" 
                  className={`nav-link ${isActive('/tables') ? 'active' : ''}`}
                >
                  <FaTable className="nav-icon" />
                  <span>Tables</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings" 
                  className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
                >
                  <FaCog className="nav-icon" />
                  <span className="nav-text">Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="header-right">
            <ThemeToggle />
            {!currentUser && (
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main className="app-main">
        {children}
      </main>
      
      {showVoiceControl && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          right: '16px',
          zIndex: 1000
        }}>
          <VoiceControl />
        </div>
      )}
      
      <footer className="app-footer">
        <p> {new Date().getFullYear()} Zap - AI-Powered Accounting</p>
      </footer>
    </div>
  );
}

export default Layout;
