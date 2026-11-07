import React, { useState } from 'react';
import {
  Trash2,
  Calendar,
  FileText,
  Utensils,
  Plane,
  GraduationCap,
  Film,
  MoreHorizontal,
  AlertCircle,
  Pencil
} from 'lucide-react';
import { CATEGORIES, formatCurrency, formatDate } from '../utils/expenseUtils';

/**
 * ExpenseItem.jsx
 * Represents a single expense row / card in the recent transactions list.
 * 
 * Demonstrates: Props, useState (for delete confirmation state), Event Handling, Conditional Rendering
 */
const ExpenseItem = ({ expense, onDelete, onEdit }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const categoryMeta = CATEGORIES[expense.category] || CATEGORIES.Other;
  const categoryColor = categoryMeta?.color || '#6B7280';
  const expenseId = expense.id || expense._id;

  const renderIcon = () => {
    const props = { size: 18, strokeWidth: 2.2 };
    switch (expense.category?.toLowerCase()) {
      case 'food':
        return <Utensils {...props} />;
      case 'travel':
        return <Plane {...props} />;
      case 'education':
        return <GraduationCap {...props} />;
      case 'entertainment':
        return <Film {...props} />;
      case 'other':
      default:
        return <MoreHorizontal {...props} />;
    }
  };

  const handleConfirmDelete = () => {
    onDelete(expenseId);
    setShowConfirm(false);
  };

  return (
    <div className="expense-item-row">
      {/* Category Icon */}
      <div
        className="expense-item-icon-box"
        style={{
          backgroundColor: categoryMeta.lightBg,
          color: categoryColor,
          borderColor: categoryMeta.border
        }}
        title={expense.category}
      >
        {renderIcon()}
      </div>

      {/* Main Details */}
      <div className="expense-item-details">
        <div className="expense-item-title-row">
          <h4 className="expense-item-title">{expense.title}</h4>
          <span
            className="category-tag"
            style={{
              backgroundColor: categoryMeta.lightBg,
              color: categoryColor,
              borderColor: categoryMeta.border
            }}
          >
            {expense.category}
          </span>
        </div>

        <div className="expense-item-meta">
          <span className="expense-item-date">
            <Calendar size={13} />
            <span>{formatDate(expense.date)}</span>
          </span>

          {expense.notes && (
            <span className="expense-item-notes" title={expense.notes}>
              <FileText size={13} />
              <span>{expense.notes}</span>
            </span>
          )}
        </div>
      </div>

      {/* Amount Display */}
      <div className="expense-item-amount-col">
        <span className="expense-item-amount">
          -{formatCurrency(expense.amount)}
        </span>
      </div>

      {/* Actions (Edit and Delete) */}
      <div className="expense-item-actions">
        {showConfirm ? (
          <div className="delete-confirm-box">
            <span className="delete-confirm-text">
              <AlertCircle size={14} /> Delete?
            </span>
            <button
              type="button"
              className="btn-danger-confirm"
              onClick={handleConfirmDelete}
              title="Yes, delete this expense"
            >
              Yes
            </button>
            <button
              type="button"
              className="btn-cancel-confirm"
              onClick={() => setShowConfirm(false)}
              title="Cancel"
            >
              No
            </button>
          </div>
        ) : (
          <div className="action-buttons-group">
            {onEdit && (
              <button
                type="button"
                className="btn-action-icon btn-edit"
                onClick={() => onEdit(expense)}
                aria-label={`Edit ${expense.title}`}
                title="Edit this expense"
              >
                <Pencil size={15} />
              </button>
            )}
            <button
              type="button"
              className="btn-action-icon btn-delete"
              onClick={() => setShowConfirm(true)}
              aria-label={`Delete ${expense.title}`}
              title="Delete this record"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseItem;
