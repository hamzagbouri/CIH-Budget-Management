import { useState } from 'react';

export default function ValidationAlert({ 
  type = 'error', 
  title, 
  message, 
  onRetry, 
  onDismiss,
  showRetry = false 
}) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss && onDismiss();
  };

  const handleRetry = () => {
    onRetry && onRetry();
  };

  if (!isVisible) return null;

  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-400',
          title: 'text-gray-800',
          message: 'text-gray-700',
          button: 'bg-gray-600 hover:bg-gray-700 text-white'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  const styles = getAlertStyles();

  return (
    <div className={`border rounded-lg p-4 ${styles.container}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          <span className="material-icons text-xl">{getIcon()}</span>
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          
          {message && (
            <div className={`mt-2 text-sm ${styles.message}`}>
              <p>{message}</p>
            </div>
          )}
          
          {(showRetry || onDismiss) && (
            <div className="mt-4 flex gap-2">
              {showRetry && onRetry && (
                <button
                  onClick={handleRetry}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${styles.button}`}
                >
                  Réessayer
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              )}
            </div>
          )}
        </div>
        
        {!showRetry && !onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={handleDismiss}
              className={`inline-flex ${styles.icon} hover:${styles.icon.replace('text-', 'text-')} transition-colors`}
            >
              <span className="material-icons text-sm">close</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 