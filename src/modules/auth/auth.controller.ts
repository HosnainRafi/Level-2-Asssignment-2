import { Request, Response } from "express";
import { authServices } from "./auth.service";
import catchAsync from "../../utils/catchAsync";

const signup = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const signin = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.loginUser(req.body);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

export const authController = {
  signup,
  signin,
};
