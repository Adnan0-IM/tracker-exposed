import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/helpers.js";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unathorized");
  }

  const token = authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  try {
    const payload = await verifyToken(token);
    req.userId = (payload as any).id;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
