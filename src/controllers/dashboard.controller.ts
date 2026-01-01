import type { Request, Response } from "express";
import { db } from "../db/db.js";
import { budgetsTable, expenseTable } from "../db/schema.js";
import { and, eq, isNull, sum } from "drizzle-orm";

export const getDashboard = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const expenses = await db
      .select({
        categoryId: expenseTable.categoryId,
        total: sum(expenseTable.amount),
      })
      .from(expenseTable)
      .where(
        and(eq(expenseTable.userId, userId), isNull(expenseTable.deletedAt))
      )
      .groupBy(expenseTable.categoryId);

    const budgets = await db
      .select({
        categoryId: budgetsTable.categoryId,
        total: sum(budgetsTable.amount),
      })
      .from(budgetsTable)
      .where(eq(budgetsTable.userId, userId))
      .groupBy(budgetsTable.categoryId);

    return res.status(200).json({expenses, budgets});
    
  } catch (error) {
    console.log("Failed to fetch data", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
