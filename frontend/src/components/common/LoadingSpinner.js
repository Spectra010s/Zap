import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary', className = '' }) => {
  const sizeClasses = {
    small: 'spinner-sm',
    medium: 'spinner-md',
    large: 'spinner-lg',
  };

  const colorClasses = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    light: 'spinner-light',
    dark: 'spinner-dark',
  };

  return (
    <div 
      className={`spinner ${sizeClasses[size] || 'spinner-md'} ${
        colorClasses[color] || 'spinner-primary'
      } ${className}`}
      role="status"
      aria-label="Loading..."
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
