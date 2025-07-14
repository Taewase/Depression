import React from 'react';

const ProgressBar = ({ progress, height = "h-2", showValue = false }) => {
  return (
    <div className="relative">
      <div className={`bg-gray-100 rounded-full overflow-hidden ${height}`}>
        <div 
          className={`relative bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500 ${height} transition-all duration-700 ease-out`}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
      {showValue && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 transform">
          <span className="text-sm font-medium text-primary-600">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
    </div>
  );
};

export default ProgressBar; 