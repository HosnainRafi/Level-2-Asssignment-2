import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";

const auth = (...roles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        401,
        "Unauthorized Access: Token missing or invalid format"
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError(
        401,
        "Unauthorized Access: Token missing or invalid format"
      );
    }

    const decoded = jwt.verify(token, config.jwtSecret as string) as JwtPayload;

    req.user = decoded;

    if (roles.length && !roles.includes(decoded.role as string)) {
      throw new AppError(
        403,
        "Forbidden: You do not have the necessary permissions"
      );
    }

    next();
  });
};

export default auth;
