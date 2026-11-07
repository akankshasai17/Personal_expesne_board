import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import authService from './services/authService';
import { getCurrentMonth } from './utils/expenseUtils';

/**
 * App.jsx
 * Root application component.
 * Coordinates sidebar navigation, user authentication status, header, active month, and dashboard.
 */
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Month-based filtering state (persisted in LocalStorage, default to current month)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return localStorage.getItem('spendwise_pref_month') || getCurrentMonth();
  });

  // Authenticated user state loaded from localStorage session
  const [user, setUser] = useState(() => authService.getStoredUser());

  // Logout handler
  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  // Smooth scroll to dashboard sections when clicked from sidebar
  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionId === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'charts') {
      const el = document.getElementById('section-charts');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'transactions') {
      const el = document.getElementById('section-transactions');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeSection={activeSection}
        onSectionClick={handleSectionClick}
        onOpenAddModal={() => setIsFormOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        user={user}
        onLogout={handleLogout}
        onLoadSampleData={() => {
          const el = document.getElementById('section-transactions');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        <Header
          user={user}
          selectedMonth={selectedMonth}
          onOpenAddModal={() => setIsFormOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="app-main-content">
          <Dashboard
            isFormOpen={isFormOpen}
            setIsFormOpen={setIsFormOpen}
            isAuthModalOpen={isAuthModalOpen}
            setIsAuthModalOpen={setIsAuthModalOpen}
            user={user}
            setUser={setUser}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
        </main>

        {/* Global Footer */}
        <footer className="app-footer">
          <p>
            <strong>SpendWise</strong> • Full-Stack Personal Expense Visualization Board • React.js + Express.js + MongoDB Atlas + Recharts
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
