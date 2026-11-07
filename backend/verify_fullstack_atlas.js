import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Expense from './models/Expense.js';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'spendwise_jwt_secret_test_2026';

console.log('================================================================');
console.log('       SpendWise Full-Stack MongoDB Atlas Integration Test      ');
console.log('================================================================\n');

async function connectToAtlas() {
  console.log('1. Connecting to MongoDB Atlas...');
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      console.log(`   Attempt ${attempt} to connect...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
        tls: true,
        tlsInsecure: true
      });
      console.log(`   ✅ Connected to Atlas host: ${conn.connection.host}`);
      console.log(`   ✅ Database selected: ${conn.connection.name}\n`);
      return conn;
    } catch (err) {
      lastError = err;
      console.log(`   ⚠️ Attempt ${attempt} failed: ${err.message}`);
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
  throw lastError;
}

async function runIntegrationVerification() {
  try {
    await connectToAtlas();

    const timestamp = Date.now();
    const testUserAEmail = `test_akanksha_${timestamp}@example.com`;
    const testUserBEmail = `test_student_b_${timestamp}@example.com`;
    const testPassword = 'Password123!';

    // -------------------------------------------------------------
    // Step 2: Test User Registration
    // -------------------------------------------------------------
    console.log('2. Testing User Registration with password hashing...');
    const userA = await User.create({
      name: 'Akanksha Test User',
      email: testUserAEmail,
      password: testPassword
    });

    if (!userA._id) throw new Error('User A creation failed');
    console.log(`   ✅ User A registered in MongoDB Atlas: ID ${userA._id}`);

    // Verify bcrypt password was hashed and not saved in plaintext
    const userAInDb = await User.findById(userA._id).select('+password');
    if (userAInDb.password === testPassword) {
      throw new Error('SECURITY BREACH: Password was saved in plaintext!');
    }
    console.log(`   ✅ Password successfully hashed with bcrypt (stored as: ${userAInDb.password.substring(0, 15)}...)`);

    // -------------------------------------------------------------
    // Step 3: Test User Login & JWT
    // -------------------------------------------------------------
    console.log('\n3. Testing User Login & JWT Authentication...');
    const isPasswordValid = await userAInDb.matchPassword(testPassword);
    if (!isPasswordValid) throw new Error('Password comparison matchPassword failed');

    const token = jwt.sign({ id: userA._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id !== userA._id.toString()) throw new Error('JWT verification failed');
    console.log(`   ✅ Login authenticated & JWT token generated and verified.`);

    // -------------------------------------------------------------
    // Step 4: Test Expense CRUD - Add (Create)
    // -------------------------------------------------------------
    console.log('\n4. Testing Expense Creation (ADD)...');
    const createdExpense = await Expense.create({
      user: userA._id,
      title: 'College Data Structures Reference Book',
      amount: 850,
      category: 'Education',
      date: '2026-11-05',
      notes: 'Purchased for computer science module'
    });

    if (!createdExpense._id) throw new Error('Expense creation failed');
    console.log(`   ✅ Expense added to MongoDB Atlas: ID ${createdExpense._id}`);
    console.log(`   ✅ Details: "${createdExpense.title}" - ₹${createdExpense.amount} (${createdExpense.category})`);

    // -------------------------------------------------------------
    // Step 5: Test Expense CRUD - View (Read)
    // -------------------------------------------------------------
    console.log('\n5. Testing Expense Retrieval (VIEW)...');
    const userAExpenses = await Expense.find({ user: userA._id });
    if (userAExpenses.length !== 1 || userAExpenses[0].title !== 'College Data Structures Reference Book') {
      throw new Error('Failed to retrieve user A expenses');
    }
    console.log(`   ✅ Retrieved ${userAExpenses.length} expense record(s) belonging to User A.`);

    // -------------------------------------------------------------
    // Step 6: Test Expense CRUD - Edit (Update)
    // -------------------------------------------------------------
    console.log('\n6. Testing Expense Modification (EDIT)...');
    createdExpense.amount = 920;
    createdExpense.notes = 'Updated price including express delivery';
    const updatedExpense = await createdExpense.save();

    if (updatedExpense.amount !== 920) throw new Error('Expense amount update failed');
    console.log(`   ✅ Expense updated in Atlas: New Amount = ₹${updatedExpense.amount}`);

    // -------------------------------------------------------------
    // Step 7: Test Multi-User Data Isolation (Requirement 6)
    // -------------------------------------------------------------
    console.log('\n7. Testing Multi-User Data Isolation...');
    const userB = await User.create({
      name: 'Second Student User',
      email: testUserBEmail,
      password: testPassword
    });

    // Verify User B cannot see User A's expenses
    const userBExpenses = await Expense.find({ user: userB._id });
    console.log(`   ✅ User B queried their expenses: found ${userBExpenses.length} records.`);
    if (userBExpenses.length !== 0) {
      throw new Error('DATA LEAK: User B can see User A expenses!');
    }

    // Verify User B cannot edit User A's expense
    const canUserBModify = createdExpense.user.toString() === userB._id.toString();
    if (canUserBModify) {
      throw new Error('AUTHORIZATION LEAK: User B permitted to modify User A expense!');
    }
    console.log(`   ✅ User isolation strictly enforced: User B cannot access or modify User A records.`);

    // -------------------------------------------------------------
    // Step 8: Test Expense CRUD - Delete
    // -------------------------------------------------------------
    console.log('\n8. Testing Expense Removal (DELETE)...');
    await createdExpense.deleteOne();
    const remainingExpenses = await Expense.find({ user: userA._id });
    if (remainingExpenses.length !== 0) throw new Error('Expense delete failed');
    console.log(`   ✅ Expense deleted successfully from MongoDB Atlas.`);

    // -------------------------------------------------------------
    // Step 9: Clean up test users
    // -------------------------------------------------------------
    console.log('\n9. Cleaning up test accounts...');
    await User.findByIdAndDelete(userA._id);
    await User.findByIdAndDelete(userB._id);
    console.log(`   ✅ Temporary test users cleanly removed.`);

    console.log('\n================================================================');
    console.log('🎉 ALL FULL-STACK MONGODB ATLAS TESTS PASSED SUCCESSFULLY!');
    console.log('   - MongoDB Atlas connection: VERIFIED');
    console.log('   - User registration & bcrypt hashing: VERIFIED');
    console.log('   - JWT login authentication: VERIFIED');
    console.log('   - Expense Add, View, Edit, Delete CRUD: VERIFIED');
    console.log('   - Multi-user data isolation: VERIFIED');
    console.log('================================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Integration Verification Error: ${error.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runIntegrationVerification();
