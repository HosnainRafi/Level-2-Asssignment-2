import { Router } from "express";
import { authRoute } from "../modules/auth/auth.route";
import { userRoute } from "../modules/user/user.route";
import { vehicleRoute } from "../modules/vehicle/vehicle.route";
import { bookingRoute } from "../modules/booking/booking.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/vehicles", vehicleRoute);
router.use("/bookings", bookingRoute);

export default router;
