import { expenseTable } from "../db/schema.js";
import { db } from "../db/db.js";
import { eq, and, isNull } from "drizzle-orm";
import type { Request, Response } from "express";

export const getExpenses = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const expenses = await db
      .select()
      .from(expenseTable)
      .where(
        and(eq(expenseTable.userId, userId), isNull(expenseTable.deletedAt))
      );

    if (expenses?.length === 0) {
      return res.status(200).json({ expenses: [] });
    }
    return res.status(200).json({ expenses });
  } catch (error) {
    console.log("Failed to load expenses", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const createExpense = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  const { categoryId, amount, currency, description, spentAt } = req.body;
  if (!amount || !description || !categoryId || !spentAt) {
    return res.status(400).json({
      message: "Amount, description, categoryId and spent at are required",
    });
  }

  try {
    const [newExpense] = await db
      .insert(expenseTable)
      .values({
        id: crypto.randomUUID(),
        amount: amount.toString(),
        categoryId,
        spentAt: new Date(spentAt),
        userId,
        currency,
        description,
      })
      .returning();

    if (!newExpense) return res.send("Failed to create expense");

    return res.status(201).json(newExpense);
  } catch (error) {
    console.log("Failed to create expense", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const editExpense = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params; // Get the expense ID from the URL (e.g., /expenses/:id)
  if (!id) return res.status(400).json({ message: "Expense ID is required" });
  const { categoryId, amount, currency, description, spentAt } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // 1. Perform the Update
    // We use .where() with 'and()' to ensure the expense ID matches AND the userId matches.
    // This prevents User A from editing User B's expenses.
    const [updatedExpense] = await db
      .update(expenseTable)
      .set({
        amount: amount ? amount.toString() : undefined, // Only update if provided
        categoryId,
        currency,
        description,
        spentAt: spentAt ? new Date(spentAt) : undefined,
        updatedAt: new Date().toISOString(), // Always update the timestamp
      })
      .where(and(eq(expenseTable.id, id), eq(expenseTable.userId, userId)))
      .returning();

    // 2. Check if anything happened
    // If updatedExpense is undefined, it means no record was found
    // (either it doesn't exist, or it belongs to another user).
    if (!updatedExpense) {
      return res
        .status(404)
        .json({ message: "Expense not found or unauthorized" });
    }

    return res.status(200).json(updatedExpense);
  } catch (error) {
    console.log("Failed to edit expense", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Expense ID is required" });

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const [deletedExpense] = await db
      .update(expenseTable)
      .set({
        deletedAt: new Date().toISOString(),
      })
      .where(and(eq(expenseTable.id, id), eq(expenseTable.userId, userId)))
      .returning();

    if (!deletedExpense) return res.send("Failed to delete expense");

    return res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    console.log("Failed to delete expense", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
