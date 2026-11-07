import React from 'react';
import { CATEGORIES, CATEGORY_NAMES } from '../utils/expenseUtils';

/**
 * CategoryFilter.jsx
 * Filter bar allowing the user to view all expenses or narrow down to a category.
 * 
 * Demonstrates: Props, Event Handling, Array map() method, Conditional styling
 */
const CategoryFilter = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
  totalCount = 0
}) => {
  const filterOptions = ['All', ...CATEGORY_NAMES];

  return (
    <div className="category-filter-container" role="tablist" aria-label="Filter expenses by category">
      {filterOptions.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = cat === 'All' ? totalCount : categoryCounts[cat] || 0;
        const categoryColor = cat === 'All' ? '#2563EB' : CATEGORIES[cat]?.color || '#6B7280';

        return (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={`category-pill ${isSelected ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat)}
            style={{
              '--filter-color': categoryColor
            }}
          >
            {cat !== 'All' && (
              <span
                className="category-pill-dot"
                style={{ backgroundColor: categoryColor }}
                aria-hidden="true"
              />
            )}
            <span className="category-pill-label">{cat}</span>
            <span className="category-pill-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
