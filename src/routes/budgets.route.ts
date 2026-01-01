import { Router } from "express";
import { deleteBudget, getBudgets, setBudget } from "../controllers/budgets.controller.js";

export const budgetsRouter = Router();

budgetsRouter.get("/", getBudgets)
budgetsRouter.post("/set", setBudget)
budgetsRouter.delete("/:id", deleteBudget)

