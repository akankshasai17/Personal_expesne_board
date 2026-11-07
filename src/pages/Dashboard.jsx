import React, { useState, useEffect, useCallback } from 'react';
import MonthYearSelector from '../components/MonthYearSelector';
import SummaryCard from '../components/SummaryCard';
import MonthlySummary from '../components/MonthlySummary';
import ExpenseCharts from '../components/ExpenseCharts';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import AuthModal from '../components/AuthModal';
import {
  CATEGORIES,
  calculateTotalExpenses,
  calculateCategoryTotals,
  getCategoryChartData,
  filterAndSortExpenses,
  getYearMonth,
  getCurrentMonth,
  formatMonthName,
  INITIAL_SAMPLE_EXPENSES
} from '../utils/expenseUtils';
import {
  loadExpensesFromStorage,
  saveExpensesToStorage,
  clearExpensesFromStorage
} from '../utils/storage';
import expenseService from '../services/expenseService';
import authService from '../services/authService';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  Loader2,
  Database,
  Lock,
  Calendar,
  Layers
} from 'lucide-react';

/**
 * Dashboard.jsx
 * The main container component for the Personal Expense Visualization Board.
 * Features comprehensive Month & Year filtering, dynamic monthly totals,
 * category breakdowns, charts synchronization, and LocalStorage + MongoDB persistence.
 */
