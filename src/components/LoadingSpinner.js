// src/components/LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p>Loading delicious food...</p>
    </div>
  );
};

export default LoadingSpinner;