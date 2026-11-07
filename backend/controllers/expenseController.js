import Expense from '../models/Expense.js';

/**
 * @desc    Get all expenses for the logged-in user with optional filters
 * @route   GET /api/expenses
 * @access  Private (Each user only sees their own expenses)
 */
export const getExpenses = async (req, res) => {
  try {
    const { category, search, month } = req.query;

    // Filter criteria strictly bound to req.user._id
    const query = { user: req.user._id };

    // Optional category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Optional search filter across title or notes
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { notes: searchRegex }];
    }

    // Optional month filter (matches YYYY-MM prefix of date string)
    if (month && month !== 'All') {
      query.date = { $regex: new RegExp(`^${month}`) };
    }

    // Sort newest date first, then newest createdAt first
    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error('Get Expenses Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving expenses'
    });
  }
};

/**
 * @desc    Get a single expense by ID
 * @route   GET /api/expenses/:id
 * @access  Private
 */
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Ensure logged-in user owns the expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this expense'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.status(500).json({ success: false, message: 'Server error retrieving expense' });
  }
};

/**
 * @desc    Create a new expense for the logged-in user
 * @route   POST /api/expenses
 * @access  Private
 */
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;

    if (!title || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, category, and date'
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than 0'
      });
    }

    const expense = await Expense.create({
      user: req.user._id,
      title: title.trim(),
      amount: Math.round(numericAmount),
      category,
      date,
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: expense
    });
  } catch (error) {
    console.error('Create Expense Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating expense'
    });
  }
};

/**
 * @desc    Update an existing expense (Edit Expense)
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
export const updateExpense = async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;

    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    // Ensure logged-in user owns this expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify another user\'s expense'
      });
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }
      expense.amount = Math.round(numericAmount);
    }

    if (title) expense.title = title.trim();
    if (category) expense.category = category;
    if (date) expense.date = date;
    if (notes !== undefined) expense.notes = notes.trim();

    const updatedExpense = await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating expense'
    });
  }
};

/**
 * @desc    Delete an expense
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    // Ensure logged-in user owns this expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot delete another user\'s expense'
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }
    res.status(500).json({
      success: false,
      message: 'Server error deleting expense'
    });
  }
};

/**
 * @desc    Get aggregate category & monthly spending summary from DB
 * @route   GET /api/expenses/summary
 * @access  Private
 */
export const getExpenseSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });

    const totalAmount = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

    const categoryTotals = expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {
      Food: 0,
      Travel: 0,
      Education: 0,
      Entertainment: 0,
      Other: 0
    });

    res.status(200).json({
      success: true,
      totalAmount,
      totalCount: expenses.length,
      categoryTotals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error calculating expense summaries'
    });
  }
};
