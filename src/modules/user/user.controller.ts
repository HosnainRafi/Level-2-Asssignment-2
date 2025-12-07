import { userServices } from "./user.service";
import catchAsync from "../../utils/catchAsync";
import { Roles } from "../../constant";
import AppError from "../../utils/AppError";

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userServices.getAllUsers();

  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const email = (req as any).user.email;
  const result = await userServices.getSingleUser(email);

  res.status(200).json({
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const updatedData = req.body;
  const currentUser = (req as any).user;

  if (currentUser.role !== Roles.admin && Number(userId) !== currentUser.id) {
    throw new AppError(403, "You are not authorized to update this profile");
  }

  if (currentUser.role !== Roles.admin) {
    delete updatedData.role;
  }

  const result = await userServices.updateUser(userId as string, updatedData);

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  await userServices.deleteUser(userId as string);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

export const userController = {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
