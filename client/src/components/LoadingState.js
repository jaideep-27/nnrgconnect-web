import React from 'react';
import './LoadingState.css';

const LoadingState = ({ 
  message = 'Loading...', 
  fullScreen = false,
  inline = false,
  className = ''
}) => {
  const containerClass = `loading-container ${fullScreen ? 'fullscreen' : ''} ${inline ? 'inline' : ''} ${className}`.trim();
  
  return (
    <div className={containerClass}>
      <div className="loading-spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingState; 