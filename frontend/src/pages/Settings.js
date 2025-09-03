import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUserCog, FaExclamationTriangle } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out:', err);
      setError('Failed to log out. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1><FaUserCog className="header-icon" /> Account Settings</h1>
      </div>
      
      <div className="settings-content">
        {error && (
          <div className="settings-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}
        
        <div className="settings-section">
          <h2>Account Information</h2>
          <div className="settings-item">
            <label>Email</label>
            <p>{currentUser?.email || 'N/A'}</p>
          </div>
          
        </div>
        
        <div className="settings-section danger-zone">
          <h2>Danger Zone</h2>
          <div className="settings-item">
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="logout-button"
            >
              {isLoading ? (
                'Logging out...'
              ) : (
                <>
                  <FaSignOutAlt /> Log Out
                </>
              )}
            </button>
            <p className="hint">Sign out of your account on this device</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
