/**
 * storage.js
 * Browser LocalStorage abstraction for persisting expense records safely.
 * Includes error handling for corrupted JSON and fallback support.
 */

const STORAGE_KEY = 'spendwise_expenses_v1';

/**
 * Load expenses from LocalStorage
 * Returns an array of expenses, or empty array if none stored or on error.
 */
export const loadExpensesFromStorage = () => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return [];
    }
    const parsedData = JSON.parse(rawData);
    if (Array.isArray(parsedData)) {
      return parsedData;
    }
    return [];
  } catch (error) {
    console.error('Failed to load expenses from LocalStorage:', error);
    return [];
  }
};

/**
 * Save expenses array to LocalStorage
 */
export const saveExpensesToStorage = (expenses) => {
  try {
    if (!Array.isArray(expenses)) {
      console.warn('saveExpensesToStorage expects an array');
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Failed to save expenses to LocalStorage:', error);
  }
};

/**
 * Clear all expenses from LocalStorage
 */
export const clearExpensesFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear expenses from LocalStorage:', error);
  }
};
