import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceControl } from '../contexts/VoiceControlContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const { currentUser } = useAuth();
  const { showVoiceControl, toggleVoiceControl } = useVoiceControl();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to Zap, {currentUser?.full_name || 'User'}!</h1>
        <p>Your AI-powered accounting assistant</p>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/tables" className="action-button">
              <span className="icon">📋</span>
              <span>View Tables</span>
            </Link>
            <Link to="/tables/new" className="action-button">
              <span className="icon">➕</span>
              <span>Create Table</span>
            </Link>
            <button 
              className={`action-button ${showVoiceControl ? 'active' : ''}`}
              onClick={toggleVoiceControl}
            >
              <span className="icon">🎤</span>
              <span>Voice Command</span>
            </button>
          </div>
        </div>

      </div>
      
    </div>
  );
}

export default Dashboard;
