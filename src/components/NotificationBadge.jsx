import React, { useState, useEffect } from 'react';

const NotificationBadge = ({ count = 0, onClick, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [count]);

  if (count === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={onClick}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span className="material-icons">notifications</span>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {count > 99 ? '99+' : count}
        </span>
      </button>
      
      {isVisible && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-fade-in">
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-600">
              {count} nouvelle{count > 1 ? 's' : ''} notification{count > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBadge; 