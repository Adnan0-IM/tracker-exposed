import "dotenv/config";
import {
  usersTable,
  budgetsTable,
  categoriesTable,
  expenseTable,
} from "../db/schema.js";
import { db } from "../db/db.js";
import { eq } from "drizzle-orm";

export const seed = async () => {
  try {
    // 1) Demo user (use env to override)
    const name = process.env.SEED_USER_NAME ?? "Demo User";
    const email = process.env.SEED_USER_EMAIL ?? "demo@example.com";
    const password = process.env.SEED_USER_PASSWORD ?? "demo123"; // replace with a hash in production

    // Try to reuse existing user to avoid unique-constraint failures
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    let userId = existing?.id;
    if (!userId) {
      const [u] = await db
        .insert(usersTable)
        .values({ name, email, password })
        .returning();
      userId = u?.id;
    }

    if (!userId) {
      throw new Error("Failed to create or retrieve demo user");
    }

    // 2) Categories (id is PK) – ignore duplicates
    await db
      .insert(categoriesTable)
      .values([
        { id: "groceries", name: "Groceries", icon: "🛒", color: "#34D399" },
        { id: "transport", name: "Transport", icon: "🚗", color: "#3B82F6" },
        { id: "rent", name: "Rent", icon: "🏠", color: "#F43F5E" },
        { id: "utilities", name: "Utilities", icon: "💡", color: "#A855F7" },
        {
          id: "entertain",
          name: "Entertainment",
          icon: "🎬",
          color: "#F59E0B",
        },
      ])
      .onConflictDoNothing();

    // 3) Budgets (may duplicate across runs since id is random)
    const budgets = [
      {
        categoryId: "groceries",
        periodType: "MONTHLY",
        amount: 300,
        alertThreshold: 80,
      },
      {
        categoryId: "transport",
        periodType: "WEEKLY",
        amount: 120,
        alertThreshold: 75,
      },
      {
        categoryId: "rent",
        periodType: "YEARLY",
        amount: 1200,
        alertThreshold: 90,
      },
      {
        categoryId: "utilities",
        periodType: "MONTHLY",
        amount: 200,
        alertThreshold: 80,
      },
      {
        categoryId: "entertain",
        periodType: "WEEKLY",
        amount: 150,
        alertThreshold: 70,
      },
    ];

    for (const b of budgets) {
      await db.insert(budgetsTable).values({
        id: crypto.randomUUID(),
        userId,
        categoryId: b.categoryId,
        periodType: b.periodType as "MONTHLY" | "WEEKLY" | "YEARLY",
        amount: b.amount.toFixed(2),
        alertThreshold: b.alertThreshold,
      });
    }

    // 4) Sample expenses
    const days = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
    const expenses = [
      {
        categoryId: "groceries",
        amount: 42.75,
        description: "Supermarket",
        spentAt: days(3),
      },
      {
        categoryId: "transport",
        amount: 15.0,
        description: "Gas",
        spentAt: days(2),
      },
      {
        categoryId: "entertain",
        amount: 12.99,
        description: "Streaming",
        spentAt: days(10),
      },
      {
        categoryId: "utilities",
        amount: 85.5,
        description: "Electric bill",
        spentAt: days(20),
      },
      {
        categoryId: "rent",
        amount: 1200.0,
        description: "Monthly rent",
        spentAt: days(28),
      },
    ];

    for (const e of expenses) {
      await db
        .insert(expenseTable)
        .values({
          id: crypto.randomUUID(),
          userId,
          categoryId: e.categoryId,
          amount: e.amount.toFixed(2),
          description: e.description,
          spentAt: e.spentAt,
        })
        .onConflictDoNothing();
    }

    console.log(`Seed complete for user ${email} (id=${userId})`);
  } catch (err) {
    console.error("Seed failed:", err);
    // Do not exit; allow server to start
    throw err;
  } finally {
    try {
      await (db as any).end?.({ timeout: 5 });
    } catch {}
  }
};
