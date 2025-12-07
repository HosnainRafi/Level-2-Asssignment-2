import { Router } from "express";
import { Roles } from "../../constant";
import auth from "../../middleware/auth";
import { vehicleController } from "./vehicle.controller";

const router = Router();

router.get("/", vehicleController.getAllVehicles);
router.get("/:vehicleId", vehicleController.getSingleVehicle);

router.post("/", auth(Roles.admin), vehicleController.createVehicle);
router.put("/:vehicleId", auth(Roles.admin), vehicleController.updateVehicle);
router.delete(
  "/:vehicleId",
  auth(Roles.admin),
  vehicleController.deleteVehicle
);

export const vehicleRoute = router;
