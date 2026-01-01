import express from 'express'
import { authRouter } from './routes/auth.route.js';
import { auth } from './middleware/auth.middleware.js';
import { expensesRouter } from './routes/expenses.route.js';
import { budgetsRouter } from './routes/budgets.route.js';
import { dashbaordRoute } from './routes/dashboard.route.js';
import { reportRouter } from './routes/reports.route.js';

const app = express()

// Global middleware
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("<h3>Expense Tracker Api</h3>");
});

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);

app.use(auth);

app.use("/api/expenses", expensesRouter);

app.use("/api/budgets", budgetsRouter);

app.use("/api/dashboard", dashbaordRoute);

app.use("/api/reports", reportRouter);

export default app
