/**
 * expenseUtils.js
 * Utility helper functions for calculations, date formatting, 
 * currency formatting, category configurations, and month-based filtering.
 * 
 * Demonstrates JavaScript array methods: reduce(), filter(), map()
 */

// Core Categories with required consistent color palette
export const CATEGORIES = {
  Food: {
    name: 'Food',
    color: '#F97316', // Warm Orange
    lightBg: '#FFF7ED',
    border: '#FDBA74',
    icon: 'Utensils'
  },
  Travel: {
    name: 'Travel',
    color: '#3B82F6', // Blue
    lightBg: '#EFF6FF',
    border: '#93C5FD',
    icon: 'Plane'
  },
  Education: {
    name: 'Education',
    color: '#8B5CF6', // Purple
    lightBg: '#F5F3FF',
    border: '#C4B5FD',
    icon: 'GraduationCap'
  },
  Entertainment: {
    name: 'Entertainment',
    color: '#EC4899', // Pink
    lightBg: '#FDF2F8',
    border: '#F472B6',
    icon: 'Film'
  },
  Other: {
    name: 'Other',
    color: '#0D9488', // Teal
    lightBg: '#F0FDFA',
    border: '#5EEAD4',
    icon: 'MoreHorizontal'
  }
};

export const CATEGORY_NAMES = Object.keys(CATEGORIES);

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

/**
 * Format a number as Indian Rupees (INR)
 * Example: 1250 => "₹1,250"
 */
export const formatCurrency = (amount) => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numericAmount);
};

/**
 * Format YYYY-MM-DD into readable date (e.g., "04 Nov 2026")
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;

  const date = new Date(year, parseInt(month, 10) - 1, day);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Returns today's date formatted as YYYY-MM-DD for <input type="date">
 */
export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Extract Year-Month string (YYYY-MM) from date
 */
export const getYearMonth = (dateString) => {
  if (!dateString) return '';
  return dateString.substring(0, 7);
};

/**
 * Get current year-month (e.g., "2026-11")
 */
export const getCurrentMonth = () => {
  return getYearMonth(getTodayDateString());
};

/**
 * Get previous month given a YYYY-MM string (or current month if omitted)
 */
