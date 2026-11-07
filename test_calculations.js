import {
  calculateTotalExpenses,
  calculateCategoryTotals,
  getCategoryChartData,
  filterAndSortExpenses,
  formatCurrency,
  getCurrentMonth,
  getPreviousMonth,
  getNextMonth,
  getDaysInMonth,
  formatMonthName,
  getAvailableYears,
  calculateMonthOverMonthComparison,
  INITIAL_SAMPLE_EXPENSES
} from './src/utils/expenseUtils.js';

console.log('--- TESTING EXPENSE UTILS ---');

// 1. Total Expenses test
const total = calculateTotalExpenses(INITIAL_SAMPLE_EXPENSES);
console.log('Total Expenses calculated:', total);
if (typeof total !== 'number' || total <= 0) {
  throw new Error('Total calculation failed');
}

// 2. Category totals test
const catTotals = calculateCategoryTotals(INITIAL_SAMPLE_EXPENSES);
console.log('Category Totals:', catTotals);
const expectedSum = Object.values(catTotals).reduce((a, b) => a + b, 0);
if (expectedSum !== total) {
  throw new Error(`Category sum (${expectedSum}) does not match total (${total})`);
}

// 3. Chart data test
const chartData = getCategoryChartData(INITIAL_SAMPLE_EXPENSES);
console.log('Chart Data entries:', chartData.length);
if (chartData.length !== 5) {
  throw new Error('Expected 5 categories in chart data');
}

// 4. Filtering test
const filteredFood = filterAndSortExpenses(INITIAL_SAMPLE_EXPENSES, { category: 'Food' });
console.log('Filtered Food count:', filteredFood.length);
filteredFood.forEach((item) => {
  if (item.category !== 'Food') throw new Error('Filter by category failed');
});

// 5. Search test
const searched = filterAndSortExpenses(INITIAL_SAMPLE_EXPENSES, { search: 'textbook' });
console.log('Search "textbook" results count:', searched.length);
if (searched.length !== 1 || !searched[0].title.includes('Textbooks')) {
  throw new Error('Search failed');
}

// 6. Currency format test
const formatted = formatCurrency(1250);
console.log('Format 1250 INR:', formatted);
if (!formatted.includes('1,250')) {
  throw new Error('Currency formatting failed');
}

// 7. Month navigation utilities test
const curr = getCurrentMonth();
console.log('Current month format (YYYY-MM):', curr);
if (!/^\d{4}-\d{2}$/.test(curr)) {
  throw new Error('getCurrentMonth did not return YYYY-MM format: ' + curr);
}

const prev = getPreviousMonth('2026-03');
if (prev !== '2026-02') {
  throw new Error('getPreviousMonth("2026-03") expected "2026-02", got ' + prev);
}

const prevYearWrap = getPreviousMonth('2026-01');
if (prevYearWrap !== '2025-12') {
  throw new Error('getPreviousMonth("2026-01") expected "2025-12", got ' + prevYearWrap);
}

const next = getNextMonth('2026-11');
if (next !== '2026-12') {
  throw new Error('getNextMonth("2026-11") expected "2026-12", got ' + next);
}

const nextYearWrap = getNextMonth('2026-12');
if (nextYearWrap !== '2027-01') {
  throw new Error('getNextMonth("2026-12") expected "2027-01", got ' + nextYearWrap);
}

// 8. Days in month test
if (getDaysInMonth('2026-02') !== 28) {
  throw new Error('2026-02 should have 28 days');
}
if (getDaysInMonth('2024-02') !== 29) {
  throw new Error('2024-02 (leap year) should have 29 days');
}

// 9. Month-over-Month comparison test
const sampleExpenses = [
  { id: '1', title: 'A', amount: 500, category: 'Food', date: '2026-03-01' },
  { id: '2', title: 'B', amount: 300, category: 'Travel', date: '2026-03-15' },
  { id: '3', title: 'C', amount: 400, category: 'Food', date: '2026-02-10' }
];

const mom = calculateMonthOverMonthComparison(sampleExpenses, '2026-03');
console.log('Month over month comparison:', mom);
if (mom.currentTotal !== 800 || mom.prevTotal !== 400 || mom.diffAmount !== 400 || mom.trend !== 'up') {
  throw new Error('Month-over-month calculation failed');
}

// 10. Empty month test (Handling months with no expenses => ₹0)
const emptyMonthExpenses = [];
const emptyTotal = calculateTotalExpenses(emptyMonthExpenses);
const emptyCatTotals = calculateCategoryTotals(emptyMonthExpenses);
if (emptyTotal !== 0) {
  throw new Error('Empty month total should be 0, got: ' + emptyTotal);
}
if (emptyCatTotals.Food !== 0 || emptyCatTotals.Travel !== 0) {
  throw new Error('Empty month category totals should all be 0');
}

console.log('✅ ALL UNIT & MONTH-FILTER LOGIC TESTS PASSED SUCCESSFULLY!');
