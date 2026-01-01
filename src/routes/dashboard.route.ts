import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";

export const dashbaordRoute = Router();

dashbaordRoute.get("/", getDashboard);
