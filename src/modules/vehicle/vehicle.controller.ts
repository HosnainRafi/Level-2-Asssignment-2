import catchAsync from "../../utils/catchAsync";
import { vehicleServices } from "./vehicle.service";

const createVehicle = catchAsync(async (req, res) => {
  const result = await vehicleServices.createVehicleIntoDB(req.body);
  res.status(201).json({
    success: true,
    message: "Vehicle created successfully",
    data: result,
  });
});

const getAllVehicles = catchAsync(async (req, res) => {
  const result = await vehicleServices.getAllVehiclesFromDB();

  res.status(200).json({
    success: true,
    message:
      result.length === 0
        ? "No vehicles found"
        : "Vehicles retrieved successfully",
    data: result,
  });
});

const getSingleVehicle = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;
  const result = await vehicleServices.getSingleVehicleFromDB(
    vehicleId as string
  );
  res.status(200).json({
    success: true,
    message: "Vehicle retrieved successfully",
    data: result,
  });
});

const updateVehicle = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;
  const result = await vehicleServices.updateVehicleInDB(
    vehicleId as string,
    req.body
  );
  res.status(200).json({
    success: true,
    message: "Vehicle updated successfully",
    data: result,
  });
});

const deleteVehicle = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;
  await vehicleServices.deleteVehicleFromDB(vehicleId as string);
  res.status(200).json({
    success: true,
    message: "Vehicle deleted successfully",
  });
});

export const vehicleController = {
  createVehicle,
  getAllVehicles,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
};
