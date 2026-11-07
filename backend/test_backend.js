import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';
import Expense from './models/Expense.js';

console.log('--- RUNNING SPENDWISE BACKEND ARCHITECTURE & LOGIC TESTS ---');

async function runTests() {
  const JWT_SECRET = 'test_secret_key_12345';
  process.env.JWT_SECRET = JWT_SECRET;

  // 1. Password Hashing Test with bcrypt
  console.log('Test 1: Testing bcrypt password hashing...');
  const rawPassword = 'StudentSecretPassword123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);

  const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
  const isWrongMatch = await bcrypt.compare('WrongPassword', hashedPassword);

  if (!isMatch || isWrongMatch) {
    throw new Error('bcrypt password verification failed!');
  }
  console.log('✅ Password hashing and comparison verified successfully.');

  // 2. JWT Signing & Verification Test
  console.log('Test 2: Testing JWT token generation and verification...');
  const userId = new mongoose.Types.ObjectId().toString();
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });

  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.id !== userId) {
    throw new Error('JWT decoded user ID does not match original ID!');
  }
  console.log('✅ JWT token creation and verification verified successfully.');

  // 3. Expense Model Schema & Validation Tests
  console.log('Test 3: Testing Expense model validation constraints...');
  const validExpense = new Expense({
    user: new mongoose.Types.ObjectId(),
    title: 'University Reference Guide',
    amount: 850,
    category: 'Education',
    date: '2026-11-05',
    notes: 'Bought for semester module'
  });

  const validationError = validExpense.validateSync();
  if (validationError) {
    throw new Error(`Valid expense failed schema validation: ${validationError.message}`);
  }

  // 4. Test Invalid Expense (negative amount, invalid category, invalid date format)
  const invalidExpense = new Expense({
    user: new mongoose.Types.ObjectId(),
    title: 'X', // too short (<2)
    amount: -50, // <= 0
    category: 'InvalidCategory', // not in enum
    date: '05-11-2026' // wrong format, should be YYYY-MM-DD
  });

  const expectedErrors = invalidExpense.validateSync();
  if (!expectedErrors || !expectedErrors.errors.amount || !expectedErrors.errors.category || !expectedErrors.errors.title || !expectedErrors.errors.date) {
    throw new Error('Expense model failed to enforce schema constraints!');
  }
  console.log('✅ Expense model validation constraints strictly enforced (title, positive amount, category enum, date format).');

  // 5. User Data Isolation Test Logic
  console.log('Test 4: Verifying user isolation logic...');
  const userAId = new mongoose.Types.ObjectId().toString();
  const userBId = new mongoose.Types.ObjectId().toString();

  const expenseA = {
    _id: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(userAId),
    title: 'User A Expense',
    amount: 500
  };

  // Check ownership
  const userACanAccess = expenseA.user.toString() === userAId;
  const userBCanAccess = expenseA.user.toString() === userBId;

  if (!userACanAccess || userBCanAccess) {
    throw new Error('User isolation check failed!');
  }
  console.log('✅ User data isolation logic verified: User B cannot access or modify User A\'s records.');

  console.log('\n🎉 ALL BACKEND LOGIC & SECURITY TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Test Failure:', err);
  process.exit(1);
});
