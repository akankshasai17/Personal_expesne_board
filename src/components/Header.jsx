import React from 'react';
import { PlusCircle, Calendar, Menu, Sparkles, LogIn, LogOut, Clock } from 'lucide-react';
import { formatMonthName } from '../utils/expenseUtils';

/**
 * Header.jsx
 * Top navigation bar displaying branding, active filtered period, authenticated user, and actions.
 */
const Header = ({
  user,
  selectedMonth = 'All',
  onOpenAddModal,
  onOpenAuthModal,
  onLogout,
  onToggleSidebar
}) => {
  const today = new Date();
  const currentMonthYear = today.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });
  const formattedFullDate = today.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const periodLabel = selectedMonth === 'All' ? 'All Months' : formatMonthName(selectedMonth);

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Mobile menu hamburger toggle */}
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-titles">
          <div className="header-brand-tag">
            <Sparkles size={14} className="sparkle-icon" />
            <span>SpendWise Finance</span>
          </div>
          <h1 className="header-main-title">Personal Expense Dashboard</h1>
        </div>
      </div>

      <div className="header-right">
        {/* Active Period badge */}
        <div className="current-date-badge" title={`Today: ${formattedFullDate} | Active View: ${periodLabel}`}>
          {selectedMonth === 'All' ? (
            <Clock size={16} className="date-icon" />
          ) : (
            <Calendar size={16} className="date-icon" />
          )}
          <div className="date-texts">
            <span className="date-label">Active Period</span>
            <span className="date-value">{periodLabel}</span>
          </div>
        </div>

        {/* User Account State (Logged In vs Guest) */}
        {user ? (
          <div className="header-user-badge">
            <div className="user-avatar-small" title={user.email}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-header-text">
              <span className="user-header-name">{user.name}</span>
            </div>
            <button
              type="button"
              className="btn-header-logout"
              onClick={onLogout}
              title="Sign Out"
            >
              <LogOut size={16} />
              <span className="hide-on-mobile">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-outline btn-auth-trigger"
            onClick={onOpenAuthModal}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
        )}

        {/* Primary CTA button */}
        <button
          type="button"
          className="btn btn-primary add-expense-cta"
          onClick={onOpenAddModal}
        >
          <PlusCircle size={18} />
          <span>Add Expense</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
