import type { Request, Response } from "express";
import {
  comparePassword,
  emailExist,
  getToken,
  hashPassword,
} from "../utils/helpers.js";
import { usersTable } from "../db/schema.js";
import { db } from "../db/db.js";
import { eq } from "drizzle-orm";

export const signUp = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    // FIXED: Use 400 for bad request
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const exist = await emailExist(email);

    if (exist) {
      // FIXED: Use 409 for conflict
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const hashed = await hashPassword(password);
    // FIXED: Added 'await' and destructuring
    const [newUser] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        password: hashed,
      })
      .returning({
        id: usersTable.id,
      });

    if (!newUser) return res.json({ message: "Failed to create account" });

    const token = getToken(newUser.id);

    return res
      .status(201)
      .json({ token, user: { id: newUser.id, name, email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email or password is incorrect" });

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user) return res.status(404).json({ message: "User not found" });

    const isValid = await comparePassword(password, user?.password);

    if (!isValid)
      return res.status(401).json({ error: "Invalid creadentials" });

    const token = getToken(user.id);

    return res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Failed to sign-in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
