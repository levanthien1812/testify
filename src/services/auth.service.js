import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import userService from "./user.service.js";

const login = async (body) => {
  const user = await userService.getUserByEmail(body.email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User with this email not found");
  }
  const isPasswordMatch = await user.isPasswordMatch(body.password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password does not match");
  }
  return user;
};

export default {
  login,
};
