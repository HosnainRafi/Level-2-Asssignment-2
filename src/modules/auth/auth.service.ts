import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db";
import config from "../../config";
import AppError from "../../utils/AppError";

const registerUser = async (payload: any) => {
  const { name, email, password, phone, role } = payload;

  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  if (existingUser.rows.length > 0) {
    throw new AppError(409, "User already exists");
  }

  if (password.length < 6) {
    throw new AppError(500, "Passwod cannot be less than 6 characters");
  }

  const hashPassword = await bcrypt.hash(password, Number(config.salt_round));

  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone, role) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, name, email, role, phone, created_at, updated_at`,
    [name, email, hashPassword, phone, role || "customer"]
  );

  return result.rows[0];
};

const loginUser = async (payload: any) => {
  const { email, password } = payload;

  const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

  if (user.rows.length === 0) {
    throw new AppError(404, "User not found!");
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.rows[0].password
  );

  if (!isPasswordMatched) {
    throw new AppError(401, "Invalid Credentials!");
  }

  const jwtPayload = {
    email: user.rows[0].email,
    role: user.rows[0].role,
    id: user.rows[0].id,
  };

  const token = jwt.sign(jwtPayload, config.jwtSecret as string, {
    expiresIn: "7d",
  });

  const { password: _, ...userData } = user.rows[0];

  return { token, user: userData };
};

export const authServices = {
  registerUser,
  loginUser,
};
