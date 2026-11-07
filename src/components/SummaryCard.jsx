import React from 'react';
import {
  Wallet,
  Utensils,
  Plane,
  GraduationCap,
  Film,
  MoreHorizontal,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '../utils/expenseUtils';

/**
 * SummaryCard.jsx
 * Reusable summary metric card for displaying key totals.
 * 
 * Demonstrates: Props, Reusable Components, Derived Display Formatting
 */
const SummaryCard = ({
  title,
  amount,
  color = '#2563EB',
  iconType = 'wallet',
  subtitle,
  badgeText,
  isTotal = false
}) => {
  // Map icon name to Lucide Icon component
  const renderIcon = () => {
    const props = { size: 24, strokeWidth: 2.2 };
    switch (iconType?.toLowerCase()) {
      case 'utensils':
      case 'food':
        return <Utensils {...props} />;
      case 'plane':
      case 'travel':
        return <Plane {...props} />;
      case 'graduationcap':
      case 'education':
        return <GraduationCap {...props} />;
      case 'film':
      case 'entertainment':
        return <Film {...props} />;
      case 'morehorizontal':
      case 'other':
        return <MoreHorizontal {...props} />;
      case 'wallet':
      default:
        return isTotal ? <TrendingUp {...props} /> : <Wallet {...props} />;
    }
  };

  return (
    <div
      className={`summary-card ${isTotal ? 'summary-card-total' : ''}`}
      style={{
        '--card-accent-color': color
      }}
    >
      <div className="summary-card-header">
        <span className="summary-card-title">{title}</span>
        <div
          className="summary-card-icon-badge"
          style={{
            backgroundColor: `${color}18`,
            color: color
          }}
          aria-hidden="true"
        >
          {renderIcon()}
        </div>
      </div>

      <div className="summary-card-body">
        <h3 className="summary-card-amount">
          {formatCurrency(amount)}
        </h3>

        <div className="summary-card-footer">
          {subtitle && (
            <span className="summary-card-subtitle">{subtitle}</span>
          )}
          {badgeText && (
            <span
              className="summary-card-badge"
              style={{
                backgroundColor: `${color}15`,
                color: color
              }}
            >
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
