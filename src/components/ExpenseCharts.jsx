import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp, Info, Calendar } from 'lucide-react';
import { formatCurrency, formatMonthName, CATEGORIES } from '../utils/expenseUtils';

/**
 * Custom Tooltip for Recharts to display formatted INR amounts & percentage
 */
const CustomChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-header">
          <span
            className="tooltip-dot"
            style={{ backgroundColor: data.color || payload[0].fill }}
          />
          <strong className="tooltip-title">{data.name}</strong>
        </div>
        <div className="tooltip-body">
          <span className="tooltip-value">{formatCurrency(data.amount || data.value)}</span>
          {data.percentage !== undefined && (
            <span className="tooltip-percentage">({data.percentage}%)</span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

/**
 * ExpenseCharts.jsx
 * Visualizes spending data using Recharts (Donut & Bar Charts).
 * Synchronized with the active month filter.
 * 
 * Demonstrates: Props, Conditional Rendering, Recharts integration, Derived Data rendering
 */
const ExpenseCharts = ({ chartData = [], totalAmount = 0, selectedMonth = 'All' }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'donut' | 'bar'

  // Filter out categories with 0 spend for the Donut chart so it looks clean
  const nonZeroData = chartData.filter((item) => (item.amount || item.value) > 0);
  const hasExpenses = totalAmount > 0 && nonZeroData.length > 0;

  const periodLabel = selectedMonth === 'All' ? 'All-Time Spending' : formatMonthName(selectedMonth);

  return (
    <section className="card charts-card" aria-labelledby="analytics-heading">
      <div className="card-header charts-header">
        <div className="card-header-titles">
          <div className="header-icon-badge charts-badge">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 id="analytics-heading" className="card-title">
              Visual Spending Analytics
            </h2>
            <p className="card-subtitle">
              Category distribution for <span className="highlight-period">{periodLabel}</span>
            </p>
          </div>
        </div>

        {/* View switcher tabs */}
        <div className="chart-tabs" role="tablist" aria-label="Chart view switcher">
          <button
            type="button"
            className={`chart-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Charts
          </button>
          <button
            type="button"
            className={`chart-tab ${activeTab === 'donut' ? 'active' : ''}`}
            onClick={() => setActiveTab('donut')}
          >
            <PieIcon size={14} />
            <span>Donut</span>
          </button>
          <button
            type="button"
            className={`chart-tab ${activeTab === 'bar' ? 'active' : ''}`}
            onClick={() => setActiveTab('bar')}
          >
            <BarChart3 size={14} />
            <span>Bar</span>
          </button>
        </div>
      </div>

      {!hasExpenses ? (
        // Empty state for charts when month has ₹0 expenses
        <div className="charts-empty-state">
          <div className="charts-empty-icon-circle">
            <PieIcon size={36} />
          </div>
          <h4>No Spending Data for {periodLabel}</h4>
          <p>
            Total expenses for this period are <strong>₹0</strong>. Add an expense or select a different month to view the category breakdown.
          </p>
        </div>
      ) : (
        <div className={`charts-grid ${activeTab !== 'all' ? 'single-chart-view' : ''}`}>
          {/* 1. DONUT / PIE CHART */}
          {(activeTab === 'all' || activeTab === 'donut') && (
            <div className="chart-box">
              <div className="chart-box-header">
                <div className="chart-box-title">
                  <PieIcon size={16} />
                  <h3>Category Distribution</h3>
                </div>
                <span className="chart-box-note">{periodLabel}</span>
              </div>

              <div className="chart-canvas-wrapper donut-wrapper">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={nonZeroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="amount"
                      animationDuration={800}
                    >
                      {nonZeroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span style={{ color: '#374151', fontSize: '12px', fontWeight: 500 }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Display */}
                <div className="donut-center-metric">
                  <span className="donut-center-label">Total</span>
                  <strong className="donut-center-val">{formatCurrency(totalAmount)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* 2. BAR CHART */}
          {(activeTab === 'all' || activeTab === 'bar') && (
            <div className="chart-box">
              <div className="chart-box-header">
                <div className="chart-box-title">
                  <BarChart3 size={16} />
                  <h3>Spending by Category</h3>
                </div>
                <span className="chart-box-note">Amount (₹)</span>
              </div>

              <div className="chart-canvas-wrapper bar-wrapper">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 15, right: 15, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar
                      dataKey="amount"
                      radius={[6, 6, 0, 0]}
                      animationDuration={800}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ExpenseCharts;
