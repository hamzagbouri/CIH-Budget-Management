import React from 'react';

const Alert = ({ type = 'info', title, message, onClose, children }) => {
  const alertStyles = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-500',
      title: 'text-green-800',
      message: 'text-green-700',
      iconName: 'check_circle'
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      message: 'text-red-700',
      iconName: 'error'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      iconName: 'warning'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      message: 'text-blue-700',
      iconName: 'info'
    }
  };

  const style = alertStyles[type];

  return (
    <div className={`border rounded-xl p-4 ${style.container}`}>
      <div className="flex items-start">
        <span className={`material-icons mr-3 mt-0.5 ${style.icon}`}>
          {style.iconName}
        </span>
        <div className="flex-1">
          {title && (
            <h3 className={`font-semibold ${style.title}`}>
              {title}
            </h3>
          )}
          {message && (
            <p className={`${style.message} ${title ? 'mt-1' : ''}`}>
              {message}
            </p>
          )}
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 p-1 rounded-lg hover:bg-white/50 transition-colors ${style.icon}`}
          >
            <span className="material-icons text-sm">close</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert; 