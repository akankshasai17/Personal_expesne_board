import React, { useState, useEffect } from 'react';
import { X, PlusCircle, CheckCircle, AlertCircle, Calendar, Tag, FileText, Edit3 } from 'lucide-react';
import { CATEGORIES, CATEGORY_NAMES, getTodayDateString } from '../utils/expenseUtils';

/**
 * ExpenseForm.jsx
 * Fully controlled form for recording a new expense OR editing an existing expense.
 * 
 * Demonstrates: useState, Controlled Forms, Event Handling, Conditional Rendering, Form Validation
 */
const ExpenseForm = ({ isOpen, onClose, onAddExpense, onUpdateExpense, initialData = null }) => {
  const isEditing = Boolean(initialData);

  // Form input state variables (Controlled Form)
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');

  // Field-level error validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize form with initialData when editing or opening
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAmount(String(initialData.amount || ''));
      setCategory(initialData.category || 'Food');
      setDate(initialData.date || getTodayDateString());
      setNotes(initialData.notes || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Food');
    setDate(getTodayDateString());
    setNotes('');
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Validate form fields
  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Expense title or description is required.';
    } else if (title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters long.';
    }

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount)) {
      newErrors.amount = 'Please enter a valid expense amount.';
    } else if (numericAmount <= 0) {
      newErrors.amount = 'Amount must be greater than ₹0.';
    }

    if (!category) {
      newErrors.category = 'Please select an expense category.';
    }

    if (!date) {
      newErrors.date = 'Please pick a valid date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const expensePayload = {
      title: title.trim(),
      amount: Math.round(parseFloat(amount)),
      category: category,
      date: date,
      notes: notes.trim()
    };

    try {
      if (isEditing) {
        const id = initialData.id || initialData._id;
        await onUpdateExpense(id, expensePayload);
      } else {
        await onAddExpense(expensePayload);
      }
      resetForm();
      onClose();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err.message || 'Error saving expense. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-form-title"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // Prevent clicking modal body from closing
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              {isEditing ? <Edit3 size={22} /> : <PlusCircle size={22} />}
            </div>
            <div>
              <h2 id="expense-form-title" className="modal-title">
                {isEditing ? 'Edit Expense Record' : 'Add New Expense'}
              </h2>
              <p className="modal-subtitle">
                {isEditing
                  ? 'Update details to synchronize with your MongoDB database'
                  : 'Enter expense details to update dashboard totals & charts'}
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

        {/* Controlled Form */}
        <form onSubmit={handleSubmit} className="expense-form" noValidate>
          {errors.form && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={15} />
              <span>{errors.form}</span>
            </div>
          )}

          {/* 1. Title Input */}
          <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
            <label htmlFor="expense-title" className="form-label">
              Expense Title / Description <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <input
                id="expense-title"
                type="text"
                className="form-input"
                placeholder="e.g. College Textbooks, Metro pass, Pizza"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
                }}
                autoFocus
              />
            </div>
            {errors.title && (
              <span className="field-error-message" role="alert">
                <AlertCircle size={13} /> {errors.title}
              </span>
            )}
          </div>

          {/* 2. Amount and Date Row */}
          <div className="form-row-two-col">
            {/* Amount */}
            <div className={`form-group ${errors.amount ? 'has-error' : ''}`}>
              <label htmlFor="expense-amount" className="form-label">
                Amount (in ₹) <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <span className="currency-prefix">₹</span>
                <input
                  id="expense-amount"
                  type="number"
                  min="1"
                  step="any"
                  className="form-input input-currency"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: null }));
                  }}
                />
              </div>
              {errors.amount && (
                <span className="field-error-message" role="alert">
                  <AlertCircle size={13} /> {errors.amount}
                </span>
              )}
            </div>

            {/* Date */}
            <div className={`form-group ${errors.date ? 'has-error' : ''}`}>
              <label htmlFor="expense-date" className="form-label">
                Date <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <input
                  id="expense-date"
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
                  }}
                />
              </div>
              {errors.date && (
                <span className="field-error-message" role="alert">
                  <AlertCircle size={13} /> {errors.date}
                </span>
              )}
            </div>
          </div>

          {/* 3. Category Selector */}
          <div className={`form-group ${errors.category ? 'has-error' : ''}`}>
            <label className="form-label">
              Category <span className="required-star">*</span>
            </label>
            <div className="category-select-cards" role="radiogroup" aria-label="Select Category">
              {CATEGORY_NAMES.map((cat) => {
                const isSelected = category === cat;
                const meta = CATEGORIES[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`category-select-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setCategory(cat);
                      if (errors.category) setErrors((prev) => ({ ...prev, category: null }));
                    }}
                    style={{
                      '--cat-accent': meta.color,
                      '--cat-light': meta.lightBg
                    }}
                  >
                    <span
                      className="cat-dot"
                      style={{ backgroundColor: meta.color }}
                      aria-hidden="true"
                    />
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <span className="field-error-message" role="alert">
                <AlertCircle size={13} /> {errors.category}
              </span>
            )}
          </div>

          {/* 4. Notes (Optional) */}
          <div className="form-group">
            <label htmlFor="expense-notes" className="form-label">
              Notes / Remarks <span className="optional-tag">(Optional)</span>
            </label>
            <textarea
              id="expense-notes"
              rows={2}
              className="form-textarea"
              placeholder="Add optional notes (e.g., payment mode, split with friend)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <CheckCircle size={18} />
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Expense' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
