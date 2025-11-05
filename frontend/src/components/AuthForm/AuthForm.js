import React from 'react';
import './AuthForm.css';

const AuthForm = ({ 
  title, 
  subtitle, 
  onSubmit, 
  loading, 
  error, 
  children, 
  buttonText,
  linkText,
  linkTo 
}) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={onSubmit}>
          {children}
          
          <button 
            type="submit" 
            className={`auth-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? '' : buttonText}
          </button>
        </form>

        {linkText && (
          <div className="auth-link">
            {linkText}
          </div>
        )}
      </div>
    </div>
  );
};

export const FormGroup = ({ label, error, children }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    {children}
    {error && <div className="form-validation-error">{error}</div>}
  </div>
);

export const FormInput = ({ error, ...props }) => (
  <input 
    className={`form-input ${error ? 'error' : ''}`}
    {...props}
  />
);

export default AuthForm;
