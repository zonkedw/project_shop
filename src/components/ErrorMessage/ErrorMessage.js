import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  message, 
  onRetry, 
  type = 'error',
  showIcon = true 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle size={20} />;
      case 'info':
        return <AlertCircle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  return (
    <div className={`error-message error-${type}`}>
      <div className="error-content">
        {showIcon && (
          <div className="error-icon">
            {getIcon()}
          </div>
        )}
        <div className="error-text">
          {message}
        </div>
      </div>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          <RefreshCw size={16} />
          Повторить
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
