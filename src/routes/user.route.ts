import { Router } from "express";
import { db } from "../db/db.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const userRouter = Router();

userRouter.get("/profile", async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (!user) return res.json({ message: "User is not found" });

    return res.status(200).json({
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.log("Failed to fetch profile", error);
    return res.status(500).json({ meassage: "Internal server error" });
  }
});
