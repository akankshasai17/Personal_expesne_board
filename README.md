# SpendWise — Full-Stack Personal Expense Visualization Board

A complete, production-ready full-stack personal finance application built with the **MERN** architecture (**React.js + Node.js/Express.js + MongoDB Atlas + Mongoose**), visualized with **Recharts**, and secured using **JWT Authentication** and **bcrypt** password hashing.

---

## 🌟 Key Full-Stack Features

- **Frontend:** Responsive React dashboard with category-based metrics, Donut & Bar charts, instant search, category filters, and monthly spending insights.
- **Backend:** Express.js REST API structured with modular controllers, routes, middleware, and Mongoose ODM models.
- **Database:** MongoDB Atlas cloud cluster storing user accounts and expense documents.
- **Authentication & Security:** User registration and login with bcrypt password hashing (10 salt rounds) and stateless JSON Web Tokens (JWT).
- **Data Isolation:** Every expense document is strictly indexed and bound to the authenticated user's ID (`req.user._id`). Users can only view, create, edit, and delete their own expenses.
- **Full CRUD Support:** Add, View, Edit, and Delete expenses connected end-to-end via Axios.
- **Derived Data:** Dashboard metrics, category breakdowns, and Recharts charts update immediately from database records without stale data.

---

## 📁 Updated Project Architecture & Folder Structure

```text
Personal_expesne_board/
├── backend/                             # Express REST API & MongoDB Atlas Backend
│   ├── config/
│   │   └── db.js                        # Mongoose Atlas connection with error handling
│   ├── controllers/
│   │   ├── authController.js            # User registration, login, and profile
│   │   └── expenseController.js         # Add, View, Edit, Delete, and Summary calculations
│   ├── middleware/
│   │   └── auth.js                      # JWT Bearer token verification middleware
│   ├── models/
│   │   ├── Expense.js                   # Mongoose schema for expenses with user reference
│   │   └── User.js                      # Mongoose user schema with bcrypt pre-save hook
│   ├── routes/
│   │   ├── authRoutes.js                # /api/auth endpoints
│   │   └── expenseRoutes.js             # /api/expenses endpoints
│   ├── .env.example                     # Environment template (safe for version control)
│   ├── .env                             # Active environment variables (PORT, MONGODB_URI, JWT_SECRET)
│   ├── package.json                     # Backend dependencies (express, mongoose, bcryptjs, jwt, cors, dotenv)
│   ├── server.js                        # Express server entry point, CORS, logging, error handlers
│   ├── check_connection.js              # Dedicated MongoDB Atlas connection diagnostic tool
│   └── test_backend.js                  # Automated backend logic & security verification suite
│
├── src/                                 # Frontend React Application
│   ├── components/
│   │   ├── AuthModal.jsx                # User Registration & Login modal dialog
│   │   ├── CategoryFilter.jsx           # Category filter pills with badge counts
│   │   ├── EmptyState.jsx               # Contextual empty state illustrations & actions
│   │   ├── ExpenseCharts.jsx            # Recharts Donut & Bar visual spending charts
│   │   ├── ExpenseForm.jsx              # Controlled form (Add Mode & Edit Mode)
│   │   ├── ExpenseItem.jsx              # Transaction card with Edit and Delete actions
│   │   ├── ExpenseList.jsx              # Search, filter, and mapped item list
│   │   ├── Header.jsx                   # Navigation, month indicator, user badge, and CTA
│   │   ├── MonthlySummary.jsx           # Selected-month metrics & period selector
│   │   ├── Sidebar.jsx                  # Responsive sidebar with profile & navigation
│   │   └── SummaryCard.jsx              # Reusable metric card with icons & percentage badges
│   ├── pages/
│   │   └── Dashboard.jsx                # Main container managing state, API calls & derived data
│   ├── services/
│   │   ├── api.js                       # Axios instance with automatic JWT Authorization interceptor
│   │   ├── authService.js               # Auth API calls & session token management
│   │   └── expenseService.js            # Expense CRUD API calls
│   ├── utils/
│   │   ├── expenseUtils.js              # Derived calculations (reduce, filter, map) & formatters
│   │   └── storage.js                   # UI preference persistence
│   ├── App.jsx                          # Main application layout coordinator
│   ├── main.jsx                         # React entry point
│   ├── index.css                        # CSS reset, typography, and theme CSS variables
│   └── App.css                          # Custom responsive styles, cards, and modal styling
│
├── index.html                           # HTML entry point with Plus Jakarta Sans typography
├── package.json                         # Frontend dependencies & root scripts
├── vite.config.js                       # Vite build and server configuration
├── test_calculations.js                 # Frontend unit logic test suite
└── README.md                            # Complete full-stack documentation & viva guide
```

---

## ⚙️ MongoDB Atlas Configuration (`backend/.env`)

Configure your connection string in [`backend/.env`](file:///c:/Users/Akanksha%20Sai/OneDrive/Documents/Personal_expesne_board/backend/.env):

```env
# Server Port
PORT=5000

# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://akanksha:<db_password>@cluster0.q8b7exq.mongodb.net/spendwise?retryWrites=true&w=majority

# JWT Authentication Secrets
JWT_SECRET=spendwise_super_secure_jwt_secret_dev_2026
JWT_EXPIRE=7d

# Allowed Frontend Client URL (for CORS)
CLIENT_ORIGIN=http://localhost:3000
```

> **Important:** In `backend/.env`, replace `<db_password>` with your database user password from MongoDB Atlas (e.g. `mongodb+srv://akanksha:YourActualPassword@cluster0.q8b7exq.mongodb.net/spendwise`). If your password contains special characters like `@`, URL-encode it (e.g. `@` becomes `%40`).

---

## 🚀 Running and Testing Commands

### 1. Test Database Connection
Run the connection diagnostic script to verify your Atlas connection:
```bash
npm run check-db
```

### 2. Start the Backend Server
```bash
npm run server
```

### 3. Start the Frontend React App
```bash
npm run dev
```

---

## 🧪 Automated Test Verification

```bash
# 1. Run Backend Logic & Security Verification Tests
node backend/test_backend.js

# 2. Run Frontend Calculation Tests
npm test

# 3. Verify Frontend Production Build
npm run build
```
