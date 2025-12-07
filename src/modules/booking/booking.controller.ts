import catchAsync from "../../utils/catchAsync";
import { bookingServices } from "./booking.service";

const createBooking = catchAsync(async (req, res) => {
  const userId = (req as any).user.id;

  const result = await bookingServices.createBookingIntoDB({
    ...req.body,
    customer_id: userId,
  });

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req, res) => {
  const user = (req as any).user;
  console.log(user);
  const result = await bookingServices.getAllBookingsFromDB(user);

  res.status(200).json({
    success: true,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  const user = (req as any).user;

  const result = await bookingServices.updateBookingStatusInDB(
    bookingId as string,
    status,
    user
  );

  res.status(200).json({
    success: true,
    message:
      status === "returned"
        ? "Booking marked as returned. Vehicle is now available"
        : "Booking cancelled successfully",
    data: result,
  });
});

export const bookingController = {
  createBooking,
  getAllBookings,
  updateBookingStatus,
};
