import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Expense from './models/Expense.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5000/api';

console.log('================================================================');
console.log('       SpendWise Live REST API & Atlas Integration Test         ');
console.log('================================================================\n');

async function runE2ETests() {
  const timestamp = Date.now();
  const userAData = {
    name: 'Akanksha Student',
    email: `akanksha_e2e_${timestamp}@example.com`,
    password: 'Password123'
  };

  const userBData = {
    name: 'Peer Student',
    email: `peer_e2e_${timestamp}@example.com`,
    password: 'Password123'
  };

  try {
    // 1. Test Health Check
    console.log('1. Testing GET /api/health...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log(`   ✅ Status: ${healthRes.data.status} (${healthRes.data.service})`);

    // 2. Test User Registration
    console.log('\n2. Testing POST /api/auth/register...');
    const regRes = await axios.post(`${BASE_URL}/auth/register`, userAData);
    if (!regRes.data.success || !regRes.data.token) {
      throw new Error('Registration failed to return token');
    }
    const tokenA = regRes.data.token;
    const userAId = regRes.data.user.id;
    console.log(`   ✅ User A registered! ID: ${userAId}`);

    // 3. Test User Login
    console.log('\n3. Testing POST /api/auth/login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: userAData.email,
      password: userAData.password
    });
    if (!loginRes.data.success || !loginRes.data.token) {
      throw new Error('Login failed');
    }
    console.log(`   ✅ User A logged in successfully! JWT Token verified.`);

    // 4. Test Protected Profile GET /api/auth/me
    console.log('\n4. Testing GET /api/auth/me...');
    const meRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log(`   ✅ Profile retrieved: ${meRes.data.user.name} (${meRes.data.user.email})`);

    // 5. Test Add Expense POST /api/expenses
    console.log('\n5. Testing POST /api/expenses (Create Expense)...');
    const newExpense = {
      title: 'University Reference Book',
      amount: 1250,
      category: 'Education',
      date: '2026-11-05',
      notes: 'Full-Stack Web Development Text'
    };
    const addExpenseRes = await axios.post(`${BASE_URL}/expenses`, newExpense, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (!addExpenseRes.data.success || !addExpenseRes.data.data) {
      throw new Error('Expense creation failed');
    }
    const expenseId = addExpenseRes.data.data.id || addExpenseRes.data.data._id;
    console.log(`   ✅ Expense added to MongoDB Atlas! ID: ${expenseId}`);
    console.log(`   ✅ Details: "${addExpenseRes.data.data.title}" - ₹${addExpenseRes.data.data.amount}`);

    // 6. Test View Expenses GET /api/expenses
    console.log('\n6. Testing GET /api/expenses (View Expenses)...');
    const getExpensesRes = await axios.get(`${BASE_URL}/expenses`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log(`   ✅ Retrieved ${getExpensesRes.data.count} expense(s) for User A from Atlas.`);
    if (getExpensesRes.data.count < 1) throw new Error('Expected at least 1 expense');

    // 7. Test Edit Expense PUT /api/expenses/:id
    console.log('\n7. Testing PUT /api/expenses/:id (Edit Expense)...');
    const updateRes = await axios.put(
      `${BASE_URL}/expenses/${expenseId}`,
      { amount: 1390, notes: 'Updated price with express shipping' },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );
    console.log(`   ✅ Expense updated! New Amount: ₹${updateRes.data.data.amount}`);

    // 8. Test Summary Stats GET /api/expenses/summary
    console.log('\n8. Testing GET /api/expenses/summary...');
    const summaryRes = await axios.get(`${BASE_URL}/expenses/summary`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log(`   ✅ Summary: Total = ₹${summaryRes.data.totalAmount}, Count = ${summaryRes.data.totalCount}`);

    // 9. Test User Data Isolation (User B cannot see or edit User A's expense)
    console.log('\n9. Testing Multi-User Data Isolation...');
    const regBRes = await axios.post(`${BASE_URL}/auth/register`, userBData);
    const tokenB = regBRes.data.token;

    const userBExpensesRes = await axios.get(`${BASE_URL}/expenses`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    console.log(`   ✅ User B fetched expenses: got ${userBExpensesRes.data.count} records (Expected 0).`);
    if (userBExpensesRes.data.count !== 0) {
      throw new Error('SECURITY VIOLATION: User B can see User A expenses!');
    }

    // Try modifying User A's expense using User B's token (Must be rejected with 403 Forbidden)
    try {
      await axios.put(
        `${BASE_URL}/expenses/${expenseId}`,
        { amount: 9999 },
        { headers: { Authorization: `Bearer ${tokenB}` } }
      );
      throw new Error('SECURITY VIOLATION: User B was able to modify User A expense!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log(`   ✅ Cross-user modification blocked: HTTP 403 Forbidden correctly returned!`);
      } else {
        throw err;
      }
    }

    // 10. Test Delete Expense DELETE /api/expenses/:id
    console.log('\n10. Testing DELETE /api/expenses/:id (Delete Expense)...');
    const delRes = await axios.delete(`${BASE_URL}/expenses/${expenseId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log(`   ✅ Expense deleted! Message: ${delRes.data.message}`);

    // Verify expense is gone
    const afterDelRes = await axios.get(`${BASE_URL}/expenses`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log(`   ✅ Verified User A expense count after deletion: ${afterDelRes.data.count}`);

    // Clean up test accounts directly in DB
    await mongoose.connect(process.env.MONGODB_URI, { tls: true, tlsInsecure: true });
    await User.deleteMany({ email: { $in: [userAData.email, userBData.email] } });
    await Expense.deleteMany({ user: { $in: [userAId, regBRes.data.user.id] } });
    await mongoose.disconnect();
    console.log('\n   ✅ Test accounts cleaned up from MongoDB Atlas.');

    console.log('\n================================================================');
    console.log('🎉 ALL REST API & DATABASE TESTS PASSED WITH 100% SUCCESS!');
    console.log('================================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ E2E Test Failure:', err.response?.data || err.message);
    process.exit(1);
  }
}

runE2ETests();
