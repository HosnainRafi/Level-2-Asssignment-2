import { pool } from "../../config/db";
import AppError from "../../utils/AppError";

const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role, created_at, updated_at FROM users`
  );
  return result.rows;
};

const getSingleUser = async (email: string) => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE email=$1`,
    [email]
  );
  return result.rows[0];
};

const updateUser = async (id: string, payload: any) => {
  const userExist = await pool.query(`Select * from users where id=$1`, [id]);
  if (userExist.rows.length === 0) {
    throw new AppError(404, "User not found");
  }
  const fields = Object.keys(payload);
  const values = Object.values(payload);
  if (fields.length === 0) {
    throw new AppError(400, "No data is there to update");
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 2}`)
    .join(", ");

  const result = await pool.query(
    `UPDATE users SET ${setClause}, updated_at = NOW() where id= $1 RETURNING id, name, email, phone, role, created_at, updated_at`,
    [id, ...values]
  );

  return result.rows[0];
};

const deleteUser = async (id: string) => {
  const userExist = await pool.query(`Select * from users where id=$1`, [id]);
  if (userExist.rows.length === 0) {
    throw new AppError(404, "User not found");
  }

  const hasBookings = await pool.query(
    `SELECT * FROM bookings WHERE customer_id = $1 AND status = 'active'`,
    [id]
  );
  if (hasBookings.rows.length > 0) {
    throw new AppError(400, "User cannot be deleted with active bookings");
  }

  await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
};

export const userServices = {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
