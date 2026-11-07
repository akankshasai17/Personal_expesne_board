# Antigravity Build Specification
## Project: Personal Expense Visualization Board

Build a complete, polished, responsive **Personal Expense Visualization Board** using the requirements below. Follow the specification closely. The project is intended to demonstrate React.js frontend and component architecture concepts for a college practical/module.

---

## 1. Technology Stack

Use only:
- **React.js** with functional components
- **JavaScript** (plain JavaScript; do not use TypeScript)
- **HTML**
- **CSS** (regular CSS files; do not use Tailwind or Bootstrap)
- **Recharts** for charts
- **Browser LocalStorage** for saving expenses between refreshes
- **Vite** for project setup and development

Do not add a backend, Node/Express API, MongoDB, Firebase, authentication, or external database. This is a frontend-focused project.

## 2. Project Goal

Create a personal finance dashboard where a user can:
1. Add daily expenses.
2. Choose an expense category.
3. View total spending.
4. View category-wise spending summaries.
5. Visualize spending through charts.
6. View, filter, and delete expense records.
7. Keep expense records after refreshing the browser using LocalStorage.

The required categories are:
- Food
- Travel
- Education
- Entertainment

Also allow an optional **Other** category if useful, but keep the four required categories prominent.

## 3. Required React Concepts

The implementation must clearly demonstrate all of these concepts:

- **Functional components:** Build the interface using separate functional React components.
- **Props:** Pass expense data, labels, totals, and callback functions from parent components to child components.
- **useState:** Manage expenses, form inputs, selected filters, and UI state.
- **Controlled forms:** Every form input must be controlled using React state.
- **Event handling:** Handle form submission, category selection, filtering, and delete actions.
- **Conditional rendering:** Show a helpful empty state when no expenses exist; show validation feedback when inputs are invalid.
- **Reusable components:** Create reusable summary cards, category labels, and expense rows/cards.
- **Array methods:** Use `map()` to render expenses, `filter()` to filter records, and `reduce()` to calculate totals.
- **Derived data:** Calculate total expenses and category totals from the expense array; do not maintain duplicate totals in separate state.
- **Component communication:** Keep the main expense state in a suitable parent component and pass data/actions through props.

Use clear, beginner-friendly code and meaningful variable names. Add short comments where they help explain the React concepts.

## 4. Dashboard UI Requirements

Create a modern, clean finance dashboard with a professional but simple design.

### Layout
- Desktop: sidebar on the left and dashboard content on the right.
- Mobile: responsive layout; sidebar should become a compact top navigation or collapsible menu.
- Use a light neutral background, white cards, subtle borders/shadows, rounded corners, and readable typography.
- Use a consistent color for each category:
  - Food: warm orange
  - Travel: blue
  - Education: purple
  - Entertainment: pink
- Do not overcrowd the screen.

### Header
- App name: **SpendWise**
- Page title: **Personal Expense Dashboard**
- Display the current month and year.
- Include a clear “Add Expense” action that takes the user to or opens the expense form.

### Summary cards
Show:
1. Total Expenses
2. Food Expenses
3. Travel Expenses
4. Education Expenses
5. Entertainment Expenses

Each card should display the calculated amount and a relevant icon or simple visual marker. The values must update immediately when an expense is added or deleted.

### Charts
Use Recharts:
- **Donut/Pie chart:** Category-wise expense distribution.
- **Bar chart:** Spending by category.
- Charts must use actual expense data from React state.
- If there is no data, show a friendly empty-chart message rather than a broken chart.
- Include category names and readable tooltips/labels.

### Add Expense Form
Provide a clearly visible form (modal, drawer, or dedicated section) with:
- Expense title/description (required)
- Amount in Indian Rupees (required; must be greater than 0)
- Category dropdown (Food, Travel, Education, Entertainment, Other)
- Date (required; default to today)
- Optional notes

Requirements:
- Use controlled inputs.
- Validate required fields and positive amount.
- Show clear inline validation messages.
- On successful submission, add the expense, close/reset the form, and update all dashboard totals and charts.
- Format amounts as Indian Rupees (e.g. ₹1,250).

### Recent Expenses
Show a recent transaction list with:
- Expense title
- Category
- Date
- Amount
- Delete action

Requirements:
- Sort newest date first.
- Add a category filter (All, Food, Travel, Education, Entertainment, Other).
- Add a search field to search by title/description.
- Show an empty state if there are no matching expenses.
- Confirm before deleting an expense, or provide a clear undo-friendly interaction.

### Monthly Summary
- Show the total spent in the currently selected month.
- Allow selecting a month if practical.
- Ensure the monthly total is calculated from expense records and is not hardcoded.

## 5. Data and LocalStorage

Use a clear expense object shape, for example:

```js
{
  id: "unique-id",
  title: "Lunch",
  amount: 250,
  category: "Food",
  date: "2026-11-04",
  notes: ""
}
```

- Load saved expenses from LocalStorage when the app starts.
- Save expenses to LocalStorage whenever the expense list changes.
- Handle missing or invalid LocalStorage data safely.
- Do not hardcode dashboard totals.
- You may include a small set of clearly identified sample expenses only for first-time preview, but provide a way to clear them. Prefer starting with an empty state so the user can add their own data.

## 6. Suggested Component Structure

Use a clean structure similar to:

```text
src/
  components/
    Sidebar.jsx
    Header.jsx
    SummaryCard.jsx
    ExpenseForm.jsx
    ExpenseList.jsx
    ExpenseItem.jsx
    CategoryFilter.jsx
    ExpenseCharts.jsx
    MonthlySummary.jsx
    EmptyState.jsx
  pages/
    Dashboard.jsx
  utils/
    expenseUtils.js
    storage.js
  App.jsx
  main.jsx
  App.css
  index.css
```

You may adjust the structure if needed, but keep components modular and reusable.

## 7. Functional Requirements / Acceptance Checklist

Before considering the project complete, verify:

- [ ] The app starts successfully with `npm run dev`.
- [ ] User can add an expense with all required fields.
- [ ] Invalid or zero/negative amounts are rejected.
- [ ] Summary cards update immediately after adding an expense.
- [ ] Category totals are calculated from the expense array.
- [ ] Donut chart and bar chart reflect the current data.
- [ ] User can search expenses.
- [ ] User can filter expenses by category.
- [ ] User can delete an expense.
- [ ] Monthly summary reflects the selected month.
- [ ] Data remains after browser refresh.
- [ ] Empty states work correctly.
- [ ] Layout works on mobile, tablet, and desktop.
- [ ] No console errors or broken imports.
- [ ] No fake buttons or non-functional controls.

## 8. Code Quality

- Keep the code readable and suitable for a student to explain in a practical/viva.
- Use functional components and React hooks.
- Avoid unnecessary libraries.
- Avoid putting the entire application in one component.
- Keep calculations in utility functions where appropriate.
- Use semantic HTML and accessible labels.
- Use CSS media queries for responsiveness.
- Do not use hardcoded totals or chart values.
- Do not leave TODO placeholders or unfinished functionality.

## 9. Final Output Expected

Generate the complete working project in the current workspace.

After implementation:
1. Show the final folder structure.
2. List the exact commands to install dependencies and run the project.
3. Explain briefly which files demonstrate `useState`, props, controlled forms, conditional rendering, `map`, `filter`, and `reduce`.
4. Explain how LocalStorage persistence works.
5. Test the main flows and fix any errors before finishing.

**Important:** Build the actual working application, not just a static UI mockup. All displayed totals, filters, forms, and charts must work with user-entered expense data.
