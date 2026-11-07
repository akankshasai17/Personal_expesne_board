import React from 'react';
import { Search, X, ListFilter, Calendar } from 'lucide-react';
import ExpenseItem from './ExpenseItem';
import CategoryFilter from './CategoryFilter';
import EmptyState from './EmptyState';
import { formatCurrency, formatMonthName } from '../utils/expenseUtils';

/**
 * ExpenseList.jsx
 * Recent transactions list with search, category filtering, count, and delete capabilities.
 * 
 * Demonstrates: Props, Array map() method, Conditional Rendering, Event Handling
 */
const ExpenseList = ({
  expenses = [],
  allExpenses = [],
  selectedCategory,
  onSelectCategory,
  selectedMonth = 'All',
  onSelectMonth,
  searchQuery,
  onSearchChange,
  onDeleteExpense,
  onEditExpense,
  onOpenAddModal,
  onLoadSampleData,
  categoryCounts = {}
}) => {
  // Calculate total for currently filtered list
  const filteredTotal = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const periodLabel = selectedMonth === 'All' ? 'All Months' : formatMonthName(selectedMonth);

  return (
    <section className="card expense-list-card" aria-labelledby="recent-expenses-heading">
      <div className="card-header expense-list-header">
        <div className="card-header-titles">
          <div className="header-icon-badge">
            <ListFilter size={20} />
          </div>
          <div>
            <h2 id="recent-expenses-heading" className="card-title">
              Recent Expenses
            </h2>
            <p className="card-subtitle">
              Showing records for <span className="highlight-period">{periodLabel}</span>
            </p>
          </div>
        </div>

        {/* Filtered stats chip */}
        <div className="filtered-stats-badge">
          <span className="stats-count">{expenses.length} records</span>
          <span className="stats-separator">•</span>
          <span className="stats-total">{formatCurrency(filteredTotal)}</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="expense-filters-bar">
        {/* Search input */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title or notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search expenses"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          categoryCounts={categoryCounts}
          totalCount={expenses.length}
        />
      </div>

      {/* Expense List Items or Empty State */}
      <div className="expense-list-content">
        {allExpenses.length === 0 ? (
          // Global empty state: No expenses at all
          <EmptyState
            type="no-data"
            title="Your expense board is empty"
            description="You haven't recorded any expenses yet. Click 'Add Expense' to record your first transaction."
            onAction={onOpenAddModal}
            actionLabel="Add Your First Expense"
            secondaryAction={onLoadSampleData}
            secondaryLabel="Load Demo Data"
          />
        ) : expenses.length === 0 ? (
          // Filtered empty state: Filters, Search, or Month yielded 0 matches
          <EmptyState
            type="no-results"
            title={
              selectedMonth !== 'All'
                ? `No expenses in ${formatMonthName(selectedMonth)}`
                : 'No matching transactions'
            }
            description={
              selectedMonth !== 'All'
                ? `Total spending for ${formatMonthName(selectedMonth)} is ₹0. Add an expense for this month or switch to a different period.`
                : `No expenses match "${searchQuery || selectedCategory}". Try changing filters or clearing search.`
            }
            onAction={() => {
              onSearchChange('');
              onSelectCategory('All');
              if (selectedMonth !== 'All') {
                onSelectMonth('All');
              }
            }}
            actionLabel={selectedMonth !== 'All' ? 'View All Months' : 'Reset Filters'}
            secondaryAction={onOpenAddModal}
            secondaryLabel="Add Expense"
          />
        ) : (
          // Render expense items using array map()
          <div className="expense-items-scrollable">
            <div className="expense-items-list" role="list">
              {expenses.map((expense) => (
                <ExpenseItem
                  key={expense.id || expense._id}
                  expense={expense}
                  onDelete={onDeleteExpense}
                  onEdit={onEditExpense}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExpenseList;
