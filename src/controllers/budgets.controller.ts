import { db } from "../db/db.js";
import { eq, and } from "drizzle-orm";
import type { Request, Response } from "express";
import { budgetsTable } from "../db/schema.js";

export const setBudget = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  const { categoryId, amount, periodType } = req.body;

  if (!categoryId || !amount || !periodType)
    return res
      .status(400)
      .json({ message: "Period type, category, and amount are required" });

  try {
    const budget = await db
      .select()
      .from(budgetsTable)
      .where(
        and(
          eq(budgetsTable.userId, userId),
          eq(budgetsTable.categoryId, categoryId),
          eq(budgetsTable.periodType, periodType)
        )
      );

    if (budget.length === 0) {
      const [newBudget] = await db
        .insert(budgetsTable)
        .values({
          amount: amount.toString(),
          categoryId,
          id: crypto.randomUUID(),
          periodType,
          userId,
          alertThreshold: 5,
        })
        .returning();
      return res
        .status(201)
        .json({ message: "Budget created successfully", budget: newBudget });
    } else {
      const [budget] = await db
        .update(budgetsTable)
        .set({
          amount: amount ? amount.toString() : undefined,
          categoryId: categoryId ? categoryId : undefined,
          periodType: periodType ? periodType : undefined,
        })
        .where(
          and(
            eq(budgetsTable.userId, userId),
            eq(budgetsTable.categoryId, categoryId),
            eq(budgetsTable.periodType, periodType)
          )
        )
        .returning();
      return res
        .status(201)
        .json({ message: "Budget updated successfully", budget });
    }
  } catch (error) {
    console.log("Failed to create or update budget", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getBudgets = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  try {
    const budgets = await db
      .select()
      .from(budgetsTable)
      .where(eq(budgetsTable.userId, userId));

    if (budgets?.length === 0) {
      return res.status(200).json({ budgets: [] });
    }
    return res.status(200).json({ budgets });
  } catch (error) {
    console.log("Failed to fetch budgets", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBudget = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Expense ID is required" });

  try {
    const deleteBudget = await db
      .delete(budgetsTable)
      .where(and(eq(budgetsTable.userId, userId), eq(budgetsTable.id, id)))
      .returning();

    if (!deleteBudget) return res.send("Failed to delete budget");

    return res.status(200).json({ message: "budget deleted" });
  } catch (error) {
    console.log("Failed to delete budget", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
