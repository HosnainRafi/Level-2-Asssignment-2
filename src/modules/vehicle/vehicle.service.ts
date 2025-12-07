import { pool } from "../../config/db";
import AppError from "../../utils/AppError";

const createVehicleIntoDB = async (payload: any) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

  const result = await pool.query(
    `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status || "available",
    ]
  );
  return result.rows[0];
};

const getAllVehiclesFromDB = async () => {
  const result = await pool.query(`SELECT * FROM vehicles`);
  return result.rows;
};

const getSingleVehicleFromDB = async (id: string) => {
  const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [id]);
  if (result.rows.length === 0) {
    throw new AppError(404, "Vehicle not found");
  }
  return result.rows[0];
};

const updateVehicleInDB = async (id: string, payload: any) => {
  await getSingleVehicleFromDB(id);

  const fields = Object.keys(payload);
  const values = Object.values(payload);

  if (fields.length === 0)
    throw new AppError(400, "No data provided to update");

  const setClause = fields
    .map((field, index) => `${field} = $${index + 2}`)
    .join(", ");

  const result = await pool.query(
    `UPDATE vehicles SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  return result.rows[0];
};

const deleteVehicleFromDB = async (id: string) => {
  const activeBookings = await pool.query(
    `SELECT * FROM bookings WHERE vehicle_id = $1 AND status = 'active'`,
    [id]
  );

  if (activeBookings.rows.length > 0) {
    throw new AppError(400, "Cannot delete vehicle with active bookings");
  }

  const result = await pool.query(
    `DELETE FROM vehicles WHERE id = $1 RETURNING *`,
    [id]
  );
  if (result.rows.length === 0) {
    throw new AppError(404, "Vehicle not found");
  }
};

export const vehicleServices = {
  createVehicleIntoDB,
  getAllVehiclesFromDB,
  getSingleVehicleFromDB,
  updateVehicleInDB,
  deleteVehicleFromDB,
};
