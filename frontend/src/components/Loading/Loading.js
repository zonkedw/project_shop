import React from 'react';
import './Loading.css';

const Loading = ({ size = 'medium', text = 'Загрузка...' }) => {
  return (
    <div className={`loading-container loading-${size}`}>
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default Loading;