export const getPreviousMonth = (yearMonthStr) => {
  const base = yearMonthStr && yearMonthStr !== 'All' ? yearMonthStr : getCurrentMonth();
  const [year, month] = base.split('-').map(Number);
  const date = new Date(year, month - 2, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

/**
 * Get next month given a YYYY-MM string (or current month if omitted)
 */
export const getNextMonth = (yearMonthStr) => {
  const base = yearMonthStr && yearMonthStr !== 'All' ? yearMonthStr : getCurrentMonth();
  const [year, month] = base.split('-').map(Number);
  const date = new Date(year, month, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

/**
 * Get total number of days in a given YYYY-MM
 */
export const getDaysInMonth = (yearMonthStr) => {
  if (!yearMonthStr || yearMonthStr === 'All') return 30;
  const [year, month] = yearMonthStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

/**
 * Format Year-Month (e.g. "2026-11" -> "November 2026")
 */
export const formatMonthName = (yearMonthString) => {
  if (!yearMonthString || yearMonthString === 'All') return 'All Months';
  const [year, month] = yearMonthString.split('-');
  const date = new Date(year, parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

/**
 * Derived Data: Calculate total expenses across all records
 * Uses array reduce() method
 */
export const calculateTotalExpenses = (expenses = []) => {
  return expenses.reduce((total, item) => total + (Number(item.amount) || 0), 0);
};

/**
 * Derived Data: Calculate total spending per category
 * Uses array reduce() method
 */
export const calculateCategoryTotals = (expenses = []) => {
  const initialTotals = {
    Food: 0,
    Travel: 0,
    Education: 0,
    Entertainment: 0,
    Other: 0
  };

  return expenses.reduce((acc, item) => {
    const cat = item.category in acc ? item.category : 'Other';
    acc[cat] = (acc[cat] || 0) + (Number(item.amount) || 0);
    return acc;
  }, initialTotals);
};

/**
 * Derived Data: Prepare data formatted for Recharts (Donut and Bar charts)
 * Uses array map() method
 */
export const getCategoryChartData = (expenses = []) => {
  const totals = calculateCategoryTotals(expenses);
  const totalAmount = calculateTotalExpenses(expenses);

  return CATEGORY_NAMES.map((cat) => {
    const value = totals[cat] || 0;
    const percentage = totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) : 0;
    return {
      name: cat,
      amount: value,
      value: value,
      percentage: Number(percentage),
      color: CATEGORIES[cat]?.color || '#6B7280'
    };
  });
};

/**
 * Filter & Sort expenses based on Category, Search Query, and Month
 * Uses array filter() and sort()
 */
export const filterAndSortExpenses = (expenses = [], { category = 'All', search = '', month = 'All' } = {}) => {
  const query = search.trim().toLowerCase();

  return expenses
    .filter((expense) => {
      // 1. Category filter
      const matchesCategory = category === 'All' || expense.category === category;

      // 2. Search filter (title or notes)
      const matchesSearch =
        !query ||
        expense.title.toLowerCase().includes(query) ||
        (expense.notes && expense.notes.toLowerCase().includes(query));

      // 3. Month filter (matches YYYY-MM)
      const matchesMonth = month === 'All' || getYearMonth(expense.date) === month;

      return matchesCategory && matchesSearch && matchesMonth;
    })
    .sort((a, b) => {
      // Sort newest date first
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      // If same date, sort by ID descending (newest created)
      return (b.id || b._id || '').localeCompare(a.id || a._id || '');
    });
};

/**
 * Get unique available months from the expense list for the Month Selector dropdown,
 * plus current month and previous month so users can always choose them even if empty.
 */
export const getAvailableMonths = (expenses = []) => {
  const monthSet = new Set();
  // Always include current month and previous month
  monthSet.add(getCurrentMonth());
  monthSet.add(getPreviousMonth(getCurrentMonth()));

  expenses.forEach((item) => {
    if (item.date) {
      monthSet.add(getYearMonth(item.date));
    }
  });

  // Sort descending (latest month first)
  return Array.from(monthSet).sort().reverse();
};

/**
 * Get unique years present in the expenses list + recent years
 */
export const getAvailableYears = (expenses = []) => {
  const yearSet = new Set();
  const currentYear = new Date().getFullYear();
  yearSet.add(currentYear);
  yearSet.add(currentYear - 1);
  yearSet.add(currentYear + 1);

  expenses.forEach((item) => {
    if (item.date) {
      const yr = parseInt(item.date.substring(0, 4), 10);
      if (!isNaN(yr)) yearSet.add(yr);
    }
  });

  return Array.from(yearSet).sort((a, b) => b - a);
};

/**
 * Month-over-month spending comparison (selected month vs previous month)
 */
export const calculateMonthOverMonthComparison = (expenses = [], selectedMonth = 'All') => {
  if (selectedMonth === 'All') {
    return null;
  }

  const prevMonth = getPreviousMonth(selectedMonth);

  const currentMonthExpenses = expenses.filter((e) => getYearMonth(e.date) === selectedMonth);
  const prevMonthExpenses = expenses.filter((e) => getYearMonth(e.date) === prevMonth);

  const currentTotal = calculateTotalExpenses(currentMonthExpenses);
  const prevTotal = calculateTotalExpenses(prevMonthExpenses);

  const diffAmount = currentTotal - prevTotal;
  let diffPercent = 0;
  if (prevTotal > 0) {
    diffPercent = Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
  } else if (currentTotal > 0) {
    diffPercent = 100;
  }

  let trend = 'same';
  if (diffAmount > 0) trend = 'up';
  else if (diffAmount < 0) trend = 'down';

  return {
    currentMonth: selectedMonth,
    prevMonth,
    currentTotal,
    prevTotal,
    diffAmount: Math.abs(diffAmount),
    diffPercent: Math.abs(diffPercent),
    trend
  };
};

/**
 * Sample initial expenses for first-time preview or demo button
 */
export const INITIAL_SAMPLE_EXPENSES = [
  {
    id: 'exp-1',
    title: 'College Textbooks & Reference Guides',
    amount: 1450,
    category: 'Education',
    date: '2026-11-04',
    notes: 'Computer Science Core Architecture & Algorithms books'
  },
  {
    id: 'exp-2',
    title: 'Metro Rail Monthly Smart Card Recharge',
    amount: 800,
    category: 'Travel',
    date: '2026-11-03',
    notes: 'Daily commute to campus'
  },
  {
    id: 'exp-3',
    title: 'Cafeteria Lunch & Coffee',
    amount: 280,
    category: 'Food',
    date: '2026-11-03',
    notes: 'South Indian thali and filter coffee'
  },
  {
    id: 'exp-4',
    title: 'Weekend Movie Tickets (IMAX)',
    amount: 650,
    category: 'Entertainment',
    date: '2026-11-02',
    notes: 'Watched new sci-fi release with project mates'
  },
  {
    id: 'exp-5',
    title: 'Online Programming Course Certification',
    amount: 999,
    category: 'Education',
    date: '2026-11-01',
    notes: 'Full-stack React & Frontend Architecture course'
  },
  {
    id: 'exp-6',
    title: 'Grocery & Fresh Fruits',
    amount: 520,
    category: 'Food',
    date: '2026-10-30',
    notes: 'Weekly fresh fruits and cereal supplies'
  }
];
