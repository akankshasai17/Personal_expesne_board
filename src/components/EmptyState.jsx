import React from 'react';
import { PlusCircle, Database, SearchX, AlertCircle } from 'lucide-react';

/**
 * EmptyState.jsx
 * Reusable empty state component for when no expenses exist
 * or when a filter/search produces 0 results.
 * 
 * Demonstrates: Props & Conditional Rendering
 */
const EmptyState = ({
  type = 'no-data', // 'no-data' | 'no-results'
  title,
  description,
  onAction,
  actionLabel = 'Add Expense',
  secondaryAction,
  secondaryLabel
}) => {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon-wrapper">
        {type === 'no-results' ? (
          <SearchX className="empty-state-icon" size={44} />
        ) : (
          <AlertCircle className="empty-state-icon" size={44} />
        )}
      </div>

      <h3 className="empty-state-title">
        {title || (type === 'no-results' ? 'No matching expenses found' : 'No expenses recorded yet')}
      </h3>

      <p className="empty-state-description">
        {description ||
          (type === 'no-results'
            ? 'Try adjusting your search query or selecting a different category filter.'
            : 'Start tracking your daily expenses to see smart category breakdowns and interactive charts.')}
      </p>

      <div className="empty-state-actions">
        {onAction && (
          <button type="button" className="btn btn-primary" onClick={onAction}>
            <PlusCircle size={18} />
            <span>{actionLabel}</span>
          </button>
        )}

        {secondaryAction && (
          <button type="button" className="btn btn-outline" onClick={secondaryAction}>
            <Database size={18} />
            <span>{secondaryLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