const Dashboard = ({
  isFormOpen,
  setIsFormOpen,
  isAuthModalOpen,
  setIsAuthModalOpen,
  user,
  setUser,
  selectedMonth,
  setSelectedMonth
}) => {
  // 1. Expenses state: Loaded from LocalStorage on mount, synced with MongoDB if authenticated
  const [expenses, setExpenses] = useState(() => {
    const saved = loadExpensesFromStorage();
    return saved.length > 0 ? saved : INITIAL_SAMPLE_EXPENSES;
  });

  const [loading, setLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // 2. UI Filtering State
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem('spendwise_pref_category') || 'All';
  });
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Temporary Toast Feedback Notification State
  const [notification, setNotification] = useState(null);

  // Helper to trigger temporary toast alerts
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Sync expenses state to browser LocalStorage on every change
  useEffect(() => {
    saveExpensesToStorage(expenses);
  }, [expenses]);

  // Persist non-sensitive filter preferences in LocalStorage
  useEffect(() => {
    localStorage.setItem('spendwise_pref_category', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem('spendwise_pref_month', selectedMonth);
  }, [selectedMonth]);

  // Fetch expenses from MongoDB backend via Axios if user is authenticated
  const fetchExpensesFromAPI = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      return;
    }

    setLoading(true);
    try {
      const result = await expenseService.fetchExpenses();
      if (result.success && Array.isArray(result.data)) {
        setExpenses(result.data);
        saveExpensesToStorage(result.data);
      }
    } catch (err) {
      console.warn('Backend offline or not reachable. Working with LocalStorage expenses:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data whenever user session changes
  useEffect(() => {
    fetchExpensesFromAPI();
  }, [fetchExpensesFromAPI, user]);

  // --- Handlers for CRUD Operations (Works with LocalStorage + MongoDB) ---

  // Add new expense
  const handleAddExpense = async (newExpenseData) => {
    // If authenticated, sync with MongoDB
    if (user && authService.isAuthenticated()) {
      try {
        const response = await expenseService.createExpense(newExpenseData);
        if (response.success && response.data) {
          setExpenses((prev) => [response.data, ...prev]);
          showToast(`Saved "${response.data.title}" to database!`, 'success');
          return;
        }
      } catch (err) {
        console.warn('MongoDB save error, falling back to LocalStorage:', err);
      }
    }

    // Local / Guest mode fallback
    const localExpense = {
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...newExpenseData
    };
    setExpenses((prev) => [localExpense, ...prev]);
    showToast(`Added "${localExpense.title}" successfully!`, 'success');
  };

  // Edit / Update expense
  const handleUpdateExpense = async (id, updatedData) => {
    if (user && authService.isAuthenticated()) {
      try {
        const response = await expenseService.updateExpense(id, updatedData);
        if (response.success && response.data) {
          setExpenses((prev) =>
            prev.map((item) => (item.id === id || item._id === id ? response.data : item))
          );
          showToast(`Updated "${response.data.title}" successfully!`, 'success');
          setEditingExpense(null);
          return;
        }
      } catch (err) {
        console.warn('MongoDB update error, updating local state:', err);
      }
    }

    setExpenses((prev) =>
      prev.map((item) =>
        item.id === id || item._id === id ? { ...item, ...updatedData } : item
      )
    );
    showToast('Expense updated successfully!', 'success');
    setEditingExpense(null);
  };

  // Delete an expense
  const handleDeleteExpense = async (id) => {
    if (user && authService.isAuthenticated()) {
      try {
        await expenseService.deleteExpense(id);
      } catch (err) {
        console.warn('MongoDB delete error:', err);
      }
    }

    setExpenses((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    showToast('Expense removed successfully!', 'info');
  };

  // Trigger editing an expense (Opens form in Edit Mode)
  const handleStartEdit = (expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  // Close form modal & reset editing state
  const handleCloseForm = () => {
    setEditingExpense(null);
    setIsFormOpen(false);
  };

  // Populate sample demo records
  const handleLoadSampleData = async () => {
    setExpenses(INITIAL_SAMPLE_EXPENSES);
    saveExpensesToStorage(INITIAL_SAMPLE_EXPENSES);
    showToast('Loaded sample demo expenses into LocalStorage!', 'success');

    if (user && authService.isAuthenticated()) {
      for (const sample of INITIAL_SAMPLE_EXPENSES) {
        const { id, ...dataWithoutId } = sample;
        try {
          await expenseService.createExpense(dataWithoutId);
        } catch {
          // ignore individual sync errors
        }
      }
    }
  };

  // Handle successful login or registration
  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    showToast(`Welcome, ${authenticatedUser.name}! Synchronized with database.`, 'success');
  };

  // --- Scoped Monthly Calculations (Requirements 4, 5, 8) ---

  // Filter expenses strictly for the selected month to drive Summary Cards and Charts
  const monthlyScopedExpenses =
    selectedMonth === 'All'
      ? expenses
      : expenses.filter((e) => getYearMonth(e.date) === selectedMonth);

  // Total expenses for the selected month (displays 0 / ₹0 if empty)
  const totalExpenses = calculateTotalExpenses(monthlyScopedExpenses);

  // Category-wise totals for the selected month
  const categoryTotals = calculateCategoryTotals(monthlyScopedExpenses);

  // Recharts data formatted for the selected month
  const chartData = getCategoryChartData(monthlyScopedExpenses);

  // Filtered and sorted list for display (Category + Search + Month)
  const filteredExpenses = filterAndSortExpenses(expenses, {
    category: selectedCategory,
    search: searchQuery,
    month: selectedMonth
  });

  // Calculate category item counts for the active month view
  const categoryCounts = monthlyScopedExpenses.reduce((acc, item) => {
    const cat = item.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const periodLabel = selectedMonth === 'All' ? 'All Months' : formatMonthName(selectedMonth);

  return (
    <div className="dashboard-content-area">
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`toast-notification toast-${notification.type}`} role="status">
          {notification.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Hero Welcome & Quick Info Banner */}
      <div className="dashboard-hero-banner">
        <div className="hero-text">
          <span className="hero-pill">
            <Sparkles size={14} /> Smart Finance Visualization
          </span>
          <h2 className="hero-title">
            {user ? `${user.name}'s Expense Board` : 'Personal Expense Dashboard'}
          </h2>
          <p className="hero-desc">
            Filter transactions by month and year, view spending trends, and explore interactive Recharts analytics.
          </p>
        </div>
        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-hero-cta"
            onClick={() => {
              setEditingExpense(null);
              setIsFormOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 1. Month & Year Selector Component (Requirement 1 & 2) */}
      <section className="month-selector-section" aria-label="Month and Year Filter">
        <MonthYearSelector
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
          allExpenses={expenses}
        />
      </section>

      {/* Active Filter Period Indicator Banner */}
      <div className="active-period-banner">
        <div className="period-indicator-text">
          <Calendar size={16} className="period-icon" />
          <span>
            Active View: <strong>{periodLabel}</strong> ({monthlyScopedExpenses.length} transactions)
          </span>
        </div>
        {selectedMonth !== 'All' && (
          <button
            type="button"
            className="btn-view-all-months"
            onClick={() => setSelectedMonth('All')}
          >
            <Layers size={13} />
            <span>Show All Months</span>
          </button>
        )}
      </div>

      {/* 2. Summary Cards Section (Dynamically updated for Selected Month) */}
      <section className="summary-cards-section" aria-label="Key Expense Totals">
        {/* Card 1: Total Expenses for Selected Month */}
        <SummaryCard
          title="Total Expenses"
          amount={totalExpenses}
          color="#2563EB"
          iconType="wallet"
          subtitle={`${monthlyScopedExpenses.length} entries in ${periodLabel.split(' ')[0]}`}
          badgeText={selectedMonth === 'All' ? 'All Time' : periodLabel}
          isTotal={true}
        />

        {/* Card 2: Food Expenses (Warm Orange) */}
        <SummaryCard
          title="Food Expenses"
          amount={categoryTotals.Food}
          color={CATEGORIES.Food.color}
          iconType="food"
          subtitle={`${categoryCounts.Food || 0} meals & groceries`}
          badgeText={
            totalExpenses > 0
              ? `${Math.round((categoryTotals.Food / totalExpenses) * 100)}%`
              : '0%'
          }
        />

        {/* Card 3: Travel Expenses (Blue) */}
        <SummaryCard
          title="Travel Expenses"
          amount={categoryTotals.Travel}
          color={CATEGORIES.Travel.color}
          iconType="travel"
          subtitle={`${categoryCounts.Travel || 0} trips & transit`}
          badgeText={
            totalExpenses > 0
              ? `${Math.round((categoryTotals.Travel / totalExpenses) * 100)}%`
              : '0%'
          }
        />

        {/* Card 4: Education Expenses (Purple) */}
        <SummaryCard
          title="Education Expenses"
          amount={categoryTotals.Education}
          color={CATEGORIES.Education.color}
          iconType="education"
          subtitle={`${categoryCounts.Education || 0} courses & books`}
          badgeText={
            totalExpenses > 0
              ? `${Math.round((categoryTotals.Education / totalExpenses) * 100)}%`
              : '0%'
          }
        />

        {/* Card 5: Entertainment Expenses (Pink) */}
        <SummaryCard
          title="Entertainment"
          amount={categoryTotals.Entertainment}
          color={CATEGORIES.Entertainment.color}
          iconType="entertainment"
          subtitle={`${categoryCounts.Entertainment || 0} leisure & movies`}
          badgeText={
            totalExpenses > 0
              ? `${Math.round((categoryTotals.Entertainment / totalExpenses) * 100)}%`
              : '0%'
          }
        />
      </section>

      {/* 3. Monthly Summary Section (Requirement 6 & 8) */}
      <section id="section-monthly" className="monthly-summary-section">
        <MonthlySummary
          allExpenses={expenses}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
        />
      </section>

      {/* 4. Visual Charts Section (Requirement 5 & 8) */}
      <section id="section-charts" className="dashboard-charts-section">
        <ExpenseCharts
          chartData={chartData}
          totalAmount={totalExpenses}
          selectedMonth={selectedMonth}
        />
      </section>

      {/* 5. Recent Expenses Section (Requirement 3 & 8) */}
      <section id="section-transactions" className="dashboard-transactions-section">
        {loading ? (
          <div className="card loading-indicator-box">
            <Loader2 className="spinner" size={28} />
            <p>Loading expenses...</p>
          </div>
        ) : (
          <ExpenseList
            expenses={filteredExpenses}
            allExpenses={expenses}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={handleStartEdit}
            onOpenAddModal={() => {
              setEditingExpense(null);
              setIsFormOpen(true);
            }}
            onLoadSampleData={handleLoadSampleData}
            categoryCounts={categoryCounts}
          />
        )}
      </section>

      {/* 6. Add / Edit Expense Modal Dialog */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onAddExpense={handleAddExpense}
        onUpdateExpense={handleUpdateExpense}
        initialData={editingExpense}
      />

      {/* 7. User Registration / Login Modal Dialog */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Dashboard;
