import { eq } from "drizzle-orm";
import { usersTable } from "../db/schema.js";
import { db } from "../db/db.js";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const emailExist = async (targetEmail: string) => {
  const count = await db.$count(usersTable, eq(usersTable.email, targetEmail));

  return count > 0;
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, Number(process.env.SALT_ROUNDS) || 10);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const getToken = (userId: number) => {
  // FIXED: Typo in env var and wrapping payload in object
  return Jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  return Jwt.verify(token, process.env.JWT_SECRET!);
};

export const objectToCsv = function (data: any) {

  if (data.length === 0) {
    return "";
  }
  const csvRows = [];

  const headers = Object.keys(data[0]);

  csvRows.push(headers.join(","));

  // Loop to get value of each objects key
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      return `"${val}"`;
    });

    // To add, separator between each value
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};
