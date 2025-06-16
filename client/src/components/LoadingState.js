import React from 'react';
import './LoadingState.css';

const LoadingState = ({ message = 'Loading...', fullScreen = false }) => {
  const containerClass = fullScreen ? 'loading-container fullscreen' : 'loading-container';
  
  return (
    <div className={containerClass}>
      <div className="loading-spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingState; 