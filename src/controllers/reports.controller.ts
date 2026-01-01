import { db } from "../db/db.js";
import { expenseTable } from "../db/schema.js";
import { and, eq, isNull } from "drizzle-orm";
import { objectToCsv } from "../utils/helpers.js";
import type { Request, Response } from "express";

export const getReports = async (req: Request, res: Response) => {
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
    //transform the data
    const csvData = expenses.map((ex) => ({
      Date: new Date(ex.spentAt).toLocaleDateString(),
      Category: ex.categoryId,
      Description: ex.description,
      Amount: ex.amount,
      Currency: ex.currency,
    }));
    // converto to csv string
    const csvString = objectToCsv(csvData);
    // send as file download
    res.header("Content-Type", "text/csv");
    res.attachment("expenses.csv");
    res.send(csvString);
  } catch (error) {
    console.log("Failed to fetch data", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
