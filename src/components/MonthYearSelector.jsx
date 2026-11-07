import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Filter,
  Check
} from 'lucide-react';
import {
  MONTH_NAMES,
  getCurrentMonth,
  getPreviousMonth,
  getNextMonth,
  formatMonthName,
  getAvailableMonths,
  getAvailableYears
} from '../utils/expenseUtils';

/**
 * MonthYearSelector.jsx
 * Interactive Month and Year selector allowing users to switch between
 * Current Month, Previous Month, Any specific Month/Year, or All Time.
 * 
 * Demonstrates: Controlled inputs, Event handling, Date manipulation, Conditional styling
 */
const MonthYearSelector = ({
  selectedMonth = 'All',
  onSelectMonth,
  allExpenses = []
}) => {
  const currentMonth = getCurrentMonth();
  const previousMonth = getPreviousMonth(currentMonth);

  // Parse currently selected month into year and month index if not 'All'
  const isAllTime = selectedMonth === 'All';
  let selectedYear = new Date().getFullYear();
  let selectedMonthIndex = new Date().getMonth(); // 0 to 11

  if (!isAllTime && selectedMonth) {
    const [y, m] = selectedMonth.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m)) {
      selectedYear = y;
      selectedMonthIndex = m - 1;
    }
  }

  const availableYears = getAvailableYears(allExpenses);

  // Quick navigation handlers
  const handlePrevMonth = () => {
    if (isAllTime) {
      onSelectMonth(previousMonth);
    } else {
      onSelectMonth(getPreviousMonth(selectedMonth));
    }
  };

  const handleNextMonth = () => {
    if (isAllTime) {
      onSelectMonth(currentMonth);
    } else {
      onSelectMonth(getNextMonth(selectedMonth));
    }
  };

  // Change specific month dropdown
  const handleMonthChange = (e) => {
    const newMonthIndex = parseInt(e.target.value, 10);
    const newMonthStr = String(newMonthIndex + 1).padStart(2, '0');
    onSelectMonth(`${selectedYear}-${newMonthStr}`);
  };

  // Change specific year dropdown
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    const monthStr = String(selectedMonthIndex + 1).padStart(2, '0');
    onSelectMonth(`${newYear}-${monthStr}`);
  };

  // Check preset active states
  const isCurrentActive = selectedMonth === currentMonth;
  const isPrevActive = selectedMonth === previousMonth;

  return (
    <div className="card month-year-selector-card" aria-label="Month and Year Filter">
      <div className="selector-inner-flex">
        {/* Left Side: Preset Buttons */}
        <div className="selector-preset-group" role="tablist" aria-label="Quick Month Presets">
          <button
            type="button"
            className={`preset-pill ${isAllTime ? 'active' : ''}`}
            onClick={() => onSelectMonth('All')}
          >
            <Clock size={14} />
            <span>All Time</span>
          </button>

          <button
            type="button"
            className={`preset-pill ${isCurrentActive ? 'active' : ''}`}
            onClick={() => onSelectMonth(currentMonth)}
          >
            <Sparkles size={14} />
            <span>Current Month</span>
            {isCurrentActive && <Check size={12} className="check-icon" />}
          </button>

          <button
            type="button"
            className={`preset-pill ${isPrevActive ? 'active' : ''}`}
            onClick={() => onSelectMonth(previousMonth)}
          >
            <Calendar size={14} />
            <span>Previous Month</span>
            {isPrevActive && <Check size={12} className="check-icon" />}
          </button>
        </div>

        {/* Center / Right: Month Stepper & Custom Pickers */}
        <div className="selector-controls-wrapper">
          {/* Month Stepper Buttons (< >) */}
          <div className="month-stepper-box">
            <button
              type="button"
              className="stepper-arrow-btn"
              onClick={handlePrevMonth}
              title="View previous month"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="stepper-current-label">
              {formatMonthName(selectedMonth)}
            </span>

            <button
              type="button"
              className="stepper-arrow-btn"
              onClick={handleNextMonth}
              title="View next month"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Month and Year Dropdowns */}
          <div className="dropdowns-combo">
            {/* Month Dropdown */}
            <div className="select-wrapper">
              <select
                className="custom-select month-dropdown"
                value={isAllTime ? '' : selectedMonthIndex}
                onChange={handleMonthChange}
                aria-label="Select month"
              >
                {isAllTime && <option value="">Select Month</option>}
                {MONTH_NAMES.map((name, index) => (
                  <option key={name} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Dropdown */}
            <div className="select-wrapper">
              <select
                className="custom-select year-dropdown"
                value={selectedYear}
                onChange={handleYearChange}
                aria-label="Select year"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthYearSelector;
