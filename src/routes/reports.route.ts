import { Router } from "express";
import { getReports } from "../controllers/reports.controller.js";


export const reportRouter = Router();

reportRouter.get("/export", getReports);
