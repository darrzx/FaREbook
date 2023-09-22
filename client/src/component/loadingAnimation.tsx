import React from 'react';
import '../styles/LoadingAnimation.css'

interface LoadingAnimationProps {
  loading: boolean;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ loading }) => {
  return loading ? (
    <div className="loading-indicator-overlay">
      <div className="loading-indicator-content">
        <div className="loading-spinner"></div>
      </div>
    </div>
  ) : null;
};

export default LoadingAnimation;