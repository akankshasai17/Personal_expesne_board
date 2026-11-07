import React, { useState } from 'react';
import { X, LogIn, UserPlus, Lock, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';
import authService from '../services/authService';

/**
 * AuthModal.jsx
 * Modal dialog for User Registration and Login with JWT authentication.
 */
const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setErrorMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (isRegister && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isRegister) {
        result = await authService.register(name.trim(), email.trim(), password);
      } else {
        result = await authService.login(email.trim(), password);
      }

      if (result.success && result.user) {
        resetForm();
        onAuthSuccess(result.user);
        onClose();
      } else {
        setErrorMessage(result.message || 'Authentication failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to connect to backend server. Make sure backend is running.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="modal-content auth-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              {isRegister ? <UserPlus size={22} /> : <LogIn size={22} />}
            </div>
            <div>
              <h2 className="modal-title">
                {isRegister ? 'Create SpendWise Account' : 'Sign in to SpendWise'}
              </h2>
              <p className="modal-subtitle">
                {isRegister
                  ? 'Sign up to store and analyze your expenses in MongoDB'
                  : 'Welcome back! Enter your credentials to access your dashboard'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-switcher">
          <button
            type="button"
            className={`auth-tab-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(false);
              setErrorMessage('');
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true);
              setErrorMessage('');
            }}
          >
            <UserPlus size={15} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="expense-form auth-form">
          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">
                Full Name <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-inner-icon">
                  <User size={16} />
                </span>
                <input
                  id="auth-name"
                  type="text"
                  className="form-input input-with-padding"
                  placeholder="e.g. Akanksha Sai"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegister}
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              Email Address <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-inner-icon">
                <Mail size={16} />
              </span>
              <input
                id="auth-email"
                type="email"
                className="form-input input-with-padding"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              Password <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-inner-icon">
                <Lock size={16} />
              </span>
              <input
                id="auth-password"
                type="password"
                className="form-input input-with-padding"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-actions auth-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span>Please wait...</span>
              ) : isRegister ? (
                <>
                  <UserPlus size={18} />
                  <span>Register Account</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
