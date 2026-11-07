import React from 'react';
import {
  LayoutDashboard,
  PieChart,
  Receipt,
  PlusCircle,
  RotateCcw,
  Database,
  Sparkles,
  Utensils,
  Plane,
  GraduationCap,
  Film,
  X,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';
import { CATEGORIES } from '../utils/expenseUtils';

/**
 * Sidebar.jsx
 * Responsive navigation sidebar with quick view filters, authenticated profile, and controls.
 */
const Sidebar = ({
  isOpen,
  onClose,
  activeSection,
  onSectionClick,
  onOpenAddModal,
  onOpenAuthModal,
  user,
  onLogout,
  onLoadSampleData,
  expenseCount = 0
}) => {
  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <Sparkles size={22} />
          </div>
          <div className="brand-text-group">
            <span className="brand-name">SpendWise</span>
            <span className="brand-tagline">MongoDB Full-Stack</span>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="sidebar-action-box">
          <button
            type="button"
            className="btn btn-sidebar-cta"
            onClick={() => {
              onOpenAddModal();
              if (onClose) onClose();
            }}
          >
            <PlusCircle size={18} />
            <span>New Expense</span>
          </button>
        </div>

        {/* Main Navigation Links */}
        <div className="sidebar-nav-group">
          <span className="sidebar-heading">Navigation</span>
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`sidebar-nav-link ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => {
                onSectionClick('overview');
                if (onClose) onClose();
              }}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard Overview</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-link ${activeSection === 'charts' ? 'active' : ''}`}
              onClick={() => {
                onSectionClick('charts');
                if (onClose) onClose();
              }}
            >
              <PieChart size={18} />
              <span>Visual Analytics</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-link ${activeSection === 'transactions' ? 'active' : ''}`}
              onClick={() => {
                onSectionClick('transactions');
                if (onClose) onClose();
              }}
            >
              <Receipt size={18} />
              <span>Recent Records</span>
              <span className="sidebar-nav-badge">{expenseCount}</span>
            </button>
          </nav>
        </div>

        {/* Category Legend Palette */}
        <div className="sidebar-nav-group">
          <span className="sidebar-heading">Color Themes</span>
          <div className="category-legend-list">
            <div className="legend-item">
              <span className="legend-indicator" style={{ backgroundColor: CATEGORIES.Food.color }} />
              <Utensils size={14} style={{ color: CATEGORIES.Food.color }} />
              <span className="legend-name">Food (Orange)</span>
            </div>
            <div className="legend-item">
              <span className="legend-indicator" style={{ backgroundColor: CATEGORIES.Travel.color }} />
              <Plane size={14} style={{ color: CATEGORIES.Travel.color }} />
              <span className="legend-name">Travel (Blue)</span>
            </div>
            <div className="legend-item">
              <span className="legend-indicator" style={{ backgroundColor: CATEGORIES.Education.color }} />
              <GraduationCap size={14} style={{ color: CATEGORIES.Education.color }} />
              <span className="legend-name">Education (Purple)</span>
            </div>
            <div className="legend-item">
              <span className="legend-indicator" style={{ backgroundColor: CATEGORIES.Entertainment.color }} />
              <Film size={14} style={{ color: CATEGORIES.Entertainment.color }} />
              <span className="legend-name">Entertainment (Pink)</span>
            </div>
          </div>
        </div>

        {/* Quick Demo Data loader */}
        <div className="sidebar-nav-group sidebar-storage-controls">
          <span className="sidebar-heading">Quick Actions</span>
          <div className="storage-button-stack">
            <button
              type="button"
              className="sidebar-utility-btn"
              onClick={() => {
                onLoadSampleData();
                if (onClose) onClose();
              }}
              title="Populate your MongoDB database with demo student records"
            >
              <Database size={15} />
              <span>Load Demo Data</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer with Authenticated User Profile */}
        <div className="sidebar-footer">
          {user ? (
            <div className="user-profile-mini">
              <div className="avatar-chip">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="profile-info">
                <span className="profile-name">{user.name}</span>
                <span className="profile-role" title={user.email}>{user.email}</span>
              </div>
              <button
                type="button"
                className="btn-profile-logout"
                onClick={onLogout}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="user-profile-login-prompt">
              <button
                type="button"
                className="btn btn-sidebar-signin"
                onClick={() => {
                  onOpenAuthModal();
                  if (onClose) onClose();
                }}
              >
                <LogIn size={16} />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
