import api from './api';

export const expenseService = {
  // Fetch all expenses belonging to logged-in user with optional query filters
  async fetchExpenses(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') {
      params.append('category', filters.category);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.month && filters.month !== 'All') {
      params.append('month', filters.month);
    }

    const response = await api.get(`/expenses?${params.toString()}`);
    return response.data;
  },

  // Get single expense by ID
  async getExpenseById(id) {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Create a new expense record in MongoDB
  async createExpense(expenseData) {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  // Edit/Update an existing expense record in MongoDB
  async updateExpense(id, expenseData) {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  // Delete an expense record from MongoDB
  async deleteExpense(id) {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  // Get aggregate summary calculations from backend
  async fetchSummary() {
    const response = await api.get('/expenses/summary');
    return response.data;
  }
};

export default expenseService;
