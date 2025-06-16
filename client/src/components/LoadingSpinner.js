import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', overlay = false }) => {
  const spinnerClass = `loading-spinner ${size} ${overlay ? 'overlay' : ''}`;
  
  return (
    <div className={spinnerClass}>
      <div className="spinner"></div>
      {overlay && <div className="spinner-overlay"></div>}
    </div>
  );
};

export default LoadingSpinner; 