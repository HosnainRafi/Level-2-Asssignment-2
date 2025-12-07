import { Router } from "express";
import { bookingController } from "./booking.controller";
import auth from "../../middleware/auth";
import { Roles } from "../../constant";

const router = Router();

router.post(
  "/",
  auth(Roles.customer, Roles.admin),
  bookingController.createBooking
);

router.get(
  "/",
  auth(Roles.admin, Roles.customer),
  bookingController.getAllBookings
);

router.put(
  "/:bookingId",
  auth(Roles.admin, Roles.customer),
  bookingController.updateBookingStatus
);

export const bookingRoute = router;
