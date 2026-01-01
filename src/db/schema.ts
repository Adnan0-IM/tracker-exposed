import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const categoriesTable = pgTable("categories", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 255 }),
  color: varchar("color", { length: 255 }),
});

export const periodType = pgEnum("period_type", [
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
]);

export const reportType = pgEnum("report_type", [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
  "CUSTOM",
]);

export const budgetsTable = pgTable("budget", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  categoryId: varchar("categoryId", { length: 255 })
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "cascade" }),
  periodType: periodType("period_type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  alertThreshold: integer().default(80),
});

export const expenseTable = pgTable("expense", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  categoryId: varchar("categoryId", { length: 255 })
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 255 }).default("NGN"),
  description: varchar("description", { length: 255 }),
  spentAt: timestamp("spent_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: varchar("updated_at", { length: 255 }).default(
    new Date().toISOString()
  ),
  deletedAt: varchar("deleted_at", { length: 255 }),
});

export const reportTable = pgTable("report", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  reportType: reportType("report_type").notNull(),
});
