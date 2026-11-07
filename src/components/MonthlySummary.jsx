import React from 'react';
import {
  Calendar,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  CreditCard,
  PieChart as PieIcon,
  AlertCircle
} from 'lucide-react';
import {
  formatCurrency,
  formatMonthName,
  getAvailableMonths,
  getYearMonth,
  getDaysInMonth,
  calculateMonthOverMonthComparison,
  CATEGORIES
} from '../utils/expenseUtils';

/**
 * MonthlySummary.jsx
 * Displays comprehensive monthly spending breakdown, month selector,
 * average daily burn, and month-over-month comparison.
 * 
 * Demonstrates: Props, Derived Data calculations, Controlled select input, Array reduce/filter
 */
const MonthlySummary = ({
  allExpenses = [],
  selectedMonth = 'All',
  onSelectMonth
}) => {
  const availableMonths = getAvailableMonths(allExpenses);

  // Filter expenses strictly for the selected month
  const monthlyExpenses = selectedMonth === 'All'
    ? allExpenses
    : allExpenses.filter((item) => getYearMonth(item.date) === selectedMonth);

  // Calculate monthly total using array reduce
  const monthlyTotal = monthlyExpenses.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  // Find top spending category in this month
  const categoryTotals = monthlyExpenses.reduce((acc, item) => {
    const cat = item.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (Number(item.amount) || 0);
    return acc;
  }, {});

  let topCategory = 'None';
  let topAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  });

  const topCategoryMeta = CATEGORIES[topCategory] || CATEGORIES.Other;

  // Days in selected month for daily average calculation
  const daysInMonth = getDaysInMonth(selectedMonth);
  const dailyAverage = monthlyExpenses.length > 0 ? Math.round(monthlyTotal / daysInMonth) : 0;

  // Month-over-month comparison
  const comparison = calculateMonthOverMonthComparison(allExpenses, selectedMonth);

  return (
    <div className="card monthly-summary-card">
      <div className="monthly-summary-header">
        <div className="monthly-title-group">
          <div className="monthly-icon-box">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="monthly-heading">
              {selectedMonth === 'All'
                ? 'All-Time Spending Overview'
                : `${formatMonthName(selectedMonth)} Summary`}
            </h3>
            <span className="monthly-subheading">
              {selectedMonth === 'All'
                ? 'Summary of all recorded expenses across all periods'
                : `Filtered expenses for ${formatMonthName(selectedMonth)}`}
            </span>
          </div>
        </div>

        {/* Month Selector Dropdown */}
        <div className="month-picker-wrapper">
          <label htmlFor="month-select" className="sr-only">
            Select Month
          </label>
          <div className="select-container">
            <select
              id="month-select"
              className="month-select"
              value={selectedMonth}
              onChange={(e) => onSelectMonth(e.target.value)}
            >
              <option value="All">All Months (Overall)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthName(m)}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="monthly-metrics-grid">
        {/* Metric 1: Total Period Spend */}
        <div className="monthly-metric-item">
          <span className="metric-label">
            {selectedMonth === 'All' ? 'Overall Spending' : 'Total Month Spend'}
          </span>
          <div className="metric-val-wrapper">
            <strong className="metric-value">{formatCurrency(monthlyTotal)}</strong>
          </div>
          <span className="metric-hint">
            {monthlyExpenses.length === 0
              ? 'No transactions recorded for this period'
              : `${monthlyExpenses.length} transaction${monthlyExpenses.length !== 1 ? 's' : ''} recorded`}
          </span>
        </div>

        {/* Metric 2: Top Expense Category */}
        <div className="monthly-metric-item">
          <span className="metric-label">Top Expense Category</span>
          <div className="metric-val-wrapper">
            {topAmount > 0 ? (
              <span
                className="metric-category-chip"
                style={{
                  backgroundColor: topCategoryMeta.lightBg,
                  color: topCategoryMeta.color,
                  borderColor: topCategoryMeta.border
                }}
              >
                {topCategory}
              </span>
            ) : (
              <span className="metric-value-empty">—</span>
            )}
          </div>
          <span className="metric-hint">
            {topAmount > 0 ? `${formatCurrency(topAmount)} spent` : '₹0 spent in this category'}
          </span>
        </div>

        {/* Metric 3: Average Daily Spend */}
        <div className="monthly-metric-item">
          <span className="metric-label">
            {selectedMonth === 'All' ? 'Average per Transaction' : 'Average Daily Spend'}
          </span>
          <div className="metric-val-wrapper">
            <strong className="metric-value">
              {selectedMonth === 'All'
                ? monthlyExpenses.length > 0
                  ? formatCurrency(Math.round(monthlyTotal / monthlyExpenses.length))
                  : '₹0'
                : formatCurrency(dailyAverage)}
            </strong>
          </div>
          <span className="metric-hint">
            {selectedMonth === 'All'
              ? 'Calculated across all transactions'
              : `Across ${daysInMonth} days in ${formatMonthName(selectedMonth).split(' ')[0]}`}
          </span>
        </div>
      </div>

      {/* Optional Month-Over-Month Comparison Banner (when a specific month is selected) */}
      {comparison && (
        <div className="month-comparison-banner">
          <div className="comparison-trend-icon">
            {comparison.trend === 'up' && <TrendingUp size={16} className="trend-up" />}
            {comparison.trend === 'down' && <TrendingDown size={16} className="trend-down" />}
            {comparison.trend === 'same' && <Minus size={16} className="trend-same" />}
          </div>
          <div className="comparison-text">
            <strong>
              {comparison.trend === 'up' && 'Spending increased '}
              {comparison.trend === 'down' && 'Spending decreased '}
              {comparison.trend === 'same' && 'Spending unchanged '}
              by {formatCurrency(comparison.diffAmount)}
              {comparison.diffPercent > 0 ? ` (${comparison.diffPercent}%)` : ''}
            </strong>
            <span> compared to previous month ({formatMonthName(comparison.prevMonth)}: {formatCurrency(comparison.prevTotal)})</span>
          </div>
        </div>
      )}

      {/* Empty Month Notice when selected month has ₹0 spend */}
      {monthlyExpenses.length === 0 && selectedMonth !== 'All' && (
        <div className="empty-month-notice">
          <AlertCircle size={16} />
          <span>No expenses were recorded for {formatMonthName(selectedMonth)}. All category totals reflect ₹0.</span>
        </div>
      )}
    </div>
  );
};

export default MonthlySummary;
