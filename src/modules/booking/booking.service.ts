import { pool } from "../../config/db";
import AppError from "../../utils/AppError";

const createBookingIntoDB = async (payload: any) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  try {
    const vehicleExist = await pool.query(
      `Select * from vehicles where id=$1`,
      [vehicle_id]
    );

    if (vehicleExist.rows.length === 0) {
      throw new AppError(404, "Vehicle not found");
    }

    const vehicle = vehicleExist.rows[0];

    if (vehicle.availability_status !== "available") {
      throw new AppError(400, "Vehicle is not available for booking");
    }

    const startDate = new Date(rent_start_date);
    const endDate = new Date(rent_end_date);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (dayDiff <= 0) {
      throw new AppError(400, "End date must be after start date");
    }

    const totalPrice = dayDiff * Number(vehicle.daily_rent_price);
    const bookingResult = await pool.query(
      `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice]
    );

    await pool.query(
      `UPDATE vehicles SET availability_status = 'booked', updated_at = NOW() WHERE id = $1`,
      [vehicle_id]
    );

    return {
      ...bookingResult.rows[0],
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price,
      },
    };
  } catch (error) {
    throw error;
    console.log(error);
  }
};

const getAllBookingsFromDB = async (user: any) => {
  console.log(user.role);
  let query = `
    SELECT 
      b.*, 
      u.name AS customer_name, 
      u.email AS customer_email, 
      u.phone AS customer_phone,
      v.vehicle_name, 
      v.registration_number, 
      v.type AS vehicle_type
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN vehicles v ON b.vehicle_id = v.id
  `;

  const params: any[] = [];

  if (user.role === "customer") {
    query += ` WHERE b.customer_id = $1`;

    params.push(user.id);
  }

  const result = await pool.query(query, params);

  return result.rows.map((row) => ({
    id: row.id,
    rent_start_date: row.rent_start_date,
    rent_end_date: row.rent_end_date,
    total_price: row.total_price,
    status: row.status,
    customer_id: row.customer_id,
    vehicle_id: row.vehicle_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
    },
    vehicle: {
      vehicle_name: row.vehicle_name,
      registration_number: row.registration_number,
      type: row.vehicle_type,
    },
  }));
};

const updateBookingStatusInDB = async (
  bookingId: string,
  status: string,
  user: any
) => {
  if (user.role === "customer" && status !== "cancelled") {
    throw new AppError(403, "Customers can only cancel bookings");
  }

  try {
    const currentBooking = await pool.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId]
    );
    if (currentBooking.rows.length === 0)
      throw new AppError(404, "Booking not found");

    const booking = currentBooking.rows[0];

    if (user.role === "customer") {
      const startDate = new Date(booking.rent_start_date);
      const today = new Date();
      if (startDate <= today) {
        throw new AppError(400, "Cannot cancel booking after it has started");
      }
    }

    const updateResult = await pool.query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, bookingId]
    );

    if (status === "returned" || status === "cancelled") {
      await pool.query(
        `UPDATE vehicles SET availability_status = 'available', updated_at = NOW() WHERE id = $1`,
        [booking.vehicle_id]
      );
    }

    const vehicleResult = await pool.query(
      `SELECT availability_status FROM vehicles WHERE id = $1`,
      [booking.vehicle_id]
    );

    return {
      ...updateResult.rows[0],
      vehicle: {
        availability_status: vehicleResult.rows[0].availability_status,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const bookingServices = {
  createBookingIntoDB,
  getAllBookingsFromDB,
  updateBookingStatusInDB,
};
